"""User namespace request specs for golden-snapshot testing.

Enumerates all 10 user routes as TestSpec objects, describing:
- The primary request (method, path, body)
- Whether to skip (token endpoints)
- For mutations: a follow-up GET to verify the state change
- Setup/cleanup hooks for mutate-then-GET tests

Routes (from lost/controllers/user/endpoint.py):
    GET  /api/user                   - list users (admin)           → structural
    GET  /api/user/anno_task_user    - list anno task users (designer) → structural
    GET  /api/user/<id>              - get single user (admin)      → structural
    GET  /api/user/self              - get current user             → structural
    POST /api/user                   - create user (admin)          → mutate-then-GET
    PATCH /api/user/<id>             - update user (admin)          → mutate-then-GET
    DELETE /api/user/<id>            - delete user (admin)          → mutate-then-GET
    POST /api/user/login             - skip (token issuance)
    POST /api/user/refresh           - skip (token issuance)
    POST /api/user/token             - skip (token issuance)
    POST /api/user/logout            - skip (token revocation)
"""

from __future__ import annotations

from typing import Callable, Optional

from tests.helpers.recorder import RequestSpec
from tests.helpers.specs import RouteSpec
from tests.helpers.seed import user_create_payload, create_test_user, cleanup_test_user, unique_suffix
from tests.compare.migration_status import target_for

_TARGET = target_for("user")


# ---------------------------------------------------------------------------
# Setup/cleanup helpers for mutate-then-GET tests
# ---------------------------------------------------------------------------


def _setup_existing_user(dbm):
    """Create a test user for PATCH/DELETE tests. Returns context with user_id."""
    user = create_test_user(dbm)
    return {"user_id": user.idx, "user_name": user.user_name, "user_obj": user}


def _setup_fresh_token(dbm):
    """Mint a fresh JWT for admin so logout doesn't invalidate the shared session token.

    The fresh token is stored in context['fresh_token']. The test runner
    uses it as the Authorization header instead of the shared auth_headers.
    """
    # from lost.app import app
    from lost.controllers.user.login_manager import LoginManager

    user = dbm.find_user_by_user_name("admin")
    lm = LoginManager(dbm, "admin", "admin")
    token, _ = lm.create_jwt_pyjwt(user.idx, user.user_name, user.roles)
    return {"fresh_token": token, "skip": False}


def _cleanup_existing_user(dbm, context):
    """Clean up a test user created by _setup_existing_user."""
    if "user_obj" in context:
        cleanup_test_user(dbm, context["user_obj"])


def _cleanup_created_user(dbm, context):
    """Clean up a user created via POST /api/user (find by name, then delete)."""
    user_name = context.get("user_name")
    if user_name:
        cleanup_test_user(dbm, user_name)

def _setup_ghost_refresh_token(dbm) -> dict:
    from lost.controllers.user.login_manager import LoginManager

    lm = LoginManager(dbm, "ghost", "")
    _, refresh_token = lm.create_jwt_pyjwt(999999, "ghost", [])
    return {"fresh_token": refresh_token}

def _setup_refresh_token_only(dbm) -> dict:
    """Mint admin's REFRESH token to prove it is rejected as an access token."""
    from lost.controllers.user.login_manager import LoginManager

    user = dbm.find_user_by_user_name("admin")
    lm = LoginManager(dbm, "admin", "admin")
    _, refresh_token = lm.create_jwt_pyjwt(user.idx, user.user_name, user.roles)
    return {"fresh_token": refresh_token}

# ---------------------------------------------------------------------------
# Path substitution helper
# ---------------------------------------------------------------------------


def _substitute_path(path: str, context: dict) -> str:
    """Replace {placeholders} in a path with values from context."""
    result = path
    for key, value in context.items():
        result = result.replace(f"{{{key}}}", str(value))
    return result


# ---------------------------------------------------------------------------
# The 11 user route specs (7 active, 4 skipped)
# ---------------------------------------------------------------------------


def get_user_specs() -> list[RouteSpec]:
    """Return all user namespace test specs.

    Call this function (not a module-level list) so that unique_suffix()
    generates fresh names each time.
    """
    specs: list[RouteSpec] = []

    # 1. GET /api/user — list users (admin)
    specs.append(RouteSpec(
        name="GET_user_list",
        request=RequestSpec(
            method="GET",
            path="/api/user",
            mode="structural",
        ),
        target=_TARGET,
    ))

    # 2. GET /api/user/anno_task_user — list anno task users (designer)
    specs.append(RouteSpec(
        name="GET_user_anno_task_user",
        request=RequestSpec(
            method="GET",
            path="/api/user/anno_task_user",
            mode="structural",
        ),
        target=_TARGET,
    ))

    # 3. GET /api/user/<id> — get single user (admin)
    #    Uses the admin user (id=1) as the target — always exists, no setup needed
    specs.append(RouteSpec(
        name="GET_user_by_id",
        request=RequestSpec(
            method="GET",
            path="/api/user/1",  # admin user, always exists
            mode="structural",
        ),
        target=_TARGET,
    ))

    # 4. GET /api/user/self — get current user
    specs.append(RouteSpec(
        name="GET_user_self",
        request=RequestSpec(
            method="GET",
            path="/api/user/self",
            mode="structural",
        ),
        target=_TARGET,
    ))

    # 5. POST /api/user — create user (admin) → mutate-then-GET
    suffix = unique_suffix()
    create_payload = user_create_payload(suffix=suffix)
    created_user_name = create_payload["user_name"]
    specs.append(RouteSpec(
        name="POST_user_create",
        request=RequestSpec(
            method="POST",
            path="/api/user",
            json=create_payload,
            mode="structural",
        ),
        follow_up=RequestSpec(
            method="GET",
            path="/api/user/{user_id}",  # substituted with created user's ID
            mode="structural",
            label="POST_user_create__then_GET",
        ),
        setup=lambda dbm: {"user_name": created_user_name},  # for cleanup tracking
        cleanup=_cleanup_created_user,
        target=_TARGET,
    ))

    # 6. PATCH /api/user/<id> — update user (admin) → mutate-then-GET
    #    Setup: create a test user. Patch: update email/name. Follow-up: GET the user.
    specs.append(RouteSpec(
        name="PATCH_user_update",
        request=RequestSpec(
            method="PATCH",
            path="/api/user/{user_id}",  # substituted with test user's ID
            json={
                "email": f"updated_{unique_suffix()}@test.local",
                "first_name": "Updated",
                "last_name": "Name",
            },
            mode="structural",
        ),
        follow_up=RequestSpec(
            method="GET",
            path="/api/user/{user_id}",
            mode="structural",
            label="PATCH_user_update__then_GET",
        ),
        setup=_setup_existing_user,
        cleanup=_cleanup_existing_user,
        target=_TARGET,
    ))

    # 7. DELETE /api/user/<id> — skip (endpoint crashes for users without filesystem: pre-existing bug)
    #    The DELETE endpoint calls UserFileAccess which requires a FileSystem object.
    #    Test users created by _setup_existing_user have no filesystem → 500 error.
    specs.append(RouteSpec(
        name="DELETE_user",
        request=RequestSpec(
            method="DELETE",
            path="/api/user/{user_id}",
            mode="structural",
        ),
        follow_up=RequestSpec(
            method="GET",
            path="/api/user/{user_id}",
            mode="structural",
            label="DELETE_user__then_GET",
        ),
        setup=_setup_existing_user,
        cleanup=_cleanup_existing_user,
        skip=True,
        skip_reason="Endpoint crashes for users without filesystem (pre-existing bug: 'fs_db needs to be a lost FileSystem object!'). Verified manually in P1.2.",
    ))

    # 8-11. Skipped endpoints (token issuance / revocation — non-deterministic JWTs)
    specs.append(RouteSpec(
        name="POST_user_login",
        request=RequestSpec(method="POST", path="/api/user/login"),
        skip=True,
        skip_reason="JWT token issuance — non-deterministic, verified manually in P1.2",
    ))
    specs.append(RouteSpec(
        name="POST_user_refresh",
        request=RequestSpec(method="POST", path="/api/user/refresh"),
        skip=True,
        skip_reason="JWT token issuance — non-deterministic, verified manually in P1.2",
    ))
    specs.append(RouteSpec(
        name="POST_user_token",
        request=RequestSpec(method="POST", path="/api/user/token"),
        skip=True,
        skip_reason="JWT token issuance — non-deterministic, verified manually in P1.2",
    ))
    # 8. POST /api/user/logout — uses a fresh token (so the shared session token stays valid)
    specs.append(RouteSpec(
        name="POST_user_logout",
        request=RequestSpec(method="POST", path="/api/user/logout", mode="structural"),
        setup=_setup_fresh_token,
        target=_TARGET,
    ))

    # 12. GET /api/user/999999 — nonexistent ID → 200 string body (legacy quirk, exact)
    specs.append(RouteSpec(
        name="GET_user_by_id_not_found",
        request=RequestSpec(method="GET", path="/api/user/999999", mode="exact"),
        target=_TARGET,
    ))

    # 13. POST /api/user — user_name collides with admin → 200 message (exact)
    specs.append(RouteSpec(
        name="POST_user_create_duplicate",
        request=RequestSpec(
            method="POST", path="/api/user", mode="exact",
            json={"user_name": "admin", "password": "x", "email": ""},
        ),
        target=_TARGET,
        # no cleanup — UserExistsError fires before any write
    ))

    # 14. DELETE /api/user/1 — deleting admin (=self, runner authenticates as admin)
    #     → 200 string body (exact). Precedent: GET_user_by_id hardcodes id 1.
    specs.append(RouteSpec(
        name="DELETE_user_self",
        request=RequestSpec(method="DELETE", path="/api/user/1", mode="exact"),
        target=_TARGET,
        # no cleanup — SelfDeleteError fires before any write
    ))

    # 15. POST /api/user/refresh — sending the session ACCESS token
    #     (default auth header) → 401 (exact)
    specs.append(RouteSpec(
        name="POST_user_refresh_with_access_token",
        request=RequestSpec(method="POST", path="/api/user/refresh", mode="exact"),
        target=_TARGET,
    ))

    # 16. POST /api/user/login — wrong password → 200 message (exact)
    specs.append(RouteSpec(
        name="POST_user_login_invalid",
        request=RequestSpec(
            method="POST", path="/api/user/login", mode="exact",
            json={"userName": "admin", "password": "definitely_wrong_password"},
        ),
        target=_TARGET,
    ))

     # 17. POST /api/user/refresh — valid refresh token for nonexistent user → 401 (exact)
    specs.append(RouteSpec(
        name="POST_user_refresh_ghost_user",
        request=RequestSpec(method="POST", path="/api/user/refresh", mode="exact"),
        setup=_setup_ghost_refresh_token,
        target=_TARGET,
    ))

    # GET /api/user/self with a REFRESH token → 401 (exact) — validates the
    # ported access-type check (master fix 5de15935e)
    specs.append(RouteSpec(
        name="GET_user_refresh_token_rejected",
        request=RequestSpec(method="GET", path="/api/user/self", mode="exact"),
        setup=_setup_refresh_token_only,
        target=_TARGET,
    ))
    
    return specs


# ---------------------------------------------------------------------------
# Active specs only (convenience for tests that want to skip the skipped ones)
# ---------------------------------------------------------------------------


def get_active_user_specs() -> list[RouteSpec]:
    """Return only the non-skipped user specs."""
    return [s for s in get_user_specs() if not s.skip]
