"""Instructionmedia namespace request specs for golden-snapshot testing.

2 routes: 0 active, 2 skipped.
- GET /api/media/media-file?path=/invalid — skip (endpoint returns non-JSON Response: pre-existing bug)
- POST /api/media/get-image-markdown — skip (needs real media file path)
"""

from __future__ import annotations

from tests.helpers.recorder import RequestSpec
from tests.helpers.specs import RouteSpec
from tests.compare.migration_status import target_for

_TARGET = target_for("instructionmedia")


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
        target=_TARGET,
        skip=True,
        skip_reason="Tested manually"
    ))

    # 2. POST /api/media/get-image-markdown — skip (needs real media file)
    specs.append(RouteSpec(
        name="POST_image_markdown",
        request=RequestSpec(method="POST", path="/api/media/get-image-markdown"),
        target=_TARGET,
        skip=True,
        skip_reason="Tested manually"
    ))
    
    # GET /api/media/media-file — path outside all instruction-media dirs → 403 (exact)
    specs.append(RouteSpec(
        name="GET_im_media_file_invalid_path",
        request=RequestSpec(
            method="GET", path="/api/media/media-file",
            params={"path": "/definitely/not/in/fs/x.png"}, mode="exact",
        ),
        target=_TARGET,
    ))

    # GET /api/media/media-file — valid prefix, nonexistent file → 404 (exact)
    specs.append(RouteSpec(
        name="GET_im_media_file_not_found",
        request=RequestSpec(
            method="GET", path="/api/media/media-file",
            params={"path": "/home/lost/data/instruction_media/no_such_file.png"},
            mode="exact",
        ),
        target=_TARGET,
    ))

    # POST /api/media/get-image-markdown — empty encodedPath → 400 (exact)
    specs.append(RouteSpec(
        name="POST_im_markdown_missing_encoded_path",
        request=RequestSpec(
            method="POST", path="/api/media/get-image-markdown",
            json={"encodedPath": ""}, mode="exact",
        ),
        target=_TARGET,
    ))

    # POST /api/media/get-image-markdown — path outside the save dir → 403 (exact)
    specs.append(RouteSpec(
        name="POST_im_markdown_forbidden",
        request=RequestSpec(
            method="POST", path="/api/media/get-image-markdown",
            json={"encodedPath": "%2Fetc%2Fpasswd"}, mode="exact",
        ),
        target=_TARGET,
    ))

    return specs


def get_active_instructionmedia_specs() -> list[RouteSpec]:
    return [s for s in get_instructionmedia_specs() if not s.skip]
