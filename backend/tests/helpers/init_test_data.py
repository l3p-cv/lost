"""Idempotent test data seeder for the golden-snapshot harness.

Creates all test prerequisites with ``compare_test_`` prefix so they're easy to
identify and clean up. Safe to run on any dev DB — only creates entities that
don't already exist by name.

Run alongside initlost.py in run_snapshots.sh:
    docker exec lost-backend-1 python3 /code/tests/helpers/init_test_data.py

Creates:
- Pipe + PipeElement + AnnoTask + 2 ImageAnnos for SIA (compare_test_sia)
- Pipe + PipeElement + AnnoTask + 2 ImageAnnos for MIA (compare_test_mia)
- Dataset (compare_test_dataset)

Does NOT create ChoosenAnnoTask — specs handle choosing in their own setup/cleanup
so SIA and MIA tests can coexist without conflicting.
"""

from __future__ import annotations

import json
import logging

from datetime import datetime, timezone
from lost.db import access, dtype, state, model
from lost.settings import LOST_CONFIG

log = logging.getLogger("lost.tests.init_test_data")

TEST_PREFIX = "compare_test_"

# OOTB VOC2012 images (available on any dev instance after initlost.py)
OOTB_IMG_PATHS = [
    "/home/lost/data/1/media/images/10_voc2012/2007_008547.jpg",
    "/home/lost/data/1/media/images/10_voc2012/2008_002123.jpg",
]
OOTB_FS_ID = 2  # admin's default filesystem (created by initlost.py)

SIA_CONFIG = json.dumps({
    "tools": {"point": True, "line": True, "polygon": True, "bbox": True, "junk": True},
    "annos": {
        "actions": {"draw": True, "label": True, "edit": True},
        "minArea": 250,
        "multilabels": False,
    },
    "img": {"actions": {"label": True}, "multilabels": False},
})

MIA_CONFIG = json.dumps({"type": "imageBased", "showProposedLabel": True})


def _entity_exists(dbm, model_cls, name: str) -> bool:
    """Check if an entity with the given name already exists."""
    return dbm.session.query(model_cls).filter_by(name=name).first() is not None


def _create_sia_test_data(dbm) -> None:
    """Create SIA test pipe + annotask + images (idempotent).

    If the annotask exists but is missing images, only the missing images are created.
    """
    pipe_name = f"{TEST_PREFIX}sia_pipe"
    at_name = f"{TEST_PREFIX}sia"

    at = dbm.session.query(model.AnnoTask).filter_by(name=at_name).first()
    if at is None:
        # Pipe
        pipe = model.Pipe(
            name=pipe_name,
            manager_id=1,
            group_id=1,
            state=state.Pipe.PAUSED,
            description="Test pipe for golden snapshots",
            is_debug_mode=False,
            is_locked=False,
            timestamp=datetime.now(timezone.utc),
        )
        dbm.save_obj(pipe)

        # PipeElement (ANNO_TASK type)
        pe = model.PipeElement(
            pipe_id=pipe.idx,
            dtype=dtype.PipeElement.ANNO_TASK,
            state=state.Pipe.PAUSED,
        )
        dbm.save_obj(pe)

        # AnnoTask (SIA)
        at = model.AnnoTask(
            name=at_name,
            dtype=dtype.AnnoTask.SIA,
            state=state.Pipe.IN_PROGRESS,
            group_id=1,
            pipe_element_id=pe.idx,
            configuration=SIA_CONFIG,
        )
        dbm.save_obj(at)
        log.info("Created SIA test annotask '%s' (idx=%s)", at_name, at.idx)
    else:
        log.info("SIA test annotask already exists (idx=%s)", at.idx)

    # ImageAnnos (UNLOCKED — so sia endpoints return them for annotation)
    # Create missing images only (idempotent per-image by path)
    existing_paths = {img.img_path for img in dbm.session.query(model.ImageAnno).filter_by(anno_task_id=at.idx).all()}
    created = 0
    for img_path in OOTB_IMG_PATHS:
        if img_path in existing_paths:
            continue
        img = model.ImageAnno(
            anno_task_id=at.idx,
            img_path=img_path,
            fs_id=OOTB_FS_ID,
            state=state.Anno.UNLOCKED,
        )
        dbm.save_obj(img)
        created += 1
    if created:
        log.info("Created %d missing SIA images", created)


def _create_mia_test_data(dbm) -> None:
    """Create MIA test pipe + annotask + images (idempotent).

    If the annotask exists but is missing images, only the missing images are created.
    """
    pipe_name = f"{TEST_PREFIX}mia_pipe"
    at_name = f"{TEST_PREFIX}mia"

    at = dbm.session.query(model.AnnoTask).filter_by(name=at_name).first()
    if at is None:
        # Pipe — IN_PROGRESS (not PAUSED) so MIA endpoints serve images
        # (MIA's get_first checks pipe.state != PAUSED → returns empty when paused)
        # Safe: pipe has only an ANNO_TASK element (no script), so dask won't execute it
        pipe = model.Pipe(
            name=pipe_name,
            manager_id=1,
            group_id=1,
            state=state.Pipe.IN_PROGRESS,
            description="Test pipe for golden snapshots (MIA)",
            is_debug_mode=False,
            is_locked=False,
            timestamp=datetime.now(timezone.utc),
        )
        dbm.save_obj(pipe)

        # PipeElement
        pe = model.PipeElement(
            pipe_id=pipe.idx,
            dtype=dtype.PipeElement.ANNO_TASK,
            state=state.Pipe.IN_PROGRESS,
        )
        dbm.save_obj(pe)

        # AnnoTask (MIA) — state=2 (active/serving, matching real MIA tasks)
        at = model.AnnoTask(
            name=at_name,
            dtype=dtype.AnnoTask.MIA,
            state=2,
            group_id=1,
            pipe_element_id=pe.idx,
            configuration=MIA_CONFIG,
        )
        dbm.save_obj(at)
        log.info("Created MIA test annotask '%s' (idx=%s)", at_name, at.idx)
    else:
        log.info("MIA test annotask already exists (idx=%s)", at.idx)

    # ImageAnnos (LABELED — MIA's get_first/get_latest need labeled images for chunks)
    # chunk_id=1 so get_whole_chunk(chunk_id=1) finds them (MIA queries by chunk)
    existing_paths = {img.img_path for img in dbm.session.query(model.ImageAnno).filter_by(anno_task_id=at.idx).all()}
    created = 0
    for img_path in OOTB_IMG_PATHS:
        if img_path in existing_paths:
            continue
        img = model.ImageAnno(
            anno_task_id=at.idx,
            img_path=img_path,
            fs_id=OOTB_FS_ID,
            state=state.Anno.LABELED,
            chunk_id=1,
            user_id=1,
        )
        dbm.save_obj(img)
        created += 1
    if created:
        log.info("Created %d missing MIA images", created)


def _create_dataset_test_data(dbm) -> None:
    """Create test dataset (idempotent)."""
    ds_name = f"{TEST_PREFIX}dataset"

    ds = dbm.session.query(model.Dataset).filter_by(name=ds_name).first()
    if ds is None:
        ds = model.Dataset(
            name=ds_name,
            description="Test dataset for golden snapshots",
        )
        dbm.save_obj(ds)
        log.info("Created test dataset '%s' (idx=%s)", ds_name, ds.idx)
    else:
        log.info("Test dataset already exists (idx=%s)", ds.idx)


def _create_group_test_data(dbm) -> None:
    """Create a test group for reversible mutation tests (idempotent)."""
    group_name = f"{TEST_PREFIX}group"

    g = dbm.session.query(model.Group).filter_by(name=group_name).first()
    if g is None:
        g = model.Group(name=group_name, manager_id=1)
        dbm.save_obj(g)
        dbm.commit()
        log.info("Created test group '%s' (idx=%s)", group_name, g.idx)
    else:
        log.info("Test group already exists (idx=%s)", g.idx)


def _create_annotask_export_test_data(dbm) -> None:
    """Create an AnnoTaskExport entry for compare_test_sia (idempotent).

    Only creates the DB entry — the actual export file is not generated.
    This is enough for the export LIST route (GET /annotasks/<id>/exports).
    The download route stays skipped (needs the actual file).
    """
    sia_name = f"{TEST_PREFIX}sia"
    at = dbm.session.query(model.AnnoTask).filter_by(name=sia_name).first()
    if at is None:
        log.warning("SIA test annotask not found — skipping export creation")
        return

    export_name = f"{TEST_PREFIX}sia_export"
    existing = dbm.session.query(model.AnnoTaskExport).filter_by(
        anno_task_id=at.idx, name=export_name
    ).first()
    if existing:
        log.info("AnnoTaskExport already exists — skipping")
        return

    from datetime import datetime, timezone

    exp = model.AnnoTaskExport(
        anno_task_id=at.idx,
        name=export_name,
        file_path=f"/home/lost/data/1/ds_export/test/compare_test_sia_export.zip",
        fs_id=OOTB_FS_ID,
        progress=100,
        img_count=2,
        anno_task_progress=100,
        timestamp=datetime.now(timezone.utc),
    )
    dbm.save_obj(exp)
    log.info("Created AnnoTaskExport '%s' (idx=%s)", export_name, exp.idx)


def _create_inference_model_test_data(dbm) -> None:
    """Create a test inference model (idempotent).

    Idempotency is by display_name (the unique column), not name.
    """
    display_name = f"{TEST_PREFIX}Dummy YOLO"

    existing = dbm.session.query(model.InferenceModel).filter_by(
        display_name=display_name
    ).first()
    if existing:
        log.info("Test inference model already exists (idx=%s)", existing.idx)
        return

    im = model.InferenceModel(
        name=f"{TEST_PREFIX}inference_model",
        display_name=display_name,
        server_url="localhost:8001",
        task_type=0,
        model_type="YOLO",
        description="Test model for golden snapshots",
    )
    dbm.save_obj(im)
    log.info("Created test inference model '%s' (idx=%s)", display_name, im.idx)


def _create_dataset_export_test_data(dbm) -> None:
    """Create a DatasetExport entry for compare_test_dataset (idempotent).

    Only creates the DB entry — the actual export file is not generated.
    This is enough for the export LIST route (GET /datasets/<id>/ds_exports).
    The download route stays skipped (needs the actual file).
    """
    ds_name = f"{TEST_PREFIX}dataset"
    ds = dbm.session.query(model.Dataset).filter_by(name=ds_name).first()
    if ds is None:
        log.warning("Test dataset not found — skipping export creation")
        return

    existing = dbm.session.query(model.DatasetExport).filter_by(
        dataset_id=ds.idx
    ).first()
    if existing:
        log.info("DatasetExport already exists — skipping")
        return

    exp = model.DatasetExport(
        dataset_id=ds.idx,
        file_path=f"/home/lost/data/1/ds_export/test/compare_test_dataset_export.parquet",
        progress=100,
    )
    dbm.save_obj(exp)
    log.info("Created DatasetExport for dataset '%s' (idx=%s)", ds_name, exp.idx)


# ---------------------------------------------------------------------------
# OOTB label leaves (children of VOC2012 root, idx=1 — seeded by initlost)
# ---------------------------------------------------------------------------

OOTB_LABEL_LEAVES = [1]  # VOC2012 root leaf — get_all_child_label_leaves(1) returns 20 children

# Extra image for the labeled path (3rd OOTB VOC2012 image)
OOTB_LABELED_IMG_PATH = "/home/lost/data/1/media/images/10_voc2012/2008_002597.jpg"


def _enrich_sia_test_data(dbm) -> None:
    """Enrich compare_test_sia with labels, annotations, and dataset link.

    Adds:
    - RequiredLabelLeaf entries linking the annotask to OOTB VOC2012 leaves
    - A 3rd image (LABELED) for review endpoint coverage
    - A TwoDAnno (bbox) + Label on the labeled image
    - Links the annotask to compare_test_dataset (annotask_children)

    Idempotent: skips any entity that already exists.
    """
    sia_name = f"{TEST_PREFIX}sia"
    at = dbm.session.query(model.AnnoTask).filter_by(name=sia_name).first()
    if at is None:
        log.warning("SIA test annotask not found — skipping enrichment")
        return

    # --- RequiredLabelLeaf entries ---
    existing_rll = {
        rll.label_leaf_id
        for rll in dbm.session.query(model.RequiredLabelLeaf).filter_by(anno_task_id=at.idx).all()
    }
    for leaf_id in OOTB_LABEL_LEAVES:
        if leaf_id in existing_rll:
            continue
        rll = model.RequiredLabelLeaf(anno_task_id=at.idx, label_leaf_id=leaf_id, max_labels="3")
        dbm.save_obj(rll)
        log.info("Created RequiredLabelLeaf for annotask %s → leaf %s", at.idx, leaf_id)

    # --- 3rd image (LABELED — for review endpoint coverage) ---
    existing_img = dbm.session.query(model.ImageAnno).filter_by(
        anno_task_id=at.idx, img_path=OOTB_LABELED_IMG_PATH
    ).first()
    if existing_img is None:
        labeled_img = model.ImageAnno(
            anno_task_id=at.idx,
            img_path=OOTB_LABELED_IMG_PATH,
            fs_id=OOTB_FS_ID,
            state=state.Anno.LABELED,
        )
        dbm.save_obj(labeled_img)
        log.info("Created labeled image idx=%s for annotask %s", labeled_img.idx, at.idx)
    else:
        labeled_img = existing_img
        log.info("Labeled image already exists (idx=%s)", labeled_img.idx)

    # --- TwoDAnno (bbox) on the labeled image ---
    existing_tda = dbm.session.query(model.TwoDAnno).filter_by(
        img_anno_id=labeled_img.idx
    ).first()
    if existing_tda is None:
        tda = model.TwoDAnno(
            anno_task_id=at.idx,
            img_anno_id=labeled_img.idx,
            user_id=1,
            dtype=dtype.TwoDAnno.BBOX,
            data='{"x": 0.1, "y": 0.1, "w": 0.2, "h": 0.2}',
            state=state.Anno.LABELED,
        )
        dbm.save_obj(tda)
        log.info("Created TwoDAnno (bbox) idx=%s on image %s", tda.idx, labeled_img.idx)
    else:
        tda = existing_tda
        log.info("TwoDAnno already exists (idx=%s)", tda.idx)

    # --- Label linking the annotation to a label leaf ---
    existing_label = dbm.session.query(model.Label).filter_by(
        two_d_anno_id=tda.idx
    ).first()
    if existing_label is None:
        lbl = model.Label(
            label_leaf_id=2,  # Aeroplane (child of VOC2012 root idx=1)
            two_d_anno_id=tda.idx,
            img_anno_id=labeled_img.idx,
            annotator_id=1,
        )
        dbm.save_obj(lbl)
        log.info("Created Label linking TwoDAnno %s → leaf 2 (Aeroplane)", tda.idx)

    # --- Link annotask to compare_test_dataset ---
    ds_name = f"{TEST_PREFIX}dataset"
    ds = dbm.session.query(model.Dataset).filter_by(name=ds_name).first()
    if ds is not None and at.dataset_id != ds.idx:
        at.dataset_id = ds.idx
        dbm.save_obj(at)
        log.info("Linked annotask %s → dataset %s", at.idx, ds.idx)
    elif at.dataset_id == ds.idx if ds else False:
        log.info("Annotask already linked to dataset")


def init_test_data() -> None:
    """Create all test prerequisites (idempotent)."""
    dbm = access.DBMan(LOST_CONFIG)
    try:
        _create_sia_test_data(dbm)
        _create_mia_test_data(dbm)
        _create_dataset_test_data(dbm)
        _create_group_test_data(dbm)
        _enrich_sia_test_data(dbm)
        _create_annotask_export_test_data(dbm)
        _create_dataset_export_test_data(dbm)
        _create_inference_model_test_data(dbm)
        dbm.close_session()
        print("init_test_data: complete (all test entities created or already exist)")
    except Exception:
        dbm.close_session()
        raise


def cleanup_test_data() -> int:
    """Force-remove all compare_test_* entities from the DB.

    Used by the --cleanup flag to recover from crashed runs.
    Returns the number of entities deleted.
    """
    dbm = access.DBMan(LOST_CONFIG)
    count = 0
    try:
        # Delete InferenceModels (no dependents — safe to delete first)
        test_models = dbm.session.query(model.InferenceModel).filter(
            model.InferenceModel.display_name.like(f"{TEST_PREFIX}%")
        ).all()
        for im in test_models:
            dbm.session.delete(im)
            count += 1
        dbm.session.commit()

        # Delete AnnoTaskExports for test annotasks
        test_annotasks = dbm.session.query(model.AnnoTask).filter(
            model.AnnoTask.name.like(f"{TEST_PREFIX}%")
        ).all()
        for at in test_annotasks:
            exports = dbm.session.query(model.AnnoTaskExport).filter_by(anno_task_id=at.idx).all()
            for exp in exports:
                dbm.session.delete(exp)
                count += 1
            dbm.session.commit()

        # Delete DatasetExports for test datasets
        test_datasets = dbm.session.query(model.Dataset).filter(
            model.Dataset.name.like(f"{TEST_PREFIX}%")
        ).all()
        for ds in test_datasets:
            dexports = dbm.session.query(model.DatasetExport).filter_by(dataset_id=ds.idx).all()
            for exp in dexports:
                dbm.session.delete(exp)
                count += 1
            dbm.session.commit()

        # Delete ImageAnnos for test annotasks
        # (first delete Labels + TwoDAnnos that reference them)
        test_annotasks = dbm.session.query(model.AnnoTask).filter(
            model.AnnoTask.name.like(f"{TEST_PREFIX}%")
        ).all()
        for at in test_annotasks:
            # Delete Labels referencing TwoDAnnos in this annotask
            tdas = dbm.session.query(model.TwoDAnno).filter_by(anno_task_id=at.idx).all()
            for tda in tdas:
                labels = dbm.session.query(model.Label).filter_by(two_d_anno_id=tda.idx).all()
                for lbl in labels:
                    dbm.session.delete(lbl)
                    count += 1
                dbm.session.commit()
            # Delete TwoDAnnos
            for tda in tdas:
                dbm.session.delete(tda)
                count += 1
            dbm.session.commit()
            # Delete RequiredLabelLeafs
            rlls = dbm.session.query(model.RequiredLabelLeaf).filter_by(anno_task_id=at.idx).all()
            for rll in rlls:
                dbm.session.delete(rll)
                count += 1
            dbm.session.commit()
            # Delete ImageAnnos
            imgs = dbm.session.query(model.ImageAnno).filter_by(anno_task_id=at.idx).all()
            for img in imgs:
                dbm.session.delete(img)
                count += 1
            dbm.session.commit()

        # Delete ChoosenAnnoTask entries pointing to test annotasks
        for at in test_annotasks:
            cats = dbm.session.query(model.ChoosenAnnoTask).filter_by(anno_task_id=at.idx).all()
            for cat in cats:
                dbm.session.delete(cat)
                count += 1
            dbm.session.commit()

        # Delete AnnoTasks
        for at in test_annotasks:
            dbm.session.delete(at)
            count += 1
        dbm.session.commit()

        # Delete PipeElements + Pipes
        test_pipes = dbm.session.query(model.Pipe).filter(
            model.Pipe.name.like(f"{TEST_PREFIX}%")
        ).all()
        for pipe in test_pipes:
            pes = dbm.session.query(model.PipeElement).filter_by(pipe_id=pipe.idx).all()
            for pe in pes:
                dbm.session.delete(pe)
                count += 1
            dbm.session.commit()
            dbm.session.delete(pipe)
            count += 1
        dbm.session.commit()

        # Delete Datasets
        test_datasets = dbm.session.query(model.Dataset).filter(
            model.Dataset.name.like(f"{TEST_PREFIX}%")
        ).all()
        for ds in test_datasets:
            dbm.session.delete(ds)
            count += 1
        dbm.session.commit()

        # Delete Groups (test group only — not user default groups)
        test_groups = dbm.session.query(model.Group).filter(
            model.Group.name.like(f"{TEST_PREFIX}%")
        ).all()
        for g in test_groups:
            dbm.session.delete(g)
            count += 1
        dbm.session.commit()

    finally:
        dbm.close_session()

    print(f"cleanup_test_data: deleted {count} entities")
    return count


if __name__ == "__main__":
    import sys

    if "--cleanup" in sys.argv:
        cleanup_test_data()
    else:
        init_test_data()
