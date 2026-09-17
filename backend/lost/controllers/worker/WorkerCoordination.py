"""Worker coordination layer — thin routing of endpoint calls to business.

Flow
----
WorkerEndpoint  ->  WorkerCoordination  ->  WorkerBusiness
"""
from __future__ import annotations

from lost.controllers.worker.WorkerBusiness import WorkerBusiness


class WorkerCoordination:
    """Coordination service for the worker namespace — thin delegation."""

    def __init__(self, business: WorkerBusiness) -> None:
        self._business = business

    def get_workers(self):
        """List workers. Delegates to WorkerBusiness.list_workers."""
        return self._business.list_workers()