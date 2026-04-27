"""
OpenID Connect authentication endpoints.

Namespace: /auth

Routes
------
GET /auth/openid/login
    Redirects the browser to the external IDP (Authentik) login page.

GET /auth/openid/callback
    Handles the OAuth2 authorization code callback from the IDP.
    Delegates full coordination to :mod:`lost.api.auth.OpenidCoordination`.

POST /auth/openid/token
    Exchanges a one-time temp code (issued by the callback) for the real
    local JWT pair.  The code is consumed on first use and expires after
    60 seconds.

Request handling flow:
    OpenidEndpoint  →  OpenidCoordination  →  openid_service
"""

import logging

from flask import make_response, redirect, request, session
from flask_restx import Resource, fields

from lost.api.api import api
from lost.api.auth.OpenidCoordination import exchange_temp_code, handle_callback
from lost.api.auth.services import openid_service


logger = logging.getLogger(__name__)

namespace = api.namespace("auth/openid", description="OpenID Connect authentication.")

_token_exchange_model = namespace.model(
    "OpenIDTokenExchange",
    {
        "code": fields.String(
            required=True,
            description="One-time temp code from the OIDC callback redirect",
        ),
    },
)


# ---------------------------------------------------------------------------
# /auth/openid/login
# ---------------------------------------------------------------------------


@namespace.route("/login")
class OpenIDLogin(Resource):
    @api.doc(
        description=(
            "Redirect the browser to the external IDP (Authentik) login page. "
            "The IDP will redirect back to /auth/openid/callback after a "
            "successful login."
        )
    )
    def get(self):
        """Initiate the OpenID Connect authorization code flow."""
        try:
            authorization_url, state, nonce = openid_service.get_authorization_url()
            session["openid_state"] = state
            session["openid_nonce"] = nonce
            return redirect(authorization_url, code=302)
        except Exception as exc:
            logger.error("Failed to build authorization URL: %s", exc)
            return make_response({"message": "OpenID login unavailable"}, 503)


# ---------------------------------------------------------------------------
# /auth/openid/callback
# ---------------------------------------------------------------------------


@namespace.route("/callback")
class OpenIDCallback(Resource):
    @api.doc(
        description=(
            "OAuth2 callback endpoint. The IDP redirects here with an "
            "authorization code (?code=...). The backend exchanges the code "
            "for an id_token, verifies it, looks up or creates the local user, "
            "stores the local JWTs under a one-time temp code and redirects "
            "to {frontend_url}/auth/callback?code=<temp_code>. "
            "The frontend must POST the temp code to /auth/openid/token to "
            "obtain the actual tokens."
        ),
        params={
            "code": "Authorization code issued by the IDP",
            "state": "State parameter for CSRF protection",
            "error": "Error code returned by the IDP on failure",
            "error_description": "Human-readable error description from the IDP",
        },
    )
    def get(self):
        """Handle the authorization code callback from the IDP."""

        # Surface IDP-level errors (e.g. user denied consent)
        error = request.args.get("error")
        if error:
            error_description = request.args.get("error_description", error)
            logger.warning("IDP returned error on callback: %s – %s", error, error_description)
            return make_response({"message": f"Authentication failed: {error_description}"}, 401)

        state = request.args.get("state")
        expected_state = session.pop("openid_state", None)
        if not state or state != expected_state:
            logger.warning("OpenID callback state mismatch (possible CSRF)")
            return make_response({"message": "Invalid state parameter"}, 400)

        nonce = session.pop("openid_nonce", None)
        if not nonce:
            logger.warning("OpenID callback nonce missing from session")
            return make_response({"message": "Invalid nonce parameter"}, 400)

        code = request.args.get("code")
        if not code:
            logger.warning("Callback received without authorization code")
            return make_response({"message": "Missing authorization code"}, 400)

        try:
            return handle_callback(code, nonce)

        except ValueError as exc:
            logger.warning("OpenID callback validation error: %s", exc)
            return make_response({"message": str(exc)}, 401)
        except Exception as exc:
            logger.error("Unexpected error in OpenID callback: %s", exc)
            return make_response({"message": "Internal authentication error"}, 500)


# ---------------------------------------------------------------------------
# /auth/openid/token
# ---------------------------------------------------------------------------


@namespace.route("/token")
class OpenIDToken(Resource):
    @api.doc(
        description=(
            "Exchange a one-time temp code (issued by the /auth/openid/callback "
            "redirect) for the real local JWT pair.  The code is consumed on "
            "first use and expires after 60 seconds."
        )
    )
    @namespace.expect(_token_exchange_model, validate=True)
    def post(self):
        """Exchange a one-time temp code for local JWT credentials."""
        body = request.get_json(silent=True) or {}
        code = body.get("code", "").strip()

        if not code:
            return make_response({"message": "Missing code"}, 400)

        try:
            token_data = exchange_temp_code(code)
            return make_response(token_data, 200)

        except ValueError as exc:
            logger.warning("Temp code exchange failed: %s", exc)
            return make_response({"message": str(exc)}, 401)
        except Exception as exc:
            logger.error("Unexpected error during temp code exchange: %s", exc)
            return make_response({"message": "Internal authentication error"}, 500)
