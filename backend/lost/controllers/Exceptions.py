"""Shared cross-module domain exceptions.

Raised by coordination/business layers; mapped to the legacy HTTP responses
by the global exception handlers registered in ``fastapi_app.py``.
Module-specific domain errors live in the module's Business file
(e.g. ``label.LabelBusiness.DuplicateLabelTreeError``).
"""

class NotAuthorizedError(PermissionError):
    """A resource-level permission check failed (visibility / ownership)."""