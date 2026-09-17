"""Config coordination layer — thin routing of endpoint calls to business.

Flow
----
ConfigEndpoint  ->  ConfigCoordination  ->  ConfigBusiness
"""
from __future__ import annotations

from lost.controllers.config.ConfigBusiness import ConfigBusiness


class ConfigCoordination:
    """Coordination service for the config namespace — thin delegation."""

    def __init__(self, business: ConfigBusiness) -> None:
        self._business = business

    def get_config(self):
        """All config entries. Delegates to ConfigBusiness.get_all."""
        return self._business.get_all()

    def update_config(self, entries) -> None:
        """Update config entries. Delegates to ConfigBusiness.update_entries."""
        self._business.update_entries(entries)