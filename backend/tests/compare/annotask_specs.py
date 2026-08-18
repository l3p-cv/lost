"""Annotasks namespace request specs for golden-snapshot testing.

Enumerates 23 annotasks routes: 17 active, 6 skipped.

Prerequisites (must exist in dev DB, seeded by initlost + OOTB pipelines):
- admin user (idx=1) with Annotator + Designer roles
- SIA annotask (idx=97) assigned to admin via ChoosenAnnoTask
- admin is the pipe manager for annotask 97's pipe (pipe.manager_id == 1)
- ImageAnno (idx=1469) belonging to annotask 97, state=4 (LABELED)
- AnnoTaskExport (idx=105) for annotask 97

Reversible mutations use dynamic read in setup + revert in cleanup:
- PATCH group: read group_id → change to 2 → GET verify → revert
- PUT config: read config → write test config → GET verify → revert
- PATCH storage: read dataset_id → set to 1 → GET verify → revert to -1 (None)
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Callable, Optional

from tests.helpers.recorder import RequestSpec
from tests.compare.user_specs import RouteSpec

# ---------------------------------------------------------------------------
# Dev DB constants
# ---------------------------------------------------------------------------

ANNOTASK_ID = 97
IMAGE_ID = 1469
EXPORT_ID = 105
TEST_GROUP_ID = 2  # "test" group — used for PATCH group revert test
TEST_DATASET_ID = 1  # "Dataset 2" — used for PATCH storage revert test


# ---------------------------------------------------------------------------
# Reversible mutation helpers (dynamic read in setup, revert in cleanup)
# ---------------------------------------------------------------------------


def _save_group_id(dbm):
    """Read current group_id from annotask 97 before mutation."""
    at = dbm.get_anno_task(ANNOTASK_ID)
    return {"original_group_id": at.group_id}


def _revert_group_id(dbm, context):
    """Revert group_id to the original value after mutation."""
    at = dbm.get_anno_task(ANNOTASK_ID)
    at.group_id = context["original_group_id"]
    dbm.save_obj(at)


def _save_config(dbm):
    """Read current configuration from annotask 97 before mutation."""
    at = dbm.get_anno_task(ANNOTASK_ID)
    return {"original_config": at.configuration}


def _revert_config(dbm, context):
    """Revert configuration to the original value after mutation."""
    at = dbm.get_anno_task(ANNOTASK_ID)
    at.configuration = context["original_config"]
    dbm.save_obj(at)


def _save_dataset_id(dbm):
    """Read current dataset_id from annotask 97 before mutation."""
    at = dbm.get_anno_task(ANNOTASK_ID)
    return {"original_dataset_id": at.dataset_id}


def _revert_dataset_id(dbm, context):
    """Revert dataset_id to the original value after mutation."""
    at = dbm.get_anno_task(ANNOTASK_ID)
    at.dataset_id = context["original_dataset_id"]
    dbm.save_obj(at)


# ---------------------------------------------------------------------------
# The 23 annotasks route specs (17 active, 6 skipped)
# ---------------------------------------------------------------------------


def get_annotask_specs() -> list[RouteSpec]:
    """Return all annotasks namespace test specs (17 active, 6 skipped)."""
    specs: list[RouteSpec] = []

    # --- Simple GETs ---

    # 1. GET /api/annotasks — list all annotasks (no pagination)
    specs.append(RouteSpec(
        name="GET_annotasks",
        request=RequestSpec(
            method="GET",
            path="/api/annotasks",
            mode="structural",
        ),
    ))

    # 2. GET /api/annotasks?page=1&pageSize=5 — list with pagination
    specs.append(RouteSpec(
        name="GET_annotasks_paged",
        request=RequestSpec(
            method="GET",
            path="/api/annotasks",
            params={"page": "1", "pageSize": "5"},
            mode="structural",
        ),
    ))

    # 3. GET /api/annotasks/working — current active annotask
    specs.append(RouteSpec(
        name="GET_annotasks_working",
        request=RequestSpec(
            method="GET",
            path="/api/annotasks/working",
            mode="structural",
        ),
    ))

    # 4. GET /api/annotasks/97?statistics=true&config=true — full details
    specs.append(RouteSpec(
        name="GET_annotask_by_id",
        request=RequestSpec(
            method="GET",
            path=f"/api/annotasks/{ANNOTASK_ID}",
            params={"statistics": "true", "config": "true"},
            mode="structural",
        ),
    ))

    # 5. GET /api/annotasks/97/storage_settings
    specs.append(RouteSpec(
        name="GET_annotask_storage",
        request=RequestSpec(
            method="GET",
            path=f"/api/annotasks/{ANNOTASK_ID}/storage_settings",
            mode="structural",
        ),
    ))

    # 6. GET /api/annotasks/97/exports — list exports
    specs.append(RouteSpec(
        name="GET_annotask_exports",
        request=RequestSpec(
            method="GET",
            path=f"/api/annotasks/{ANNOTASK_ID}/exports",
            mode="structural",
        ),
    ))

    # 7. GET /api/annotasks/97/instruction
    specs.append(RouteSpec(
        name="GET_annotask_instruction",
        request=RequestSpec(
            method="GET",
            path=f"/api/annotasks/{ANNOTASK_ID}/instruction",
            mode="structural",
        ),
    ))

    # 8. GET /api/annotasks/filterLabels
    specs.append(RouteSpec(
        name="GET_annotasks_filterLabels",
        request=RequestSpec(
            method="GET",
            path="/api/annotasks/filterLabels",
            mode="structural",
        ),
    ))

    # 9. GET /api/annotasks/97/review/images — review image search
    specs.append(RouteSpec(
        name="GET_annotask_review_images",
        request=RequestSpec(
            method="GET",
            path=f"/api/annotasks/{ANNOTASK_ID}/review/images",
            mode="structural",
        ),
    ))

    # 10. GET /api/annotasks/97/review/labels
    specs.append(RouteSpec(
        name="GET_annotask_review_labels",
        request=RequestSpec(
            method="GET",
            path=f"/api/annotasks/{ANNOTASK_ID}/review/labels",
            mode="structural",
        ),
    ))

    # 11. GET /api/annotasks/97/review/options
    specs.append(RouteSpec(
        name="GET_annotask_review_options",
        request=RequestSpec(
            method="GET",
            path=f"/api/annotasks/{ANNOTASK_ID}/review/options",
            mode="structural",
        ),
    ))

    # 12. GET /api/annotasks/statistics/97
    specs.append(RouteSpec(
        name="GET_annotask_statistics",
        request=RequestSpec(
            method="GET",
            path=f"/api/annotasks/statistics/{ANNOTASK_ID}",
            mode="structural",
        ),
    ))

    # --- POST that's a read (navigation, not destructive) ---

    # 13. POST /api/annotasks/97/review — review navigation (direction=first)
    specs.append(RouteSpec(
        name="POST_annotask_review",
        request=RequestSpec(
            method="POST",
            path=f"/api/annotasks/{ANNOTASK_ID}/review",
            json={"direction": "first", "imageAnnoId": 0, "annotaskIdx": ANNOTASK_ID},
            mode="structural",
        ),
    ))

    # --- Idempotent mutate-then-GET ---

    # 14. POST /api/annotasks (choose) + GET /api/annotasks/working
    #     Idempotent — re-choosing annotask 97 is a no-op (unique constraint on user_id)
    specs.append(RouteSpec(
        name="POST_annotasks_choose",
        request=RequestSpec(
            method="POST",
            path="/api/annotasks",
            json={"id": ANNOTASK_ID},
            mode="structural",
        ),
        follow_up=RequestSpec(
            method="GET",
            path="/api/annotasks/working",
            mode="structural",
            label="POST_annotasks_choose__then_GET_working",
        ),
    ))

    # --- Reversible mutations (dynamic read in setup, revert in cleanup) ---

    # 15. PATCH /api/annotasks/97 (group change) + GET verify
    specs.append(RouteSpec(
        name="PATCH_annotask_group",
        request=RequestSpec(
            method="PATCH",
            path=f"/api/annotasks/{ANNOTASK_ID}",
            json={"groupId": TEST_GROUP_ID},
            mode="structural",
        ),
        follow_up=RequestSpec(
            method="GET",
            path=f"/api/annotasks/{ANNOTASK_ID}",
            mode="structural",
            label="PATCH_annotask_group__then_GET",
        ),
        setup=_save_group_id,
        cleanup=_revert_group_id,
    ))

    # 16. PUT /api/annotasks/97 (config change) + GET verify
    specs.append(RouteSpec(
        name="PUT_annotask_config",
        request=RequestSpec(
            method="PUT",
            path=f"/api/annotasks/{ANNOTASK_ID}",
            json={"configuration": {"test": True}},
            mode="structural",
        ),
        follow_up=RequestSpec(
            method="GET",
            path=f"/api/annotasks/{ANNOTASK_ID}",
            params={"config": "true"},
            mode="structural",
            label="PUT_annotask_config__then_GET",
        ),
        setup=_save_config,
        cleanup=_revert_config,
    ))

    # 17. PATCH /api/annotasks/97 (storage_settings change) + GET verify
    specs.append(RouteSpec(
        name="PATCH_annotask_storage",
        request=RequestSpec(
            method="PATCH",
            path=f"/api/annotasks/{ANNOTASK_ID}",
            json={"datasetId": TEST_DATASET_ID},
            mode="structural",
        ),
        follow_up=RequestSpec(
            method="GET",
            path=f"/api/annotasks/{ANNOTASK_ID}/storage_settings",
            mode="structural",
            label="PATCH_annotask_storage__then_GET",
        ),
        setup=_save_dataset_id,
        cleanup=_revert_dataset_id,
    ))

    # --- Skipped: irreversible / risky mutations ---

    # 18. POST /api/annotasks/97/force_release — releases locked annotations
    specs.append(RouteSpec(
        name="POST_annotask_force_release",
        request=RequestSpec(method="POST", path=f"/api/annotasks/{ANNOTASK_ID}/force_release"),
        skip=True,
        skip_reason="Irreversible — releases locked annotations, can't re-lock. Verified manually in P1.2.",
    ))

    # 19. POST /api/annotasks/97/exports — triggers async dask export job
    specs.append(RouteSpec(
        name="POST_annotask_export",
        request=RequestSpec(method="POST", path=f"/api/annotasks/{ANNOTASK_ID}/exports"),
        skip=True,
        skip_reason="Triggers async dask job + creates export entry. Verified manually in P1.2.",
    ))

    # 20. DELETE /api/annotasks/exports/105 — deletes export
    specs.append(RouteSpec(
        name="DELETE_annotask_export",
        request=RequestSpec(method="DELETE", path=f"/api/annotasks/exports/{EXPORT_ID}"),
        skip=True,
        skip_reason="Irreversible — deletes export file + DB entry. Verified manually in P1.2.",
    ))

    # 21. PATCH /api/annotasks/97/instruction — no instructions in DB to test with
    specs.append(RouteSpec(
        name="PATCH_annotask_instruction",
        request=RequestSpec(method="PATCH", path=f"/api/annotasks/{ANNOTASK_ID}/instruction"),
        skip=True,
        skip_reason="No instructions in DB to meaningfully test. Verified manually in P1.2.",
    ))

    # 22. PATCH /api/annotasks/97/annotation — changes annotation state
    specs.append(RouteSpec(
        name="PATCH_annotask_annotation",
        request=RequestSpec(method="PATCH", path=f"/api/annotasks/{ANNOTASK_ID}/annotation"),
        skip=True,
        skip_reason="Changes annotation state — too risky for dev DB. Verified manually in P1.2.",
    ))

    # 23. GET /api/annotasks/exports/105 — binary file download
    specs.append(RouteSpec(
        name="GET_annotask_export_download",
        request=RequestSpec(method="GET", path=f"/api/annotasks/exports/{EXPORT_ID}"),
        skip=True,
        skip_reason="Binary file download — recorder needs fix for binary responses. Verified manually in P1.2.",
    ))

    return specs


def get_active_annotask_specs() -> list[RouteSpec]:
    """Return only the non-skipped annotasks specs."""
    return [s for s in get_annotask_specs() if not s.skip]
