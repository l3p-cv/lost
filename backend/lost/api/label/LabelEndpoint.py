"""Label namespace — FastAPI endpoints for label info and control.

Routes:
    GET    /api/label/tree/{visibility}      — list label trees (designer/admin)
    POST   /api/label/tree/{visibility}      — import label tree from CSV (designer/admin)
    GET    /api/label/{label_leaf_id}         — get label leaf by ID (designer)
    PATCH  /api/label/{visibility}            — update label (designer)
    POST   /api/label/{visibility}            — create label (designer/admin)
    DELETE /api/label/{label_leaf_id}        — delete label (designer)
    GET    /api/label/{label_leaf_id}/export — export label tree as CSV (designer)
"""

from __future__ import annotations

import logging
from io import BytesIO

import pandas as pd
from fastapi import APIRouter, Depends, UploadFile
from fastapi.responses import Response
from pydantic import BaseModel, Field

from lost.api.auth.dependencies import require_role
from lost.api.base import ProfilingRoute
from lost.db import model, roles
from lost.db.access import DBMan
from lost.db.session import get_db
from lost.db.vis_level import VisLevel
from lost.logic.label import LabelTree

logger = logging.getLogger("lost.api.label")
router = APIRouter(tags=["label"], route_class=ProfilingRoute)


# --- Schemas ---


class Group(BaseModel):
    idx: int | None = None
    name: str | None = None


class LabelLeafSchema(BaseModel):
    id: int | None = None
    name: str | None = None
    description: str | None = None
    abbreviation: str | None = None
    leaf_id: str | None = None
    group: Group | None = None
    is_root: bool | None = None
    color: str | None = None
    label: str | None = None


class CreateLabelRequest(BaseModel):
    is_root: bool
    parent_leaf_id: int | None = None
    name: str
    description: str
    abbreviation: str
    external_id: str | None = None
    color: str | None = None


class UpdateLabelRequest(BaseModel):
    id: int
    name: str
    description: str
    abbreviation: str
    external_id: str | None = None
    color: str | None = None


# --- Routes ---


@router.get("/tree/{visibility}")
def get_label_trees(
    visibility: str,
    user=Depends(require_role(roles.DESIGNER)),
    dbm: DBMan = Depends(get_db),
):
    """Get all label trees for the given visibility level."""
    default_group = dbm.get_group_by_name(user.user_name)

    if visibility == VisLevel.USER:
        root_leaves = dbm.get_all_label_trees(group_id=default_group.idx)
    elif visibility == VisLevel.GLOBAL:
        if not user.has_role(roles.ADMINISTRATOR):
            return {"message": "You are not authorized."}, 403
        root_leaves = dbm.get_all_label_trees(global_only=True)
    elif visibility == VisLevel.ALL:
        root_leaves = dbm.get_all_label_trees(group_id=default_group.idx, add_global=True)
    else:
        return {"message": "You are not authorized."}, 403

    trees = []
    for root_leaf in root_leaves:
        trees.append(LabelTree(dbm, root_leaf.idx).to_hierarchical_dict())
    return trees


@router.post("/tree/{visibility}")
async def import_label_tree(
    visibility: str,
    file: UploadFile,
    user=Depends(require_role(roles.DESIGNER)),
    dbm: DBMan = Depends(get_db),
):
    """Import a label tree from CSV."""
    if not file.filename or not file.filename.endswith(".csv"):
        return {"error": "Invalid file format. Please upload a CSV file."}, 400

    default_group = dbm.get_group_by_name(user.user_name)

    if visibility == VisLevel.ALL:
        tree = LabelTree(dbm, logger=logger, group_id=default_group.idx)
    elif visibility == VisLevel.GLOBAL:
        if not user.has_role(roles.ADMINISTRATOR):
            return {"message": "You are not authorized."}, 403
        tree = LabelTree(dbm, logger=logger)
    else:
        return {"message": "You are not authorized."}, 403

    contents = await file.read()
    df = pd.read_csv(BytesIO(contents))
    root = tree.import_df(df)
    if not root:
        return {"error": "LabelTree already present in database!"}, 400
    return {"message": "Tree imported successfully"}


def _label_leaf_to_dict(leaf):
    """Convert a LabelLeaf ORM object to a dict matching Flask restx marshal_with output.

    LabelLeaf ORM model has group_id but no 'group' relationship — Flask restx
    outputs {"idx": null, "name": null} for the missing nested model.
    """
    if leaf is None:
        return {"id": None, "name": None, "description": None, "abbreviation": None,
                "leaf_id": None, "group": {"idx": None, "name": None},
                "is_root": None, "color": None, "label": None}
    return {
        "id": leaf.idx,
        "name": leaf.name,
        "description": leaf.description,
        "abbreviation": leaf.abbreviation,
        "leaf_id": leaf.external_id if leaf.external_id else None,
        "group": {"idx": None, "name": None},
        "is_root": leaf.is_root,
        "color": leaf.color,
        "label": None,
    }


@router.get("/{label_leaf_id}")
def get_label_leaf(
    label_leaf_id: int,
    user=Depends(require_role(roles.DESIGNER)),
    dbm: DBMan = Depends(get_db),
):
    """Get a label leaf by ID."""
    return _label_leaf_to_dict(dbm.get_label_leaf(label_leaf_id))

@router.delete("/{label_leaf_id}")
def delete_label(
    label_leaf_id: int,
    user=Depends(require_role(roles.DESIGNER)),
    dbm: DBMan = Depends(get_db),
):
    """Delete a label leaf by ID."""
    label = dbm.get_label_leaf(label_leaf_id)
    dbm.delete(label)
    dbm.commit()
    return "success"


@router.get("/{label_leaf_id}/export")
def export_label_tree(
    label_leaf_id: int,
    user=Depends(require_role(roles.DESIGNER)),
    dbm: DBMan = Depends(get_db),
):
    """Export a label tree as CSV."""
    label_tree = LabelTree(dbm, root_id=label_leaf_id)
    ldf = label_tree.to_df()
    f = BytesIO()
    ldf.to_csv(f)
    f.seek(0)
    return Response(
        content=f.read(),
        media_type="blob",
        headers={"Content-Disposition": f"attachment; filename={label_tree.root.name}.csv"},
    )

@router.patch("/{visibility}")
def update_label(
    visibility: str,
    req: UpdateLabelRequest,
    user=Depends(require_role(roles.DESIGNER)),
    dbm: DBMan = Depends(get_db),
):
    """Update an existing label leaf."""
    label = dbm.get_label_leaf(req.id)
    label.name = req.name
    label.description = req.description
    label.abbreviation = req.abbreviation
    label.external_id = req.external_id
    label.color = req.color
    dbm.save_obj(label)
    return "success"


@router.post("/{visibility}")
def create_label(
    visibility: str,
    req: CreateLabelRequest,
    user=Depends(require_role(roles.DESIGNER)),
    dbm: DBMan = Depends(get_db),
):
    """Create a new label leaf."""
    default_group = dbm.get_group_by_name(user.user_name)

    if visibility == VisLevel.ALL:
        label = model.LabelLeaf(
            name=req.name,
            abbreviation=req.abbreviation,
            description=req.description,
            external_id=req.external_id,
            is_root=req.is_root,
            color=req.color,
            group_id=default_group.idx,
        )
    elif visibility == VisLevel.GLOBAL:
        if not user.has_role(roles.ADMINISTRATOR):
            return {"message": "You are not authorized."}, 403
        label = model.LabelLeaf(
            name=req.name,
            abbreviation=req.abbreviation,
            description=req.description,
            external_id=req.external_id,
            is_root=req.is_root,
            color=req.color,
        )
    else:
        return {"message": "You are not authorized."}, 403

    if req.parent_leaf_id:
        label.parent_leaf_id = req.parent_leaf_id
    dbm.save_obj(label)
    return {"message": "Label added successfully", "labelId": label.idx}