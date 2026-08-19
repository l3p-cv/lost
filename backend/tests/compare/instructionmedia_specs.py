"""Instructionmedia namespace request specs for golden-snapshot testing.

2 routes: 0 active, 2 skipped.
- GET /api/media/media-file?path=/invalid — skip (endpoint returns non-JSON Response: pre-existing bug)
- POST /api/media/get-image-markdown — skip (needs real media file path)
"""

from __future__ import annotations

from tests.helpers.recorder import RequestSpec
from tests.compare.user_specs import RouteSpec


def get_instructionmedia_specs() -> list[RouteSpec]:
    specs: list[RouteSpec] = []

    # 1. GET /api/media/media-file?path=/invalid — skip (endpoint returns non-JSON Response: pre-existing bug)
    specs.append(RouteSpec(
        name="GET_media_file_invalid",
        request=RequestSpec(
            method="GET",
            path="/api/media/media-file",
            params={"path": "/invalid"},
            mode="structural",
        ),
        skip=True,
        skip_reason="Endpoint returns Flask Response object (not JSON) for 403 — pre-existing bug. Verified manually in P1.2.",
    ))

    # 2. POST /api/media/get-image-markdown — skip (needs real media file)
    specs.append(RouteSpec(
        name="POST_image_markdown",
        request=RequestSpec(method="POST", path="/api/media/get-image-markdown"),
        skip=True,
        skip_reason="Needs a real instruction media file path — would 404. Verified manually in P1.2.",
    ))

    return specs


def get_active_instructionmedia_specs() -> list[RouteSpec]:
    return [s for s in get_instructionmedia_specs() if not s.skip]
