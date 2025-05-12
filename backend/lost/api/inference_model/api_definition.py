import datetime
from typing import Optional
from lost.api.base import BaseModelWithCamelCase
from pydantic import field_validator
from werkzeug.exceptions import BadRequest

from utils.validators import is_valid_grpc_url


class InferenceModelRequest(BaseModelWithCamelCase):
    name: str
    display_name: str
    server_url: str
    task_type: int  # renamed from 'type'
    model_type: str  # newly added
    description: Optional[str] = None  # newly added

    @field_validator('server_url', mode='before')
    @classmethod
    def validate_server_url(cls, v):
        if not is_valid_grpc_url(v):
            raise BadRequest(f"Invalid grpc URL format: {v}")
        return v

    @field_validator('model_type', mode='before')
    @classmethod
    def validate_model_type(cls, v):
        allowed_types = {'YOLO', 'SAM'}
        if v not in allowed_types:
            raise BadRequest(f"Invalid model type: {v}. Allowed types are: {', '.join(allowed_types)}")
        return v



class InferenceModelResponse(BaseModelWithCamelCase):
    id: int
    name: str
    display_name: str
    server_url: str
    task_type: int  # renamed from 'type'
    model_type: str  # newly added
    description: Optional[str] = None  # newly added
    last_updated: datetime.datetime


class InferenceModelListResponse(BaseModelWithCamelCase):
    models: list[InferenceModelResponse]
