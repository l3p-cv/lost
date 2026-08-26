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

from lost.api.auth.dependencies import get_current_user, require_role
from lost.api.base import ProfilingRoute
from lost.db import model, roles
from lost.db.access import DBMan
from lost.db.model import User as DBUser
from lost.db.session import get_db
from lost.db.vis_level import VisLevel

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
    dbm: DBMan = Depends(get_db),
):
    """Get all instructions for the given visibility level."""
    default_group = dbm.get_group_by_name(user.user_name)
    if visibility == VisLevel.USER:
        instructions = dbm.get_all_instructions(group_id=default_group.idx)
    elif visibility == VisLevel.GLOBAL:
        instructions = dbm.get_all_instructions(global_only=True)
    elif visibility == VisLevel.ALL:
        instructions = dbm.get_all_instructions(group_id=default_group.idx, add_global=True)
    else:
        return {"message": "Invalid visibility level"}
    return {"instructions": [ins.to_dict() for ins in instructions]}


@router.post("/addInstruction", status_code=201)
def add_instruction(
    req: AddInstructionRequest,
    user: DBUser = Depends(get_current_user),
    dbm: DBMan = Depends(get_db),
):
    """Add a new instruction (designer/admin only)."""
    if not (user.has_role(roles.ADMINISTRATOR) or user.has_role(roles.DESIGNER)):
        return {"message": "You are not authorized to add instructions. Required role: ADMINISTRATOR or DESIGNER."}
    visibility = req.visibility
    group_id = None
    if visibility == "user":
        for user_group in dbm.get_user_groups_by_user_id(user.idx):
            if user_group.group.is_user_default:
                group_id = user_group.group.idx
        if not group_id:
            return {"message": "Default group not found for user."}
    try:
        instruction = model.Instruction(
            option=req.option,
            description=req.description,
            instruction=req.instruction,
            is_deleted=False,
            group_id=group_id,
        )
        dbm.session.add(instruction)
        dbm.session.commit()
        return {"message": "Instruction added successfully", "instruction": instruction.to_dict()}
    except Exception as e:
        dbm.session.rollback()
        return {"message": f"Error adding instruction: {e!s}"}


@router.put("/editInstruction")
def edit_instruction(
    req: EditInstructionRequest,
    user: DBUser = Depends(get_current_user),
    dbm: DBMan = Depends(get_db),
):
    """Edit an existing instruction (designer/admin only)."""
    if not (user.has_role(roles.ADMINISTRATOR) or user.has_role(roles.DESIGNER)):
        return {"message": "You are not authorized to edit instructions. Required role: ADMINISTRATOR or DESIGNER."}
    instruction_id = req.id
    if not instruction_id:
        return {"message": "Instruction ID is required"}
    try:
        instruction = dbm.session.query(model.Instruction).filter_by(id=instruction_id).first()
        if not instruction or instruction.is_deleted:
            return {"message": "Instruction not found or is deleted"}
        instruction.option = req.option if req.option is not None else instruction.option
        instruction.description = req.description if req.description is not None else instruction.description
        instruction.instruction = req.instruction if req.instruction is not None else instruction.instruction
        instruction.is_deleted = req.is_deleted if req.is_deleted is not None else instruction.is_deleted
        dbm.session.commit()
        return {"message": "Instruction updated successfully", "instruction": instruction.to_dict()}
    except Exception as e:
        dbm.session.rollback()
        return {"message": f"Error updating instruction: {e!s}"}


@router.delete("/deleteInstruction/{instruction_id}")
def delete_instruction(
    instruction_id: int,
    user: DBUser = Depends(get_current_user),
    dbm: DBMan = Depends(get_db),
):
    """Soft-delete an instruction (designer/admin only)."""
    if not (user.has_role(roles.ADMINISTRATOR) or user.has_role(roles.DESIGNER)):
        return {"message": "You are not authorized to delete instructions. Required role: ADMINISTRATOR or DESIGNER."}
    try:
        instruction = dbm.session.query(model.Instruction).filter_by(id=instruction_id).first()
        if not instruction or instruction.is_deleted:
            return {"message": "Instruction not found or is already deleted"}
        instruction.is_deleted = True
        dbm.session.commit()
        return {"message": "Instruction deleted successfully"}
    except Exception as e:
        dbm.session.rollback()
        return {"message": f"Error deleting instruction: {e!s}"}
