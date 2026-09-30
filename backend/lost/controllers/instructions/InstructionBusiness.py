"""Instructions business layer — instruction CRUD.

No legacy lost/logic counterpart; logic was inline in the endpoint. Legacy
failure flows return HTTP 200 with ``{"message": ...}`` bodies (not error
codes) — business raises PLAIN domain signals (D2-pure) and the endpoint
builds the byte-exact legacy responses via Responses. Role enforcement for
mutations lives in the ENDPOINT as inline checks because the legacy
contract answers unauthorized calls with 200 message bodies.
"""
from __future__ import annotations

from lost.controllers.Exceptions import DomainError
from lost.db import model
from lost.db.vis_level import VisLevel


class _InstructionMessage(DomainError):
    """Base for legacy 200-status message signals."""


class InvalidVisibilityError(_InstructionMessage):
    """The visiblity level is not one of user/global/all."""


class InstructionRoleRequiredError(_InstructionMessage):
    def __init__(self, action: str) -> None:
        super().__init__(action)
        self.http_body = {"message": f"You are not authorized to {action} instructions. "
                                      "Required role: ADMINISTRATOR or DESIGNER."}


class DefaultGroupNotFoundError(_InstructionMessage):
    """The user has no default group (visiblity=user)."""


class InstructionIdRequiredError(_InstructionMessage):
    """The user has no default group (visibility=user)."""


class InstructionNotFoundError(_InstructionMessage):
    """The instruction does not exist or is soft deleted."""
    def __init__(self, detail: str) -> None:
        super().__init__(detail)


class InstructionOperationError(_InstructionMessage):
    """The DB action failed. Carries the action and the cause."""
    def __init__(self, action: str, exc: Exception) -> None:
        super().__init__(action, str(exc))
        self.action = action
        self.exc = exc


class InstructionBusiness:
    """Instructions business service — instruction CRUD."""

    def __init__(self, dbm) -> None:
        self.dbm = dbm

    def list_instructions(self, user, visibility: str) -> dict:
        """All instructions for a visibility level."""
        default_group = self.dbm.get_group_by_name(user.user_name)
        if visibility == VisLevel.USER:
            instructions = self.dbm.get_all_instructions(group_id=default_group.idx)
        elif visibility == VisLevel.GLOBAL:
            instructions = self.dbm.get_all_instructions(global_only=True)
        elif visibility == VisLevel.ALL:
            instructions = self.dbm.get_all_instructions(group_id=default_group.idx, add_global=True)
        else:
            raise InvalidVisibilityError(visibility)
        return {"instructions": [ins.to_dict() for ins in instructions]}

    def add_instruction(self, user, req) -> dict:
        """Add an instruction (designer/admin)."""
        group_id = None
        if req.visibility == "user":
            for user_group in self.dbm.get_user_groups_by_user_id(user.idx):
                if user_group.group.is_user_default:
                    group_id = user_group.group.idx
            if not group_id:
                raise DefaultGroupNotFoundError("no default group")
        try:
            instruction = model.Instruction(
                option=req.option, description=req.description,
                instruction=req.instruction, is_deleted=False, group_id=group_id,
            )
            self.dbm.session.add(instruction)
            self.dbm.session.commit()
            return {"message": "Instruction added successfully", "instruction": instruction.to_dict()}
        except Exception as e:
            self.dbm.session.rollback()
            raise InstructionOperationError("adding", e) from e

    def edit_instruction(self, req) -> dict:
        """Edit an instruction (designer/admin)."""
        if not req.id:
            raise InstructionIdRequiredError("id required")
        try:
            instruction = self.dbm.session.query(model.Instruction).filter_by(id=req.id).first()
            if not instruction or instruction.is_deleted:
                raise InstructionNotFoundError("Instruction not found or is deleted")
            instruction.option = req.option if req.option is not None else instruction.option
            instruction.description = req.description if req.description is not None else instruction.description
            instruction.instruction = req.instruction if req.instruction is not None else instruction.instruction
            instruction.is_deleted = req.is_deleted if req.is_deleted is not None else instruction.is_deleted
            self.dbm.session.commit()
            return {"message": "Instruction updated successfully", "instruction": instruction.to_dict()}
        except DomainError:
            raise
        except Exception as e:
            self.dbm.session.rollback()
            raise InstructionOperationError("updating", e) from e

    def delete_instruction(self, instruction_id: int) -> dict:
        """Soft-delete an instruction (designer/admin)."""
        try:
            instruction = self.dbm.session.query(model.Instruction).filter_by(id=instruction_id).first()
            if not instruction or instruction.is_deleted:
                raise InstructionNotFoundError("Instruction not found or is already deleted")
            instruction.is_deleted = True
            self.dbm.session.commit()
            return {"message": "Instruction deleted successfully"}
        except DomainError:
            raise
        except Exception as e:
            self.dbm.session.rollback()
            raise InstructionOperationError("deleting", e) from e
