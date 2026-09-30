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

from lost.controllers.base import ProfilingRoute
from lost.controllers.Dependencies import get_current_user, get_instructions_coordination
from lost.controllers.instructions.InstructionBusiness import (
    DefaultGroupNotFoundError,
    InstructionIdRequiredError,
    InstructionNotFoundError,
    InstructionOperationError,
    InvalidVisibilityError,
)
from lost.controllers.instructions.InstructionCoordination import InstructionCoordination
from lost.controllers.Responses import Responses
from lost.db import roles
from lost.db.model import User as DBUser

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


# --- Helper ---

def _role_denied(user, action: str):
    """Legacy quirk: unauthorized mutations answer 200 with a message, NOT 403."""
    if user.has_role(roles.ADMINISTRATOR) or user.has_role(roles.DESIGNER):
        return None
    return Responses.ok(
        {"message": f"You are not authorized to {action} instructions. Required role: ADMINISTRATOR or DESIGNER."}
    )

# --- Routes ---


@router.get("/getInstructions/{visibility}")
def get_instructions(
    visibility: str,
    user: DBUser = Depends(get_current_user),
    coord: InstructionCoordination = Depends(get_instructions_coordination),
):
    """Get all instructions for the given visibility level."""
    try:
        result = coord.get_instructions(user, visibility)
    except InvalidVisibilityError:
        return Responses.ok({"message": "Invalid visibility level"})
    else:
        return result


@router.post("/addInstruction", status_code=201)
def add_instruction(
    req: AddInstructionRequest,
    user: DBUser = Depends(get_current_user),
    coord: InstructionCoordination = Depends(get_instructions_coordination),
):
    """Add a new instruction (designer/admin only)."""
    denied = _role_denied(user, "add")
    if denied:
        return denied
    try:
        result = coord.add_instruction(user, req)
    except DefaultGroupNotFoundError:
        return Responses.ok({"message": "Default group not found for user."})
    except InstructionOperationError as e:
        return Responses.ok({"message": f"Error {e.action} instruction: {e.exc!s}"})
    else:
        return result


@router.put("/editInstruction")
def edit_instruction(
    req: EditInstructionRequest,
    user: DBUser = Depends(get_current_user),
    coord: InstructionCoordination = Depends(get_instructions_coordination),
):
    """Edit an existing instruction (designer/admin only)."""
    denied = _role_denied(user, "edit")
    if denied:
        return denied
    try:
        result = coord.edit_instruction(req)
    except InstructionIdRequiredError:
        return Responses.ok({"message": "Instruction ID is required"})
    except InstructionNotFoundError as e:
        return Responses.ok({"message": e.args[0]})
    except InstructionOperationError as e:
        return Responses.ok({"message": f"Error {e.action} instruction: {e.exc!s}"})
    else:
        return result


@router.delete("/deleteInstruction/{instruction_id}")
def delete_instruction(
    instruction_id: int,
    user: DBUser = Depends(get_current_user),
    coord: InstructionCoordination = Depends(get_instructions_coordination),
):
    """Soft-delete an instruction (designer/admin only)."""
    denied = _role_denied(user, "delete")
    if denied:
        return denied
    try:
        result = coord.delete_instruction(instruction_id)
    except InstructionNotFoundError as e:
        return Responses.ok({"message": e.args[0]})
    except InstructionOperationError as e:
        return Responses.ok({"message": f"Error {e.action} instruction: {e.exc!s}"})
    else:
        return result
