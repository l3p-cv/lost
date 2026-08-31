"""MIA namespace — FastAPI endpoints for Multi Image Annotation.

Routes:
    PATCH  /api/mia                    — update MIA task (annotator)
    GET    /api/mia/next/{max_amount}  — get next MIA annotations (annotator)
    GET    /api/mia/label             — get MIA label trees (annotator)
    POST   /api/mia/finish            — finish MIA task (annotator)
    POST   /api/mia/special           — get special MIA images (annotator)
    GET    /api/mia/prev              — get previous MIA annotations (annotator)
    GET    /api/mia/first             — get first MIA annotation (annotator)
    GET    /api/mia/latest            — get latest MIA annotation (annotator)
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel

from lost.api.auth.dependencies import get_current_user, require_role
from lost.api.base import ProfilingRoute
from lost.db import roles
from lost.db.access import DBMan
from lost.db.model import User as DBUser
from lost.db.session import get_db
from lost.logic import mia

router = APIRouter(tags=["mia"], route_class=ProfilingRoute)


# --- Schemas ---


class SpecialRequest(BaseModel):
    miaIds: list[int]


# --- Routes ---


@router.patch("")
def update_mia(
    data: dict,
    user: DBUser = Depends(require_role(roles.ANNOTATOR)),
    dbm: DBMan = Depends(get_db),
):
    """Update MIA task."""
    return mia.update(dbm, user.idx, data)


@router.get("/next/{max_amount}")
def get_next_mia(
    max_amount: int,
    user: DBUser = Depends(require_role(roles.ANNOTATOR)),
    dbm: DBMan = Depends(get_db),
):
    """Get next MIA annotations."""
    return mia.get_next(dbm, user.idx, max_amount)


@router.get("/label")
def get_mia_labels(
    user: DBUser = Depends(require_role(roles.ANNOTATOR)),
    dbm: DBMan = Depends(get_db),
):
    """Get possible MIA labels."""
    return mia.get_label_trees(dbm, user.idx)


@router.post("/finish")
def finish_mia_task(
    user: DBUser = Depends(require_role(roles.ANNOTATOR)),
    dbm: DBMan = Depends(get_db),
):
    """Finish MIA task."""
    return mia.finish(dbm, user.idx)


@router.post("/special")
def get_special_mia(
    req: SpecialRequest,
    user: DBUser = Depends(require_role(roles.ANNOTATOR)),
    dbm: DBMan = Depends(get_db),
):
    """Get special MIA images."""
    return mia.get_special(dbm, user.idx, req.miaIds)


@router.get("/prev")
def get_prev_mia(
    currentChunkId: int = Query(..., description="Current chunk ID"),
    currentUpdateIds: list[int] = Query([], description="Current update IDs"),
    user: DBUser = Depends(require_role(roles.ANNOTATOR)),
    dbm: DBMan = Depends(get_db),
):
    """Get previous MIA annotations. If chunk_id is -1, returns latest."""
    if currentChunkId != -1:
        return mia.get_prev(dbm, user.idx, currentChunkId, currentUpdateIds)
    return mia.get_latest(dbm, user.idx)


@router.get("/first")
def get_first_mia(
    user: DBUser = Depends(require_role(roles.ANNOTATOR)),
    dbm: DBMan = Depends(get_db),
):
    """Get first MIA annotation."""
    return mia.get_first(dbm, user.idx)


@router.get("/latest")
def get_latest_mia(
    user: DBUser = Depends(require_role(roles.ANNOTATOR)),
    dbm: DBMan = Depends(get_db),
):
    """Get latest MIA annotation."""
    return mia.get_latest(dbm, user.idx)