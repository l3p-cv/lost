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

_TARGET = target_for("data")


def _setup_data_context(dbm):
    """Look up compare_test_sia's first image ID by name."""
    from tests.helpers.lookups import get_test_sia_image_id

    image_id = get_test_sia_image_id(dbm, 0)
    if image_id is None:
        return {"skip": True}
    return {"image_id": image_id, "skip": False}


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

    return specs


def get_active_data_specs() -> list[RouteSpec]:
    return [s for s in get_data_specs() if not s.skip]
