"""Test client wrappers for Flask and FastAPI.

Provides a unified interface so comparison tests can target either framework
via the ``--target`` flag (set up in conftest.py).
"""

from __future__ import annotations

import sys
from contextlib import contextmanager
from pathlib import Path
from typing import Iterator


def _ensure_lost_on_path() -> None:
    """Add the lost package directory to sys.path so `from flaskapp import app` works.

    `lost/app.py` line 9 imports `from flaskapp import app, blacklist` — a top-level
    import that relies on `/code/lost/` being on sys.path (as it is when entrypoint.sh
    runs `python3 /code/lost/app.py`). When pytest imports `lost.app` as a module,
    this path isn't set, so we add it explicitly.
    """
    lost_dir = str(Path(__file__).resolve().parents[2] / "lost")
    if lost_dir not in sys.path:
        sys.path.insert(0, lost_dir)


@contextmanager
def flask_client():
    """Yield a Flask test client with TESTING enabled.

    Usage::
        with flask_client() as c:
            resp = c.get("/api/user/self", headers={"Authorization": "Bearer <token>"})
    """
    _ensure_lost_on_path()
    from lost.app import app

    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client


@contextmanager
def fastapi_client():
    """Yield a FastAPI TestClient (in-process, no server needed).

    raise_server_exceptions=False so 500 errors are returned as HTTP responses
    (matching Flask behavior) instead of raising in the test.
    """
    from lost.fastapi_app import app
    from fastapi.testclient import TestClient

    with TestClient(app, raise_server_exceptions=False) as client:
        yield client


def get_client(target: str = "flask"):
    """Return a context manager yielding the appropriate test client.

    Args:
        target: "flask" (default) or "fastapi".
    """
    if target == "flask":
        return flask_client()
    if target == "fastapi":
        return fastapi_client()
    raise ValueError(f"Unknown target: {target!r} (expected 'flask' or 'fastapi')")
