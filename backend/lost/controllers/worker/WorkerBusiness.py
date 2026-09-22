"""Worker business layer — worker registry info.

No legacy lost/logic counterpart; the single route reads the worker
registry. No domain errors.
"""
from __future__ import annotations


class WorkerBusiness:
    """Worker business service — worker registry queries."""

    def __init__(self, dbm) -> None:
        self.dbm = dbm

    def list_workers(self):
        """All registered workers."""
        return self.dbm.get_worker()
