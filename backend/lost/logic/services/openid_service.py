"""
OpenID Connect service for authenticating users via an external Identity Provider (e.g. Authentik).

Flow:
  1. get_authorization_url()     - Build the Authentik authorization redirect URL.
  2. exchange_code_for_tokens()  - Exchange the OAuth2 authorization code for an id_token.
  3. fetch_jwks()                - Retrieve (and cache) the IDP's public JWKS for token verification.
  4. verify_id_token()           - Verify the RS256-signed id_token from the IDP.
  5. get_or_create_user()        - Look up or create the local DB user from the verified claims.
  6. build_token_redirect()      - Issue a local JWT pair and return a redirect response to the frontend.
"""

import logging
import secrets
import datetime

import requests
import jwt
from jwt import PyJWKClient, ExpiredSignatureError, InvalidTokenError
from flask import redirect

from lostconfig import LOSTConfig
from lost.db import roles
from lost.db.access import DBMan
from lost.db.model import User as DBUser, UserRoles, Group, UserGroups
from lost.api.user.login_manager import LoginManager

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Module-level config (instantiated once at import time, matching the pattern
# used throughout the rest of the codebase).
# ---------------------------------------------------------------------------
_CONFIG = LOSTConfig()

# Simple in-process JWKS cache: stores the PyJWKClient so it can re-use its
# own internal cache between requests.  Replaced on first call.
_jwks_client: PyJWKClient | None = None


# ---------------------------------------------------------------------------
# Task 1 – Build the authorization redirect URL
# ---------------------------------------------------------------------------


def get_authorization_url() -> str:
    """Return the full Authentik authorization URL the browser should be sent to.

    Generates a cryptographically random *state* token that is embedded in the
    URL.  The same state value is expected back on the callback so the endpoint
    can pass it through to :func:`exchange_code_for_tokens` for CSRF validation.

    Returns:
        str: The authorization URL.
    """
    state = secrets.token_urlsafe(32)

    params = {
        "client_id": _CONFIG.openid_client_id,
        "redirect_uri": _CONFIG.openid_redirect_uri,
        "response_type": "code",
        "scope": "openid email profile",
        "state": state,
    }

    base = _CONFIG.openid_url.rstrip("/")
    query = "&".join(f"{k}={v}" for k, v in params.items())
    url = f"{base}/application/o/authorize/?{query}"

    logger.debug("Built authorization URL: %s", url)
    return url, state


# ---------------------------------------------------------------------------
# Task 2 – Exchange an authorization code for tokens
# ---------------------------------------------------------------------------


def exchange_code_for_tokens(code: str) -> dict:
    """Exchange an OAuth2 authorization *code* for a token response.

    Makes a server-side POST to the Authentik token endpoint using the
    *authorization_code* grant type.

    Args:
        code: The authorization code received on the callback.

    Returns:
        dict: The full token response from Authentik (contains ``id_token``,
              ``access_token``, ``refresh_token``, ``token_type``, etc.).

    Raises:
        ValueError: If the token endpoint returns a non-200 status or an error
                    field is present in the response.
    """
    base = _CONFIG.openid_url.rstrip("/")
    token_url = f"{base}/application/o/token/"

    payload = {
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": _CONFIG.openid_redirect_uri,
        "client_id": _CONFIG.openid_client_id,
        "client_secret": _CONFIG.openid_client_secret,
    }

    logger.debug("Exchanging authorization code at %s", token_url)
    response = requests.post(token_url, data=payload, timeout=10)

    if response.status_code != 200:
        logger.error(
            "Token exchange failed: HTTP %s – %s",
            response.status_code,
            response.text,
        )
        raise ValueError(f"Token exchange failed with status {response.status_code}")

    token_data = response.json()

    if "error" in token_data:
        logger.error("Token exchange error: %s", token_data)
        raise ValueError(f"Token exchange error: {token_data['error']}")

    if "id_token" not in token_data:
        raise ValueError("Token response did not contain an id_token")

    return token_data


# ---------------------------------------------------------------------------
# Task 3 – Fetch (and cache) the IDP JWKS
# ---------------------------------------------------------------------------


def _get_jwks_client() -> PyJWKClient:
    """Return a (cached) :class:`jwt.PyJWKClient` for the Authentik JWKS endpoint.

    The client is constructed once and reused across requests.  PyJWKClient
    has its own internal key-caching layer, so keys are only re-fetched when
    the ``kid`` in a token header is not recognised.
    """
    global _jwks_client
    if _jwks_client is None:
        base = _CONFIG.openid_url.rstrip("/")
        slug = _CONFIG.openid_app_slug
        jwks_uri = f"{base}/application/o/{slug}/jwks/"
        logger.debug("Initialising JWKS client with URI: %s", jwks_uri)
        _jwks_client = PyJWKClient(jwks_uri)
    return _jwks_client


# ---------------------------------------------------------------------------
# Task 4 – Verify the id_token
# ---------------------------------------------------------------------------


def verify_id_token(id_token: str) -> dict:
    """Decode and validate a JWT *id_token* issued by the external IDP.

    Verification steps:
    * Signature validated against the IDP's public key (fetched via JWKS).
    * ``iss`` claim must match :attr:`DAISyConfig.oidc_jwt_issuer`.
    * ``aud`` claim must contain :attr:`DAISyConfig.openid_client_id`.
    * ``exp`` claim must not be in the past.

    Args:
        id_token: The raw JWT string received from the IDP.

    Returns:
        dict: The decoded, verified claims payload.

    Raises:
        ValueError: If the token is invalid or verification fails for any reason.
    """
    try:
        client = _get_jwks_client()
        signing_key = client.get_signing_key_from_jwt(id_token)

        claims = jwt.decode(
            id_token,
            signing_key.key,
            algorithms=[_CONFIG.oidc_jwt_algorithm],
            issuer=_CONFIG.oidc_jwt_issuer,
            audience=_CONFIG.openid_client_id,
            options={"verify_exp": True},
        )

        logger.debug("id_token verified for sub=%s", claims.get("sub"))
        return claims

    except ExpiredSignatureError:
        logger.warning("Received expired id_token")
        raise ValueError("The provided id_token has expired")
    except InvalidTokenError as exc:
        logger.warning("Invalid id_token: %s", exc)
        raise ValueError(f"Invalid id_token: {exc}")
    except Exception as exc:
        logger.error("Unexpected error verifying id_token: %s", exc)
        raise ValueError(f"Token verification failed: {exc}")


# ---------------------------------------------------------------------------
# Coordination – Handle the full callback flow
# ---------------------------------------------------------------------------


def handle_callback(code: str):
    """Coordinate the full OAuth2 callback flow for a given authorization *code*.

    This is the single entry-point called by the callback endpoint. It
    sequentially:

    1. Exchanges the authorization code for IDP tokens.
    2. Verifies the ``id_token`` signature and claims.
    3. Looks up or creates the local user from the verified claims.
    4. Issues a local JWT pair and returns a redirect response to the frontend.

    Args:
        code: The OAuth2 authorization code received from the IDP callback.

    Returns:
        A Flask :class:`~flask.Response` with status 302 redirecting the
        browser to the frontend with local JWTs in the URL fragment.

    Raises:
        ValueError: If any validation step fails (token exchange error,
                    invalid token, missing claims, etc.).
    """
    token_data = exchange_code_for_tokens(code)
    claims = verify_id_token(token_data["id_token"])

    # user has a verified JWT (from IDP) at this point - add locally and create local JWT
    dbm = DBMan(_CONFIG)
    user = get_or_create_user(dbm, claims)
    return build_token_redirect(dbm, user)


# ---------------------------------------------------------------------------
# Task 5 – Get or create the local user
# ---------------------------------------------------------------------------


def get_or_create_user(dbm: DBMan, claims: dict) -> DBUser:
    """Return the local :class:`~daisy.db.model.User` that corresponds to the
    verified OIDC claims, creating one if this is the first login.

    Lookup strategy:
    1. Try to find an existing user by ``preferred_username`` claim.
    2. If none exists, create a new user and assign the *Annotator* role.

    New users receive:
    * ``user_name``  – from the ``preferred_username`` claim.
    * ``email``      – from the ``email`` claim (optional).
    * ``first_name`` – from the ``given_name`` claim (optional).
    * ``last_name``  – from the ``family_name`` claim (optional).
    * A personal default :class:`~daisy.db.model.Group` (``is_user_default=True``).
    * The *Annotator* role.

    Args:
        claims: The verified JWT claims dict returned by :func:`verify_id_token`.

    Returns:
        DBUser: The (possibly newly-created) local user object.

    Raises:
        ValueError: If required claims (``preferred_username``) are missing.
    """
    preferred_username = claims.get("preferred_username")
    if not preferred_username:
        raise ValueError('id_token is missing the required "preferred_username" claim')

    email = claims.get("email") or ""

    try:
        user = dbm.find_user_by_user_name(preferred_username)

        if user is not None:
            logger.debug("Found existing local user id=%s for username=%s", user.idx, preferred_username)
            dbm.close_session()
            return user

        # ---- Create a new local user ----------------------------------------
        first_name = claims.get("given_name") or ""
        last_name = claims.get("family_name") or ""

        # Authentik stores the full name in the "name" claim when given_name/family_name
        # are not populated separately. If both are still empty and "name" contains
        # exactly two words, split them into first and last name.
        if not first_name and not last_name:
            full_name = claims.get("name", "").strip()
            name_parts = full_name.split()
            if len(name_parts) == 2:
                first_name, last_name = name_parts

        logger.info(
            "Creating new local user username=%s email=%s from OIDC login",
            preferred_username,
            email,
        )

        new_user = DBUser(
            user_name=preferred_username,
            email=email,
            email_confirmed_at=datetime.datetime.utcnow(),
            password=secrets.token_hex(32),  # random unusable password – login is via OIDC
            first_name=first_name,
            last_name=last_name,
        )
        dbm.save_obj(new_user)

        # Personal default group (mirrors the pattern in user/endpoint.py)
        personal_group = Group(name=new_user.user_name, is_user_default=True)
        dbm.save_obj(personal_group)
        dbm.save_obj(UserGroups(group_id=personal_group.idx, user_id=new_user.idx))

        # Assign Annotator role
        annotator_role = dbm.get_role_by_name(roles.ANNOTATOR)
        if annotator_role:
            dbm.save_obj(UserRoles(user_id=new_user.idx, role_id=annotator_role.idx))
        else:
            logger.warning("Annotator role not found in database – new OIDC user created without a role")

        # Refresh to load relationships (roles, groups) before closing session
        dbm.session.refresh(new_user)

        dbm.close_session()
        return new_user

    except Exception:
        dbm.close_session()
        raise


# ---------------------------------------------------------------------------
# Task 6 – Issue a local token pair and build the redirect response
# ---------------------------------------------------------------------------


def build_token_redirect(dbm: DBMan, user: DBUser):
    """Issue a local JWT pair for *user* and return a redirect response.

    Calls the existing :func:`~daisy.api.user.endpoint.do_login` helper so the
    local token is generated identically to a password-based login (same
    expiry, same ``permissions`` claim, same ``flask_jwt_extended`` machinery).

    The browser is then redirected to::

        {FRONTEND_URL}/#token=<access_token>&refreshToken=<refresh_token>

    Tokens are placed in the URL *fragment* (``#``) so they are never sent to
    the frontend server in HTTP request logs.

    Args:
        user: A fully-loaded local :class:`~daisy.db.model.User` instance.

    Returns:
        A Flask :class:`~flask.Response` with status 302.
    """
    # username and password is intentionally empty
    # we already authenticated the user and just want to create the JWT
    lm = LoginManager(dbm, "", "")
    access_token, refresh_token = lm.create_jwt(user.idx, user.roles)

    frontend_url = _CONFIG.frontend_url.rstrip("/")
    redirect_url = f"{frontend_url}/#token={access_token}&refreshToken={refresh_token}"

    logger.debug("Redirecting authenticated user id=%s to frontend", user.idx)
    return redirect(redirect_url, code=302)
