"""Label namespace request specs for golden-snapshot testing.

8 routes: 6 active, 2 skipped.
- 3 GETs (tree/all, tree/global, by_id) — use OOTB VOC2012 root leaf (idx=1)
- POST add label (create test leaf → cleanup delete)
- PATCH edit label (create in setup → edit via API → cleanup delete)
- DELETE label (create in setup → delete via API → GET verify 404)
- Skip: export (binary CSV), import (file upload)

Self-contained: GETs use OOTB VOC2012 label leaf (idx=1, seeded by initlost).
POST/PATCH/DELETE create test leaves with compare_test_ prefix.
"""

from __future__ import annotations

from tests.helpers.recorder import RequestSpec
from tests.helpers.seed import unique_suffix, TEST_PREFIX
from tests.compare.user_specs import RouteSpec

# OOTB VOC2012 root label leaf (idx=1 — seeded by initlost on every dev instance)
OOTB_LABEL_LEAF_ID = 1


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
        from lost.db import model

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
    ))

    # 2. GET /api/label/tree/global — global label trees (admin)
    specs.append(RouteSpec(
        name="GET_label_tree_global",
        request=RequestSpec(method="GET", path="/api/label/tree/global", mode="structural"),
    ))

    # 3. GET /api/label/1 — get label leaf by ID (designer)
    specs.append(RouteSpec(
        name="GET_label_by_id",
        request=RequestSpec(method="GET", path=f"/api/label/{OOTB_LABEL_LEAF_ID}", mode="structural"),
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
        setup=_create_test_label_db,
        cleanup=_cleanup_test_label_db,  # safe if already deleted
    ))

    # --- Skipped ---

    # 7. GET /api/label/1/export — binary CSV download
    specs.append(RouteSpec(
        name="GET_label_export",
        request=RequestSpec(method="GET", path=f"/api/label/{OOTB_LABEL_LEAF_ID}/export"),
        skip=True,
        skip_reason="Binary CSV download — recorder needs fix for binary responses. Verified manually in P1.2.",
    ))

    # 8. POST /api/label/tree/all — import label tree from CSV (file upload)
    specs.append(RouteSpec(
        name="POST_label_import",
        request=RequestSpec(method="POST", path="/api/label/tree/all"),
        skip=True,
        skip_reason="File upload (multipart) — complex handling. Verified manually in P1.2.",
    ))

    return specs


def _cleanup_created_label_by_name(dbm, context):
    """Delete a test label created via POST API, found by name."""
    from lost.db import model

    name = context.get("label_name")
    if name:
        leaf = dbm.session.query(model.LabelLeaf).filter_by(name=name).first()
        if leaf:
            dbm.delete(leaf)
            dbm.commit()


def get_active_label_specs() -> list[RouteSpec]:
    return [s for s in get_label_specs() if not s.skip]
