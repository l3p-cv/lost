"""Group namespace — FastAPI endpoints for group management.

Pass 2 CCB split: routes, schemas, response construction only.
Flow: GroupEndpoint -> GroupCoordination -> GroupBusiness.
Domain errors are mapped to legacy HTTP bodies by the DomainError handler
in fastapi_app.py.

Routes:
    GET    /api/group              — list all groups (designer)
    POST   /api/group              — create new group (any authenticated user)
    GET    /api/group/{group_id}   — get group by ID (any authenticated user)
    DELETE /api/group/{group_id}   — delete group (designer)
"""
from __future__ import annotations

from fastapi import APIRouter, Depends
from pydantic import BaseModel, ConfigDict

from lost.controllers.base import ProfilingRoute
from lost.controllers.Dependencies import get_current_user, get_group_coordination, require_role
from lost.controllers.group.GroupCoordination import GroupCoordination
from lost.db import roles
from lost.db.model import User as DBUser

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
    coord: GroupCoordination = Depends(get_group_coordination),
):
    """Get a list of all groups (excluding user defaults)."""
    return {"groups": coord.get_groups(user)}


@router.post("")
def create_group(
    req: CreateGroupRequest,
    user: DBUser = Depends(get_current_user),
    coord: GroupCoordination = Depends(get_group_coordination),
):
    """Create a new group. Current user becomes the manager."""
    coord.create_group(user, req.group_name)
    return "success"


@router.get("/{group_id}", response_model=GroupSchema)
def get_group(
    group_id: int,
    user: DBUser = Depends(get_current_user),
    coord: GroupCoordination = Depends(get_group_coordination),
):
    """Get a group by ID. No role check — just JWT required."""
    group = coord.get_group(group_id)
    if group:
        return group
    return GroupSchema()


@router.delete("/{group_id}")
def delete_group(
    group_id: int,
    user: DBUser = Depends(require_role(roles.DESIGNER)),
    coord: GroupCoordination = Depends(get_group_coordination),
):
    """Delete a group by ID (designer only)."""
    coord.delete_group(group_id)
    return "success"
