"""Instructionmedia coordination layer — thin routing of endpoint calls to business.

Flow
----
InstructionMediaEndpoint  ->  InstructionMediaCoordination  ->  InstructionMediaBusiness
"""
from __future__ import annotations

from lost.controllers.instructionmedia.InstructionMediaBusiness import InstructionMediaBusiness


class InstructionMediaCoordination:
    """Coordination service for the instructionmedia namespace — thin delegation."""

    def __init__(self, business: InstructionMediaBusiness) -> None:
        self._business = business

    def media_file_path(self, raw_path: str) -> str:
        """Validated media path. Delegates to InstructionMediaBusiness.media_file_path."""
        return self._business.media_file_path(raw_path)

    def image_markdown(self, user, encoded_path: str, base_url: str) -> dict:
        """Image markdown. Delegates to InstructionMediaBusiness.image_markdown."""
        return self._business.image_markdown(user, encoded_path, base_url)
