"""Statistics namespace — FastAPI endpoints for annotation statistics.

Pass 2 CCB split: routes, schemas, response construction only.
Flow: StatisticsEndpoint -> StatisticsCoordination -> StatisticsBusiness
(PersonalStats / DesignerStats moved here from lost/logic/statistics/).

Routes:
    GET /api/statistics/personal — personal annotation stats (annotator)
    GET /api/statistics/designer  — designer annotation stats (designer)
"""
from __future__ import annotations

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from lost.controllers.base import ProfilingRoute
from lost.controllers.Dependencies import get_statistics_coordination, require_role
from lost.controllers.statistics.StatisticsCoordination import StatisticsCoordination
from lost.db import roles
from lost.db.model import User as DBUser

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
    coord: StatisticsCoordination = Depends(get_statistics_coordination),
):
    """Get personal annotation statistics."""
    return coord.get_personal_stats(user)


@router.get("/designer", response_model=AnnoStatisticsSchema)
def get_designer_stats(
    user: DBUser = Depends(require_role(roles.DESIGNER)),
    coord: StatisticsCoordination = Depends(get_statistics_coordination),
):
    """Get designer annotation statistics."""
    return coord.get_designer_stats(user)
