"""Dataset namespace request specs for golden-snapshot testing.

Enumerates 13 dataset routes: 8 active, 5 skipped.

Prerequisites (must exist in dev DB, seeded by initlost + OOTB pipelines):
- admin user (idx=1) with Designer role
- Dataset (idx=1, name="Dataset 2") with 2 annotask children (76, 105)
- DatasetExport (idx=3) for dataset 1
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Callable, Optional

from tests.helpers.recorder import RequestSpec
from tests.helpers.seed import unique_suffix, TEST_PREFIX
from tests.helpers.specs import RouteSpec

# ---------------------------------------------------------------------------
# Setup: look up test dataset + export IDs by name
# ---------------------------------------------------------------------------


def _setup_dataset_context(dbm):
    """Look up compare_test_dataset + its export ID by name."""
    from tests.helpers.lookups import get_test_dataset_id, get_test_dataset_export_id

    ds_id = get_test_dataset_id(dbm)
    if ds_id is None:
        return {"skip": True}
    return {
        "dataset_id": ds_id,
        "export_id": get_test_dataset_export_id(dbm),
        "skip": False,
    }


# ---------------------------------------------------------------------------
# Reversible mutation helpers (dynamic read in setup, revert in cleanup)
# ---------------------------------------------------------------------------


def _save_dataset_name(dbm):
    """Read current name + description from compare_test_dataset before mutation."""
    from tests.helpers.lookups import get_test_dataset_id

    ds_id = get_test_dataset_id(dbm)
    if ds_id is None:
        return {"skip": True}
    ds = dbm.get_dataset(ds_id)
    return {"original_name": ds.name, "original_description": ds.description, "dataset_id": ds_id, "skip": False}


def _revert_dataset_name(dbm, context):
    """Revert name + description to original values after mutation.

    Uses a fresh DBMan session to avoid stale state — the Flask API endpoint
    committed the mutation with its own DBMan session, so the shared fixture
    session may have cached the pre-mutation object.
    """
    from lost.db import access
    from lost.settings import LOST_CONFIG

    fresh_dbm = access.DBMan(LOST_CONFIG)
    try:
        ds = fresh_dbm.get_dataset(context["dataset_id"])
        if ds:
            ds.name = context["original_name"]
            ds.description = context["original_description"]
            fresh_dbm.save_obj(ds)
    finally:
        fresh_dbm.close_session()


# ---------------------------------------------------------------------------
# Cleanup for POST create (delete the created test dataset)
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
# Setup: create a throwaway dataset for DELETE test
# ---------------------------------------------------------------------------


def _setup_delete_dataset(dbm):
    """Create a throwaway dataset to be deleted via the API."""
    from lost.db import model
    from tests.helpers.seed import unique_suffix, TEST_PREFIX

    ds = model.Dataset(
        name=f"{TEST_PREFIX}delete_{unique_suffix()}",
        description="Throwaway dataset for DELETE test",
    )
    dbm.save_obj(ds)
    return {"dataset_id": ds.idx, "skip": False}


# ---------------------------------------------------------------------------
# Setup: create a throwaway DatasetExport for DELETE test
# ---------------------------------------------------------------------------


def _setup_delete_export(dbm):
    """Create a throwaway DatasetExport to be deleted via the API."""
    from lost.db import model
    from tests.helpers.seed import unique_suffix, TEST_PREFIX
    from tests.helpers.lookups import get_test_dataset_id
    from datetime import datetime, timezone

    ds_id = get_test_dataset_id(dbm)
    if ds_id is None:
        return {"skip": True}
    exp = model.DatasetExport(
        dataset_id=ds_id,
        file_path=f"/home/lost/data/1/ds_export/test/{TEST_PREFIX}delete_export_{unique_suffix()}.parquet",
        progress=100,
    )
    dbm.save_obj(exp)
    return {"export_id": exp.idx, "skip": False}


# ---------------------------------------------------------------------------
# Cleanup: delete a DatasetExport created by POST parquet export
# ---------------------------------------------------------------------------


def _cleanup_created_export(dbm, context):
    """Delete a DatasetExport created by POST export (if the API didn't already)."""
    from lost.db import model

    exp_id = context.get("export_id")
    if exp_id is not None:
        exp = dbm.session.query(model.DatasetExport).filter_by(idx=exp_id).first()
        if exp:
            dbm.session.delete(exp)
            dbm.session.commit()


# ---------------------------------------------------------------------------
# The 13 dataset route specs (8 active, 5 skipped)
# ---------------------------------------------------------------------------


def get_dataset_specs() -> list[RouteSpec]:
    """Return all dataset namespace test specs (8 active, 5 skipped)."""
    specs: list[RouteSpec] = []

    # --- Simple GETs ---

    # 1. GET /api/datasets — list all top-level datasets + meta
    specs.append(RouteSpec(
        name="GET_datasets",
        request=RequestSpec(
            method="GET",
            path="/api/datasets",
            mode="structural",
        ),
    ))

    # 2. GET /api/datasets/paged/0/5 — paginated list
    specs.append(RouteSpec(
        name="GET_datasets_paged",
        request=RequestSpec(
            method="GET",
            path="/api/datasets/paged/0/5",
            mode="structural",
        ),
    ))

    # 3. GET /api/datasets/flat — skip (flat dict with DB-ID keys, non-deterministic across runs)
    specs.append(RouteSpec(
        name="GET_datasets_flat",
        request=RequestSpec(method="GET", path="/api/datasets/flat"),
        skip=True,
        skip_reason="Flat dict with DB-ID keys — new datasets created during test runs add keys. Non-deterministic. Verified manually in P1.2.",
    ))

    # 4. GET /api/datasets/{id}/review/images — review image search
    specs.append(RouteSpec(
        name="GET_dataset_review_images",
        request=RequestSpec(
            method="GET",
            path="/api/datasets/{dataset_id}/review/images",
            mode="structural",
        ),
        setup=_setup_dataset_context,
    ))

    # 5. GET /api/datasets/{id}/review/possibleLabels
    specs.append(RouteSpec(
        name="GET_dataset_review_possibleLabels",
        request=RequestSpec(
            method="GET",
            path="/api/datasets/{dataset_id}/review/possibleLabels",
            mode="structural",
        ),
        setup=_setup_dataset_context,
    ))

    # 6. GET /api/datasets/{id}/ds_exports — list exports
    specs.append(RouteSpec(
        name="GET_dataset_exports",
        request=RequestSpec(
            method="GET",
            path="/api/datasets/{dataset_id}/ds_exports",
            mode="structural",
        ),
        setup=_setup_dataset_context,
    ))

    # --- POST that's a read (navigation, not destructive) ---

    # 7. POST /api/datasets/{id}/review — skip (stateful navigation, non-deterministic)
    specs.append(RouteSpec(
        name="POST_dataset_review",
        request=RequestSpec(
            method="POST",
            path="/api/datasets/{dataset_id}/review",
            json={"direction": "first"},
            mode="structural",
        ),
        setup=_setup_dataset_context,
        skip=True,
        skip_reason="Stateful navigation — advances through images, returns different data on each run. Non-deterministic. Verified manually in P1.2.",
    ))

    # --- Mutate-then-GET (create + cleanup) ---

    # 8. POST /api/datasets — create test dataset → GET verify → cleanup
    suffix = unique_suffix()
    create_payload = {
        "name": f"{TEST_PREFIX}{suffix}",
        "description": "Test dataset for golden snapshots",
        "parentDatasetId": -1,
    }
    specs.append(RouteSpec(
        name="POST_dataset_create",
        request=RequestSpec(
            method="POST",
            path="/api/datasets",
            json=create_payload,
            mode="structural",
        ),
        follow_up=RequestSpec(
            method="GET",
            path="/api/datasets",
            mode="structural",
            label="POST_dataset_create__then_GET",
        ),
        setup=lambda dbm: {},  # no setup needed
        cleanup=_cleanup_created_dataset,
    ))

    # --- Reversible mutation (PATCH name + description) ---

    # 9. PATCH /api/datasets — rename dataset 1 → GET verify → revert
    specs.append(RouteSpec(
        name="PATCH_dataset_update",
        request=RequestSpec(
            method="PATCH",
            path="/api/datasets",
            json={
                "id": "{dataset_id}",
                "name": f"{TEST_PREFIX}renamed",
                "description": "Temporarily renamed by golden snapshot test",
                "parentDatasetId": -1,
            },
            mode="structural",
        ),
        follow_up=RequestSpec(
            method="GET",
            path="/api/datasets",
            mode="structural",
            label="PATCH_dataset_update__then_GET",
        ),
        setup=_save_dataset_name,
        cleanup=_revert_dataset_name,
    ))

    # --- Skipped: irreversible / risky ---

    # 10. DELETE /api/datasets/{id} — create throwaway → DELETE via API → GET 404
    specs.append(RouteSpec(
        name="DELETE_dataset",
        request=RequestSpec(method="DELETE", path="/api/datasets/{dataset_id}", mode="structural"),
        follow_up=RequestSpec(
            method="GET", path="/api/datasets/{dataset_id}", mode="structural",
            label="DELETE_dataset__then_GET",
        ),
        setup=_setup_delete_dataset,
    ))

    # 11. POST /api/datasets/export_ds_parquet/{id} — trigger dask export → GET verify → cleanup
    specs.append(RouteSpec(
        name="POST_dataset_parquet_export",
        request=RequestSpec(
            method="POST", path="/api/datasets/export_ds_parquet/{dataset_id}",
            json={"annotatedOnly": True}, mode="structural",
        ),
        follow_up=RequestSpec(
            method="GET", path="/api/datasets/{dataset_id}/ds_exports", mode="structural",
            label="POST_dataset_parquet_export__then_GET",
        ),
        setup=_setup_dataset_context,
        cleanup=_cleanup_created_export,
    ))

    # 12. DELETE /api/datasets/ds_exports/{id} — create throwaway export → DELETE via API → GET verify
    specs.append(RouteSpec(
        name="DELETE_dataset_export",
        request=RequestSpec(method="DELETE", path="/api/datasets/ds_exports/{export_id}", mode="structural"),
        follow_up=RequestSpec(
            method="GET", path="/api/datasets/{dataset_id}/ds_exports", mode="structural",
            label="DELETE_dataset_export__then_GET",
        ),
        setup=_setup_delete_export,
    ))

    # 13. GET /api/datasets/ds_exports/{id} — binary file download
    specs.append(RouteSpec(
        name="GET_dataset_export_download",
        request=RequestSpec(method="GET", path="/api/datasets/ds_exports/{export_id}"),
        skip=True,
        skip_reason="Binary file download — recorder needs fix for binary responses. Verified manually in P1.2.",
    ))

    return specs


def get_active_dataset_specs() -> list[RouteSpec]:
    """Return only the non-skipped dataset specs."""
    return [s for s in get_dataset_specs() if not s.skip]
