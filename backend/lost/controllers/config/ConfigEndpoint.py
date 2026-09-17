"""Config namespace — FastAPI endpoints for project config management.

Pass 2 CCB split: routes, schemas, response construction only.
Flow: ConfigEndpoint -> ConfigCoordination -> ConfigBusiness (ProjectConfigMan util).

Routes:
    GET   /api/config — get all config entries (admin)
    PATCH /api/config — update config entries (admin)
"""
from __future__ import annotations

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from lost.controllers.Dependencies import get_config_coordination, require_role
from lost.controllers.base import ProfilingRoute
from lost.controllers.config.ConfigCoordination import ConfigCoordination
from lost.db import roles
from lost.db.model import User as DBUser

router = APIRouter(tags=["config"], route_class=ProfilingRoute)


class ConfigEntry(BaseModel):
    key: str
    value: str


@router.get("")
def get_config(
    user: DBUser = Depends(require_role(roles.ADMINISTRATOR)),
    coord: ConfigCoordination = Depends(get_config_coordination),
):
    """Get all config entries (admin only)."""
    return coord.get_config()


@router.patch("")
def update_config(
    entries: list[ConfigEntry],
    user: DBUser = Depends(require_role(roles.ADMINISTRATOR)),
    coord: ConfigCoordination = Depends(get_config_coordination),
):
    """Update config entries (admin only)."""
    coord.update_config(entries)
    return "success"