"""Label namespace — FastAPI endpoints for label info and control.

Pass 2 CCB split: routes, schemas and error mapping only.
Orchestration: LabelCoordination -> LabelBusiness (LabelTree).

Routes:
    GET    /api/label/tree/{visibility}       — list label trees (designer/admin)
    POST   /api/label/tree/{visibility}       — import label tree from CSV (designer/admin)
    GET    /api/label/{label_leaf_id}         — get label leaf by ID (designer)
    PATCH  /api/label/{visibility}           — update label (designer)
    POST   /api/label/{visibility}           — create label (designer/admin)
    DELETE /api/label/{label_leaf_id}         — delete label (designer)
    GET    /api/label/{label_leaf_id}/export  — export label tree as CSV (designer)
"""
from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, UploadFile
from fastapi.responses import JSONResponse, Response
from pydantic import BaseModel

from lost.controllers.Dependencies import require_role
from lost.controllers.base import ProfilingRoute
from lost.controllers.label import LabelCoordination
from lost.db import roles
from lost.db.access import DBMan
from lost.db.session import get_db

logger = logging.getLogger("lost.controllers.label")
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


# --- Serializers (Flask restx marshal parity) ---

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


# --- Routes ---

@router.get("/tree/{visibility}")
def get_label_trees(
    visibility: str,
    user=Depends(require_role(roles.DESIGNER)),
    dbm: DBMan = Depends(get_db),
):
    """Get all label trees for the given visibility level."""
    try:
        return LabelCoordination.get_label_trees(dbm, user, visibility)
    except PermissionError:
        return JSONResponse(status_code=403, content={"message": "You are not authorized."})


@router.post("/tree/{visibility}")
async def import_label_tree(
    visibility: str,
    file: UploadFile,
    user=Depends(require_role(roles.DESIGNER)),
    dbm: DBMan = Depends(get_db),
):
    """Import a label tree from CSV."""
    if not file.filename or not file.filename.endswith(".csv"):
        return JSONResponse(status_code=400, content={"error": "Invalid file format. Please upload a CSV file."})
    csv_bytes = await file.read()
    try:
        root = LabelCoordination.import_label_tree(dbm, user, visibility, csv_bytes)
    except PermissionError:
        return JSONResponse(status_code=403, content={"message": "You are not authorized."})
    if root is None:
        return JSONResponse(status_code=400, content={"error": "LabelTree already present in database!"})
    return {"message": "Tree imported successfully"}


@router.get("/{label_leaf_id}")
def get_label_leaf(
    label_leaf_id: int,
    user=Depends(require_role(roles.DESIGNER)),
    dbm: DBMan = Depends(get_db),
):
    """Get a label leaf by ID."""
    return _label_leaf_to_dict(LabelCoordination.get_label_leaf(dbm, label_leaf_id))


@router.delete("/{label_leaf_id}")
def delete_label(
    label_leaf_id: int,
    user=Depends(require_role(roles.DESIGNER)),
    dbm: DBMan = Depends(get_db),
):
    """Delete a label leaf by ID."""
    LabelCoordination.delete_label(dbm, label_leaf_id)
    return "success"


@router.get("/{label_leaf_id}/export")
def export_label_tree(
    label_leaf_id: int,
    user=Depends(require_role(roles.DESIGNER)),
    dbm: DBMan = Depends(get_db),
):
    """Export a label tree as CSV."""
    csv_bytes, root_name = LabelCoordination.export_label_tree(dbm, label_leaf_id)
    return Response(
        content=csv_bytes,
        media_type="blob",
        headers={"Content-Disposition": f"attachment; filename={root_name}.csv"},
    )


@router.patch("/{visibility}")
def update_label(
    visibility: str,
    req: UpdateLabelRequest,
    user=Depends(require_role(roles.DESIGNER)),
    dbm: DBMan = Depends(get_db),
):
    """Update an existing label leaf."""
    LabelCoordination.update_label(
        dbm, req.id, req.name, req.description, req.abbreviation, req.external_id, req.color
    )
    return "success"


@router.post("/{visibility}")
def create_label(
    visibility: str,
    req: CreateLabelRequest,
    user=Depends(require_role(roles.DESIGNER)),
    dbm: DBMan = Depends(get_db),
):
    """Create a new label leaf."""
    try:
        label_id = LabelCoordination.create_label(dbm, user, visibility, req)
    except PermissionError:
        return JSONResponse(status_code=403, content={"message": "You are not authorized."})
    return {"message": "Label added successfully", "labelId": label_id}