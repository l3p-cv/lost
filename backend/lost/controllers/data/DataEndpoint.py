"""Data namespace — FastAPI endpoints for data access.

Pass 2 CCB split: routes, schemas, response construction only.
Flow: DataEndpoint -> DataCoordination -> DataBusiness.

Routes:
    GET /api/data/export/{deid}    — get data export as blob (designer)
    GET /api/data/image/{image_id} — get image as base64 string (annotator)
    GET /api/data/storeKeys        — get datastore keys (jwt)
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from fastapi.responses import PlainTextResponse, Response

from lost.controllers.Dependencies import get_current_user, get_data_coordination, require_role
from lost.controllers.base import ProfilingRoute
from lost.controllers.data.DataCoordination import DataCoordination
from lost.db import roles
from lost.db.model import User as DBUser

router = APIRouter(tags=["data"], route_class=ProfilingRoute)


@router.get("/export/{deid}")
def get_data_export(
    deid: int,
    user: DBUser = Depends(require_role(roles.DESIGNER)),
    coord: DataCoordination = Depends(get_data_coordination),
):
    """Get the data export for the given export id as a blob."""
    return Response(
        content=coord.get_data_export(deid),
        media_type="blob",
        headers={"Content-Disposition": "attachment; filename=annos.parquet"},
    )


@router.get("/image/{image_id}")
def get_image(
    image_id: int,
    type: str = Query(..., description='Type of the mia image: "imageBased" or "annoBased"'),
    context: float = Query(0.0, description="Context Size"),
    drawAnno: bool = Query(False, description="Whether anno should be drawn"),
    user: DBUser = Depends(require_role(roles.ANNOTATOR)),
    coord: DataCoordination = Depends(get_data_coordination),
):
    """Get the image with the given ID as a base64 encoded BLOB."""
    return PlainTextResponse(coord.get_image(user, image_id, type, context, drawAnno))


@router.get("/storeKeys")
def get_store_keys(
    user: DBUser = Depends(get_current_user),
    coord: DataCoordination = Depends(get_data_coordination),
):
    """Get the Datastores with their names."""
    return coord.get_store_keys()