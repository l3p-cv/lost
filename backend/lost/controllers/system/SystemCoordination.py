"""System coordination layer — thin routing of endpoint calls to business.

Flow
----
SystemEndpoint  ->  SystemCoordination  ->  SystemBusiness
"""
from __future__ import annotations

from lost.controllers.system.SystemBusiness import SystemBusiness


class SystemCoordination:
    """Coordination service for the system namespace — thin delegation."""

    def __init__(self, business: SystemBusiness) -> None:
        self._business = business

    def get_version(self) -> str:
        """LOST version. Delegates to SystemBusiness.get_version."""
        return self._business.get_version()

    def get_settings(self) -> dict:
        """System settings. Delegates to SystemBusiness.get_settings."""
        return self._business.get_settings()

    def get_jupyter_url(self) -> str:
        """Jupyter Lab URL. Delegates to SystemBusiness.get_jupyter_url."""
        return self._business.get_jupyter_url()
