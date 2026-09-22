"""Annotasks namespace — FastAPI endpoints for annotation task management.

Routes:
    GET    /api/annotasks                              — list available annotasks (annotator)
    POST   /api/annotasks                              — select an annotask (annotator)
    GET    /api/annotasks/working                      — get current working annotask (annotator)
    GET    /api/annotasks/{annotask_id}                — get annotask details (annotator)
    POST   /api/annotasks/{annotask_id}/force_release   — force release locked annos (annotator)
    PATCH  /api/annotasks/{annotask_id}/group          — change group (designer)
    PUT    /api/annotasks/{annotask_id}/config         — update config (designer)
    GET    /api/annotasks/{annotask_id}/storage_settings — get storage settings (designer)
    PATCH  /api/annotasks/{annotask_id}/storage_settings — update storage settings (designer)
    POST   /api/annotasks/{annotask_id}/exports       — generate export (annotator)
    GET    /api/annotasks/{annotask_id}/exports       — list exports (annotator)
    GET    /api/annotasks/exports/{export_id}         — download export (annotator)
    DELETE /api/annotasks/exports/{export_id}         — delete export (designer)
    GET    /api/annotasks/{annotask_id}/instruction   — get instruction (jwt)
    PATCH  /api/annotasks/{annotask_id}/instruction   — update instruction (designer)
    GET    /api/annotasks/filterLabels                 — get filter labels (annotator)
    GET    /api/annotasks/{annotask_id}/review/images  — search review images (designer)
    GET    /api/annotasks/{annotask_id}/review/labels  — get review labels (designer)
    PATCH  /api/annotasks/{annotask_id}/annotation    — update one thing (annotator)
    GET    /api/annotasks/{annotask_id}/review/options — get review options (designer)
    POST   /api/annotasks/{annotask_id}/review        — review navigation (designer)
    GET    /api/annotasks/statistics/{annotask_id}     — get statistics (annotator)

"""

from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, Query
from fastapi.responses import Response
from pydantic import BaseModel

from lost.controllers.annotasks.AnnotasksCoordination import AnnotasksCoordination
from lost.controllers.base import ProfilingRoute
from lost.controllers.Dependencies import get_annotasks_coordination, get_current_user, require_role
from lost.db import roles
from lost.db.model import User as DBUser

logger = logging.getLogger("lost.controllers.annotasks")
router = APIRouter(tags=["annotasks"], route_class=ProfilingRoute)


# --- Schemas ---


class ChooseAnnotaskRequest(BaseModel):
    id: int


class UpdateGroupRequest(BaseModel):
    groupId: int


class UpdateConfigRequest(BaseModel):
    id: int
    configuration: dict | None = None


class UpdateStorageRequest(BaseModel):
    datasetId: int


class GenerateExportRequest(BaseModel):
    exportName: str
    exportType: str
    includeImages: bool
    annotatedOnly: bool
    randomSplits: dict


class UpdateInstructionRequest(BaseModel):
    instructionId: int | None = None


class ReviewRequest(BaseModel):
    direction: str
    imageAnnoId: int | None = None
    iteration: int | None = None
    annotaskIdx: int | None = None


class PatchAnnotationRequest(BaseModel):
    action: str
    anno: dict | None = None
    img: dict | None = None


# --- Routes ---


@router.get("")
def get_annotasks(
    page_size: int | None = Query(None, alias="pageSize", description="Page size"),
    page: int | None = Query(None, alias="page", description="Page number"),
    filtered_name: str | None = Query(None, alias="filteredName", description="Name filter"),
    filtered_states: str | None = Query(None, alias="filteredStates", description="State filter"),
    user: DBUser = Depends(require_role(roles.ANNOTATOR)),
    coord: AnnotasksCoordination = Depends(get_annotasks_coordination),
):
    """Retrieve a list of available annotation tasks for the authenticated user."""
    return coord.get_annotasks(user, page_size, page, filtered_name, filtered_states)


@router.post("")
def choose_annotask(
    req: ChooseAnnotaskRequest,
    user: DBUser = Depends(require_role(roles.ANNOTATOR)),
    coord: AnnotasksCoordination = Depends(get_annotasks_coordination),
):
    """Select an annotation task for the authenticated user."""
    return coord.choose_annotask(user, req.id)


@router.get("/working")
def get_working_annotask(
    user: DBUser = Depends(require_role(roles.ANNOTATOR)),
    coord: AnnotasksCoordination = Depends(get_annotasks_coordination),
):
    """Get currently active annotation task."""
    return coord.get_working_annotask(user)


@router.get("/filterLabels")
def get_filter_labels(
    user: DBUser = Depends(require_role(roles.ANNOTATOR)),
    coord: AnnotasksCoordination = Depends(get_annotasks_coordination)
):
    """Get possible filter labels for annotation lists."""
    return coord.get_filter_labels()


# NOTE: /{annotask_id} routes must be registered AFTER specific sub-routes
# (/working, /filterLabels, /statistics/{id}, /exports/{id})
# to avoid path conflicts.
@router.get("/statistics/{annotask_id}")
def get_annotask_statistics(
    annotask_id: int,
    user: DBUser = Depends(require_role(roles.ANNOTATOR)),
    coord: AnnotasksCoordination = Depends(get_annotasks_coordination)
):
    """Get statistics for an annotation task."""
    return coord.get_annotask_statistics(annotask_id)


@router.get("/exports/{annotask_export_id}")
def download_annotask_export(
    annotask_export_id: int,
    user: DBUser = Depends(get_current_user),
    coord: AnnotasksCoordination = Depends(get_annotasks_coordination),
):
    """Download an annotation task export."""
    my_file, export_name = coord.download_annotask_export(user, annotask_export_id)
    return Response(
        content=my_file,
        media_type="blob",
        headers={"Content-Disposition": f"attachment; filename={export_name}"},
    )


@router.delete("/exports/{annotask_export_id}")
def delete_annotask_export(
    annotask_export_id: int,
    user: DBUser = Depends(require_role(roles.DESIGNER)),
    coord: AnnotasksCoordination = Depends(get_annotasks_coordination)
):
    """Delete an annotation task export (designer only)."""
    return coord.delete_annotask_export(user, annotask_export_id)


@router.get("/{annotask_id}")
def get_annotask_by_id(
    annotask_id: int,
    statistics: str | None = Query(None, description="Return statistics too"),
    config: str | None = Query(None, description="Return config too"),
    user: DBUser = Depends(require_role(roles.ANNOTATOR)),
    coord: AnnotasksCoordination = Depends(get_annotasks_coordination)
):
    """Get details for an annotation task with the given id."""
    return coord.get_annotask_by_id(user, annotask_id, statistics, config)


@router.post("/{annotask_id}/force_release")
def force_release(
    annotask_id: int,
    user: DBUser = Depends(require_role(roles.ANNOTATOR)),
    coord: AnnotasksCoordination = Depends(get_annotasks_coordination)
):
    """Force release of locked annotations."""
    return coord.force_release(annotask_id)


@router.patch("/{annotask_id}/group")
def change_group(
    annotask_id: int,
    req: UpdateGroupRequest,
    user: DBUser = Depends(require_role(roles.DESIGNER)),
    coord: AnnotasksCoordination = Depends(get_annotasks_coordination)
):
    """Update the group the annotation task is assigned to."""
    return coord.change_group(user, annotask_id, req.groupId)


@router.put("/{annotask_id}/config")
def update_annotask_config(
    annotask_id: int,
    req: UpdateConfigRequest,
    user: DBUser = Depends(require_role(roles.DESIGNER)),
    coord: AnnotasksCoordination = Depends(get_annotasks_coordination)
):
    """Update the config of the annotation task."""
    return coord.update_annotask_config(user, annotask_id, req.configuration)


@router.get("/{annotask_id}/storage_settings")
def get_storage_settings(
    annotask_id: int,
    user: DBUser = Depends(require_role(roles.DESIGNER)),
    coord: AnnotasksCoordination = Depends(get_annotasks_coordination)
):
    """Get the storage settings of the annotation task."""
    return coord.get_storage_settings(annotask_id)


@router.patch("/{annotask_id}/storage_settings")
def update_storage_settings(
    annotask_id: int,
    req: UpdateStorageRequest,
    user: DBUser = Depends(require_role(roles.DESIGNER)),
    coord: AnnotasksCoordination = Depends(get_annotasks_coordination)
):
    """Update the storage settings of the annotation task."""
    return coord.update_storage_settings(annotask_id, req.datasetId)


@router.post("/{annotask_id}/exports")
def generate_export(
    annotask_id: int,
    req: GenerateExportRequest,
    user: DBUser = Depends(get_current_user),
    coord: AnnotasksCoordination = Depends(get_annotasks_coordination)
):
    """Generate an export for the annotation task."""
    return coord.generate_export(user, annotask_id, req)


@router.get("/{annotask_id}/exports")
def get_annotask_exports(
    annotask_id: int,
    user: DBUser = Depends(get_current_user),
    coord: AnnotasksCoordination = Depends(get_annotasks_coordination)
):
    """Get all exports for the annotation task."""
    return coord.get_annotask_exports(user, annotask_id)

@router.get("/{annotask_id}/instruction")
def get_annotask_instruction(
    annotask_id: int,
    user: DBUser = Depends(get_current_user),
    coord: AnnotasksCoordination = Depends(get_annotasks_coordination)
):
    """Get the current instruction of the annotation task."""
    return coord.get_annotask_instruction(annotask_id)

@router.patch("/{annotask_id}/instruction")
def update_annotask_instruction(
    annotask_id: int,
    req: UpdateInstructionRequest,
    user: DBUser = Depends(require_role(roles.DESIGNER)),
    coord: AnnotasksCoordination = Depends(get_annotasks_coordination)
):
    """Update the instruction of the annotation task."""
    return coord.update_annotask_instruction(annotask_id, req.instructionId)

@router.get("/{annotask_id}/review/images")
def get_review_images(
    annotask_id: int,
    filter: str | None = Query(None, description="Search filter"),
    labels: str | None = Query(None, description="Label filter"),
    annotated_only: str = Query("false", description="Annotated only"),
    user: DBUser = Depends(require_role(roles.DESIGNER)),
    coord: AnnotasksCoordination = Depends(get_annotasks_coordination)
):
    """Search for images in the annotation task review."""
    return coord.get_review_images(annotask_id, filter, labels, annotated_only)

@router.get("/{annotask_id}/review/labels")
def get_review_labels(
    annotask_id: int,
    user: DBUser = Depends(require_role(roles.DESIGNER)),
    coord: AnnotasksCoordination = Depends(get_annotasks_coordination)
):
    """Get all possible labels for a given annotation task."""
    return coord.get_review_labels(annotask_id)


@router.patch("/{annotask_id}/annotation")
def update_one_thing(
    annotask_id: int,
    req: PatchAnnotationRequest,
    user: DBUser = Depends(require_role(roles.ANNOTATOR)),
    coord: AnnotasksCoordination = Depends(get_annotasks_coordination)
):
    """Update image annotation time, junk status, or image label."""
    return coord.update_one_thing(user, annotask_id, req)

@router.get("/{annotask_id}/review/options")
def get_review_options(
    annotask_id: int,
    user: DBUser = Depends(require_role(roles.DESIGNER)),
    coord: AnnotasksCoordination = Depends(get_annotasks_coordination)
):
    """Get review options for the annotation task."""
    return coord.get_review_options(user, annotask_id)


@router.post("/{annotask_id}/review")
def annotask_review(
    annotask_id: int,
    req: ReviewRequest,
    user: DBUser = Depends(require_role(roles.DESIGNER)),
    coord: AnnotasksCoordination = Depends(get_annotasks_coordination)
):
    """Get data for the next annotask review image."""
    return coord.annotask_review(user, annotask_id, req.model_dump())
