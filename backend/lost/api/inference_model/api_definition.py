import datetime
from typing import Optional
from lost.api.base import BaseModelWithCamelCase
from pydantic import field_validator
from werkzeug.exceptions import BadRequest
import re

def is_valid_grpc_url(url: str) -> bool:
    # Match standard host:port or scheme://host:port
    pattern = re.compile(
        r'^(?:(dns|unix):\/\/\/?)?'     # optional scheme
        r'(([\w\.-]+)|(\[::1\])|(\[.*\]))?'  # host, IPv4, domain, or IPv6
        r'(?::(\d{1,5}))?'              # optional :port (1–5 digits)
        r'(\/[\w\/\.]+)?$'              # optional path (for unix sockets)
    )
    match = pattern.match(url)
    if not match:
        return False

    # Check port range if present
    port_str = match.group(6)
    if port_str:
        port = int(port_str)
        if not (1 <= port <= 65535):
            return False
    return True


class InferenceModelRequest(BaseModelWithCamelCase):
    name: str
    display_name: str
    server_url: str
    prompts: Optional[bool] = False
    type: int

    @field_validator('server_url', mode='before')
    @classmethod
    def validate_server_url(cls, v):
        if not is_valid_grpc_url(v):
            raise BadRequest(f"Invalid grpc URL format: {v}")
        return v


class InferenceModelResponse(BaseModelWithCamelCase):
    id: int
    name: str
    display_name: str
    server_url: str
    prompts: Optional[bool] = False
    type: int
    last_updated: datetime.datetime

class InferenceModelListResponse(BaseModelWithCamelCase):
    models: list[InferenceModelResponse]
