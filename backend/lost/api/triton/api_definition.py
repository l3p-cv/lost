from typing import Literal, Optional
from pydantic import field_validator
from api.base import BaseModelWithCamelCase
from utils.validators import is_valid_grpc_url


class TritonModelsQuery(BaseModelWithCamelCase):
    server_url: str

    @field_validator('server_url', mode='before')
    @classmethod
    def validate_server_url(cls, v):
        if not is_valid_grpc_url(v):
            raise ValueError(f"Invalid grpc URL format: {v}")
        return v


class TritonModelListResponse(BaseModelWithCamelCase):
    models: list[str]



class PointPrompt(BaseModelWithCamelCase):
    x: int
    y: int
    label: Literal["positive", "negative"]


class BoxPrompt(BaseModelWithCamelCase):
    x: int
    y: int
    w: int
    h: int

class Prompts(BaseModelWithCamelCase):
    points: Optional[list[PointPrompt]] = None
    boxes: Optional[list[BoxPrompt]] = None



class TritonInferenceRequest(BaseModelWithCamelCase):
    image_id: int
    model_id: int
    prompts: Optional[Prompts] = None
