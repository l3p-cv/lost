"""Instructions namespace — FastAPI endpoints for instruction management.

Routes:
    GET    /api/instructions/getInstructions/{visibility}  — list instructions (jwt)
    POST   /api/instructions/addInstruction              — add instruction (designer/admin)
    PUT    /api/instructions/editInstruction             — edit instruction (designer/admin)
    DELETE /api/instructions/deleteInstruction/{id}     — soft-delete instruction (designer/admin)
"""

from __future__ import annotations

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from lost.controllers.Dependencies import get_current_user, require_role, get_instructions_coordination
from lost.controllers.base import ProfilingRoute
from lost.db import model, roles
from lost.db.access import DBMan
from lost.db.model import User as DBUser
from lost.db.session import get_db
from lost.db.vis_level import VisLevel
from lost.controllers.instructions.InstructionCoordination import InstructionCoordination

router = APIRouter(tags=["instructions"], route_class=ProfilingRoute)


# --- Schemas ---


class InstructionSchema(BaseModel):
    id: int | None = None
    option: str | None = None
    description: str | None = None
    instruction: str | None = None
    is_deleted: bool | None = None
    created_at: str | None = None
    updated_at: str | None = None
    parent_instruction_id: int | None = None
    group_id: int | None = None
    group: dict | None = None


class AddInstructionRequest(BaseModel):
    option: str
    instruction: str
    description: str = ""
    visibility: str = "user"


class EditInstructionRequest(BaseModel):
    id: int
    option: str | None = None
    description: str | None = None
    instruction: str | None = None
    is_deleted: bool | None = None


# --- Routes ---


@router.get("/getInstructions/{visibility}")
def get_instructions(
    visibility: str,
    user: DBUser = Depends(get_current_user),
    coord: InstructionCoordination = Depends(get_instructions_coordination),
):
    """Get all instructions for the given visibility level."""
    return coord.get_instructions(user, visibility)


@router.post("/addInstruction", status_code=201)
def add_instruction(
    req: AddInstructionRequest,
    user: DBUser = Depends(get_current_user),
    coord: InstructionCoordination = Depends(get_instructions_coordination),
):
    """Add a new instruction (designer/admin only)."""
    return coord.add_instruction(user, req)


@router.put("/editInstruction")
def edit_instruction(
    req: EditInstructionRequest,
    user: DBUser = Depends(get_current_user),
    coord: InstructionCoordination = Depends(get_instructions_coordination),
):
    """Edit an existing instruction (designer/admin only)."""
    return coord.edit_instruction(user, req)


@router.delete("/deleteInstruction/{instruction_id}")
def delete_instruction(
    instruction_id: int,
    user: DBUser = Depends(get_current_user),
    coord: InstructionCoordination = Depends(get_instructions_coordination),
):
    """Soft-delete an instruction (designer/admin only)."""
    return coord.delete_instruction(user, instruction_id)