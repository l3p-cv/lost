"""Statistics business layer — personal/designer annotation statistics.

PersonalStats / DesignerStats were moved (git mv) from
``lost/logic/statistics/`` into this module as sibling domain files —
no other importers existed. The legacy ``example_data.py`` skeleton was
deleted outright: every key it carried was overwritten by both routes (the
personal route's all-null ``annosPerHour`` comes from the response_model
default), and its module-level mutation leaked values across requests.
"""
from __future__ import annotations

from lost.controllers.statistics.DesignerStats import DesignerStats
from lost.controllers.statistics.PersonalStats import PersonalStats


class StatisticsBusiness:
    """Statistics business service — assembles personal/designer stats."""

    def __init__(self, dbm) -> None:
        self.dbm = dbm

    def personal_stats(self, user_id) -> dict:
        """Personal annotation stats for one annotator."""
        stats = PersonalStats(self.dbm, user_id)
        return {
            "annos": stats.get_annotation_stats(),
            "labels": stats.get_annos_per_label(),
            "types": stats.get_annos_per_type(),
            "annotime": stats.get_anno_times(),
            "annotasks": stats.get_annotasks(),
            "processedImages": stats.get_processed_images(),
        }

    def designer_stats(self, user_id) -> dict:
        """Designer annotation stats for one designer's pipelines."""
        stats = DesignerStats(self.dbm, user_id)
        return {
            "annos": stats.get_annotation_stats(),
            "labels": stats.get_annos_per_label(),
            "types": stats.get_annos_per_type(),
            "annotime": stats.get_anno_times(),
            "annotasks": stats.get_annotasks(),
            "processedImages": stats.get_processed_images(),
            "annosPerHour": stats.get_annos_per_hour(),
        }