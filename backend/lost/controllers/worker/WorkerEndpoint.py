"""Worker namespace — FastAPI endpoints for worker info.

Pass 2 CCB split: routes, schemas, response construction only.
Flow: WorkerEndpoint -> WorkerCoordination -> WorkerBusiness.

Routes:
    GET /api/worker/ — list all workers (designer)
"""
from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from lost.controllers.base import ProfilingRoute
from lost.controllers.Dependencies import get_worker_coordination, require_role
from lost.controllers.worker.WorkerCoordination import WorkerCoordination
from lost.db import roles

router = APIRouter(tags=["worker"], route_class=ProfilingRoute)


# --- Schemas ---

class Worker(BaseModel):
    idx: int | None = None
    env_name: str | None = None
    worker_name: str | None = None
    timestamp: datetime | None = None
    register_timestamp: datetime | None = None
    resources: str | None = None
    in_progress: str | None = None


class WorkerList(BaseModel):
    workers: list[Worker] = []


# --- Routes ---

@router.get("", response_model=WorkerList)
def get_workers(
    user=Depends(require_role(roles.DESIGNER)),
    coord: WorkerCoordination = Depends(get_worker_coordination),
):
    """List all workers."""
    return {"workers": coord.get_workers()}
