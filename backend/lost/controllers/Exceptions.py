"""Shared cross-module domain exceptions.

All domain exceptions derive from :class:`DomainError` and declare their own
legacy HTTP mapping (status + body). The single handler registered in
``fastapi_app.py`` maps them; endpoints never need try/except.

Shared cross-module vocabulary lives here; module-specific domain errors
live in the module's Business file
(e.g. ``label.LabelBusiness.DuplicateLabelTreeError``).
"""


class DomainError(Exception):
    """Base for all domain exceptions — subclasses declare their legacy HTTP mapping."""

    http_status: int = 500
    http_body: dict | str = {}
    http_media_type: str | None = None


class NotAuthorizedError(DomainError):
    """A resource-level permission check failed (visibility / ownership)."""

    http_status = 403
    http_body = {"message": "You are not authorized."}
