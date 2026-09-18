"""MIA coordination layer — thin routing of endpoint calls to business.

Flow
----
MiaEndpoint  ->  MiaCoordination  ->  MiaBusiness
"""
from __future__ import annotations

from lost.controllers.mia.MiaBusiness import MiaBusiness


class MiaCoordination:
    """Coordination service for the mia namespace — thin delegation."""

    def __init__(self, business: MiaBusiness) -> None:
        self._business = business

    def update_mia(self, user, data):
        """Update MIA task. Delegates to MiaBusiness.update."""
        return self._business.update(user.idx, data)

    def get_next_mia(self, user, max_amount: int):
        """Next MIA annotations. Delegates to MiaBusiness.get_next."""
        return self._business.get_next(user.idx, max_amount)

    def get_mia_labels(self, user):
        """MIA label trees. Delegates to MiaBusiness.get_label_trees."""
        return self._business.get_label_trees(user.idx)

    def finish_mia_task(self, user):
        """Finish MIA task. Delegates to MiaBusiness.finish."""
        return self._business.finish(user.idx)

    def get_special_mia(self, user, mia_ids: list[int]):
        """Special MIA images. Delegates to MiaBusiness.get_special."""
        return self._business.get_special(user.idx, mia_ids)

    def get_prev_mia(self, user, chunk_id: int, update_ids: list[int]):
        """Previous MIA annotations. Delegates to MiaBusiness.get_prev."""
        return self._business.get_prev(user.idx, chunk_id, update_ids)

    def get_first_mia(self, user):
        """First MIA annotation. Delegates to MiaBusiness.get_first."""
        return self._business.get_first(user.idx)

    def get_latest_mia(self, user):
        """Latest MIA annotation. Delegates to MiaBusiness.get_latest."""
        return self._business.get_latest(user.idx)