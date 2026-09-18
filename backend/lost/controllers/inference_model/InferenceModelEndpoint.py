"""Inference model namespace — FastAPI endpoints for model management.

Routes:
    GET    /api/models           — list all inference models
    GET    /api/models/{id}      — get model by ID
    POST   /api/models          — create model (201)
    PUT    /api/models/{id}      — update model
    DELETE /api/models/{id}      — delete model (JWT required)
"""

from __future__ import annotations

import datetime

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse, PlainTextResponse
from pydantic import BaseModel, field_validator
from sqlalchemy.exc import IntegrityError

from lost.controllers.Dependencies import get_current_user , get_inference_model_coordination
from lost.controllers.base import ProfilingRoute
from lost.db import model
from lost.db.access import DBMan
from lost.db.model import User as DBUser
from lost.db.session import get_db
from lost.utils.validators import is_valid_grpc_url
from lost.controllers.inference_model.InferenceModelCoordination import InferenceModelCoordination

router = APIRouter(tags=["models"], route_class=ProfilingRoute)


# --- Schemas (match Flask restx inference_model models exactly) ---

_ALLOWED_MODEL_TYPES = {"YOLO", "SAM"}


class ModelRequest(BaseModel):
    name: str
    displayName: str
    serverUrl: str
    taskType: int
    modelType: str
    description: str | None = None

    @field_validator("serverUrl", mode="before")
    @classmethod
    def validate_server_url(cls, v):
        if not is_valid_grpc_url(v):
            raise HTTPException(status_code=400, detail=f"Invalid grpc URL format: {v}")
        return v

    @field_validator("modelType", mode="before")
    @classmethod
    def validate_model_type(cls, v):
        if v not in _ALLOWED_MODEL_TYPES:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid model type: {v}. Allowed types are: {', '.join(sorted(_ALLOWED_MODEL_TYPES))}",
            )
        return v


class ModelSchema(BaseModel):
    id: int
    name: str
    displayName: str
    serverUrl: str
    taskType: int
    modelType: str
    description: str | None = None
    lastUpdated: datetime.datetime


class ModelList(BaseModel):
    models: list[ModelSchema]


# --- Serialization helper (matches Flask restx model output) ---


def _to_schema(m: model.InferenceModel) -> ModelSchema:
    return ModelSchema(
        id=m.idx,
        name=m.name,
        displayName=m.display_name,
        serverUrl=m.server_url,
        taskType=m.task_type,
        modelType=m.model_type,
        description=m.description,
        lastUpdated=m.last_updated,
    )


def _duplicate_response(display_name: str) -> JSONResponse:
    return JSONResponse(
        status_code=400,
        content={"message": f'Model with display name "{display_name}" already exists'},
    )


# --- Routes ---


@router.get("", response_model=ModelList)
def get_models(coord: InferenceModelCoordination = Depends(get_inference_model_coordination)):
    """Get a list of all inference models, newest first."""
    return {"models": coord.get_models()}


@router.post("", status_code=201, response_model=ModelSchema)
def create_model(
    req: ModelRequest,
    coord: InferenceModelCoordination = Depends(get_inference_model_coordination),
):
    """Create a new inference model. Duplicate displayName → 400."""
    return coord.create_model(req)


@router.get("/{idx}", response_model=ModelSchema)
def get_model(
    idx: int,
    coord: InferenceModelCoordination = Depends(get_inference_model_coordination),
):
    """Get an inference model by ID. 404 if not found."""
    return coord.get_model(idx)


@router.put("/{idx}", response_model=ModelSchema)
def update_model(
    idx: int,
    req: ModelRequest,
    coord: InferenceModelCoordination = Depends(get_inference_model_coordination),
):
    """Update an inference model. 404 if not found, duplicate displayName → 400."""
    return coord.update_model(idx, req)


@router.delete("/{idx}", status_code=204)
def delete_model(
    idx: int,
    user: DBUser = Depends(get_current_user),
    coord: InferenceModelCoordination = Depends(get_inference_model_coordination),
):
    """Delete an inference model (JWT required). Missing ID is a no-op → 204."""
    coord.delete_model(idx)
    return PlainTextResponse("", status_code=204)