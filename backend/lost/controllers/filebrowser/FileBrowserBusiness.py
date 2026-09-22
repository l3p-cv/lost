"""Filebrowser business layer — filesystem browsing and management.

No legacy lost/logic counterpart was moved: file_access / file_man /
crypt / logic.user are shared utils that stay in logic/ (consumed across
modules). Failure flows with legacy HTTP semantics are self-describing
DomainError subclasses (string bodies for 401/403 checks; 200 {"error": …}
for check-path / validate-datasource exception paths).
"""
from __future__ import annotations

import ast
import json
import os
from datetime import datetime, timezone

from lost.controllers.Exceptions import DomainError
from lost.db import model, roles
from lost.db.vis_level import VisLevel
from lost.logic import file_access
from lost.logic.crypt import decrypt_fs_connection, encrypt_fs_connection
from lost.logic.file_access import UserFileAccess
from lost.logic.file_man import FileMan, chonkyfy
from lost.logic.user import get_user_default_group


class FilesystemTestForbiddenError(DomainError):
    """Testing a local ('file') filesystem requires the administrator role."""

    http_status = 403
    http_body = f"You need to be {roles.ADMINISTRATOR} in order to perform this request."


class LocalFsAdminRequiredError(DomainError):
    """Saving a local ('file') filesystem requires the administrator role."""

    http_status = 401
    http_body = "Access to the local file system can only be performed by administrators."


class UploadNotPermittedError(DomainError):
    """The filesystem does not permit write access."""

    http_status = 403
    http_body = "Not allowed to upload to this filesystem"


class CheckPathError(DomainError):
    """Legacy 200 error-dict for check-path failures."""
    http_status = 200

    def __init__(self, exc: Exception) -> None:
        super().__init__(exc)
        self.http_body = {"error": str(exc)}


class DatasourceValidationError(DomainError):
    """Legacy 200 error-dict for validate-datasource failures."""
    http_status = 200

    def __init__(self, exc: Exception) -> None:
        super().__init__(exc)
        self.http_body = {"error": str(exc)}


class FileBrowserBusiness:
    """Filebrowser business service — filesystem CRUD, browsing, uploads."""

    def __init__(self, dbm) -> None:
        self.dbm = dbm

    # --- listing ---

    def fs_list(self, user, visibility: str) -> list[dict]:
        """Filesystems for a visibility level (unknown visibility → empty list)."""
        group_id = get_user_default_group(self.dbm, user.idx)
        if visibility == VisLevel.USER:
            fs_list = list(self.dbm.get_fs(group_id=group_id))
        elif visibility == VisLevel.GLOBAL:
            fs_list = list(self.dbm.get_public_fs())
        elif visibility == VisLevel.ALL:
            fs_list = list(self.dbm.get_public_fs())
            fs_list += list(self.dbm.get_fs(group_id=group_id))
        else:
            return []
        ret = []
        for fs in fs_list:
            try:
                ufa = UserFileAccess(self.dbm, user, fs)
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

    def fs_types(self, user) -> list[str]:
        """Possible filesystem types; admins also see 'file'."""
        possible_fs_types = ["ssh", "ftp", "sftp", "s3", "s3a", "adl", "abfs", "abfss"]
        if user.has_role(roles.ADMINISTRATOR):
            possible_fs_types.append("file")
        return possible_fs_types

    # --- browsing ---

    def ls(self, user, req) -> list:
        """List directory contents."""
        fs_db = self.dbm.get_fs(fs_id=req.fs["id"])
        ufa = UserFileAccess(self.dbm, user, fs_db)
        fm = FileMan(fs_db=fs_db)
        commonprefix = os.path.commonprefix([req.path, fs_db.root_path])
        if commonprefix != fs_db.root_path:
            path = fs_db.root_path
        else:
            path = req.path
        res = ufa.ls(path, detail=True)
        return chonkyfy(res, path, fm)

    def ls_test(self, user, req) -> list:
        """Test an arbitrary filesystem connection."""
        if req.fs["fsType"] == "file":
            if not user.has_role(roles.ADMINISTRATOR):
                raise FilesystemTestForbiddenError(req.fs["fsType"])
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

    # --- filesystem CRUD ---

    def delete_fs(self, req) -> dict:
        """Delete a filesystem entry (soft-delete fallback)."""
        print(f"Deleting filesystem entry id: {req.fs['row']['original']['id']}")
        fs_db = self.dbm.get_fs(fs_id=req.fs['row']['original']['id'])
        try:
            self.dbm.delete(fs_db)
            self.dbm.commit()
        except Exception:
            fs_db = self.dbm.get_fs(fs_id=req.fs['row']['original']['id'])
            fs_db.deleted = True
            self.dbm.add(fs_db)
            self.dbm.commit()
        return {"deleted": "mu ha ha!"}

    def save_fs(self, user, req) -> str:
        """Save or update a filesystem entry."""
        if req.id:
            fs_db = self.dbm.get_fs(fs_id=req.id)
        else:
            fs_db = None
        if fs_db is None:
            group_id = None
            for user_group in self.dbm.get_user_groups_by_user_id(user.idx):
                if user_group.group.is_user_default:
                    group_id = user_group.group.idx
            if req.visLevel == VisLevel.GLOBAL:
                group_id = None
            if req.fsType == "file":
                if not user.has_role(roles.ADMINISTRATOR):
                    raise LocalFsAdminRequiredError(req.fsType)
            connection_str = json.dumps(ast.literal_eval(req.connection))
            new_fs_db = model.FileSystem(
                group_id=group_id,
                connection=encrypt_fs_connection(connection_str) if req.fsType != "file" else connection_str,
                root_path=req.rootPath,
                fs_type=req.fsType,
                name=req.name,
                timestamp=datetime.now(timezone.utc),
            )
            self.dbm.save_obj(new_fs_db)
        else:
            connection_str = json.dumps(ast.literal_eval(req.connection))
            fs_db.connection = encrypt_fs_connection(connection_str) if req.fsType != "file" else connection_str
            fs_db.root_path = req.rootPath
            fs_db.fs_type = req.fsType
            fs_db.name = req.name
            fs_db.timestamp = datetime.now(timezone.utc)
            self.dbm.save_obj(fs_db)
        return "success"

    def full_fs(self, user, req) -> dict:
        """Full filesystem details (connection only for rw non-owner)."""
        group_id = None
        for user_group in self.dbm.get_user_groups_by_user_id(user.idx):
            if user_group.group.is_user_default:
                group_id = user_group.group.idx
        fs = self.dbm.get_fs(fs_id=req.id)
        ufa = UserFileAccess(self.dbm, user, fs)
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

    # --- file operations ---

    def rm_files(self, user, req) -> str:
        """Remove files from a filesystem."""
        fs_db = self.dbm.get_fs(fs_id=req.fsId)
        ufa = UserFileAccess(self.dbm, user, fs_db)
        for file in req.files:
            if "isDir" in file:
                ufa.rm(file["id"], True)
            else:
                ufa.rm(file["id"], False)
        return "success"

    def upload(self, user, fs_id: str, path: str, files: list[tuple[str, bytes]]) -> str:
        """Upload files to a filesystem path."""
        fs_db = self.dbm.get_fs(fs_id=int(fs_id))
        ufa = UserFileAccess(self.dbm, user, fs_db)
        try:
            for filename, contents in files:
                dst_path = os.path.join(path, filename)
                if not ufa.exists(path):
                    ufa.mkdirs(path, exist_ok=True)
                ufa.write_file(contents, dst_path)
            return "success"
        except file_access.WriteAccessNotPermitted as e:
            raise UploadNotPermittedError(e) from e

    def mkdirs(self, user, req) -> str:
        """Create directories on a filesystem (touch-then-mkdirs fallback)."""
        fs_db = self.dbm.get_fs(fs_id=req.fsId)
        fm = FileMan(fs_db=fs_db)
        ufa = UserFileAccess(self.dbm, user, fs_db)
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

    def check_path(self, user, req) -> dict:
        """Check if a path exists on the filesystem."""
        fs_db = self.dbm.get_fs(fs_id=req.fsId)
        ufa = UserFileAccess(self.dbm, user, fs_db)
        try:
            exists = ufa.exists(req.path)
            return {"exists": exists}
        except Exception as e:
            raise CheckPathError(e) from e

    def validate_datasource(self, user, req) -> dict:
        """Validate a datasource (image folder or dataset file)."""
        path = req.path
        expected_type = req.expectedType
        valid_extensions = [e.lower().lstrip(".") for e in req.validExtensions]
        recursive = req.recursive
        fs_db = self.dbm.get_fs(fs_id=req.fsId)
        ufa = UserFileAccess(self.dbm, user, fs_db)
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
            raise DatasourceValidationError(e) from e
