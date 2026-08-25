"""Group namespace — FastAPI endpoints for group management.

Routes:
    GET    /api/group              — list all groups (designer)
    POST   /api/group              — create new group (jwt)
    GET    /api/group/{group_id}   — get group by ID (jwt)
    DELETE /api/group/{group_id}   — delete group (designer)
"""

from __future__ import annotations

from fastapi import APIRouter, Depends
from pydantic import BaseModel, ConfigDict
from fastapi.responses import JSONResponse

from lost.api.auth.dependencies import get_current_user, require_role
from lost.api.base import ProfilingRoute
from lost.db import model, roles
from lost.db.access import DBMan
from lost.db.model import User as DBUser
from lost.db.session import get_db

router = APIRouter(tags=["group"], route_class=ProfilingRoute)

# --- Schemas ---


class GroupSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    idx: int | None = None
    name: str | None = None


class GroupList(BaseModel):
    groups: list[GroupSchema] = []



class CreateGroupRequest(BaseModel):
    group_name: str


# --- Routes ---


@router.get("", response_model=GroupList)
def get_groups(
    user: DBUser = Depends(require_role(roles.DESIGNER)),
    dbm: DBMan = Depends(get_db),
):
    """Get a list of all groups (excluding user defaults)."""
    return {"groups": dbm.get_user_groups(user_defaults=False)}


@router.post("")
def create_group(
    req: CreateGroupRequest,
    user: DBUser = Depends(get_current_user),
    dbm: DBMan = Depends(get_db),
):
    """Create a new group. Current user becomes the manager."""
    group_name = req.group_name
    if not group_name:
        return "A group name is required.", 400
    if dbm.get_group_by_name(group_name):
        return f"Group with name '{group_name}' already exists.", 409
    group = model.Group(name=group_name, manager_id=user.idx)
    dbm.save_obj(group)
    dbm.commit()
    return "success"


@router.get("/{group_id}", response_model=GroupSchema)
def get_group(
    group_id: int,
    user: DBUser = Depends(get_current_user),
    dbm: DBMan = Depends(get_db),
):
    """Get a group by ID. No role check — just JWT required."""
    group = dbm.get_group_by_id(group_id)
    if group:
        return group
    return GroupSchema()


@router.delete("/{group_id}")
def delete_group(
    group_id: int,
    user: DBUser = Depends(require_role(roles.DESIGNER)),
    dbm: DBMan = Depends(get_db),
):
    """Delete a group by ID (designer only)."""
    group = dbm.get_group_by_id(group_id)
    if group:
        dbm.delete(group)
        dbm.commit()
        return "success"
    return JSONResponse(status_code=400, content=f"Group with ID '{group_id}' not found.")