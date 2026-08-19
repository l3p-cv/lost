"""SIA namespace request specs for golden-snapshot testing.

Enumerates all 18 SIA routes. 15 are active (recorded + compared);
3 mutations (PUT, PATCH, finish) are skipped to avoid destructive dev DB changes.

Self-contained: uses ``compare_test_sia`` annotask created by init_test_data.py.
No hardcoded IDs — looks up annotask + image by name.

Setup: save current chosen annotask → choose compare_test_sia for admin → get image ID.
Cleanup: re-choose the original annotask.
If compare_test_sia doesn't exist (init_test_data.py didn't run) → pytest.skip.
"""

from __future__ import annotations

import pytest

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
# Setup/cleanup — choose compare_test_sia, revert to original
# ---------------------------------------------------------------------------


def _setup_choose_sia(dbm):
    """Save current chosen annotask, choose compare_test_sia, get image ID."""
    from lost.db.model import ChoosenAnnoTask, AnnoTask, ImageAnno
    from tests.helpers.lookups import get_test_sia_annotask_id, get_test_sia_image_id

    sia_id = get_test_sia_annotask_id(dbm)
    if sia_id is None:
        return {"skip": True}

    image_id = get_test_sia_image_id(dbm, 0)
    if image_id is None:
        return {"skip": True}

    current = dbm.session.query(ChoosenAnnoTask).filter_by(user_id=1).first()
    original_id = current.anno_task_id if current else None

    if current:
        dbm.delete(current)
        dbm.commit()
    new_choice = ChoosenAnnoTask(user_id=1, anno_task_id=sia_id)
    dbm.save_obj(new_choice)

    return {"original_id": original_id, "skip": False, "image_id": image_id}


def _cleanup_revert_choice(dbm, context):
    """Re-choose the original annotask after SIA test."""
    if context.get("skip"):
        return

    from lost.db import access
    from lost.settings import LOST_CONFIG
    from lost.db.model import ChoosenAnnoTask

    fresh_dbm = access.DBMan(LOST_CONFIG)
    try:
        current = fresh_dbm.session.query(ChoosenAnnoTask).filter_by(user_id=1).first()
        if current:
            fresh_dbm.delete(current)
            fresh_dbm.commit()
        original_id = context.get("original_id")
        if original_id is not None:
            new_choice = ChoosenAnnoTask(user_id=1, anno_task_id=original_id)
            fresh_dbm.save_obj(new_choice)
    finally:
        fresh_dbm.close_session()


# ---------------------------------------------------------------------------
# Specs that need the annotask chosen (use setup/cleanup)
# ---------------------------------------------------------------------------

_NEEDS_CHOSEN = "needs_chosen"


def get_sia_specs() -> list[RouteSpec]:
    """Return all SIA namespace test specs (15 active, 3 skipped)."""
    specs: list[RouteSpec] = []

    # --- GETs that need the annotask chosen ---

    # 1. GET /api/sia?direction=first — get first SIA annotation
    specs.append(RouteSpec(
        name="GET_sia_first",
        request=RequestSpec(
            method="GET", path="/api/sia",
            params={"direction": "first", "lastImgId": "0"},
            mode="structural",
        ),
        setup=_setup_choose_sia,
        cleanup=_cleanup_revert_choice,
    ))

    # 2. GET /api/sia?direction=next&lastImgId={image_id} — get next image
    specs.append(RouteSpec(
        name="GET_sia_next",
        request=RequestSpec(
            method="GET", path="/api/sia",
            params={"direction": "next", "lastImgId": "{image_id}"},
            mode="structural",
        ),
        setup=_setup_choose_sia,
        cleanup=_cleanup_revert_choice,
    ))

    # 3. GET /api/sia/images — get all image IDs for current annotask
    specs.append(RouteSpec(
        name="GET_sia_images",
        request=RequestSpec(method="GET", path="/api/sia/images", mode="structural"),
        setup=_setup_choose_sia,
        cleanup=_cleanup_revert_choice,
    ))

    # 4. GET /api/sia/label — get label trees
    specs.append(RouteSpec(
        name="GET_sia_label",
        request=RequestSpec(method="GET", path="/api/sia/label", mode="structural"),
        setup=_setup_choose_sia,
        cleanup=_cleanup_revert_choice,
    ))

    # 5. GET /api/sia/configuration — get SIA config
    specs.append(RouteSpec(
        name="GET_sia_configuration",
        request=RequestSpec(method="GET", path="/api/sia/configuration", mode="structural"),
        setup=_setup_choose_sia,
        cleanup=_cleanup_revert_choice,
    ))

    # 6. GET /api/sia/nextAnnoId — get next annotation ID
    specs.append(RouteSpec(
        name="GET_sia_nextAnnoId",
        request=RequestSpec(method="GET", path="/api/sia/nextAnnoId", mode="structural"),
        setup=_setup_choose_sia,
        cleanup=_cleanup_revert_choice,
    ))

    # 7. GET /api/sia/allowedExampler — check if user can mark examples
    specs.append(RouteSpec(
        name="GET_sia_allowedExampler",
        request=RequestSpec(method="GET", path="/api/sia/allowedExampler", mode="structural"),
        setup=_setup_choose_sia,
        cleanup=_cleanup_revert_choice,
    ))

    # --- Image GETs (need valid image_id from context) ---

    # 8. GET /api/sia/image/{image_id} — get image (base64 JPEG)
    specs.append(RouteSpec(
        name="GET_sia_image",
        request=RequestSpec(method="GET", path="/api/sia/image/{image_id}", mode="exact"),
        setup=_setup_choose_sia,
        cleanup=_cleanup_revert_choice,
    ))

    # 9. GET /api/sia/image/{image_id}/name — get image basename
    specs.append(RouteSpec(
        name="GET_sia_image_name",
        request=RequestSpec(method="GET", path="/api/sia/image/{image_id}/name", mode="structural"),
        setup=_setup_choose_sia,
        cleanup=_cleanup_revert_choice,
    ))

    # 10. GET /api/sia/image/{image_id}/thumbnail — get thumbnail (base64 JPEG)
    specs.append(RouteSpec(
        name="GET_sia_image_thumbnail",
        request=RequestSpec(method="GET", path="/api/sia/image/{image_id}/thumbnail", mode="exact"),
        setup=_setup_choose_sia,
        cleanup=_cleanup_revert_choice,
    ))

    # --- Image filter POST (base64 JPEG response) ---

    # 11. POST /api/sia/image/{image_id}/filters — apply filters to image
    specs.append(RouteSpec(
        name="POST_sia_image_filters",
        request=RequestSpec(
            method="POST", path="/api/sia/image/{image_id}/filters",
            json=IMAGE_FILTERS_PAYLOAD, mode="exact",
        ),
        setup=_setup_choose_sia,
        cleanup=_cleanup_revert_choice,
    ))

    # --- Pure-compute POSTs (no DB, no annotask needed, deterministic) ---

    # 12. POST /api/sia/polygonOperations/union
    specs.append(RouteSpec(
        name="POST_sia_polygon_union",
        request=RequestSpec(
            method="POST", path="/api/sia/polygonOperations/union",
            json=UNION_PAYLOAD, mode="exact",
        ),
    ))

    # 13. POST /api/sia/polygonOperations/intersection
    specs.append(RouteSpec(
        name="POST_sia_polygon_intersection",
        request=RequestSpec(
            method="POST", path="/api/sia/polygonOperations/intersection",
            json=INTERSECTION_PAYLOAD, mode="exact",
        ),
    ))

    # 14. POST /api/sia/polygonOperations/difference
    specs.append(RouteSpec(
        name="POST_sia_polygon_difference",
        request=RequestSpec(
            method="POST", path="/api/sia/polygonOperations/difference",
            json=DIFFERENCE_PAYLOAD, mode="exact",
        ),
    ))

    # 15. POST /api/sia/bboxFromPoints
    specs.append(RouteSpec(
        name="POST_sia_bbox_from_points",
        request=RequestSpec(
            method="POST", path="/api/sia/bboxFromPoints",
            json=BBOX_FROM_POINTS_PAYLOAD, mode="exact",
        ),
    ))

    # --- Skipped: mutations (destructive to dev DB annotask state) ---

    specs.append(RouteSpec(
        name="PUT_sia_update",
        request=RequestSpec(method="PUT", path="/api/sia"),
        skip=True,
        skip_reason="Mutation — updates annotations, destructive to dev DB state. Verified manually in P1.2.",
    ))

    specs.append(RouteSpec(
        name="PATCH_sia_partial_update",
        request=RequestSpec(method="PATCH", path="/api/sia"),
        skip=True,
        skip_reason="Mutation — partial update, destructive to dev DB state. Verified manually in P1.2.",
    ))

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
