"""Label coordination layer - orchestration for label namespace

Flow
---
LabelEndpoint -> LabelCoordination -> LabelBusiness (LabelTree)

Framework-free: unauthorized operations raise PermissionError
the endpoint maps it to 403 response.
A duplicate-tree import returns None
"""
from __future__ import annotations

import logging
from io import BytesIO

import pandas as pd

from lost.controllers.label.LabelBusiness import LabelTree
from lost.db import model, roles
from lost.db.vis_level import VisLevel

logger = logging.getLogger("lost.controllers.label")


def get_label_trees(dbm, user, visibility: str) -> list[dict]:
    """Return hierarchical label-tree dicts for the given visibility level."""
    default_group = dbm.get_group_by_name(user.user_name)
    if visibility == VisLevel.USER:
        root_leaves = dbm.get_all_label_trees(group_id=default_group.idx)
    elif visibility == VisLevel.GLOBAL:
        if not user.has_role(roles.ADMINISTRATOR):
            raise PermissionError("You are not authorized.")
        root_leaves = dbm.get_all_label_trees(global_only=True)
    elif visibility == VisLevel.ALL:
        root_leaves = dbm.get_all_label_trees(group_id=default_group.idx, add_global=True)
    else:
        raise PermissionError("You are not authorized.")
    return [LabelTree(dbm, root_leaf.idx).to_hierarchical_dict() for root_leaf in root_leaves]


def import_label_tree(dbm, user, visibility: str, csv_bytes: bytes):
    """Import a label tree from CSV. Return the new root leaf, or None if a
    tree with the same name already exists in the database."""
    default_group = dbm.get_group_by_name(user.user_name)
    if visibility == VisLevel.ALL:
        tree = LabelTree(dbm, logger=logger, group_id=default_group.idx)
    elif visibility == VisLevel.GLOBAL:
        if not user.has_role(roles.ADMINISTRATOR):
            raise PermissionError("You are not authorized.")
        tree = LabelTree(dbm, logger=logger)
    else:
        raise PermissionError("You are not authorized.")
    df = pd.read_csv(BytesIO(csv_bytes))
    return tree.import_df(df)


def get_label_leaf(dbm, label_leaf_id: int):
    return dbm.get_label_leaf(label_leaf_id)


def delete_label(dbm, label_leaf_id: int) -> None:
    label = dbm.get_label_leaf(label_leaf_id)
    dbm.delete(label)
    dbm.commit()


def export_label_tree(dbm, label_leaf_id: int) -> tuple[bytes, str]:
    """Return (csv_bytes, root_name) for the tree rooted at *label_leaf_id*."""
    label_tree = LabelTree(dbm, root_id=label_leaf_id)
    ldf = label_tree.to_df()
    f = BytesIO()
    ldf.to_csv(f)
    f.seek(0)
    return f.read(), label_tree.root.name


def update_label(dbm, label_id: int, name: str, description: str, abbreviation: str,
                 external_id: str | None, color: str | None) -> None:
    label = dbm.get_label_leaf(label_id)
    label.name = name
    label.description = description
    label.abbreviation = abbreviation
    label.external_id = external_id
    label.color = color
    dbm.save_obj(label)


def create_label(dbm, user, visibility: str, req) -> int:
    """Create a label leaf. Return the idx of the created label."""
    default_group = dbm.get_group_by_name(user.user_name)
    if visibility == VisLevel.ALL:
        label = model.LabelLeaf(
            name=req.name, abbreviation=req.abbreviation, description=req.description,
            external_id=req.external_id, is_root=req.is_root, color=req.color,
            group_id=default_group.idx,
        )
    elif visibility == VisLevel.GLOBAL:
        if not user.has_role(roles.ADMINISTRATOR):
            raise PermissionError("You are not authorized.")
        label = model.LabelLeaf(
            name=req.name, abbreviation=req.abbreviation, description=req.description,
            external_id=req.external_id, is_root=req.is_root, color=req.color,
        )
    else:
        raise PermissionError("You are not authorized.")
    if req.parent_leaf_id:
        label.parent_leaf_id = req.parent_leaf_id
    dbm.save_obj(label)
    return label.idx