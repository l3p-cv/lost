"""Instructionmedia namespace — FastAPI endpoints for serving static instruction images.

Routes:
    GET  /api/media/media-file         — serve static instruction image (no auth, path validation)
    POST /api/media/get-image-markdown — get markdown for an instruction image (designer)
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, Query, Request
from fastapi.responses import FileResponse
from pydantic import BaseModel

from lost.controllers.base import ProfilingRoute
from lost.controllers.Dependencies import get_instructionmedia_coordination, require_role
from lost.controllers.instructionmedia.InstructionMediaBusiness import (
    InvalidMediaPathError,
    MediaFileNotFoundError,
    MediaForbiddenError,
    MissingEncodedPathError,
)
from lost.controllers.instructionmedia.InstructionMediaCoordination import InstructionMediaCoordination
from lost.controllers.Responses import Responses
from lost.db import roles
from lost.db.model import User as DBUser

router = APIRouter(tags=["instructionmedia"], route_class=ProfilingRoute)


# --- Schemas ---


class GetImageMarkdownRequest(BaseModel):
    encodedPath: str


# --- Routes ---


@router.get("/media-file")
def serve_instruction_image(
    path: str = Query("", description="Path to the instruction media file"),
    coord: InstructionMediaCoordination = Depends(get_instructionmedia_coordination),
):
    """Serve a static instruction image file. No auth — path validation only."""
    try:
        result = coord.media_file_path(path)
    except InvalidMediaPathError:
        return Responses.forbidden({"message": "Forbidden: Invalid path"})
    except MediaFileNotFoundError:
        return Responses.not_found({"message": "File not found"})
    else:
        return FileResponse(result)


@router.post("/get-image-markdown")
def get_image_markdown(
    request: Request,
    req: GetImageMarkdownRequest,
    user: DBUser = Depends(require_role(roles.DESIGNER)),
    coord: InstructionMediaCoordination = Depends(get_instructionmedia_coordination),
):
    """Get markdown for an instruction image."""
    base_url = str(request.base_url).rstrip("/")
    try:
        result = coord.image_markdown(user, req.encodedPath, base_url)
    except MissingEncodedPathError:
        return Responses.bad_request({"message": 'Missing "encodedPath"'})
    except MediaForbiddenError:
        return Responses.forbidden({"message": "Forbidden"})
    except MediaFileNotFoundError:
        return Responses.not_found({"message": "File not found"})
    else:
        return result
