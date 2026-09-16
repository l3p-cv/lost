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

import base64
import json
import logging
import os
import traceback
import cv2

from fastapi import APIRouter, Depends, Query
from fastapi.responses import PlainTextResponse, JSONResponse
from pydantic import BaseModel

from shapely.errors import TopologicalError
from lost.api.auth.dependencies import get_current_user, require_role
from lost.api.base import ProfilingRoute
from lost.db import roles, state
from lost.db.access import DBMan
from lost.db.model import User as DBUser
from lost.db.session import get_db
from lost.logic import sia
from lost.logic.file_man import FileMan
from lost.logic.permissions import UserPermissions
from lost.settings import DATA_URL, LOST_CONFIG

logger = logging.getLogger("lost.api.sia")

router = APIRouter(tags=["sia"], route_class=ProfilingRoute)


# --- Schemas ---


class ImageFiltersRequest(BaseModel):
    filters: list[dict] = []


class SiaAnnoUpdate(BaseModel):
    # Flexible model — the actual SIA annotation structure is complex
    # and validated by sia.update() / sia.update_one_thing()
    pass


class PolygonOperationError(Exception):
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
    dbm: DBMan = Depends(get_db),
):
    """Get SIA annotation information."""
    identity = user.idx
    if direction == "first":
        result = sia.get_first(dbm, identity, DATA_URL)
    elif direction == "next":
        result = sia.get_next(dbm, identity, lastImgId, DATA_URL)
    elif direction == "prev":
        result =  sia.get_previous(dbm, identity, lastImgId, DATA_URL)
    elif direction == "current":
        result = sia.get_current(dbm, identity, lastImgId, DATA_URL)
    elif direction == "specificImage":
        result = sia.get_current(dbm, identity, lastImgId, DATA_URL)
    else:
        return SiaAnnoSchema()

    if isinstance(result, str):
        return SiaAnnoSchema()
    return result


@router.put("")
def update_sia_anno(
    data: dict,
    user: DBUser = Depends(require_role(roles.ANNOTATOR)),
    dbm: DBMan = Depends(get_db),
):
    """Update whole SIA annotation."""
    try:
        return sia.update(dbm, data, user.idx)
    except Exception:
        msg = traceback.format_exc()
        msg += f"\nuser.idx: {user.idx}, user.name: {user.user_name}\n"
        msg += f"Received data:\n{json.dumps(data, indent=4)}\n"
        logger.error(f"{msg}")
        return JSONResponse(status_code=500, content="error updating sia anno")


@router.patch("")
def update_partial_sia_anno(
    data: dict,
    user: DBUser = Depends(require_role(roles.ANNOTATOR)),
    dbm: DBMan = Depends(get_db),
):
    """Update partial SIA annotation."""
    try:
        if "anno" not in data:
            if data["action"] not in ["imgAnnoTimeUpdate", "imgJunkUpdate", "imgLabelUpdate"]:
                raise Exception("Expect either anno or img information!")
        return sia.update_one_thing(dbm, data, user.idx)
    except Exception:
        raise


@router.get("/image/{image_id}")
def get_sia_image(
    image_id: int,
    angle: int | None = Query(None, description="Angle to rotate: 0, 90, 180, -90"),
    clipLimit: int | None = Query(None, description="Clip limit for clahe filter"),
    user: DBUser = Depends(require_role(roles.ANNOTATOR)),
    dbm: DBMan = Depends(get_db),
):
    """Get SIA image with optional rotation/clahe filters."""
    img = dbm.get_image_anno(image_id)
    logger.info(f"img.img_path: {img.img_path}")
    logger.info(f"img.fs.name: {img.fs.name}")
    fs = FileMan(fs_db=img.fs)
    if clipLimit is not None:
        img_data = fs.load_img(img.img_path, color_type="gray")
    else:
        img_data = fs.load_img(img.img_path, color_type="color")
    if angle is not None:
        if angle == 90:
            img_data = cv2.rotate(img_data, cv2.ROTATE_90_CLOCKWISE)
        elif angle == -90:
            img_data = cv2.rotate(img_data, cv2.ROTATE_90_COUNTERCLOCKWISE)
        elif angle == 180:
            img_data = cv2.rotate(img_data, cv2.ROTATE_180)
    if clipLimit is not None:
        clahe = cv2.createCLAHE(clipLimit)
        img_data = clahe.apply(img_data)
    _, data = cv2.imencode(".jpg", img_data)
    data64 = base64.b64encode(data.tobytes())
    return PlainTextResponse("data:image/jpeg;base64," + data64.decode("utf-8"))


@router.get("/image/{image_id}/name")
def get_sia_image_name(
    image_id: int,
    user: DBUser = Depends(require_role(roles.ANNOTATOR)),
    dbm: DBMan = Depends(get_db),
):
    """Get SIA image name."""
    img = dbm.get_image_anno(image_id)
    if img is None:
        return JSONResponse(status_code=404, content={"error": "Not found"})
    logger.info(f"img.img_path: {img.img_path}")
    logger.info(f"img.fs.name: {img.fs.name}")
    return {"img_name": os.path.basename(img.img_path)}


@router.post("/image/{image_id}/filters")
def get_image_with_filters(
    image_id: int,
    req: ImageFiltersRequest,
    user: DBUser = Depends(require_role(roles.ANNOTATOR)),
    dbm: DBMan = Depends(get_db),
):
    """Get an image with applied filters."""
    try:
        filters = req.filters
        img = dbm.get_image_anno(image_id)
        logger.info(f"img.img_path: {img.img_path}")
        logger.info(f"img.fs.name: {img.fs.name}")
        fs = FileMan(fs_db=img.fs)
        img_data = fs.load_img(
            img.img_path, color_type="gray" if any(f["name"] == "cannyEdge" for f in filters) else "color"
        )
        img_data = sia.apply_filters(img_data, filters)
        _, data = cv2.imencode(".jpg", img_data)
        data64 = base64.b64encode(data.tobytes())
        return PlainTextResponse("data:image/jpeg;base64," + data64.decode("utf-8"))
    except ValueError as ve:
        logger.warning(f"ValueError applying filters: {ve!s}")
        return JSONResponse(status_code=400, content={"error": str(ve)})
    except Exception as e:
        logger.error(f"Error applying filters: {e!s}")
        return JSONResponse(status_code=500, content={"error": str(e)})


@router.get("/images")
def get_sia_image_list(
    currentImgId: int | None = Query(None, description="Current image ID"),
    user: DBUser = Depends(require_role(roles.ANNOTATOR)),
    dbm: DBMan = Depends(get_db),
):
    """Get all image IDs and numbers for the current annotator's active annotask."""
    identity = user.idx
    at = sia.get_sia_anno_task(dbm, identity)
    if at is None:
        return {"images": []}
    all_annos = dbm.get_all_image_annos(at.idx)
    visited_states = {state.Anno.LABELED, state.Anno.LABELED_LOCKED, state.Anno.JUNK}
    user_annos = [
        a
        for a in all_annos
        if a.user_id == identity
        and (
            a.state in visited_states
            or a.idx == currentImgId
            or (a.state == state.Anno.LOCKED and a.timestamp_lock is not None)
        )
    ]
    total = len(user_annos)
    images = [{"imageId": a.idx, "number": i + 1, "total": total} for i, a in enumerate(user_annos)]
    return {"images": images}


@router.get("/image/{image_id}/thumbnail")
def get_sia_thumbnail(
    image_id: int,
    user: DBUser = Depends(get_current_user),
    dbm: DBMan = Depends(get_db),
):
    """Get a small thumbnail for the given image annotation ID."""
    identity = user.idx
    if not user.has_role(roles.ANNOTATOR) and not user.has_role(roles.DESIGNER):
        return JSONResponse(
            status_code=403,
            content={"message": f"You need to be {roles.ANNOTATOR} or {roles.DESIGNER} in order to perform this request."},
        )
    try:
        img = dbm.get_image_anno(image_id)
        if img is None:
            return JSONResponse(status_code=404, content={"error": "Not found"})
        if not user.has_role(roles.DESIGNER):
            at = dbm.get_anno_task(img.anno_task_id)
            at_group = dbm.get_group_by_id(at.group_id)
            if at_group is None:
                return JSONResponse(status_code=404, content={"error": "Group not found"})
            is_anno_group = at_group.is_user_default == 0
            is_owner = img.user_id == identity
            if not (is_owner or is_anno_group):
                return JSONResponse(status_code=403, content={"error": "Forbidden"})
        fs = FileMan(fs_db=img.fs)
        img_data = fs.load_img(img.img_path, color_type="color")
        h, w = img_data.shape[:2]
        scale = 120 / max(h, w)
        thumb = cv2.resize(img_data, (int(w * scale), int(h * scale)))
        _, encoded = cv2.imencode(".jpg", thumb, [cv2.IMWRITE_JPEG_QUALITY, 70])
        data64 = base64.b64encode(encoded.tobytes())
        return PlainTextResponse("data:image/jpeg;base64," + data64.decode("utf-8"))
    except Exception as e:
        logger.error(f"Error generating thumbnail: {e!s}")
        return JSONResponse(status_code=500, content={"error": str(e)})


@router.get("/allowedExampler")
def get_allowed_exampler(
    user: DBUser = Depends(require_role(roles.ANNOTATOR)),
    dbm: DBMan = Depends(get_db),
):
    """Check if user is allowed to mark images as examples."""
    up = UserPermissions(dbm, user)
    return up.allowed_to_mark_example()


@router.get("/nextAnnoId")
def get_next_anno_id(
    user: DBUser = Depends(require_role(roles.ANNOTATOR)),
    dbm: DBMan = Depends(get_db),
):
    """Get the ID of the next annotation."""
    return sia.get_next_anno_id(dbm)


@router.post("/finish")
def finish_sia_task(
    user: DBUser = Depends(require_role(roles.ANNOTATOR)),
    dbm: DBMan = Depends(get_db),
):
    """Finish the current SIA task."""
    return sia.finish(dbm, user.idx)


@router.get("/label")
def get_sia_labels(
    user: DBUser = Depends(require_role(roles.ANNOTATOR)),
    dbm: DBMan = Depends(get_db),
):
    """Get label trees for the SIA task."""
    return sia.get_label_trees(dbm, user.idx)


@router.get("/configuration", response_model=SiaConfigSchema)
def get_sia_configuration(
    user: DBUser = Depends(require_role(roles.ANNOTATOR)),
    dbm: DBMan = Depends(get_db),
):
    """Get config for the current SIA task."""
    return sia.get_configuration(dbm, user.idx)


@router.post("/polygonOperations/union")
def polygon_union(
    data: dict,
    user: DBUser = Depends(require_role(roles.ANNOTATOR)),
    dbm: DBMan = Depends(get_db),
):
    """Perform union operation on a list of at least 2 polygons."""
    try:
        data = sia.normalize_annotations(data)
        logger.info(f"Normalized payload for union: {data}")
        response = sia.perform_polygon_union(data)
        return response
    except sia.PolygonOperationError as e:
        logger.error(f"Validation error in polygon union: {e!s}")
        return JSONResponse(status_code=400, content={"error": str(e)})
    except TopologicalError as e:
        logger.error(f"Topology error in polygon union: {e!s}")
        return JSONResponse(status_code=400, content={"error": str(e)})
    except Exception as e:
        logger.error(f"Unexpected error in polygon union: {e!s}")
        return JSONResponse(status_code=500, content={"error": str(e)})


@router.post("/polygonOperations/intersection")
def polygon_intersection(
    data: dict,
    user: DBUser = Depends(require_role(roles.ANNOTATOR)),
    dbm: DBMan = Depends(get_db),
):
    """Perform intersection operation on exactly 2 polygons."""
    try:
        data = sia.normalize_annotations(data)
        response = sia.perform_polygon_intersection(data)
        return response
    except sia.PolygonOperationError as e:
        logger.error(f"Validation error in polygon intersection: {e!s}")
        return JSONResponse(status_code=400, content={"error": str(e)})
    except TopologicalError as e:
        logger.error(f"Topology error in polygon intersection: {e!s}")
        return JSONResponse(status_code=400, content={"error": str(e)})
    except Exception as e:
        logger.error(f"Unexpected error in polygon intersection: {e!s}")
        return JSONResponse(status_code=500, content={"error": str(e)})


@router.post("/polygonOperations/difference")
def polygon_difference(
    data: dict,
    user: DBUser = Depends(require_role(roles.ANNOTATOR)),
    dbm: DBMan = Depends(get_db),
):
    """Perform difference operation on a selected polygon and a list of modifier polygons."""
    try:
        logger.info(f"Received payload for difference: {data}")
        data = sia.normalize_annotations({
            "annotations": [data["selectedPolygon"]] + data.get("polygonModifiers", [])
        })
        data["selectedPolygon"] = data["annotations"][0]["polygonCoordinates"]
        data["polygonModifiers"] = [ann["polygonCoordinates"] for ann in data["annotations"][1:]]
        response = sia.perform_polygon_difference(data)
        return response
    except sia.PolygonOperationError as e:
        logger.error(f"Validation error in polygon difference: {e!s}")
        return JSONResponse(status_code=400, content={"error": str(e)})
    except TopologicalError as e:
        logger.error(f"Topology error in polygon difference: {e!s}")
        return JSONResponse(status_code=400, content={"error": str(e)})
    except Exception as e:
        logger.error(f"Unexpected error in polygon difference: {e!s}")
        return JSONResponse(status_code=500, content={"error": str(e)})


@router.post("/bboxFromPoints")
def bbox_from_points(
    data: dict,
    user: DBUser = Depends(require_role(roles.ANNOTATOR)),
    dbm: DBMan = Depends(get_db),
):
    """Compute tightest bounding boxes from multiple point sets."""
    try:
        logger.info(f"Received payload for bounding box computation: {data}")
        response = sia.compute_bboxes_from_points(data)
        return {"data": response}
    except sia.PolygonOperationError as e:
        logger.error(f"Validation error in bounding box computation: {e!s}")
        return JSONResponse(status_code=400, content={"error": str(e)})
    except Exception as e:
        logger.error(f"Unexpected error in bounding box computation: {e!s}")
        return JSONResponse(status_code=500, content={"error": str(e)})
