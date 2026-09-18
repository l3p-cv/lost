"""Filebrowser coordination layer — thin routing of endpoint calls to business.

Flow
----
FileBrowserEndpoint  ->  FileBrowserCoordination  ->  FileBrowserBusiness
"""
from __future__ import annotations

from lost.controllers.filebrowser.FileBrowserBusiness import FileBrowserBusiness


class FileBrowserCoordination:
    """Coordination service for the filebrowser namespace — thin delegation."""

    def __init__(self, business: FileBrowserBusiness) -> None:
        self._business = business

    def get_fs_list(self, user, visibility: str) -> list[dict]:
        """List filesystems. Delegates to FileBrowserBusiness.fs_list."""
        return self._business.fs_list(user, visibility)

    def get_fs_types(self, user) -> list[str]:
        """List fs types. Delegates to FileBrowserBusiness.fs_types."""
        return self._business.fs_types(user)

    def ls(self, user, req):
        """List directory. Delegates to FileBrowserBusiness.ls."""
        return self._business.ls(user, req)

    def ls_test(self, user, req):
        """Test fs connection. Delegates to FileBrowserBusiness.ls_test."""
        return self._business.ls_test(user, req)

    def rm_files(self, user, req) -> str:
        """Remove files. Delegates to FileBrowserBusiness.rm_files."""
        return self._business.rm_files(user, req)

    def delete_fs(self, req) -> dict:
        """Delete filesystem. Delegates to FileBrowserBusiness.delete_fs."""
        return self._business.delete_fs(req)

    def save_fs(self, user, req) -> str:
        """Save filesystem. Delegates to FileBrowserBusiness.save_fs."""
        return self._business.save_fs(user, req)

    def full_fs(self, user, req) -> dict:
        """Filesystem details. Delegates to FileBrowserBusiness.full_fs."""
        return self._business.full_fs(user, req)

    def upload(self, user, fs_id: str, path: str, files) -> str:
        """Upload files. Delegates to FileBrowserBusiness.upload."""
        return self._business.upload(user, fs_id, path, files)

    def mkdirs(self, user, req) -> str:
        """Create directories. Delegates to FileBrowserBusiness.mkdirs."""
        return self._business.mkdirs(user, req)

    def check_path(self, user, req) -> dict:
        """Check path. Delegates to FileBrowserBusiness.check_path."""
        return self._business.check_path(user, req)

    def validate_datasource(self, user, req) -> dict:
        """Validate datasource. Delegates to FileBrowserBusiness.validate_datasource."""
        return self._business.validate_datasource(user, req)