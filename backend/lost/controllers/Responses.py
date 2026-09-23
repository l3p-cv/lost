"""Generalized exception-to-HTTP vocabulary for endpoint except blocks.

D2 pattern: business raises plain domain errors; endpoints catch them and
build the byte-exact legacy responses via these helpers. Endpoints stay
declarative about *which* status/body; this class is the only place that
knows *how* a legacy response is constructed.

Never import this from business/coordination layers (enforced by the
layering guard's infra ban).

Known legacy shapes covered (module -> error):
    ok                    200 {"message": ...} / 200 string bodies
                          (instructions role-quirks, user exists/not-found,
                          filebrowser check-path/datasource error-dicts)
    no_content            204 (dataset PATCH, model DELETE)
    bad_request           400 dict/string (group name/dup-delete, inference
                          model duplicate, pipeline import messages)
    unauthorized          401 (user refresh/token, filebrowser local-fs)
    forbidden             403 dict/string (thumbnail role, lsTest, upload)
    not_found             404 dict/string (template, user-by-id, model,
                          instruction, image-not-found)
    conflict              409 string (group duplicate)
    precondition_failed   412 (annotasks working-task)
    unprocessable         422 (mia image type)
    internal              500 string (sia update failure)
    plain_text            legacy text/plain bodies (data 422, dataset 400/404)
"""
from __future__ import annotations

from fastapi.responses import JSONResponse, PlainTextResponse


class Responses:
    """Static helpers — one method per legacy HTTP response shape."""

    # --- success-shaped legacy responses ---

    @staticmethod
    def ok(body: dict | list | str):
        """200 with a JSON body — the legacy 200-message error quirks."""
        return JSONResponse(status_code=200, content=body)

    @staticmethod
    def no_content() -> PlainTextResponse:
        """204 empty body (dataset PATCH, inference-model DELETE)."""
        return PlainTextResponse("", status_code=204)

    # --- client errors ---

    @staticmethod
    def bad_request(body: dict | list | str):
        """400 — dict or JSON-encoded string body."""
        return JSONResponse(status_code=400, content=body)

    @staticmethod
    def unauthorized(body: dict | list | str):
        """401 — dict or string body."""
        return JSONResponse(status_code=401, content=body)

    @staticmethod
    def forbidden(body: dict | list | str):
        """403 — dict or string body."""
        return JSONResponse(status_code=403, content=body)

    @staticmethod
    def not_found(body: dict | list | str):
        """404 — dict or string body."""
        return JSONResponse(status_code=404, content=body)

    @staticmethod
    def conflict(body: dict | list | str):
        """409 — legacy duplicate-conflict bodies."""
        return JSONResponse(status_code=409, content=body)

    @staticmethod
    def precondition_failed(body: dict | list | str):
        """412 — annotasks working-task not found."""
        return JSONResponse(status_code=412, content=body)

    @staticmethod
    def unprocessable(body: dict | list | str):
        """422 — mia unknown image type."""
        return JSONResponse(status_code=422, content=body)

    # --- server errors (transcribed legacy failures) ---

    @staticmethod
    def internal(body: dict | list | str):
        """500 — legacy transcribed failure bodies (e.g. sia update)."""
        return JSONResponse(status_code=500, content=body)

    # --- plain-text legacy bodies (former http_media_type cases) ---

    @staticmethod
    def plain_text(body: str, status_code: int) -> PlainTextResponse:
        """Legacy text/plain bodies — data 422, dataset 400/404 parent errors."""
        return PlainTextResponse(body, status_code=status_code)

    # --- escape hatch for odd one-offs (prefer named methods) ---

    @staticmethod
    def json_response(status_code: int, body: dict | list | str):
        return JSONResponse(status_code=status_code, content=body)
