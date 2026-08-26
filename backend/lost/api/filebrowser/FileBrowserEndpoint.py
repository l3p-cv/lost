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

import ast
import json
import os
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, UploadFile, File, Form
from pydantic import BaseModel

from lost.api.auth.dependencies import require_role
from lost.api.base import ProfilingRoute
from lost.db import model, roles
from lost.db.access import DBMan
from lost.db.session import get_db
from lost.db.vis_level import VisLevel
from lost.db.model import User as DBUser
from lost.logic import file_access
from lost.logic.crypt import decrypt_fs_connection, encrypt_fs_connection
from lost.logic.file_access import UserFileAccess
from lost.logic.file_man import FileMan, chonkyfy
from lost.logic.user import get_user_default_group

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


@router.get("/fslist/{visibility}")
def get_fs_list(
    visibility: str,
    user: DBUser = Depends(require_role(roles.DESIGNER)),
    dbm: DBMan = Depends(get_db),
):
    """List filesystems for the given visibility level."""
    group_id = get_user_default_group(dbm, user.idx)
    if visibility == VisLevel.USER:
        fs_list = list(dbm.get_fs(group_id=group_id))
    elif visibility == VisLevel.GLOBAL:
        fs_list = list(dbm.get_public_fs())
    elif visibility == VisLevel.ALL:
        fs_list = list(dbm.get_public_fs())
        fs_list += list(dbm.get_fs(group_id=group_id))
    else:
        return []
    ret = []
    for fs in fs_list:
        try:
            ufa = UserFileAccess(dbm, user, fs)
            ret.append({
                "id": fs.idx,
                "groupId": fs.group_id,
                "rootPath": fs.root_path,
                "fsType": fs.fs_type,
                "name": fs.name,
                "permission": ufa.get_permission(),
                "timestamp": fs.timestamp.isoformat(),
            })
        except Exception:
            pass
    return ret


@router.get("/fstypes")
def get_fs_types(
    user: DBUser = Depends(require_role(roles.DESIGNER)),
):
    """List possible filesystem types. Admin sees 'file' type too."""
    possible_fs_types = ["ssh", "ftp", "sftp", "s3", "s3a", "adl", "abfs", "abfss"]
    if user.has_role(roles.ADMINISTRATOR):
        possible_fs_types.append("file")
    return possible_fs_types


@router.post("/ls")
def ls(
    req: LsRequest,
    user: DBUser = Depends(require_role(roles.DESIGNER)),
    dbm: DBMan = Depends(get_db),
):
    """List directory contents."""
    fs_db = dbm.get_fs(fs_id=req.fs["id"])
    ufa = UserFileAccess(dbm, user, fs_db)
    fm = FileMan(fs_db=fs_db)
    commonprefix = os.path.commonprefix([req.path, fs_db.root_path])
    if commonprefix != fs_db.root_path:
        path = fs_db.root_path
    else:
        path = req.path
    res = ufa.ls(path, detail=True)
    return chonkyfy(res, path, fm)


@router.post("/lsTest")
def ls_test(
    req: LsTestRequest,
    user: DBUser = Depends(require_role(roles.DESIGNER)),
    dbm: DBMan = Depends(get_db),
):
    """Test an arbitrary filesystem connection."""
    if req.fs["fsType"] == "file":
        if not user.has_role(roles.ADMINISTRATOR):
            return f"You need to be {roles.ADMINISTRATOR} in order to perform this request.", 403
    connection_dict = ast.literal_eval(req.fs["connection"])
    db_fs = model.FileSystem(
        connection=json.dumps(connection_dict),
        root_path=req.fs["rootPath"],
        fs_type=req.fs["fsType"],
    )
    fm = FileMan(fs_db=db_fs, decrypt=False)
    path = req.path
    res = fm.ls(path, detail=True)
    return chonkyfy(res, path, fm)


@router.post("/rm")
def rm_files(
    req: RmRequest,
    user: DBUser = Depends(require_role(roles.DESIGNER)),
    dbm: DBMan = Depends(get_db),
):
    """Remove files from a filesystem."""
    fs_db = dbm.get_fs(fs_id=req.fsId)
    ufa = UserFileAccess(dbm, user, fs_db)
    for file in req.files:
        if "isDir" in file:
            ufa.rm(file["id"], True)
        else:
            ufa.rm(file["id"], False)
    return "success"


@router.post("/delete")
def delete_fs(
    req: DeleteFsRequest,
    user: DBUser = Depends(require_role(roles.DESIGNER)),
    dbm: DBMan = Depends(get_db),
):
    """Delete a filesystem entry."""
    fs_db = dbm.get_fs(fs_id=req.fs["id"])
    try:
        dbm.delete(fs_db)
        dbm.commit()
    except Exception:
        fs_db = dbm.get_fs(fs_id=req.fs["id"])
        fs_db.deleted = True
        dbm.add(fs_db)
        dbm.commit()
    return {"deleted": "mu ha ha!"}


@router.post("/savefs")
def save_fs(
    req: SaveFsRequest,
    user: DBUser = Depends(require_role(roles.DESIGNER)),
    dbm: DBMan = Depends(get_db),
):
    """Save or update a filesystem entry."""
    if req.id:
        fs_db = dbm.get_fs(fs_id=req.id)
    else:
        fs_db = None
    if fs_db is None:
        group_id = None
        for user_group in dbm.get_user_groups_by_user_id(user.idx):
            if user_group.group.is_user_default:
                group_id = user_group.group.idx
        if req.visLevel == VisLevel.GLOBAL:
            group_id = None
        if req.fsType == "file":
            if not user.has_role(roles.ADMINISTRATOR):
                return "Access to the local file system can only be performed by administrators.", 401
        connection_str = json.dumps(ast.literal_eval(req.connection))
        new_fs_db = model.FileSystem(
            group_id=group_id,
            connection=encrypt_fs_connection(connection_str) if req.fsType != "file" else connection_str,
            root_path=req.rootPath,
            fs_type=req.fsType,
            name=req.name,
            timestamp=datetime.now(timezone.utc),
        )
        dbm.save_obj(new_fs_db)
    else:
        connection_str = json.dumps(ast.literal_eval(req.connection))
        fs_db.connection = encrypt_fs_connection(connection_str) if req.fsType != "file" else connection_str
        fs_db.root_path = req.rootPath
        fs_db.fs_type = req.fsType
        fs_db.name = req.name
        fs_db.timestamp = datetime.now(timezone.utc)
        dbm.save_obj(fs_db)
    return "success"


@router.post("/fullfs")
def full_fs(
    req: FullFsRequest,
    user: DBUser = Depends(require_role(roles.DESIGNER)),
    dbm: DBMan = Depends(get_db),
):
    """Get full filesystem details."""
    group_id = None
    for user_group in dbm.get_user_groups_by_user_id(user.idx):
        if user_group.group.is_user_default:
            group_id = user_group.group.idx
    fs = dbm.get_fs(fs_id=req.id)
    ufa = UserFileAccess(dbm, user, fs)
    permission = ufa.get_permission()
    connection = None
    if permission == "rw":
        if user.idx != fs.user_default_id:
            connection = decrypt_fs_connection(fs)
    return {
        "id": fs.idx,
        "groupId": fs.group_id,
        "connection": connection,
        "rootPath": fs.root_path,
        "permission": permission,
        "fsType": fs.fs_type,
        "name": fs.name,
        "timestamp": fs.timestamp.isoformat(),
    }


@router.post("/upload")
async def upload(
    fsId: str = Form(...),
    path: str = Form(...),
    files: list[UploadFile] = File(..., alias="file[]"),
    user: DBUser = Depends(require_role(roles.DESIGNER)),
    dbm: DBMan = Depends(get_db),
):
    """Upload files to a filesystem path."""
    fs_db = dbm.get_fs(fs_id=int(fsId))
    ufa = UserFileAccess(dbm, user, fs_db)
    try:
        for file in files:
            dst_path = os.path.join(path, file.filename)
            if not ufa.exists(path):
                ufa.mkdirs(path, exist_ok=True)
            contents = await file.read()
            ufa.write_file(contents, dst_path)
        return "success"
    except file_access.WriteAccessNotPermitted:
        return "Not allowed to upload to this filesystem", 403


@router.post("/mkdirs")
def mkdirs(
    req: MkdirsRequest,
    user: DBUser = Depends(require_role(roles.DESIGNER)),
    dbm: DBMan = Depends(get_db),
):
    """Create directories on a filesystem."""
    fs_db = dbm.get_fs(fs_id=req.fsId)
    fm = FileMan(fs_db=fs_db)
    ufa = UserFileAccess(dbm, user, fs_db)
    path = req.path
    commonprefix = os.path.commonprefix([req.path, fs_db.root_path])
    if commonprefix != fs_db.root_path:
        path = fs_db.root_path
    name = req.name
    path = os.path.join(path, name)
    try:
        temp_file = os.path.join(path, "empty.txt")
        ufa.touch(temp_file)
    except Exception:
        ufa.mkdirs(path, exist_ok=False)
    return "success"


@router.post("/check-path")
def check_path(
    req: CheckPathRequest,
    user: DBUser = Depends(require_role(roles.DESIGNER)),
    dbm: DBMan = Depends(get_db),
):
    """Check if a path exists on the filesystem."""
    fs_db = dbm.get_fs(fs_id=req.fsId)
    ufa = UserFileAccess(dbm, user, fs_db)
    try:
        exists = ufa.exists(req.path)
        return {"exists": exists}
    except Exception as e:
        return {"error": str(e)}


@router.post("/validate-datasource")
def validate_datasource(
    req: ValidateDatasourceRequest,
    user: DBUser = Depends(require_role(roles.DESIGNER)),
    dbm: DBMan = Depends(get_db),
):
    """Validate a datasource (image folder or dataset file)."""
    fs_id = req.fsId
    path = req.path
    expected_type = req.expectedType
    valid_extensions = [e.lower().lstrip(".") for e in req.validExtensions]
    recursive = req.recursive
    fs_db = dbm.get_fs(fs_id=fs_id)
    ufa = UserFileAccess(dbm, user, fs_db)
    fm = FileMan(fs_db=fs_db)
    commonprefix = os.path.commonprefix([path, fs_db.root_path])
    if commonprefix != fs_db.root_path:
        path = fs_db.root_path
    try:
        if not ufa.exists(path):
            return {"valid": False, "reason": "Path does not exist", "isDir": None}
        if expected_type == "datasetFile":
            ext = os.path.splitext(path)[1].lower().lstrip(".")
            is_dir = fm.fs.isdir(path)
            if is_dir:
                return {"valid": False, "reason": "Expected a .csv or .parquet file, but a folder was selected", "isDir": True}
            if ext in valid_extensions:
                return {"valid": True, "reason": f"Valid dataset file (.{ext})", "isDir": False}
            return {"valid": False, "reason": f"Expected a .csv or .parquet file, got .{ext}", "isDir": False}
        if expected_type == "imageFolder":
            is_dir = fm.fs.isdir(path)
            if not is_dir:
                return {"valid": False, "reason": "Expected a folder, but a file was selected", "isDir": False}
            match_count = 0
            cap = 1000
            try:
                top_listing = fm.fs.ls(path, detail=True)
                for entry in top_listing:
                    entry_type = entry.get("type", "")
                    entry_name = entry.get("name", "")
                    if entry_type == "file" or (entry_type == "" and not fm.fs.isdir(entry_name)):
                        ext = os.path.splitext(entry_name)[1].lower().lstrip(".")
                        if ext in valid_extensions:
                            match_count += 1
                            if match_count >= cap:
                                break
            except Exception:
                pass
            if match_count > 0:
                return {"valid": True, "reason": "Folder contains valid images", "isDir": True}
            if recursive:
                try:
                    for file_path in fm.fs.find(path):
                        ext = os.path.splitext(file_path)[1].lower().lstrip(".")
                        if ext in valid_extensions:
                            match_count += 1
                            if match_count >= cap:
                                break
                except Exception:
                    pass
            if match_count > 0:
                return {"valid": True, "reason": "Folder contains valid images", "isDir": True}
            return {"valid": False, "reason": "No valid images found in this folder", "isDir": True}
        return {"valid": False, "reason": f"Unknown expectedType: {expected_type}", "isDir": None}
    except Exception as e:
        return {"error": str(e)}