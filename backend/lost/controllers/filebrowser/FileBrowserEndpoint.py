"""Filebrowser namespace — FastAPI endpoints for file system browsing.

Routes:
    GET    /api/fb/fslist/{visibility}          — list filesystems (designer)
    GET    /api/fb/fstypes                      — list fs types (jwt, admin sees "file")
    POST   /api/fb/ls                           — list directory (designer)
    POST   /api/fb/lsTest                       — test arbitrary fs connection (designer)
    POST   /api/fb/rm                           — remove files (designer)
    POST   /api/fb/delete                       — delete filesystem (designer)
    POST   /api/fb/savefs                       — save/update filesystem (designer)
    POST   /api/fb/fullfs                       — get filesystem details (designer)
    POST   /api/fb/upload                       — upload files (designer)
    POST   /api/fb/mkdirs                       — create directories (designer)
    POST   /api/fb/check-path                   — check if path exists (designer)
    POST   /api/fb/validate-datasource          — validate image folder (designer)
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, File, Form, UploadFile
from pydantic import BaseModel

from lost.controllers.base import ProfilingRoute
from lost.controllers.Dependencies import get_filebrowser_coordination, require_role
from lost.controllers.filebrowser.FileBrowserCoordination import FileBrowserCoordination
from lost.db import roles
from lost.db.model import User as DBUser

router = APIRouter(tags=["fb"], route_class=ProfilingRoute)


# --- Schemas ---


class LsRequest(BaseModel):
    fs: dict
    path: str


class LsTestRequest(BaseModel):
    fs: dict
    path: str


class FullFsRequest(BaseModel):
    id: int


class CheckPathRequest(BaseModel):
    fsId: int
    path: str


class ValidateDatasourceRequest(BaseModel):
    fsId: int
    path: str
    expectedType: str
    validExtensions: list[str] = []
    recursive: bool = True


class MkdirsRequest(BaseModel):
    fsId: int
    path: str
    name: str


class RmRequest(BaseModel):
    fsId: int
    files: list[dict] = []


class DeleteFsRequest(BaseModel):
    fs: dict


class SaveFsRequest(BaseModel):
    id: int | None = None
    visLevel: str
    fsType: str
    connection: str
    rootPath: str
    name: str


# --- Routes ---

# --- Routes ---

@router.get("/fslist/{visibility}")
def get_fs_list(
    visibility: str,
    user: DBUser = Depends(require_role(roles.DESIGNER)),
    coord: FileBrowserCoordination = Depends(get_filebrowser_coordination),
):
    """List filesystems for the given visibility level."""
    return coord.get_fs_list(user, visibility)


@router.get("/fstypes")
def get_fs_types(
    user: DBUser = Depends(require_role(roles.DESIGNER)),
    coord: FileBrowserCoordination = Depends(get_filebrowser_coordination),
):
    """List possible filesystem types. Admin sees 'file' type too."""
    return coord.get_fs_types(user)


@router.post("/ls")
def ls(
    req: LsRequest,
    user: DBUser = Depends(require_role(roles.DESIGNER)),
    coord: FileBrowserCoordination = Depends(get_filebrowser_coordination),
):
    """List directory contents."""
    return coord.ls(user, req)


@router.post("/lsTest")
def ls_test(
    req: LsTestRequest,
    user: DBUser = Depends(require_role(roles.DESIGNER)),
    coord: FileBrowserCoordination = Depends(get_filebrowser_coordination),
):
    """Test an arbitrary filesystem connection."""
    return coord.ls_test(user, req)


@router.post("/rm")
def rm_files(
    req: RmRequest,
    user: DBUser = Depends(require_role(roles.DESIGNER)),
    coord: FileBrowserCoordination = Depends(get_filebrowser_coordination),
):
    """Remove files from a filesystem."""
    return coord.rm_files(user, req)


@router.post("/delete")
def delete_fs(
    req: DeleteFsRequest,
    user: DBUser = Depends(require_role(roles.DESIGNER)),
    coord: FileBrowserCoordination = Depends(get_filebrowser_coordination),
):
    """Delete a filesystem entry."""
    return coord.delete_fs(req)


@router.post("/savefs")
def save_fs(
    req: SaveFsRequest,
    user: DBUser = Depends(require_role(roles.DESIGNER)),
    coord: FileBrowserCoordination = Depends(get_filebrowser_coordination),
):
    """Save or update a filesystem entry."""
    return coord.save_fs(user, req)


@router.post("/fullfs")
def full_fs(
    req: FullFsRequest,
    user: DBUser = Depends(require_role(roles.DESIGNER)),
    coord: FileBrowserCoordination = Depends(get_filebrowser_coordination),
):
    """Get full filesystem details."""
    return coord.full_fs(user, req)


@router.post("/upload")
async def upload(
    fsId: str = Form(...),
    path: str = Form(...),
    files: list[UploadFile] = File(..., alias="file[]"),
    user: DBUser = Depends(require_role(roles.DESIGNER)),
    coord: FileBrowserCoordination = Depends(get_filebrowser_coordination),
):
    """Upload files to a filesystem path."""
    payload = [(f.filename, await f.read()) for f in files]
    return coord.upload(user, fsId, path, payload)


@router.post("/mkdirs")
def mkdirs(
    req: MkdirsRequest,
    user: DBUser = Depends(require_role(roles.DESIGNER)),
    coord: FileBrowserCoordination = Depends(get_filebrowser_coordination),
):
    """Create directories on a filesystem."""
    return coord.mkdirs(user, req)


@router.post("/check-path")
def check_path(
    req: CheckPathRequest,
    user: DBUser = Depends(require_role(roles.DESIGNER)),
    coord: FileBrowserCoordination = Depends(get_filebrowser_coordination),
):
    """Check if a path exists on the filesystem."""
    return coord.check_path(user, req)


@router.post("/validate-datasource")
def validate_datasource(
    req: ValidateDatasourceRequest,
    user: DBUser = Depends(require_role(roles.DESIGNER)),
    coord: FileBrowserCoordination = Depends(get_filebrowser_coordination),
):
    """Validate a datasource (image folder or dataset file)."""
    return coord.validate_datasource(user, req)
