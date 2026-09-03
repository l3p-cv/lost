"""OpenID Connect authentication endpoints (FastAPI).

Routes:
    GET  /auth/openid/login    — redirect to IDP login page
    GET  /auth/openid/callback — handle OAuth2 callback from IDP
    POST /auth/openid/token    — exchange temp code for JWT pair
"""
from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, Query, Request
from fastapi.responses import JSONResponse, RedirectResponse
from pydantic import BaseModel

from lost.api.auth.OpenidCoordination import exchange_temp_code, handle_callback
from lost.api.auth.services import openid_service
from lost.api.base import ProfilingRoute

logger = logging.getLogger("lost.api.auth")
router = APIRouter(tags=["auth/openid"], route_class=ProfilingRoute)

class TokenExchangeRequest(BaseModel):
    code: str


@router.get("/login")
def openid_login(request: Request):
    """Redirect to the IDP authorization URL."""
    try:
        authorization_url, state, nonce = openid_service.get_authorization_url()
        request.session["openid_state"] = state
        request.session["openid_nonce"] = nonce
        return RedirectResponse(authorization_url, status_code=302)
    except Exception as exc:
        logger.error("Failed to build authorization URL: %s", exc)
        return JSONResponse(status_code=503, content={"message": "OpenID login unavailable"})

@router.get("/callback")
def openid_callback(
    request: Request,
    code: str | None = Query(None),
    state: str | None = Query(None),
    error: str | None = Query(None),
    error_description: str | None = Query(None),
):
    """Handle the OAuth2 callback from the IDP."""
    if error:
        logger.warning("IDP returned error on callback: %s – %s", error, error_description or error)
        return JSONResponse(status_code=401, content={"message": f"Authentication failed: {error_description or error}"})
    expected_state = request.session.pop("openid_state", None)
    if not state or state != expected_state:
        logger.warning("OpenID callback state mismatch (possible CSRF)")
        return JSONResponse(status_code=400, content={"message": "Invalid state parameter"})
    nonce = request.session.pop("openid_nonce", None)
    if not nonce:
        logger.warning("OpenID callback nonce missing from session")
        return JSONResponse(status_code=400, content={"message": "Invalid nonce parameter"})
    if not code:
        logger.warning("Callback received without authorization code")
        return JSONResponse(status_code=400, content={"message": "Missing authorization code"})
    try:
        redirect_url = handle_callback(code, nonce)
        return RedirectResponse(redirect_url, status_code=302)
    except ValueError as exc:
        logger.warning("OpenID callback validation error: %s", exc)
        return JSONResponse(status_code=401, content={"message": str(exc)})
    except Exception as exc:
        logger.error("Unexpected error in OpenID callback: %s", exc)
        return JSONResponse(status_code=500, content={"message": "Internal authentication error"})


@router.post("/token")
def openid_token(req: TokenExchangeRequest):
    """Exchange a one-time temp code for local JWT credentials."""
    code = req.code.strip()
    if not code:
        return JSONResponse(status_code=400, content={"message": "Missing code"})
    try:
        token_data = exchange_temp_code(code)
        return token_data
    except ValueError as exc:
        logger.warning("Temp code exchange failed: %s", exc)
        return JSONResponse(status_code=401, content={"message": str(exc)})
    except Exception as exc:
        logger.error("Unexpected error during temp code exchange: %s", exc)
        return JSONResponse(status_code=500, content={"message": "Internal authentication error"})