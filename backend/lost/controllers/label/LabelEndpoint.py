"""Label namespace — FastAPI endpoints for label info and control.

Pass 2 CCB split: routes, schemas, response construction only.
Flow: LabelEndpoint -> LabelCoordination -> LabelBusiness (LabelTree).
Domain errors are mapped to legacy HTTP bodies by the global exception
handlers registered in fastapi_app.py.

Routes:
    GET    /api/label/tree/{visibility}       — list label trees (designer/admin)
    POST   /api/label/tree/{visibility}       — import label tree from CSV (designer/admin)
    GET    /api/label/{label_leaf_id}         — get label leaf by ID (designer)
    PATCH  /api/label/{visibility}            — update label (designer)
    POST   /api/label/{visibility}            — create label (designer/admin)
    DELETE /api/label/{label_leaf_id}         — delete label (designer)
    GET    /api/label/{label_leaf_id}/export  — export label tree as CSV (designer)
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, UploadFile
from fastapi.responses import Response
from pydantic import BaseModel

from lost.controllers.base import ProfilingRoute
from lost.controllers.Dependencies import get_label_coordination, require_role
from lost.controllers.label.LabelCoordination import LabelCoordination
from lost.db import roles

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
    coord: LabelCoordination = Depends(get_label_coordination),
):
    """Get all label trees for the given visibility level."""
    return coord.get_label_trees(user, visibility)


@router.post("/tree/{visibility}")
async def import_label_tree(
    visibility: str,
    file: UploadFile,
    user=Depends(require_role(roles.DESIGNER)),
    coord: LabelCoordination = Depends(get_label_coordination),
):
    """Import a label tree from CSV."""
    csv_bytes = await file.read()
    coord.import_label_tree(user, visibility, file.filename, csv_bytes)
    return {"message": "Tree imported successfully"}


@router.get("/{label_leaf_id}")
def get_label_leaf(
    label_leaf_id: int,
    user=Depends(require_role(roles.DESIGNER)),
    coord: LabelCoordination = Depends(get_label_coordination),
):
    """Get a label leaf by ID."""
    return coord.get_label_leaf(label_leaf_id)


@router.delete("/{label_leaf_id}")
def delete_label(
    label_leaf_id: int,
    user=Depends(require_role(roles.DESIGNER)),
    coord: LabelCoordination = Depends(get_label_coordination),
):
    """Delete a label leaf by ID."""
    coord.delete_label(label_leaf_id)
    return "success"


@router.get("/{label_leaf_id}/export")
def export_label_tree(
    label_leaf_id: int,
    user=Depends(require_role(roles.DESIGNER)),
    coord: LabelCoordination = Depends(get_label_coordination),
):
    """Export a label tree as CSV."""
    csv_bytes, root_name = coord.export_label_tree(label_leaf_id)
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
    coord: LabelCoordination = Depends(get_label_coordination),
):
    """Update an existing label leaf."""
    coord.update_label(req)
    return "success"


@router.post("/{visibility}")
def create_label(
    visibility: str,
    req: CreateLabelRequest,
    user=Depends(require_role(roles.DESIGNER)),
    coord: LabelCoordination = Depends(get_label_coordination),
):
    """Create a new label leaf."""
    label_id = coord.create_label(user, visibility, req)
    return {"message": "Label added successfully", "labelId": label_id}
