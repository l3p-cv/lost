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

from lost.api.auth.dependencies import require_role
from lost.api.base import ProfilingRoute
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


def _valid_public_instruction_media_path(mp: str, dbm: DBMan) -> bool:
    """Check if the media path is within a valid user filesystem instruction media path."""
    fs_list = dbm.get_all_user_default_fs()
    for fs in fs_list:
        check_path = os.path.join(fs.root_path, INSTRUCTION_MEDIA_PATH)
        if check_path in mp:
            return True
    return False


@router.get("/media-file")
def serve_instruction_image(
    path: str = Query("", description="Path to the instruction media file"),
    dbm: DBMan = Depends(get_db),
):
    """Serve a static instruction image file. No auth — path validation only."""
    path = path.lstrip("/")
    path = os.path.join("/", path)
    if _valid_public_instruction_media_path(path, dbm):
        if not os.path.isfile(path):
            return JSONResponse(status_code=404, content={"message": "File not found"})
        return FileResponse(path)
    return JSONResponse(status_code=403, content={"message": "Forbidden: Invalid path"})


@router.post("/get-image-markdown")
def get_image_markdown(
    request: Request,
    req: GetImageMarkdownRequest,
    user: DBUser = Depends(require_role(roles.DESIGNER)),
    dbm: DBMan = Depends(get_db),
):
    """Get markdown for an instruction image. Returns a markdown string with the image URL."""
    encoded_path = urllib.parse.unquote(req.encodedPath.lstrip("/"))
    if not encoded_path:
        return JSONResponse(status_code=400, content={"message": 'Missing "encodedPath"'})
    fs_db = dbm.get_user_default_fs(user.idx)
    ufa = UserFileAccess(dbm, user, fs_db)
    if not ufa.valid_instruction_media_save_path(encoded_path):
        return JSONResponse(status_code=403, content={"message": "Forbidden"})
    if not ufa.fs.isfile(encoded_path):
        return JSONResponse(status_code=404, content={"message": "File not found"})
    # Build markdown with the base URL — FastAPI doesn't have request.host_url
    # Use the path as-is (Traefik handles the host)
    base_url = str(request.base_url).rstrip("/")
    markdown = f"![Image]({base_url}/api/media/media-file?path={req.encodedPath})"
    return {"markdown": markdown}