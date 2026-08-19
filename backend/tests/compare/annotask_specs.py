"""Annotasks namespace request specs for golden-snapshot testing.

Enumerates 23 annotasks routes: 17 active, 6 skipped.

Self-contained: uses ``compare_test_sia`` annotask + ``compare_test_dataset`` +
``compare_test_group`` created by init_test_data.py. No hardcoded IDs.

Reversible mutations modify compare_test_sia (not a real user's annotask):
- PATCH group: save group_id → change to compare_test_group → revert
- PUT config: save config → write test config → revert
- PATCH storage: save dataset_id → set to compare_test_dataset → revert
"""

from __future__ import annotations

from tests.helpers.recorder import RequestSpec
from tests.helpers.seed import unique_suffix, TEST_PREFIX
from tests.compare.user_specs import RouteSpec


# ---------------------------------------------------------------------------
# Setup: look up test annotask + image + export IDs by name
# ---------------------------------------------------------------------------


def _setup_annotask_context(dbm):
    """Look up compare_test_sia annotask + its image + export IDs.

    Populates context with:
    - annotask_id: the compare_test_sia annotask ID
    - image_id: the first image of compare_test_sia
    - export_id: the AnnoTaskExport ID for compare_test_sia
    - test_group_id: the compare_test_group ID (for PATCH group revert)
    - test_dataset_id: the compare_test_dataset ID (for PATCH storage revert)
    """
    from tests.helpers.lookups import (
        get_test_sia_annotask_id,
        get_test_sia_image_id,
        get_test_sia_export_id,
        get_test_group_id,
        get_test_dataset_id,
    )

    at_id = get_test_sia_annotask_id(dbm)
    if at_id is None:
        return {"skip": True}

    return {
        "annotask_id": at_id,
        "image_id": get_test_sia_image_id(dbm, 0),
        "export_id": get_test_sia_export_id(dbm),
        "test_group_id": get_test_group_id(dbm),
        "test_dataset_id": get_test_dataset_id(dbm),
        "skip": False,
    }


# ---------------------------------------------------------------------------
# Reversible mutation helpers (dynamic read in setup, revert in cleanup)
# ---------------------------------------------------------------------------


def _save_group_id(dbm):
    """Read current group_id from compare_test_sia before mutation.

    Also looks up test_group_id for the JSON body substitution.
    """
    from tests.helpers.lookups import get_test_sia_annotask_id, get_test_group_id

    at_id = get_test_sia_annotask_id(dbm)
    if at_id is None:
        return {"skip": True}
    at = dbm.get_anno_task(at_id)
    return {
        "original_group_id": at.group_id,
        "annotask_id": at_id,
        "test_group_id": get_test_group_id(dbm),
        "skip": False,
    }


def _revert_group_id(dbm, context):
    """Revert group_id to the original value after mutation."""
    from lost.db import access
    from lost.settings import LOST_CONFIG

    fresh_dbm = access.DBMan(LOST_CONFIG)
    try:
        at = fresh_dbm.get_anno_task(context["annotask_id"])
        if at:
            at.group_id = context["original_group_id"]
            fresh_dbm.save_obj(at)
    finally:
        fresh_dbm.close_session()


def _save_config(dbm):
    """Read current configuration from compare_test_sia before mutation."""
    from tests.helpers.lookups import get_test_sia_annotask_id

    at_id = get_test_sia_annotask_id(dbm)
    if at_id is None:
        return {"skip": True}
    at = dbm.get_anno_task(at_id)
    return {"original_config": at.configuration, "annotask_id": at_id, "skip": False}


def _revert_config(dbm, context):
    """Revert configuration to the original value after mutation."""
    from lost.db import access
    from lost.settings import LOST_CONFIG

    fresh_dbm = access.DBMan(LOST_CONFIG)
    try:
        at = fresh_dbm.get_anno_task(context["annotask_id"])
        if at:
            at.configuration = context["original_config"]
            fresh_dbm.save_obj(at)
    finally:
        fresh_dbm.close_session()


def _save_dataset_id(dbm):
    """Read current dataset_id from compare_test_sia before mutation.

    Also looks up test_dataset_id for the JSON body substitution.
    """
    from tests.helpers.lookups import get_test_sia_annotask_id, get_test_dataset_id

    at_id = get_test_sia_annotask_id(dbm)
    if at_id is None:
        return {"skip": True}
    at = dbm.get_anno_task(at_id)
    return {
        "original_dataset_id": at.dataset_id,
        "annotask_id": at_id,
        "test_dataset_id": get_test_dataset_id(dbm),
        "skip": False,
    }


def _revert_dataset_id(dbm, context):
    """Revert dataset_id to the original value after mutation."""
    from lost.db import access
    from lost.settings import LOST_CONFIG

    fresh_dbm = access.DBMan(LOST_CONFIG)
    try:
        at = fresh_dbm.get_anno_task(context["annotask_id"])
        if at:
            at.dataset_id = context["original_dataset_id"]
            fresh_dbm.save_obj(at)
    finally:
        fresh_dbm.close_session()


# ---------------------------------------------------------------------------
# Cleanup for POST create (delete the created dataset)
# ---------------------------------------------------------------------------


def _cleanup_created_dataset(dbm, context):
    """Delete a dataset created by POST /api/datasets."""
    ds_id = context.get("dataset_id")
    if ds_id is not None:
        ds = dbm.get_dataset(ds_id)
        if ds:
            dbm.session.delete(ds)
            dbm.session.commit()


# ---------------------------------------------------------------------------
# The 23 annotasks route specs (17 active, 6 skipped)
# ---------------------------------------------------------------------------


def get_annotask_specs() -> list[RouteSpec]:
    """Return all annotasks namespace test specs (17 active, 6 skipped)."""
    specs: list[RouteSpec] = []

    # --- Simple GETs (use setup to resolve IDs by name) ---

    # 1. GET /api/annotasks — list all annotasks (no pagination)
    specs.append(RouteSpec(
        name="GET_annotasks",
        request=RequestSpec(method="GET", path="/api/annotasks", mode="structural"),
    ))

    # 2. GET /api/annotasks?page=1&pageSize=5 — paginated list
    specs.append(RouteSpec(
        name="GET_annotasks_paged",
        request=RequestSpec(
            method="GET", path="/api/annotasks",
            params={"page": "1", "pageSize": "5"}, mode="structural",
        ),
    ))

    # 3. GET /api/annotasks/working — current active annotask
    specs.append(RouteSpec(
        name="GET_annotasks_working",
        request=RequestSpec(method="GET", path="/api/annotasks/working", mode="structural"),
    ))

    # 4. GET /api/annotasks/{id}?config=true — full details (statistics=true crashes with minimal data)
    specs.append(RouteSpec(
        name="GET_annotask_by_id",
        request=RequestSpec(
            method="GET", path="/api/annotasks/{annotask_id}",
            params={"config": "true"}, mode="structural",
        ),
        setup=_setup_annotask_context,
    ))

    # 5. GET /api/annotasks/{id}/storage_settings
    specs.append(RouteSpec(
        name="GET_annotask_storage",
        request=RequestSpec(
            method="GET", path="/api/annotasks/{annotask_id}/storage_settings", mode="structural",
        ),
        setup=_setup_annotask_context,
    ))

    # 6. GET /api/annotasks/{id}/exports — list exports
    specs.append(RouteSpec(
        name="GET_annotask_exports",
        request=RequestSpec(
            method="GET", path="/api/annotasks/{annotask_id}/exports", mode="structural",
        ),
        setup=_setup_annotask_context,
    ))

    # 7. GET /api/annotasks/{id}/instruction
    specs.append(RouteSpec(
        name="GET_annotask_instruction",
        request=RequestSpec(
            method="GET", path="/api/annotasks/{annotask_id}/instruction", mode="structural",
        ),
        setup=_setup_annotask_context,
    ))

    # 8. GET /api/annotasks/filterLabels
    specs.append(RouteSpec(
        name="GET_annotasks_filterLabels",
        request=RequestSpec(method="GET", path="/api/annotasks/filterLabels", mode="structural"),
    ))

    # 9. GET /api/annotasks/{id}/review/images — review image search
    specs.append(RouteSpec(
        name="GET_annotask_review_images",
        request=RequestSpec(
            method="GET", path="/api/annotasks/{annotask_id}/review/images", mode="structural",
        ),
        setup=_setup_annotask_context,
    ))

    # 10. GET /api/annotasks/{id}/review/labels
    specs.append(RouteSpec(
        name="GET_annotask_review_labels",
        request=RequestSpec(
            method="GET", path="/api/annotasks/{annotask_id}/review/labels", mode="structural",
        ),
        setup=_setup_annotask_context,
    ))

    # 11. GET /api/annotasks/{id}/review/options
    specs.append(RouteSpec(
        name="GET_annotask_review_options",
        request=RequestSpec(
            method="GET", path="/api/annotasks/{annotask_id}/review/options", mode="structural",
        ),
        setup=_setup_annotask_context,
    ))

    # 12. GET /api/annotasks/statistics/{id} — skip (crashes with minimal data: pandas "No objects to concatenate")
    specs.append(RouteSpec(
        name="GET_annotask_statistics",
        request=RequestSpec(
            method="GET", path="/api/annotasks/statistics/{annotask_id}", mode="structural",
        ),
        setup=_setup_annotask_context,
        skip=True,
        skip_reason="Endpoint crashes with minimal annotation data (pre-existing LOST bug: pandas concat on empty). Verified manually in P1.2.",
    ))

    # --- POST that's a read (navigation, not destructive) ---

    # 13. POST /api/annotasks/{id}/review — review navigation (direction=first)
    specs.append(RouteSpec(
        name="POST_annotask_review",
        request=RequestSpec(
            method="POST", path="/api/annotasks/{annotask_id}/review",
            json={"direction": "first", "imageAnnoId": 0, "annotaskIdx": "{annotask_id}"},
            mode="structural",
        ),
        setup=_setup_annotask_context,
    ))

    # --- Idempotent mutate-then-GET ---

    # 14. POST /api/annotasks (choose) + GET /api/annotasks/working
    specs.append(RouteSpec(
        name="POST_annotasks_choose",
        request=RequestSpec(
            method="POST", path="/api/annotasks",
            json={"id": "{annotask_id}"}, mode="structural",
        ),
        follow_up=RequestSpec(
            method="GET", path="/api/annotasks/working", mode="structural",
            label="POST_annotasks_choose__then_GET_working",
        ),
        setup=_setup_annotask_context,
    ))

    # --- Reversible mutations (dynamic read in setup, revert in cleanup) ---

    # 15. PATCH /api/annotasks/{id}/group (group change) + GET verify
    specs.append(RouteSpec(
        name="PATCH_annotask_group",
        request=RequestSpec(
            method="PATCH", path="/api/annotasks/{annotask_id}/group",
            json={"groupId": "{test_group_id}"}, mode="structural",
        ),
        follow_up=RequestSpec(
            method="GET", path="/api/annotasks/{annotask_id}", mode="structural",
            label="PATCH_annotask_group__then_GET",
        ),
        setup=_save_group_id,
        cleanup=_revert_group_id,
    ))

    # 16. PUT /api/annotasks/{id}/config (config change) + GET verify
    specs.append(RouteSpec(
        name="PUT_annotask_config",
        request=RequestSpec(
            method="PUT", path="/api/annotasks/{annotask_id}/config",
            json={"id": "{annotask_id}", "configuration": {"test": True}}, mode="structural",
        ),
        follow_up=RequestSpec(
            method="GET", path="/api/annotasks/{annotask_id}",
            params={"config": "true"}, mode="structural",
            label="PUT_annotask_config__then_GET",
        ),
        setup=_save_config,
        cleanup=_revert_config,
    ))

    # 17. PATCH /api/annotasks/{id}/storage_settings (storage change) + GET verify
    specs.append(RouteSpec(
        name="PATCH_annotask_storage",
        request=RequestSpec(
            method="PATCH", path="/api/annotasks/{annotask_id}/storage_settings",
            json={"datasetId": "{test_dataset_id}"}, mode="structural",
        ),
        follow_up=RequestSpec(
            method="GET", path="/api/annotasks/{annotask_id}/storage_settings", mode="structural",
            label="PATCH_annotask_storage__then_GET",
        ),
        setup=_save_dataset_id,
        cleanup=_revert_dataset_id,
    ))

    # --- Skipped: irreversible / risky mutations ---

    specs.append(RouteSpec(
        name="POST_annotask_force_release",
        request=RequestSpec(method="POST", path="/api/annotasks/{annotask_id}/force_release"),
        skip=True,
        skip_reason="Irreversible — releases locked annotations. Verified manually in P1.2.",
    ))

    specs.append(RouteSpec(
        name="POST_annotask_export",
        request=RequestSpec(method="POST", path="/api/annotasks/{annotask_id}/exports"),
        skip=True,
        skip_reason="Triggers async dask job. Verified manually in P1.2.",
    ))

    specs.append(RouteSpec(
        name="DELETE_annotask_export",
        request=RequestSpec(method="DELETE", path="/api/annotasks/exports/{export_id}"),
        skip=True,
        skip_reason="Irreversible — deletes export. Verified manually in P1.2.",
    ))

    specs.append(RouteSpec(
        name="PATCH_annotask_instruction",
        request=RequestSpec(method="PATCH", path="/api/annotasks/{annotask_id}/instruction"),
        skip=True,
        skip_reason="No instructions in DB to meaningfully test. Verified manually in P1.2.",
    ))

    specs.append(RouteSpec(
        name="PATCH_annotask_annotation",
        request=RequestSpec(method="PATCH", path="/api/annotasks/{annotask_id}/annotation"),
        skip=True,
        skip_reason="Changes annotation state — too risky. Verified manually in P1.2.",
    ))

    specs.append(RouteSpec(
        name="GET_annotask_export_download",
        request=RequestSpec(method="GET", path="/api/annotasks/exports/{export_id}"),
        skip=True,
        skip_reason="Binary file download — recorder needs fix. Verified manually in P1.2.",
    ))

    return specs


def get_active_annotask_specs() -> list[RouteSpec]:
    """Return only the non-skipped annotasks specs."""
    return [s for s in get_annotask_specs() if not s.skip]
