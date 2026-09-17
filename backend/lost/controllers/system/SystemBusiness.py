"""System business layer — version/settings/jupyter values.

No legacy lost/logic counterpart. No DB access — values come from the
``lost`` package and ``LOST_CONFIG``.
"""
from __future__ import annotations

import lost
from lost.settings import LOST_CONFIG


class SystemBusiness:
    """System business service — system/version/settings values."""

    def get_version(self) -> str:
        """The LOST package version (or 'development')."""
        try:
            return lost.__version__
        except Exception:
            return "development"

    def get_settings(self) -> dict:
        """Auto-logout + dev-mode settings."""
        return {"autoLogoutWarnTime": 5 * 60, "isDevMode": LOST_CONFIG.debug}

    def get_jupyter_url(self) -> str:
        """Jupyter Lab URL (empty string when inactive)."""
        if LOST_CONFIG.jupyter_lab_active:
            return f"{LOST_CONFIG.jupyter_lab_port}/lab?token={LOST_CONFIG.jupyter_lab_token}"
        return ""