"""User namespace request specs for golden-snapshot testing.

Enumerates all 10 user routes as TestSpec objects, describing:
- The primary request (method, path, body)
- Whether to skip (token endpoints)
- For mutations: a follow-up GET to verify the state change
- Setup/cleanup hooks for mutate-then-GET tests

Routes (from lost/api/user/endpoint.py):
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

from dataclasses import dataclass, field
from typing import Callable, Optional

from tests.helpers.recorder import RequestSpec
from tests.helpers.seed import user_create_payload, create_test_user, cleanup_test_user, unique_suffix


# ---------------------------------------------------------------------------
# TestSpec — a RequestSpec + metadata about how to test it
# ---------------------------------------------------------------------------


@dataclass
class RouteSpec:
    """A test case spec: one route + how to verify it.

    Attributes:
        name: Short identifier (used in snapshot filename + test name).
        request: The primary RequestSpec to capture.
        skip: If True, this route is skipped (non-deterministic, can't snapshot).
        skip_reason: Why it's skipped (for documentation).
        follow_up: Optional follow-up RequestSpec (for mutate-then-GET).
        setup: Optional callable(dbm) → dict to run before the primary request.
               Returns a dict of values to substitute into the request path/body
               (e.g. {"user_id": 42} for /api/user/<id>).
        cleanup: Optional callable(dbm, context) to run after the test.
    """

    name: str
    request: RequestSpec
    skip: bool = False
    skip_reason: str = ""
    follow_up: Optional[RequestSpec] = None
    setup: Optional[Callable] = None
    cleanup: Optional[Callable] = None


# ---------------------------------------------------------------------------
# Setup/cleanup helpers for mutate-then-GET tests
# ---------------------------------------------------------------------------


def _setup_existing_user(dbm):
    """Create a test user for PATCH/DELETE tests. Returns context with user_id."""
    user = create_test_user(dbm)
    return {"user_id": user.idx, "user_name": user.user_name, "user_obj": user}


def _cleanup_existing_user(dbm, context):
    """Clean up a test user created by _setup_existing_user."""
    if "user_obj" in context:
        cleanup_test_user(dbm, context["user_obj"])


def _cleanup_created_user(dbm, context):
    """Clean up a user created via POST /api/user (find by name, then delete)."""
    user_name = context.get("user_name")
    if user_name:
        cleanup_test_user(dbm, user_name)


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
    ))

    # 2. GET /api/user/anno_task_user — list anno task users (designer)
    specs.append(RouteSpec(
        name="GET_user_anno_task_user",
        request=RequestSpec(
            method="GET",
            path="/api/user/anno_task_user",
            mode="structural",
        ),
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
    ))

    # 4. GET /api/user/self — get current user
    specs.append(RouteSpec(
        name="GET_user_self",
        request=RequestSpec(
            method="GET",
            path="/api/user/self",
            mode="structural",
        ),
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
    specs.append(RouteSpec(
        name="POST_user_logout",
        request=RequestSpec(method="POST", path="/api/user/logout"),
        skip=True,
        skip_reason="Token revocation — no GET to compare, verified manually in P1.2",
    ))

    return specs


# ---------------------------------------------------------------------------
# Active specs only (convenience for tests that want to skip the skipped ones)
# ---------------------------------------------------------------------------


def get_active_user_specs() -> list[RouteSpec]:
    """Return only the non-skipped user specs."""
    return [s for s in get_user_specs() if not s.skip]
