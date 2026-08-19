"""Data namespace request specs for golden-snapshot testing.

5 routes: 2 active, 3 skipped.
- GET /api/data/image/1469 — base64 JPEG (exact mode, reuses image 1469 from sia)
- GET /api/data/storeKeys — static dict (exact mode)
- GET /api/data/export/{id} — skip (0 data exports in dev DB)
- 2 commented-out routes — skip
"""

from __future__ import annotations

from tests.helpers.recorder import RequestSpec
from tests.compare.user_specs import RouteSpec

IMAGE_ID = 1469  # same image used in sia specs


def get_data_specs() -> list[RouteSpec]:
    specs: list[RouteSpec] = []

    # 1. GET /api/data/image/1469?type=imageBased — base64 JPEG (annotator)
    specs.append(RouteSpec(
        name="GET_data_image",
        request=RequestSpec(
            method="GET",
            path=f"/api/data/image/{IMAGE_ID}",
            params={"type": "imageBased"},
            mode="exact",
        ),
    ))

    # 2. GET /api/data/storeKeys — static dict (jwt, no role check)
    specs.append(RouteSpec(
        name="GET_data_storeKeys",
        request=RequestSpec(
            method="GET",
            path="/api/data/storeKeys",
            mode="exact",
        ),
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
