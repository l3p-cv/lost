"""Data namespace request specs for golden-snapshot testing.

5 routes: 2 active, 3 skipped.
- GET /api/data/image/{id} — base64 JPEG (exact mode, uses compare_test_sia image)
- GET /api/data/storeKeys — static dict (exact mode)
- GET /api/data/export/{id} — skip (no data exports in dev DB)
- 2 commented-out routes — skip

Self-contained: looks up image ID from compare_test_sia by name.
"""

from __future__ import annotations

from tests.helpers.recorder import RequestSpec
from tests.helpers.specs import RouteSpec
from tests.compare.migration_status import target_for
from tests.helpers.seed import cleanup_test_user, create_test_user

_TARGET = target_for("data")


def _setup_data_context(dbm):
    """Look up compare_test_sia's first image ID by name."""
    from tests.helpers.lookups import get_test_sia_image_id

    image_id = get_test_sia_image_id(dbm, 0)
    if image_id is None:
        return {"skip": True}
    return {"image_id": image_id, "skip": False}


def _setup_pure_designer_image(dbm) -> dict:
    """Fresh user holding ONLY the Designer role + the compare_test_sia image id."""
    ctx = _setup_data_context(dbm)
    if ctx.get("skip"):
        return ctx

    from lost.controllers.user.login_manager import LoginManager
    from lost.db import roles as db_roles

    user = create_test_user(dbm, role=db_roles.DESIGNER)
    lm = LoginManager(dbm, user.user_name, "")
    fresh_token, _ = lm.create_jwt_pyjwt(user.idx, user.user_name, user.roles)
    ctx.update({"fresh_token": fresh_token, "user_obj": user})
    return ctx


def _cleanup_fresh_user(dbm, context) -> None:
    """Delete the fresh designer test user (idempotent, rollback-first)."""
    if "user_obj" in context:
        cleanup_test_user(dbm, context["user_obj"])


def get_data_specs() -> list[RouteSpec]:
    specs: list[RouteSpec] = []

    # 1. GET /api/data/image/{id}?type=imageBased — base64 JPEG (annotator)
    specs.append(RouteSpec(
        name="GET_data_image",
        request=RequestSpec(
            method="GET",
            path="/api/data/image/{image_id}",
            params={"type": "imageBased"},
            mode="exact",
        ),
        target=_TARGET,
        setup=_setup_data_context,
    ))

    # 2. GET /api/data/storeKeys — static dict (jwt, no role check)
    specs.append(RouteSpec(
        name="GET_data_storeKeys",
        request=RequestSpec(
            method="GET",
            path="/api/data/storeKeys",
            mode="exact",
        ),
        target=_TARGET,
    ))

    # 3. GET /api/data/export/1 — skip (0 data exports in dev DB)
    specs.append(RouteSpec(
        name="GET_data_export",
        request=RequestSpec(method="GET", path="/api/data/export/1"),
        skip=True,
        skip_reason="0 data exports in dev DB — would 404. Verified manually in P1.2.",
    ))

    # 4. GET /api/data/image/1?type=invalid_type → 422 text/plain (exact)
    specs.append(RouteSpec(
        name="GET_data_image_unknown_type",
        request=RequestSpec(
            method="GET",
            path="/api/data/image/1",
            params={"type": "invalid_type"},
            mode="exact",
        ),
        target=_TARGET,
        # no setup/cleanup — the type check fires before the image is loaded,
        # so image_id is never touched (any value works)
    ))

    # 5. GET /api/data/image/{id}?type=imageBased as a pure designer (no annotator role) → 200
    specs.append(RouteSpec(
        name="GET_data_image_designer",
        request=RequestSpec(
            method="GET",
            path="/api/data/image/{image_id}",
            params={"type": "imageBased"},
            mode="exact",
        ),
        target=_TARGET,
        setup=_setup_pure_designer_image,
        cleanup=_cleanup_fresh_user,
        # proves the designer-review guard widening; same deterministic seeded
        # bytes as GET_data_image, hence exact mode
    ))

    return specs


def get_active_data_specs() -> list[RouteSpec]:
    return [s for s in get_data_specs() if not s.skip]
