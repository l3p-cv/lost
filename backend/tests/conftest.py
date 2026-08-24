"""Pytest configuration and fixtures for the golden-snapshot test suite.

Provides:
- Env loading from docker/compose/.env (so LOST_CONFIG connects to the compose DB)
- ``--record`` flag: re-record golden snapshots from the running app
- ``--target`` flag: select which app to test (flask|fastapi)
- ``auth_token`` fixture: a JWT minted directly via LoginManager (admin/admin, all roles)
- ``client`` fixture: a Flask test client (FastAPI TestClient stub in P1.2)
"""

from __future__ import annotations

import os
import sys
from pathlib import Path
from typing import Iterator

import pytest

# ---------------------------------------------------------------------------
# Env loading — read docker/compose/.env before importing lost.settings
# ---------------------------------------------------------------------------

_REPO_ROOT = Path(__file__).resolve().parents[2]
_COMPOSE_ENV = _REPO_ROOT / "docker" / "compose" / ".env"


def _load_env(env_path: Path) -> None:
    """Load a .env file into os.environ (without overwriting existing values)."""
    if not env_path.exists():
        return
    for line in env_path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        os.environ.setdefault(key, value)


_load_env(_COMPOSE_ENV)

# Ensure /code/lost is on sys.path so `from flaskapp import app` resolves
_LOST_DIR = str(Path(__file__).resolve().parents[1] / "lost")
if _LOST_DIR not in sys.path:
    sys.path.insert(0, _LOST_DIR)


# ---------------------------------------------------------------------------
# Pytest CLI flags
# ---------------------------------------------------------------------------


def pytest_addoption(parser):
    parser.addoption(
        "--record",
        action="store_true",
        default=False,
        help="Re-record golden snapshots from the running app (overwrites golden/*.json).",
    )
    parser.addoption(
        "--target",
        action="store",
        default="flask",
        choices=["flask", "fastapi"],
        help="Which app to test: 'flask' (default) or 'fastapi' (P1.2+).",
    )
    parser.addoption(
        "--cleanup",
        action="store_true",
        default=False,
        help="Force-remove leftover compare_test_* data before running.",
    )


@pytest.fixture(scope="session")
def record(request) -> bool:
    """True if --record was passed."""
    return request.config.getoption("--record")


@pytest.fixture(scope="session")
def target(request) -> str:
    """The target app: 'flask' or 'fastapi'."""
    return request.config.getoption("--target")


# ---------------------------------------------------------------------------
# App + DB fixtures
# ---------------------------------------------------------------------------


@pytest.fixture(scope="session")
def flask_app():
    """The Flask app instance (session-scoped)."""
    from lost.app import app

    app.config["TESTING"] = True
    return app


@pytest.fixture(scope="session")
def dbm():
    """A DBMan session for direct DB access (seed/cleanup). Session-scoped."""
    from lost.db import access
    from lost.settings import LOST_CONFIG

    db = access.DBMan(LOST_CONFIG)
    yield db
    db.close_session()


@pytest.fixture(scope="session")
def auth_token(flask_app):
    """A JWT access token for the admin user, minted directly via LoginManager.

    The admin user (admin/admin) is seeded by initlost.py and has all three roles
    (Administrator, Designer, Annotator), so this token works for every role-gated
    route. Minting directly (rather than hitting /api/user/login) avoids coupling
    the fixture to the login endpoint, which itself migrates in P1.2.
    """
    from lost.api.user.login_manager import LoginManager
    from lost.db import access
    from lost.settings import LOST_CONFIG

    with flask_app.app_context():
        db = access.DBMan(LOST_CONFIG)
        user = db.find_user_by_user_name("admin")
        if user is None:
            pytest.fail("admin user not found — run initlost.py to seed the DB")
        lm = LoginManager(db, "admin", "admin")
        access_token, _ = lm.create_jwt(user.idx, user.user_name, user.roles)
        db.close_session()
    return access_token


@pytest.fixture
def auth_headers(auth_token) -> dict:
    """Authorization headers dict for use with the test client."""
    return {"Authorization": f"Bearer {auth_token}"}


# Client fixture — Flask or FastAPI, selected per-spec via indirect parametrize
# Each test passes spec.target ("flask" or "fastapi") as the indirect param


@pytest.fixture
def client(request):
    """A test client for the target app, selected per-spec via indirect parametrize.

    The parametrize decorator passes spec.target as the indirect param.
    Falls back to the --target global flag if no indirect param is set.
    """
    # Prefer indirect param (per-spec target), fall back to global --target flag
    if hasattr(request, "param"):
        target = request.param
    else:
        target = request.config.getoption("--target")

    if target == "flask":
        from tests.helpers.client import flask_client

        with flask_client() as c:
            yield c
    elif target == "fastapi":
        from tests.helpers.client import fastapi_client

        with fastapi_client() as c:
            yield c
    else:
        pytest.fail(f"Unknown target: {target!r}")


@pytest.fixture
def seed(dbm, request):
    """Yield the seed helpers module, with automatic cleanup after each test.

    Tracks created test users and cleans them up after the test, so mutations
    don't leak between tests. For force-cleanup of leftover data, use --cleanup.
    """
    from tests.helpers import seed as seed_module

    created_users: list = []

    def track_user(user):
        created_users.append(user)
        return user

    # Attach the tracker to the module's create function
    original_create = seed_module.create_test_user

    def create_and_track(dbm_arg, suffix=None):
        user = original_create(dbm_arg, suffix)
        created_users.append(user)
        return user

    seed_module.create_test_user = create_and_track

    # If --cleanup flag is set, force-remove all leftover test data first
    if request.config.getoption("--cleanup"):
        n = seed_module.cleanup_all_test_users(dbm)
        if n:
            print(f"\n[cleanup] removed {n} leftover test users")

    yield seed_module

    # Restore original function
    seed_module.create_test_user = original_create

    # Cleanup tracked users
    for user in created_users:
        try:
            seed_module.cleanup_test_user(dbm, user)
        except Exception as e:
            print(f"\n[seed] cleanup failed for user {getattr(user, 'user_name', '?')}: {e}")
