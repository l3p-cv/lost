"""
OpenID Connect authentication endpoints.

Namespace: /auth

Routes
------
GET /auth/openid/login
    Redirects the browser to the external IDP (Authentik) login page.

GET /auth/openid/callback
    Handles the OAuth2 authorization code callback from the IDP.
    Exchanges the code for an id_token, verifies it, looks up or creates
    the local user, and redirects the browser to the frontend with local
    JWTs embedded in the URL fragment.

Each route delegates all business logic to :mod:`daisy.logic.services.openid_service`.
"""

import logging

from flask import make_response, redirect, request
from flask_restx import Resource

from lost.api.api import api
from lost.logic.services import openid_service

logger = logging.getLogger(__name__)

namespace = api.namespace("auth", description="OpenID Connect authentication.")


# ---------------------------------------------------------------------------
# /auth/openid/login
# ---------------------------------------------------------------------------


@namespace.route("/openid/login")
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
            authorization_url, _state = openid_service.get_authorization_url()
            return redirect(authorization_url, code=302)
        except Exception as exc:
            logger.error("Failed to build authorization URL: %s", exc)
            return make_response({"message": "OpenID login unavailable"}, 503)


# ---------------------------------------------------------------------------
# /auth/openid/callback
# ---------------------------------------------------------------------------


@namespace.route("/openid/callback")
class OpenIDCallback(Resource):
    @api.doc(
        description=(
            "OAuth2 callback endpoint. The IDP redirects here with an "
            "authorization code (?code=...). The backend exchanges the code "
            "for an id_token, verifies it, looks up or creates the local user, "
            "and redirects to the frontend with local JWTs in the URL fragment."
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

        code = request.args.get("code")
        if not code:
            logger.warning("Callback received without authorization code")
            return make_response({"message": "Missing authorization code"}, 400)

        try:
            return openid_service.handle_callback(code)

        except ValueError as exc:
            logger.warning("OpenID callback validation error: %s", exc)
            return make_response({"message": str(exc)}, 401)
        except Exception as exc:
            logger.exception("Unexpected error in OpenID callback: %s", exc)
            return make_response({"message": "Internal authentication error"}, 500)
