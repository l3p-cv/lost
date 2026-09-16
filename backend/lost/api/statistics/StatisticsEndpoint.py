"""Statistics namespace — FastAPI endpoints for annotation statistics.

Routes:
    GET /api/statistics/personal  — personal annotation stats (annotator)
    GET /api/statistics/designer  — designer annotation stats (designer)
"""

from __future__ import annotations

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from lost.api.auth.dependencies import require_role
from lost.api.base import ProfilingRoute
from lost.db import roles
from lost.db.access import DBMan
from lost.db.model import User as DBUser
from lost.db.session import get_db
from lost.logic.statistics import designer, personal


router = APIRouter(tags=["statistics"], route_class=ProfilingRoute)


# --- Schemas (match Flask restx anno_statistics model exactly) ---


class HistorySchema(BaseModel):
    week: list[float] | None = None
    month: list[float] | None = None


class AnnosSchema(BaseModel):
    today: float | None = None
    allTime: float | None = None
    avg: float | None = None
    history: HistorySchema | None = None


class TypesSchema(BaseModel):
    bbox: int | None = None
    polygon: int | None = None
    line: int | None = None
    point: int | None = None
    image: int | None = None


class PerHourSchema(BaseModel):
    amountPerHour: list[float] | None = None
    avgPerHour: list[float] | None = None
    totalTimePerHour: list[float] | None = None
    labels: list[str] | None = None


class AnnoStatisticsSchema(BaseModel):
    annos: AnnosSchema | None = None
    labels: dict | None = None
    types: TypesSchema | None = None
    annotime: AnnosSchema | None = None
    annotasks: AnnosSchema | None = None
    processedImages: AnnosSchema | None = None
    annosPerHour: PerHourSchema = PerHourSchema()


# --- Routes ---


@router.get("/personal", response_model=AnnoStatisticsSchema)
def get_personal_stats(
    user: DBUser = Depends(require_role(roles.ANNOTATOR)),
    dbm: DBMan = Depends(get_db),
):
    """Get personal annotation statistics."""
    from lost.api.statistics.example_data import example_stats
    personal_stats = personal.PersonalStats(dbm, user.idx)
    example_stats["annos"] = personal_stats.get_annotation_stats()
    example_stats["labels"] = personal_stats.get_annos_per_label()
    example_stats["types"] = personal_stats.get_annos_per_type()
    example_stats["annotime"] = personal_stats.get_anno_times()
    example_stats["annotasks"] = personal_stats.get_annotasks()
    example_stats["processedImages"] = personal_stats.get_processed_images()
    return example_stats


@router.get("/designer", response_model=AnnoStatisticsSchema)
def get_designer_stats(
    user: DBUser = Depends(require_role(roles.DESIGNER)),
    dbm: DBMan = Depends(get_db),
):
    """Get designer annotation statistics."""
    from lost.api.statistics.example_data import example_stats
    designer_stats = designer.DesignerStats(dbm, user.idx)
    example_stats["annos"] = designer_stats.get_annotation_stats()
    example_stats["labels"] = designer_stats.get_annos_per_label()
    example_stats["types"] = designer_stats.get_annos_per_type()
    example_stats["annotime"] = designer_stats.get_anno_times()
    example_stats["annotasks"] = designer_stats.get_annotasks()
    example_stats["processedImages"] = designer_stats.get_processed_images()
    example_stats["annosPerHour"] = designer_stats.get_annos_per_hour()
    return example_stats
