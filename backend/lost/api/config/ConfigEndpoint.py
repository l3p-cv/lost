"""Config namespace — FastAPI endpoints for project config management.

Routes:
    GET   /api/config   — get all config entries (admin)
    PATCH /api/config   — update config entries (admin)
"""

from __future__ import annotations

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from lost.api.auth.dependencies import require_role
from lost.api.base import ProfilingRoute
from lost.db import roles
from lost.db.access import DBMan
from lost.db.model import User as DBUser
from lost.db.session import get_db
from lost.logic.project_config import ProjectConfigMan


router = APIRouter(tags=["config"], route_class=ProfilingRoute)


class ConfigEntry(BaseModel):
    key: str
    value: str


@router.get("")
def get_config(
    user: DBUser = Depends(require_role(roles.ADMINISTRATOR)),
    dbm: DBMan = Depends(get_db),
):
    """Get all config entries (admin only)."""
    project_config = ProjectConfigMan(dbm)
    return project_config.get_all()


@router.patch("")
def update_config(
    entries: list[ConfigEntry],
    user: DBUser = Depends(require_role(roles.ADMINISTRATOR)),
    dbm: DBMan = Depends(get_db),
):
    """Update config entries (admin only)."""
    project_config = ProjectConfigMan(dbm)
    for element in entries:
        project_config.update_entry(element.key, value=element.value)
    return "success"
