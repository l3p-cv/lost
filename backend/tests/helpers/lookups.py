"""Shared lookup helpers for test specs.

All lookups use entity names (compare_test_*) created by init_test_data.py.
No hardcoded IDs — specs work on any dev instance after init_test_data.py runs.
"""

from __future__ import annotations


def get_test_sia_annotask_id(dbm):
    """Return the compare_test_sia annotask ID, or None if not found."""
    from lost.db.model import AnnoTask

    at = dbm.session.query(AnnoTask).filter_by(name="compare_test_sia").first()
    return at.idx if at else None


def get_test_sia_image_id(dbm, index: int = 0):
    """Return the Nth image ID from compare_test_sia annotask, or None.

    Args:
        dbm: A DBMan instance.
        index: 0 for first image, 1 for second.
    """
    from lost.db.model import AnnoTask, ImageAnno

    at = dbm.session.query(AnnoTask).filter_by(name="compare_test_sia").first()
    if at is None:
        return None
    imgs = dbm.session.query(ImageAnno).filter_by(anno_task_id=at.idx).all()
    if index < len(imgs):
        return imgs[index].idx
    return None


def get_test_sia_export_id(dbm):
    """Return the AnnoTaskExport ID for compare_test_sia, or None."""
    from lost.db.model import AnnoTask, AnnoTaskExport

    at = dbm.session.query(AnnoTask).filter_by(name="compare_test_sia").first()
    if at is None:
        return None
    exp = dbm.session.query(AnnoTaskExport).filter_by(anno_task_id=at.idx).first()
    return exp.idx if exp else None


def get_test_dataset_id(dbm):
    """Return the compare_test_dataset ID, or None."""
    from lost.db.model import Dataset

    ds = dbm.session.query(Dataset).filter_by(name="compare_test_dataset").first()
    return ds.idx if ds else None


def get_test_dataset_export_id(dbm):
    """Return the DatasetExport ID for compare_test_dataset, or None."""
    from lost.db.model import Dataset, DatasetExport

    ds = dbm.session.query(Dataset).filter_by(name="compare_test_dataset").first()
    if ds is None:
        return None
    exp = dbm.session.query(DatasetExport).filter_by(dataset_id=ds.idx).first()
    return exp.idx if exp else None


def get_test_mia_annotask_id(dbm):
    """Return the compare_test_mia annotask ID, or None."""
    from lost.db.model import AnnoTask

    at = dbm.session.query(AnnoTask).filter_by(name="compare_test_mia").first()
    return at.idx if at else None


def get_test_group_id(dbm):
    """Return the compare_test_group ID, or None."""
    from lost.db.model import Group

    g = dbm.session.query(Group).filter_by(name="compare_test_group").first()
    return g.idx if g else None


def get_default_fs_id(dbm):
    """Return the OOTB 'default' filesystem ID (seeded by initlost)."""
    from lost.db.model import FileSystem

    fs = dbm.session.query(FileSystem).filter_by(name="default").first()
    return fs.idx if fs else None


def get_test_sia_pipe_id(dbm):
    """Return the compare_test_sia_pipe ID, or None."""
    from lost.db.model import Pipe

    pipe = dbm.session.query(Pipe).filter_by(name="compare_test_sia_pipe").first()
    return pipe.idx if pipe else None


def get_test_sia_pipe_element_id(dbm):
    """Return the PipeElement ID of compare_test_sia_pipe, or None."""
    from lost.db.model import Pipe, PipeElement

    pipe = dbm.session.query(Pipe).filter_by(name="compare_test_sia_pipe").first()
    if pipe is None:
        return None
    pe = dbm.session.query(PipeElement).filter_by(pipe_id=pipe.idx).first()
    return pe.idx if pe else None
