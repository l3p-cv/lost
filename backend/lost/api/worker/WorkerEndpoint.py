"""Worker namespace — FastAPI endpoints for worker info and control.

Routes:
    GET /api/worker/ — list all workers
"""

from datetime import datetime

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from lost.api.base import ProfilingRoute
from lost.api.auth.dependencies import require_role
from lost.db.session import get_db
from lost.db import roles

router = APIRouter(tags=["worker"], route_class=ProfilingRoute)

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
    
@router.get("", response_model=WorkerList)
def get_workers(
    user=Depends(require_role(roles.DESIGNER)),
    dbm=Depends(get_db),
):
    return {"workers": dbm.get_worker()}