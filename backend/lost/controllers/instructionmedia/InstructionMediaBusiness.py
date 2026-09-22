"""Instructionmedia business layer — serving instruction images.

No legacy lost/logic counterpart. Uses shared utils that stay in logic/:
``UserFileAccess`` (file_access) and ``INSTRUCTION_MEDIA_PATH`` (file_man).
"""
from __future__ import annotations

import os
import urllib.parse

from lost.controllers.Exceptions import DomainError
from lost.logic.file_access import UserFileAccess
from lost.logic.file_man import INSTRUCTION_MEDIA_PATH


class InvalidMediaPathError(DomainError):
    http_status = 403
    http_body = {"message": "Forbidden: Invalid path"}


class MediaFileNotFoundError(DomainError):
    http_status = 404
    http_body = {"message": "File not found"}


class MissingEncodedPathError(DomainError):
    http_status = 400
    http_body = {"message": 'Missing "encodedPath"'}


class MediaForbiddenError(DomainError):
    http_status = 403
    http_body = {"message": "Forbidden"}


class InstructionMediaBusiness:
    """Instructionmedia business service — media validation + markdown."""

    def __init__(self, dbm) -> None:
        self.dbm = dbm

    def _valid_public_path(self, mp: str) -> bool:
        """True when the path lies within a user-filesystem instruction media dir."""
        for fs in self.dbm.get_all_user_default_fs():
            if os.path.join(fs.root_path, INSTRUCTION_MEDIA_PATH) in mp:
                return True
        return False

    def media_file_path(self, raw_path: str) -> str:
        """Validated absolute path for a public instruction image."""
        path = raw_path.lstrip("/")
        path = os.path.join("/", path)
        if not self._valid_public_path(path):
            raise InvalidMediaPathError(path)
        if not os.path.isfile(path):
            raise MediaFileNotFoundError(path)
        return path

    def image_markdown(self, user, encoded_path: str, base_url: str) -> dict:
        """Markdown embedding URL for an instruction image (designer)."""
        decoded = urllib.parse.unquote(encoded_path.lstrip("/"))
        if not decoded:
            raise MissingEncodedPathError("empty path")
        fs_db = self.dbm.get_user_default_fs(user.idx)
        ufa = UserFileAccess(self.dbm, user, fs_db)
        if not ufa.valid_instruction_media_save_path(decoded):
            raise MediaForbiddenError(decoded)
        if not ufa.fs.isfile(decoded):
            raise MediaFileNotFoundError(decoded)
        # parity: the URL embeds the RAW encodedPath, not the decoded one
        markdown = f"![Image]({base_url}/api/media/media-file?path={encoded_path})"
        return {"markdown": markdown}
