"""Shared cross-module domain exceptions.

D2 end-state: DomainError is a bare MARKER base — module errors carry no
HTTP vocabulary

Endpoints catch them and build legacy responses via
Responses (lost/controllers/Responses.py). The single exception is
NotAuthorizedError: the shared guard error whose standard 403 body is
mapped by the global handler registered in fastapi_app.py.
"""


class DomainError(Exception):
    """Marker base for all domain exceptions."""


class NotAuthorizedError(DomainError):
    """A resource-level permission check failed (shared guard error → global handler)."""

    http_status: int = 403
    http_body: dict | str = {"message": "You are not authorized."}
