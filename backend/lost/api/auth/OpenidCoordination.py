"""
OpenID Connect coordination layer.

Orchestrates the full OAuth2 callback flow by sequencing calls to
:mod:`lost.logic.services.openid_service`.

Flow
----
OpenidEndpoint  →  OpenidCoordination  →  openid_service
"""

import logging

from lost.api.auth.services import openid_service


logger = logging.getLogger(__name__)


def exchange_temp_code(code: str) -> dict:
    """Validate and consume a one-time temp *code*, returning the JWT pair.

    Delegates to :func:`openid_service.exchange_temp_code`.

    Args:
        code: The opaque temp code received from the frontend.

    Returns:
        dict: ``{"token": <access_token>, "refreshToken": <refresh_token>}``

    Raises:
        ValueError: If the code is missing, expired, or has already been used.
    """
    return openid_service.exchange_temp_code(code)


def handle_callback(code: str, nonce: str):
    """Coordinate the full OAuth2 callback flow for a given authorization *code*.

    This is the single entry-point called by the callback endpoint. It
    sequentially:

    1. Exchanges the authorization code for IDP tokens.
    2. Verifies the ``id_token`` signature, claims, and nonce.
    3. Maps user groups from IDP with lost roles - fails if no role assigned
    4. Looks up or creates the local user from the verified claims.
    5. Issues a local JWT pair and returns a redirect response to the frontend.

    Args:
        code: The OAuth2 authorization code received from the IDP callback.
        nonce: The nonce stored in the session during the login redirect,
               used to bind the id_token to this specific authorization request.

    Returns:
        A Flask :class:`~flask.Response` with status 302 redirecting the
        browser to ``{frontend_url}/auth/callback?code=<temp_code>``.

    Raises:
        ValueError: If any validation step fails (token exchange error,
                    invalid token, nonce mismatch, missing claims, etc.).
    """
    token_data = openid_service.exchange_code_for_tokens(code)
    claims = openid_service.verify_id_token(token_data["id_token"], nonce)
    roles = openid_service.get_user_roles_from_claims(claims)
    user = openid_service.get_or_create_user(claims, roles)
    return openid_service.build_token_redirect(user)
