"""Instructions business layer — instruction CRUD.

No legacy lost/logic counterpart; logic was inline in the endpoint. Legacy
failure flows return HTTP 200 with ``{"message": ...}`` bodies (not error
codes) — modeled as self-describing ``DomainError`` subclasses with
``http_status=200`` so the global handler reproduces them byte-exactly while
endpoints stay declarative. Role enforcement stays here (NOT require_role)
because the legacy contract answers unauthorized calls with 200 messages.
"""
from __future__ import annotations

from lost.controllers.Exceptions import DomainError
from lost.db import model, roles
from lost.db.vis_level import VisLevel


class _InstructionMessage(DomainError):
    """Base for legacy 200-status message bodies."""
    http_status = 200


class InvalidVisibilityError(_InstructionMessage):
    http_body = {"message": "Invalid visibility level"}


class InstructionRoleRequiredError(_InstructionMessage):
    def __init__(self, action: str) -> None:
        super().__init__(action)
        self.http_body = {"message": f"You are not authorized to {action} instructions. "
                                      "Required role: ADMINISTRATOR or DESIGNER."}


class DefaultGroupNotFoundError(_InstructionMessage):
    http_body = {"message": "Default group not found for user."}


class InstructionIdRequiredError(_InstructionMessage):
    http_body = {"message": "Instruction ID is required"}


class InstructionNotFoundError(_InstructionMessage):
    def __init__(self, detail: str) -> None:
        super().__init__(detail)
        self.http_body = {"message": detail}


class InstructionOperationError(_InstructionMessage):
    def __init__(self, action: str, exc: Exception) -> None:
        super().__init__(action)
        self.http_body = {"message": f"Error {action} instruction: {exc!s}"}


class InstructionBusiness:
    """Instructions business service — instruction CRUD."""

    def __init__(self, dbm) -> None:
        self.dbm = dbm

    @staticmethod
    def _ensure_designer_or_admin(user, action: str) -> None:
        if not (user.has_role(roles.ADMINISTRATOR) or user.has_role(roles.DESIGNER)):
            raise InstructionRoleRequiredError(action)

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
        self._ensure_designer_or_admin(user, "add")
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

    def edit_instruction(self, user, req) -> dict:
        """Edit an instruction (designer/admin)."""
        self._ensure_designer_or_admin(user, "edit")
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

    def delete_instruction(self, user, instruction_id: int) -> dict:
        """Soft-delete an instruction (designer/admin)."""
        self._ensure_designer_or_admin(user, "delete")
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
