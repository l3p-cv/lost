"""System namespace — FastAPI endpoints for system info.

Pass 2 CCB split: routes, schemas, response construction only.
Flow: SystemEndpoint -> SystemCoordination -> SystemBusiness.

Routes:
    GET /api/system/version   — LOST version string (no auth)
    GET /api/system/settings  — auto-logout + dev mode config (no auth)
    GET /api/system/jupyter   — jupyter lab URL (admin only)
"""
from __future__ import annotations

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from lost.controllers.base import ProfilingRoute
from lost.controllers.Dependencies import get_system_coordination, require_role
from lost.controllers.system.SystemCoordination import SystemCoordination
from lost.db import roles

router = APIRouter(tags=["system"], route_class=ProfilingRoute)


class SystemSettings(BaseModel):
    autoLogoutTime: int | None = None  # Flask restx includes this as null — match for compatibility
    autoLogoutWarnTime: int
    isDevMode: bool


@router.get("/version")
def get_version(coord: SystemCoordination = Depends(get_system_coordination)):
    """Get the LOST version string."""
    return coord.get_version()


@router.get("/settings", response_model=SystemSettings)
def get_settings(coord: SystemCoordination = Depends(get_system_coordination)):
    """Get auto-logout and dev-mode settings."""
    return coord.get_settings()


@router.get("/jupyter")
def get_jupyter_url(
    user=Depends(require_role(roles.ADMINISTRATOR)),
    coord: SystemCoordination = Depends(get_system_coordination),
):
    """Get the Jupyter Lab URL."""
    return coord.get_jupyter_url()
