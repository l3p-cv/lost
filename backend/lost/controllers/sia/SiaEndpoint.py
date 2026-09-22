"""SIA namespace — FastAPI endpoints for Single Image Annotation.

Routes:
    GET    /api/sia                           — get SIA annotation info (annotator)
    PUT    /api/sia                           — update whole annotation (annotator)
    PATCH  /api/sia                           — update partial annotation (annotator)
    GET    /api/sia/image/{image_id}          — get image with filters (annotator)
    GET    /api/sia/image/{image_id}/name     — get image name (annotator)
    POST   /api/sia/image/{image_id}/filters  — get image with applied filters (annotator)
    GET    /api/sia/images                    — get all image IDs for sidebar (annotator)
    GET    /api/sia/image/{image_id}/thumbnail — get thumbnail (annotator/designer)
    GET    /api/sia/allowedExampler            — check example permission (annotator)
    GET    /api/sia/nextAnnoId                 — get next annotation ID (annotator)
    POST   /api/sia/finish                    — finish current task (annotator)
    GET    /api/sia/label                      — get label trees (annotator)
    GET    /api/sia/configuration              — get SIA config (annotator)
    POST   /api/sia/polygonOperations/union   — polygon union (annotator)
    POST   /api/sia/polygonOperations/intersection — polygon intersection (annotator)
    POST   /api/sia/polygonOperations/difference   — polygon difference (annotator)
    POST   /api/sia/bboxFromPoints            — compute bboxes from points (annotator)
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from fastapi.responses import PlainTextResponse
from pydantic import BaseModel

from lost.controllers.base import ProfilingRoute
from lost.controllers.Dependencies import get_current_user, get_sia_coordination, require_role
from lost.controllers.sia.SiaCoordination import SiaCoordination
from lost.db import roles
from lost.db.model import User as DBUser

router = APIRouter(tags=["sia"], route_class=ProfilingRoute)


# --- Schemas ---


class ImageFiltersRequest(BaseModel):
    filters: list[dict] = []


class SiaAnnoUpdate(BaseModel):
    # Flexible model — the actual SIA annotation structure is complex
    # and validated by sia.update() / sia.update_one_thing()
    pass

class SiaAnnotationsSchema(BaseModel):
    bBoxes: list | None = None
    lines: list | None = None
    points: list | None = None
    polygons: list | None = None

class SiaImageSchema(BaseModel):
    amount: int | None = None
    annoTime: float | None = None
    description: str | None = None
    id: int | None = None
    imgActions: list | None = None
    isFirst: bool | None = None
    isJunk: bool | None = None
    isLast: bool | None = None
    labelIds: list | None = None
    number: int | None = None

class SiaAnnoSchema(BaseModel):
    annotations: SiaAnnotationsSchema = SiaAnnotationsSchema()
    image: SiaImageSchema = SiaImageSchema()

class SiaConfigToolsSchema(BaseModel):
    point: bool | None = None
    line: bool | None = None
    polygon: bool | None = None
    bbox: bool | None = None
    junk: bool | None = None
    sam: bool | None = None  # ← missing field

class SiaConfigAnnosActionsSchema(BaseModel):
    draw: bool | None = None
    label: bool | None = None
    edit: bool | None = None

class SiaConfigAnnosSchema(BaseModel):
    minArea: int | None = None
    multilabels: bool | None = None
    actions: SiaConfigAnnosActionsSchema | None = None

class SiaConfigImgActionsSchema(BaseModel):
    label: bool | None = None

class SiaConfigImgSchema(BaseModel):
    multilabels: bool | None = None
    actions: SiaConfigImgActionsSchema | None = None

class SiaInferenceModelConfigSchema(BaseModel):
    id: int | None = None
    displayName: str | None = None
    modelType: str | None = None

class SiaConfigSchema(BaseModel):
    tools: SiaConfigToolsSchema | None = None
    annos: SiaConfigAnnosSchema | None = None
    img: SiaConfigImgSchema | None = None
    inferenceModel: SiaInferenceModelConfigSchema = SiaInferenceModelConfigSchema()

# --- Routes ---

@router.get("", response_model=SiaAnnoSchema)
def get_sia_info(
    direction: str = Query(..., description='One of "next","prev","current","first","specificImage"'),
    lastImgId: int = Query(..., description="ID of the last image"),
    user: DBUser = Depends(require_role(roles.ANNOTATOR)),
    coord: SiaCoordination = Depends(get_sia_coordination),
):
    """Get SIA annotation information."""
    result = coord.get_sia_info(user, direction, lastImgId)
    if result is None:
        return SiaAnnoSchema()
    return result


@router.put("")
def update_sia_anno(
    data: dict,
    user: DBUser = Depends(require_role(roles.ANNOTATOR)),
    coord: SiaCoordination = Depends(get_sia_coordination),
):
    """Update whole SIA annotation."""
    return coord.update_sia_anno(user, data)


@router.patch("")
def update_partial_sia_anno(
    data: dict,
    user: DBUser = Depends(require_role(roles.ANNOTATOR)),
    coord: SiaCoordination = Depends(get_sia_coordination),
):
    """Update partial SIA annotation."""
    return coord.update_partial_sia_anno(user, data)


@router.get("/image/{image_id}")
def get_sia_image(
    image_id: int,
    angle: int | None = Query(None, description="Angle to rotate: 0, 90, 180, -90"),
    clipLimit: int | None = Query(None, description="Clip limit for clahe filter"),
    user: DBUser = Depends(require_role(roles.ANNOTATOR)),
    coord: SiaCoordination = Depends(get_sia_coordination),
):
    """Get SIA image with optional rotation/clahe filters."""
    return PlainTextResponse(coord.get_sia_image(image_id, angle, clipLimit))


@router.get("/image/{image_id}/name")
def get_sia_image_name(
    image_id: int,
    user: DBUser = Depends(require_role(roles.ANNOTATOR)),
    coord: SiaCoordination = Depends(get_sia_coordination),
):
    """Get SIA image name."""
    return coord.get_sia_image_name(image_id)


@router.post("/image/{image_id}/filters")
def get_image_with_filters(
    image_id: int,
    req: ImageFiltersRequest,
    user: DBUser = Depends(require_role(roles.ANNOTATOR)),
    coord: SiaCoordination = Depends(get_sia_coordination),
):
    """Get an image with applied filters."""
    return PlainTextResponse(coord.get_image_with_filters(image_id, req.filters))


@router.get("/images")
def get_sia_image_list(
    currentImgId: int | None = Query(None, description="Current image ID"),
    user: DBUser = Depends(require_role(roles.ANNOTATOR)),
    coord: SiaCoordination = Depends(get_sia_coordination),
):
    """Get all image IDs and numbers for the current annotator's active annotask."""
    return coord.get_sia_image_list(user, currentImgId)


@router.get("/image/{image_id}/thumbnail")
def get_sia_thumbnail(
    image_id: int,
    user: DBUser = Depends(get_current_user),
    coord: SiaCoordination = Depends(get_sia_coordination),
):
    """Get a small thumbnail for the given image annotation ID."""
    return PlainTextResponse(coord.get_sia_thumbnail(user, image_id))


@router.get("/allowedExampler")
def get_allowed_exampler(
    user: DBUser = Depends(require_role(roles.ANNOTATOR)),
    coord: SiaCoordination = Depends(get_sia_coordination),
):
    """Check if user is allowed to mark images as examples."""
    return coord.get_allowed_exampler(user)


@router.get("/nextAnnoId")
def get_next_anno_id(
    user: DBUser = Depends(require_role(roles.ANNOTATOR)),
    coord: SiaCoordination = Depends(get_sia_coordination),
):
    """Get the ID of the next annotation."""
    return coord.get_next_anno_id()


@router.post("/finish")
def finish_sia_task(
    user: DBUser = Depends(require_role(roles.ANNOTATOR)),
    coord: SiaCoordination = Depends(get_sia_coordination),
):
    """Finish the current SIA task."""
    return coord.finish_sia_task(user)


@router.get("/label")
def get_sia_labels(
    user: DBUser = Depends(require_role(roles.ANNOTATOR)),
    coord: SiaCoordination = Depends(get_sia_coordination),
):
    """Get label trees for the SIA task."""
    return coord.get_sia_labels(user)


@router.get("/configuration", response_model=SiaConfigSchema)
def get_sia_configuration(
    user: DBUser = Depends(require_role(roles.ANNOTATOR)),
    coord: SiaCoordination = Depends(get_sia_coordination),
):
    """Get config for the current SIA task."""
    return coord.get_sia_configuration(user)


@router.post("/polygonOperations/union")
def polygon_union(
    data: dict,
    user: DBUser = Depends(require_role(roles.ANNOTATOR)),
    coord: SiaCoordination = Depends(get_sia_coordination),
):
    """Perform union operation on a list of at least 2 polygons."""
    return coord.polygon_union(data)


@router.post("/polygonOperations/intersection")
def polygon_intersection(
    data: dict,
    user: DBUser = Depends(require_role(roles.ANNOTATOR)),
    coord: SiaCoordination = Depends(get_sia_coordination),
):
    """Perform intersection operation on exactly 2 polygons."""
    return coord.polygon_intersection(data)


@router.post("/polygonOperations/difference")
def polygon_difference(
    data: dict,
    user: DBUser = Depends(require_role(roles.ANNOTATOR)),
    coord: SiaCoordination = Depends(get_sia_coordination),
):
    """Perform difference operation on a selected polygon and a list of modifier polygons."""
    return coord.polygon_difference(data)


@router.post("/bboxFromPoints")
def bbox_from_points(
    data: dict,
    user: DBUser = Depends(require_role(roles.ANNOTATOR)),
    coord: SiaCoordination = Depends(get_sia_coordination),
):
    """Compute tightest bounding boxes from multiple point sets."""
    return {"data": coord.bbox_from_points(data)}
