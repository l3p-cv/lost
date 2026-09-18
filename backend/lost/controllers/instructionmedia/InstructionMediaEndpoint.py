"""Instructionmedia namespace — FastAPI endpoints for serving static instruction images.

Routes:
    GET  /api/media/media-file         — serve static instruction image (no auth, path validation)
    POST /api/media/get-image-markdown — get markdown for an instruction image (designer)
"""

from __future__ import annotations

import os
import urllib.parse

from fastapi import APIRouter, Depends, Query, Request
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel

from lost.controllers.Dependencies import require_role , get_instructionmedia_coordination
from lost.controllers.instructionmedia.InstructionMediaCoordination import InstructionMediaCoordination
from lost.controllers.base import ProfilingRoute
from lost.db import roles
from lost.db.access import DBMan
from lost.db.model import User as DBUser
from lost.db.session import get_db
from lost.logic.file_access import UserFileAccess
from lost.logic.file_man import INSTRUCTION_MEDIA_PATH
from lost.settings import LOST_CONFIG


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
    return FileResponse(coord.media_file_path(path))


@router.post("/get-image-markdown")
def get_image_markdown(
    request: Request,
    req: GetImageMarkdownRequest,
    user: DBUser = Depends(require_role(roles.DESIGNER)),
    coord: InstructionMediaCoordination = Depends(get_instructionmedia_coordination),
):
    """Get markdown for an instruction image."""
    base_url = str(request.base_url).rstrip("/")
    return coord.image_markdown(user, req.encodedPath, base_url)