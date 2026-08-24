"""MIA namespace request specs for golden-snapshot testing.

8 routes: 5 active (GETs), 3 skipped (mutations).

Self-contained: uses ``compare_test_mia`` annotask created by init_test_data.py.
No hardcoded IDs — looks up the annotask by name.

Setup: save current chosen annotask → choose compare_test_mia for admin.
Cleanup: re-choose the original annotask.
If compare_test_mia doesn't exist (init_test_data.py didn't run) → pytest.skip.
"""

from __future__ import annotations

import pytest

from tests.helpers.recorder import RequestSpec
from tests.helpers.specs import RouteSpec


def _get_test_mia_annotask_id(dbm):
    """Look up the compare_test_mia annotask ID by name."""
    from lost.db.model import AnnoTask

    at = dbm.session.query(AnnoTask).filter_by(name="compare_test_mia").first()
    return at.idx if at else None


def _setup_choose_mia(dbm):
    """Save current chosen annotask, then choose compare_test_mia for admin."""
    from lost.db.model import ChoosenAnnoTask

    mia_id = _get_test_mia_annotask_id(dbm)
    if mia_id is None:
        return {"skip": True}

    current = dbm.session.query(ChoosenAnnoTask).filter_by(user_id=1).first()
    original_id = current.anno_task_id if current else None

    if current:
        dbm.delete(current)
        dbm.commit()
    new_choice = ChoosenAnnoTask(user_id=1, anno_task_id=mia_id)
    dbm.save_obj(new_choice)

    return {"original_id": original_id, "skip": False, "mia_id": mia_id}


def _cleanup_revert_choice(dbm, context):
    """Re-choose the original annotask after MIA test."""
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


def get_mia_specs() -> list[RouteSpec]:
    specs: list[RouteSpec] = []

    # 1. GET /api/mia/first — get first MIA anno
    specs.append(RouteSpec(
        name="GET_mia_first",
        request=RequestSpec(method="GET", path="/api/mia/first", mode="structural"),
        setup=_setup_choose_mia,
        cleanup=_cleanup_revert_choice,
    ))

    # 2. GET /api/mia/latest — get latest MIA anno
    specs.append(RouteSpec(
        name="GET_mia_latest",
        request=RequestSpec(method="GET", path="/api/mia/latest", mode="structural"),
        setup=_setup_choose_mia,
        cleanup=_cleanup_revert_choice,
    ))

    # 3. GET /api/mia/next/10 — get next 10 MIA annos
    specs.append(RouteSpec(
        name="GET_mia_next",
        request=RequestSpec(method="GET", path="/api/mia/next/10", mode="structural"),
        setup=_setup_choose_mia,
        cleanup=_cleanup_revert_choice,
    ))

    # 4. GET /api/mia/label — get MIA label trees
    specs.append(RouteSpec(
        name="GET_mia_label",
        request=RequestSpec(method="GET", path="/api/mia/label", mode="structural"),
        setup=_setup_choose_mia,
        cleanup=_cleanup_revert_choice,
    ))

    # 5. GET /api/mia/prev?currentChunkId=-1 — chunkId=-1 calls get_latest
    specs.append(RouteSpec(
        name="GET_mia_prev",
        request=RequestSpec(
            method="GET", path="/api/mia/prev",
            params={"currentChunkId": "-1"},
            mode="structural",
        ),
        setup=_setup_choose_mia,
        cleanup=_cleanup_revert_choice,
    ))

    # --- Skipped: mutations ---

    # 6. PATCH /api/mia — update MIA task (mutation)
    specs.append(RouteSpec(
        name="PATCH_mia_update",
        request=RequestSpec(method="PATCH", path="/api/mia"),
        skip=True,
        skip_reason="Mutation — updates annotation state. Verified manually in P1.2.",
    ))

    # 7. POST /api/mia/finish — finish MIA task (mutation)
    specs.append(RouteSpec(
        name="POST_mia_finish",
        request=RequestSpec(method="POST", path="/api/mia/finish"),
        skip=True,
        skip_reason="Mutation — finishes annotask. Verified manually in P1.2.",
    ))

    # 8. POST /api/mia/special — get special MIA images (needs miaIds from prior calls)
    specs.append(RouteSpec(
        name="POST_mia_special",
        request=RequestSpec(method="POST", path="/api/mia/special"),
        skip=True,
        skip_reason="Needs miaIds from prior MIA calls — complex setup. Verified manually in P1.2.",
    ))

    return specs


def get_active_mia_specs() -> list[RouteSpec]:
    return [s for s in get_mia_specs() if not s.skip]
