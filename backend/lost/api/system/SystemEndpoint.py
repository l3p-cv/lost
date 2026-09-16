"""System namespace — FastAPI endpoints for system info and control.

Routes:
    GET /api/system/version   — LOST version string (no auth)
    GET /api/system/settings  — auto-logout + dev mode config (no auth)
    GET /api/system/jupyter  — jupyter lab URL (admin only)
"""

from __future__ import annotations

import lost
from fastapi import APIRouter, Depends
from pydantic import BaseModel

from lost.api.base import ProfilingRoute
from lost.api.auth.dependencies import require_role
from lost.db import roles
from lost.settings import LOST_CONFIG

router = APIRouter(tags=["system"], route_class=ProfilingRoute)


class SystemSettings(BaseModel):
    autoLogoutTime: int | None = None  # Flask restx includes this as null — match for compatibility
    autoLogoutWarnTime: int
    isDevMode: bool


@router.get("/version")
def get_version():
    try:
        return lost.__version__
    except Exception:
        return "development"


@router.get("/settings", response_model=SystemSettings)
def get_settings():
    return {"autoLogoutWarnTime": 5 * 60, "isDevMode": LOST_CONFIG.debug}


@router.get("/jupyter")
def get_jupyter_url(user=Depends(require_role(roles.ADMINISTRATOR))):
    if LOST_CONFIG.jupyter_lab_active:
        return f"{LOST_CONFIG.jupyter_lab_port}/lab?token={LOST_CONFIG.jupyter_lab_token}"
    return ""
