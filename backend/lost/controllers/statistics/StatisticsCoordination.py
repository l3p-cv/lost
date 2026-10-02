"""Statistics coordination layer — thin routing of endpoint calls to business.

Flow
----
StatisticsEndpoint  ->  StatisticsCoordination  ->  StatisticsBusiness
"""
from __future__ import annotations

from lost.controllers.statistics.StatisticsBusiness import StatisticsBusiness


class StatisticsCoordination:
    """Coordination service for the statistics namespace — thin delegation."""

    def __init__(self, business: StatisticsBusiness) -> None:
        self._business = business

    def get_personal_stats(self, user) -> dict:
        """Personal stats. Delegates to StatisticsBusiness.personal_stats."""
        return self._business.personal_stats(user.idx)

    def get_designer_stats(self, user) -> dict:
        """Designer stats. Delegates to StatisticsBusiness.designer_stats."""
        return self._business.designer_stats(user.idx)
