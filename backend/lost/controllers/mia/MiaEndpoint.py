"""MIA namespace — FastAPI endpoints for Multi Image Annotation.

Pass 2 CCB split: routes, schemas, response construction only.
Flow: MiaEndpoint -> MiaCoordination -> MiaBusiness.

Routes:
    PATCH  /api/mia                    — update MIA task (annotator)
    GET    /api/mia/next/{max_amount}  — get next MIA annotations (annotator)
    GET    /api/mia/label              — get MIA label trees (annotator)
    POST   /api/mia/finish             — finish MIA task (annotator)
    POST   /api/mia/special            — get special MIA images (annotator)
    GET    /api/mia/prev               — get previous MIA annotations (annotator)
    GET    /api/mia/first              — get first MIA annotation (annotator)
    GET    /api/mia/latest             — get latest MIA annotation (annotator)
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel

from lost.controllers.Dependencies import get_mia_coordination, require_role
from lost.controllers.base import ProfilingRoute
from lost.controllers.mia.MiaCoordination import MiaCoordination
from lost.db import roles
from lost.db.model import User as DBUser

router = APIRouter(tags=["mia"], route_class=ProfilingRoute)


# --- Schemas ---

class SpecialRequest(BaseModel):
    miaIds: list[int]


# --- Routes ---

@router.patch("")
def update_mia(
    data: dict,
    user: DBUser = Depends(require_role(roles.ANNOTATOR)),
    coord: MiaCoordination = Depends(get_mia_coordination),
):
    """Update MIA task."""
    return coord.update_mia(user, data)


@router.get("/next/{max_amount}")
def get_next_mia(
    max_amount: int,
    user: DBUser = Depends(require_role(roles.ANNOTATOR)),
    coord: MiaCoordination = Depends(get_mia_coordination),
):
    """Get next MIA annotations."""
    return coord.get_next_mia(user, max_amount)


@router.get("/label")
def get_mia_labels(
    user: DBUser = Depends(require_role(roles.ANNOTATOR)),
    coord: MiaCoordination = Depends(get_mia_coordination),
):
    """Get possible MIA labels."""
    return coord.get_mia_labels(user)


@router.post("/finish")
def finish_mia_task(
    user: DBUser = Depends(require_role(roles.ANNOTATOR)),
    coord: MiaCoordination = Depends(get_mia_coordination),
):
    """Finish MIA task."""
    return coord.finish_mia_task(user)


@router.post("/special")
def get_special_mia(
    req: SpecialRequest,
    user: DBUser = Depends(require_role(roles.ANNOTATOR)),
    coord: MiaCoordination = Depends(get_mia_coordination),
):
    """Get special MIA images."""
    return coord.get_special_mia(user, req.miaIds)


@router.get("/prev")
def get_prev_mia(
    currentChunkId: int = Query(..., description="Current chunk ID"),
    currentUpdateIds: list[int] = Query([], description="Current update IDs"),
    user: DBUser = Depends(require_role(roles.ANNOTATOR)),
    coord: MiaCoordination = Depends(get_mia_coordination),
):
    """Get previous MIA annotations. If chunk_id is -1, returns latest."""
    return coord.get_prev_mia(user, currentChunkId, currentUpdateIds)


@router.get("/first")
def get_first_mia(
    user: DBUser = Depends(require_role(roles.ANNOTATOR)),
    coord: MiaCoordination = Depends(get_mia_coordination),
):
    """Get first MIA annotation."""
    return coord.get_first_mia(user)


@router.get("/latest")
def get_latest_mia(
    user: DBUser = Depends(require_role(roles.ANNOTATOR)),
    coord: MiaCoordination = Depends(get_mia_coordination),
):
    """Get latest MIA annotation."""
    return coord.get_latest_mia(user)