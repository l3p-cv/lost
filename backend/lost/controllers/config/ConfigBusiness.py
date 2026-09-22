"""Config business layer — project config management.

Wraps the shared ``ProjectConfigMan`` utility (lost/logic/project_config.py),
which stays in logic/ — it is used beyond the HTTP surface.
"""
from __future__ import annotations

from lost.logic.project_config import ProjectConfigMan


class ConfigBusiness:
    """Config business service — get/update project config via the shared util."""

    def __init__(self, dbm) -> None:
        self.dbm = dbm

    def get_all(self):
        """All config entries."""
        return ProjectConfigMan(self.dbm).get_all()

    def update_entries(self, entries) -> None:
        """Update config entries (key/value pairs)."""
        manager = ProjectConfigMan(self.dbm)
        for element in entries:
            manager.update_entry(element.key, value=element.value)
