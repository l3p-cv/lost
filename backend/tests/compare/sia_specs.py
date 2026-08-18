"""SIA namespace request specs for golden-snapshot testing.

Enumerates all 18 SIA routes. 15 are active (recorded + compared);
3 mutations (PUT, PATCH, finish) are skipped to avoid destructive dev DB changes.

Prerequisites (must exist in dev DB, seeded by initlost + OOTB pipelines):
- admin user (idx=1) with Annotator role
- SIA annotask (idx=97) assigned to admin via ChoosenAnnoTask
- ImageAnno (idx=1469) belonging to annotask 97, assigned to admin
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Callable, Optional

from tests.helpers.recorder import RequestSpec
from tests.compare.user_specs import RouteSpec


# ---------------------------------------------------------------------------
# Polygon operation payloads (reused from lost/logic/test/test_sia_polygon_operations.py)
# ---------------------------------------------------------------------------

UNION_PAYLOAD = {
    "annotations": [
        {
            "type": "polygon",
            "data": [
                {"x": 0.5445484739598239, "y": 0.4714587835275131},
                {"x": 0.5823014179935729, "y": 0.6330413839919591},
                {"x": 0.7453941362193689, "y": 0.5907580866741601},
                {"x": 0.7000906033788701, "y": 0.45937784143671334},
            ],
        },
        {
            "type": "polygon",
            "data": [
                {"x": 0.36484446035917834, "y": 0.7040169187754073},
                {"x": 0.5309574141077643, "y": 0.7704621002748057},
                {"x": 0.5294472963463243, "y": 0.6541830326508585},
            ],
        },
        {
            "type": "bbox",
            "data": {"x": 0.5483237683631988, "y": 0.6519178560088337, "w": 0.12836, "h": 0.14346118732824645},
        },
    ]
}

INTERSECTION_PAYLOAD = {
    "annotations": [
        {
            "type": "bbox",
            "data": {
                "x": 0.5483237683631988,
                "y": 0.6519178560088337,
                "w": 0.12836000971474684,
                "h": 0.14346118732824645,
            },
        },
        {
            "type": "bbox",
            "data": {
                "x": 0.4350649362619516,
                "y": 0.5477197304756862,
                "w": 0.23406825300924422,
                "h": 0.20990636882764482,
            },
        },
    ]
}

DIFFERENCE_PAYLOAD = {
    "selectedPolygon": {
        "type": "bbox",
        "data": {"x": 0.5483237683631988, "y": 0.6519178560088337, "w": 0.12836000971474684, "h": 0.14346118732824645},
    },
    "polygonModifiers": [
        {
            "type": "polygon",
            "data": [
                {"x": 0.5445484739598239, "y": 0.4714587835275131},
                {"x": 0.5823014179935729, "y": 0.6330413839919591},
                {"x": 0.7453941362193689, "y": 0.5907580866741601},
                {"x": 0.7000906033788701, "y": 0.45937784143671334},
            ],
        },
        {
            "type": "polygon",
            "data": [
                {"x": 0.5445484739598239, "y": 0.4714587835275131},
                {"x": 0.5823014179935729, "y": 0.6330413839919591},
                {"x": 0.7453941362193689, "y": 0.5907580866741601},
                {"x": 0.7000906033788701, "y": 0.45937784143671334},
            ],
        },
        {
            "type": "polygon",
            "data": [
                {"x": 0.36484446035917834, "y": 0.7040169187754073},
                {"x": 0.5309574141077643, "y": 0.7704621002748057},
                {"x": 0.5294472963463243, "y": 0.6541830326508585},
            ],
        },
    ],
}

BBOX_FROM_POINTS_PAYLOAD = {
    "data": [
        [
            {"x": 0.20201015188684168, "y": 0.5913626320093255},
            {"x": 0.0843630930633123, "y": 0.5913626320093255},
            {"x": 0.0843630930633123, "y": 0.6749090940724116},
            {"x": 0.15216530090296987, "y": 0.6749090940724116},
            {"x": 0.15216530090296987, "y": 0.8067954138177009},
            {"x": 0.3521653009029699, "y": 0.8067954138177009},
            {"x": 0.3521653009029699, "y": 0.619105729248221},
            {"x": 0.20201015188684168, "y": 0.619105729248221},
        ]
    ]
}

# Empty filters payload — returns the image with no filters applied
IMAGE_FILTERS_PAYLOAD = {"filters": []}


# ---------------------------------------------------------------------------
# Dev DB constants (annotask 97, image 1469 — seeded by initlost + OOTB pipelines)
# ---------------------------------------------------------------------------

IMAGE_ID = 1469


# ---------------------------------------------------------------------------
# The 18 SIA route specs
# ---------------------------------------------------------------------------


def get_sia_specs() -> list[RouteSpec]:
    """Return all SIA namespace test specs (15 active, 3 skipped)."""
    specs: list[RouteSpec] = []

    # --- Simple GETs (need active annotask — annotask 97 exists) ---

    # 1. GET /api/sia?direction=first — get first SIA annotation
    specs.append(RouteSpec(
        name="GET_sia_first",
        request=RequestSpec(
            method="GET",
            path="/api/sia",
            params={"direction": "first", "lastImgId": "0"},
            mode="structural",
        ),
    ))

    # 2. GET /api/sia?direction=next&lastImgId=1469 — get next image
    specs.append(RouteSpec(
        name="GET_sia_next",
        request=RequestSpec(
            method="GET",
            path="/api/sia",
            params={"direction": "next", "lastImgId": str(IMAGE_ID)},
            mode="structural",
        ),
    ))

    # 3. GET /api/sia/images — get all image IDs for current annotask
    specs.append(RouteSpec(
        name="GET_sia_images",
        request=RequestSpec(
            method="GET",
            path="/api/sia/images",
            mode="structural",
        ),
    ))

    # 4. GET /api/sia/label — get label trees
    specs.append(RouteSpec(
        name="GET_sia_label",
        request=RequestSpec(
            method="GET",
            path="/api/sia/label",
            mode="structural",
        ),
    ))

    # 5. GET /api/sia/configuration — get SIA config
    specs.append(RouteSpec(
        name="GET_sia_configuration",
        request=RequestSpec(
            method="GET",
            path="/api/sia/configuration",
            mode="structural",
        ),
    ))

    # 6. GET /api/sia/nextAnnoId — get next annotation ID
    specs.append(RouteSpec(
        name="GET_sia_nextAnnoId",
        request=RequestSpec(
            method="GET",
            path="/api/sia/nextAnnoId",
            mode="structural",
        ),
    ))

    # 7. GET /api/sia/allowedExampler — check if user can mark examples
    specs.append(RouteSpec(
        name="GET_sia_allowedExampler",
        request=RequestSpec(
            method="GET",
            path="/api/sia/allowedExampler",
            mode="structural",
        ),
    ))

    # --- Image GETs (need valid image_id — using 1469) ---

    # 8. GET /api/sia/image/1469 — get image with optional filters (base64 JPEG)
    specs.append(RouteSpec(
        name="GET_sia_image",
        request=RequestSpec(
            method="GET",
            path=f"/api/sia/image/{IMAGE_ID}",
            mode="exact",
        ),
    ))

    # 9. GET /api/sia/image/1469/name — get image basename
    specs.append(RouteSpec(
        name="GET_sia_image_name",
        request=RequestSpec(
            method="GET",
            path=f"/api/sia/image/{IMAGE_ID}/name",
            mode="structural",
        ),
    ))

    # 10. GET /api/sia/image/1469/thumbnail — get thumbnail (base64 JPEG)
    specs.append(RouteSpec(
        name="GET_sia_image_thumbnail",
        request=RequestSpec(
            method="GET",
            path=f"/api/sia/image/{IMAGE_ID}/thumbnail",
            mode="exact",
        ),
    ))

    # --- Image filter POST (base64 JPEG response) ---

    # 11. POST /api/sia/image/1469/filters — apply filters to image
    specs.append(RouteSpec(
        name="POST_sia_image_filters",
        request=RequestSpec(
            method="POST",
            path=f"/api/sia/image/{IMAGE_ID}/filters",
            json=IMAGE_FILTERS_PAYLOAD,
            mode="exact",
        ),
    ))

    # --- Pure-compute POSTs (no DB, deterministic shapely/cv2 math) ---

    # 12. POST /api/sia/polygonOperations/union
    specs.append(RouteSpec(
        name="POST_sia_polygon_union",
        request=RequestSpec(
            method="POST",
            path="/api/sia/polygonOperations/union",
            json=UNION_PAYLOAD,
            mode="exact",
        ),
    ))

    # 13. POST /api/sia/polygonOperations/intersection
    specs.append(RouteSpec(
        name="POST_sia_polygon_intersection",
        request=RequestSpec(
            method="POST",
            path="/api/sia/polygonOperations/intersection",
            json=INTERSECTION_PAYLOAD,
            mode="exact",
        ),
    ))

    # 14. POST /api/sia/polygonOperations/difference
    specs.append(RouteSpec(
        name="POST_sia_polygon_difference",
        request=RequestSpec(
            method="POST",
            path="/api/sia/polygonOperations/difference",
            json=DIFFERENCE_PAYLOAD,
            mode="exact",
        ),
    ))

    # 15. POST /api/sia/bboxFromPoints
    specs.append(RouteSpec(
        name="POST_sia_bbox_from_points",
        request=RequestSpec(
            method="POST",
            path="/api/sia/bboxFromPoints",
            json=BBOX_FROM_POINTS_PAYLOAD,
            mode="exact",
        ),
    ))

    # --- Skipped: mutations (destructive to dev DB annotask state) ---

    # 16. PUT /api/sia — update whole annotation
    specs.append(RouteSpec(
        name="PUT_sia_update",
        request=RequestSpec(method="PUT", path="/api/sia"),
        skip=True,
        skip_reason="Mutation — updates annotations, destructive to dev DB state. Verified manually in P1.2.",
    ))

    # 17. PATCH /api/sia — partial annotation update
    specs.append(RouteSpec(
        name="PATCH_sia_partial_update",
        request=RequestSpec(method="PATCH", path="/api/sia"),
        skip=True,
        skip_reason="Mutation — partial update, destructive to dev DB state. Verified manually in P1.2.",
    ))

    # 18. POST /api/sia/finish — finish the annotask
    specs.append(RouteSpec(
        name="POST_sia_finish",
        request=RequestSpec(method="POST", path="/api/sia/finish"),
        skip=True,
        skip_reason="Mutation — finishes annotask (state change), destructive. Verified manually in P1.2.",
    ))

    return specs


def get_active_sia_specs() -> list[RouteSpec]:
    """Return only the non-skipped SIA specs."""
    return [s for s in get_sia_specs() if not s.skip]
