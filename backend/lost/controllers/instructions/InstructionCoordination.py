"""Instruction coordination layer — thin routing of endpoint calls to business.

Flow
----
InstructionEndpoint  ->  InstructionCoordination  ->  InstructionBusiness
"""
from __future__ import annotations

from lost.controllers.instructions.InstructionBusiness import InstructionBusiness


class InstructionCoordination:
    """Coordination service for the instructions namespace — thin delegation."""

    def __init__(self, business: InstructionBusiness) -> None:
        self._business = business

    def get_instructions(self, user, visibility: str) -> dict:
        """List instructions. Delegates to InstructionBusiness.list_instructions."""
        return self._business.list_instructions(user, visibility)

    def add_instruction(self, user, req) -> dict:
        """Add instruction. Delegates to InstructionBusiness.add_instruction."""
        return self._business.add_instruction(user, req)

    def edit_instruction(self, user, req) -> dict:
        """Edit instruction. Delegates to InstructionBusiness.edit_instruction."""
        return self._business.edit_instruction(user, req)

    def delete_instruction(self, user, instruction_id: int) -> dict:
        """Soft-delete instruction. Delegates to InstructionBusiness.delete_instruction."""
        return self._business.delete_instruction(user, instruction_id)