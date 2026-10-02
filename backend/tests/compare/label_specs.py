"""Label namespace request specs for golden-snapshot testing.

11 routes: 10 active, 1 skipped.
- 3 GETs (tree/all, tree/global, by_id) — use OOTB VOC2012 root leaf (idx=1)
- POST add label (create test leaf → cleanup delete)
- PATCH edit label (create in setup → edit via API → cleanup delete)
- DELETE label (create in setup → delete via API → GET verify 404)
- GET export (CSV, exact mode — generated on the fly)
- POST import (CSV upload → cleanup delete imported tree)
- Skip: pipeline import_zip, import_git (complex cleanup)

Self-contained: GETs use OOTB VOC2012 label leaf (idx=1, seeded by initlost).
POST/PATCH/DELETE create test leaves with compare_test_ prefix.
"""

from __future__ import annotations

from tests.compare.migration_status import target_for
from tests.helpers.recorder import RequestSpec
from tests.helpers.seed import TEST_PREFIX, unique_suffix
from tests.helpers.specs import RouteSpec

_TARGET = target_for("label")

# OOTB VOC2012 root label leaf (idx=1 — seeded by initlost on every dev instance)
OOTB_LABEL_LEAF_ID = 1

# Minimal CSV for label import test — creates a 2-leaf tree under a compare_test_ root
_TEST_LABEL_CSV = (
    "idx,name,abbreviation,description,external_id,is_root,parent_leaf_id,color\n"
    f"1,{TEST_PREFIX}label_tree,,Test label tree for golden snapshots,,True,,#ff0000\n"
    f"2,{TEST_PREFIX}leaf1,L1,First test leaf,,False,1,#00ff00\n"
)

# Root name collides with the OOTB VOC2012 tree (always present) → deterministic duplicate
_DUPLICATE_TREE_CSV = (
    "name,abbreviation,description,external_id,is_root,parent_leaf_id,color\n"
    "VOC2012,,Duplicate-root tree for golden snapshots,,True,,#ff0000\n"
)


# ---------------------------------------------------------------------------
# Setup/cleanup for create-test-label patterns
# ---------------------------------------------------------------------------


def _create_test_label_db(dbm):
    """Create a test label leaf directly in the DB. Returns context with label_id."""
    from lost.db import model

    suffix = unique_suffix()
    leaf = model.LabelLeaf(
        name=f"{TEST_PREFIX}{suffix}",
        abbreviation="test",
        description="Test label for golden snapshots",
        is_root=False,
        parent_leaf_id=OOTB_LABEL_LEAF_ID,
        group_id=1,
    )
    dbm.save_obj(leaf)
    dbm.commit()
    return {"label_id": leaf.idx, "label_name": leaf.name}


def _cleanup_test_label_db(dbm, context):
    """Delete a test label leaf from the DB (safe if already deleted)."""
    label_id = context.get("label_id")
    if label_id is not None:

        leaf = dbm.get_label_leaf(label_id)
        if leaf:
            dbm.delete(leaf)
            dbm.commit()


def get_label_specs() -> list[RouteSpec]:
    specs: list[RouteSpec] = []

    # --- Simple GETs (OOTB VOC2012 leaf, no setup needed) ---

    # 1. GET /api/label/tree/all — all label trees (designer)
    specs.append(RouteSpec(
        name="GET_label_tree_all",
        request=RequestSpec(method="GET", path="/api/label/tree/all", mode="structural"),
        target=_TARGET,
    ))

    # 2. GET /api/label/tree/global — global label trees (admin)
    specs.append(RouteSpec(
        name="GET_label_tree_global",
        request=RequestSpec(method="GET", path="/api/label/tree/global", mode="structural"),
        target=_TARGET,
    ))

    # 3. GET /api/label/1 — get label leaf by ID (designer)
    specs.append(RouteSpec(
        name="GET_label_by_id",
        request=RequestSpec(method="GET", path=f"/api/label/{OOTB_LABEL_LEAF_ID}", mode="structural"),
        target=_TARGET,
    ))

    # --- POST add label (create via API → cleanup delete) ---

    # 4. POST /api/label/all — create test label (designer)
    suffix = unique_suffix()
    label_name = f"{TEST_PREFIX}{suffix}"
    specs.append(RouteSpec(
        name="POST_label_add",
        request=RequestSpec(
            method="POST", path="/api/label/all",
            json={
                "is_root": False,
                "parent_leaf_id": OOTB_LABEL_LEAF_ID,
                "name": label_name,
                "description": "Test label for golden snapshots",
                "abbreviation": "test",
                "external_id": "",
                "color": "#FF0000",
            },
            mode="structural",
        ),
        follow_up=RequestSpec(
            method="GET", path="/api/label/tree/all", mode="structural",
            label="POST_label_add__then_GET",
        ),
        target=_TARGET,
        setup=lambda dbm: {"label_name": label_name},
        cleanup=_cleanup_created_label_by_name,
    ))

    # --- PATCH edit label (create in setup → edit via API → cleanup delete) ---

    # 5. PATCH /api/label/all — edit test label (designer)
    specs.append(RouteSpec(
        name="PATCH_label_edit",
        request=RequestSpec(
            method="PATCH", path="/api/label/all",
            json={
                "id": "{label_id}",
                "name": f"{TEST_PREFIX}edited",
                "description": "Edited by golden snapshot test",
                "abbreviation": "edt",
                "external_id": "",
                "color": "#00FF00",
            },
            mode="structural",
        ),
        follow_up=RequestSpec(
            method="GET", path="/api/label/{label_id}", mode="structural",
            label="PATCH_label_edit__then_GET",
        ),
        target=_TARGET,
        setup=_create_test_label_db,
        cleanup=_cleanup_test_label_db,
    ))

    # --- DELETE label (create in setup → delete via API → GET verify) ---

    # 6. DELETE /api/label/{id} — delete test label (designer)
    specs.append(RouteSpec(
        name="DELETE_label",
        request=RequestSpec(
            method="DELETE", path="/api/label/{label_id}", mode="structural",
        ),
        follow_up=RequestSpec(
            method="GET", path="/api/label/{label_id}", mode="structural",
            label="DELETE_label__then_GET",
        ),
        target=_TARGET,
        setup=_create_test_label_db,
        cleanup=_cleanup_test_label_db,  # safe if already deleted
    ))

    # --- Skipped ---

    # 7. GET /api/label/1/export — CSV download (generated on the fly, text/csv content type)
    specs.append(RouteSpec(
        name="GET_label_export",
        request=RequestSpec(method="GET", path=f"/api/label/{OOTB_LABEL_LEAF_ID}/export", mode="exact"),
        target=_TARGET,
    ))

    # 8. POST /api/label/tree/all — import label tree from CSV (multipart upload)
    specs.append(RouteSpec(
        name="POST_label_import",
        request=RequestSpec(
            method="POST", path="/api/label/tree/all",
            files={"file": ("compare_test_label.csv", _TEST_LABEL_CSV.encode("utf-8"), "text/csv")},
            mode="structural",
        ),
        follow_up=RequestSpec(
            method="GET", path="/api/label/tree/all", mode="structural",
            label="POST_label_import__then_GET",
        ),
        target=_TARGET,
        cleanup=_cleanup_imported_label_tree,
    ))

    # 9. POST /api/label/tree/all — non-CSV filename → 400 (exact)
    specs.append(RouteSpec(
        name="POST_label_import_not_csv",
        request=RequestSpec(
            method="POST", path="/api/label/tree/all",
            files={"file": ("compare_test_label.txt", b"name,is_root\nVOC2012,True\n", "text/plain")},
            mode="exact",
        ),
        target=_TARGET,
        # no cleanup — the filename check fires before anything is written
    ))

    # 10. POST /api/label/tree/all — root name collides with OOTB VOC2012 → 400 (exact)
    specs.append(RouteSpec(
        name="POST_label_import_duplicate",
        request=RequestSpec(
            method="POST", path="/api/label/tree/all",
            files={"file": ("compare_test_label.csv", _DUPLICATE_TREE_CSV.encode("utf-8"), "text/csv")},
            mode="exact",
        ),
        target=_TARGET,
        # no cleanup — create_root bails before any write (fixed OOTB name: deterministic)
    ))

    # 11. GET /api/label/tree/{bad_visibility} → 403 (exact) — validates the retained
    #     global-handler fallback path (shared NotAuthorizedError, attrs intact)
    specs.append(RouteSpec(
        name="GET_label_tree_bad_visibility",
        request=RequestSpec(
            method="GET", path="/api/label/tree/invalid_visibility", mode="exact",
        ),
        target=_TARGET,
    ))

    return specs


def _cleanup_created_label_by_name(dbm, context):
    """Delete a test label created via POST API, found by name."""
    from lost.db import model

    name = context.get("label_name")
    if name:
        dbm.session.rollback()  # ensure no pending transactions
        leaf = dbm.session.query(model.LabelLeaf).filter_by(name=name).first()
        if leaf:
            dbm.delete(leaf)
            dbm.commit()


def _cleanup_imported_label_tree(dbm, context):
    """Delete a label tree imported via POST /api/label/tree/all.

    Finds the root leaf by name (compare_test_label_tree) and cascades delete.
    """
    from lost.db import model

    root_name = f"{TEST_PREFIX}label_tree"
    root = dbm.session.query(model.LabelLeaf).filter_by(name=root_name).first()
    if root:
        # Delete children first
        children = dbm.session.query(model.LabelLeaf).filter_by(parent_leaf_id=root.idx).all()
        for child in children:
            dbm.delete(child)
            dbm.commit()
        dbm.delete(root)
        dbm.commit()


def get_active_label_specs() -> list[RouteSpec]:
    return [s for s in get_label_specs() if not s.skip]
