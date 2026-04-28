"""
OpenID Connect service for authenticating users via an external Identity Provider (e.g. Authentik).

Flow:
  1. get_authorization_url()     - Build the Authentik authorization redirect URL.
  2. exchange_code_for_tokens()  - Exchange the OAuth2 authorization code for an id_token.
  3. fetch_jwks()                - Retrieve (and cache) the IDP's public JWKS for token verification.
  4. verify_id_token()           - Verify the RS256-signed id_token from the IDP.
  5. get_or_create_user()        - Look up or create the local DB user from the verified claims.
  6. build_token_redirect()      - Issue a local JWT pair, store it under a one-time temp code in
                                   the DB, and redirect the frontend to /auth/callback?code=<temp_code>.
  7. exchange_temp_code()        - Validate and consume the temp code, returning the JWT pair.
"""

import datetime
import logging
import secrets
from urllib.parse import urlencode

import jwt
from jwt import PyJWKClient, ExpiredSignatureError, InvalidTokenError
import requests
from flask import redirect
from werkzeug.exceptions import Forbidden

from lostconfig import LOSTConfig
from lost.db import roles
from lost.db.access import DBMan
from lost.db.model import User as DBUser, UserRoles, Group, UserGroups, OidcTempCode
from lost.api.auth.exceptions import MisconfiguredException
from lost.api.user.login_manager import LoginManager

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Module-level config (instantiated once at import time
# ---------------------------------------------------------------------------
_CONFIG = LOSTConfig()

# Simple in-process JWKS cache: stores the PyJWKClient so it can re-use its
# own internal cache between requests.  Replaced on first call.
_jwks_client: PyJWKClient | None = None

# Prefix for all temp-code keys in Redis, and TTL in seconds.
_TEMP_CODE_PREFIX = "openid_temp:"
_TEMP_CODE_TTL = 60  # seconds


# ---------------------------------------------------------------------------
# Task 1 – Build the authorization redirect URL
# ---------------------------------------------------------------------------


def get_authorization_url() -> tuple[str, str, str]:
    """Return the full Authentik authorization URL the browser should be sent to.

    Generates a cryptographically random *state* token (for CSRF protection) and
    a *nonce* (recommended by the OIDC specification to bind the id_token to this
    specific authorization request and prevent replay attacks).  Both values are
    embedded in the authorization URL and must be stored server-side so they can
    be validated on the callback.

    Returns:
        tuple[str, str, str]: ``(authorization_url, state, nonce)``
    """
    state = secrets.token_urlsafe(32)
    nonce = secrets.token_urlsafe(32)

    params = {
        "client_id": _CONFIG.openid_client_id,
        "redirect_uri": _CONFIG.openid_redirect_uri,
        "response_type": "code",
        "scope": "openid email profile",
        "state": state,
        "nonce": nonce,
    }

    base = _CONFIG.openid_auth_endpoint
    query = urlencode(params)
    url = f"{base}?{query}"

    logger.debug("Built authorization URL: %s", url)
    return url, state, nonce


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
    token_url = _CONFIG.openid_token_endpoint

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
        jwks_uri = _CONFIG.openid_jwks_uri
        logger.debug("Initialising JWKS client with URI: %s", jwks_uri)
        _jwks_client = PyJWKClient(jwks_uri)
    return _jwks_client


# ---------------------------------------------------------------------------
# Task 4 – Verify the id_token
# ---------------------------------------------------------------------------


def verify_id_token(id_token: str, nonce: str) -> dict:
    """Decode and validate a JWT *id_token* issued by the external IDP.

    Verification steps:
    * Signature validated against the IDP's public key (fetched via JWKS).
    * ``iss`` claim must match :attr:`LOSTConfig.oidc_jwt_issuer`.
    * ``aud`` claim must contain :attr:`LOSTConfig.openid_client_id`.
    * ``exp`` claim must not be in the past.
    * ``nonce`` claim must match the *nonce* generated during authorization
      (OIDC specification recommendation to prevent replay attacks).

    Args:
        id_token: The raw JWT string received from the IDP.
        nonce: The nonce value generated by :func:`get_authorization_url` and
               stored server-side for this authorization request.

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

        if claims.get("nonce") != nonce:
            logger.warning("id_token nonce mismatch (possible replay attack)")
            raise ValueError("Nonce mismatch in id_token")

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
# Task 5 – Get or create the local user
# ---------------------------------------------------------------------------


def get_or_create_user(claims: dict, roles: list[str]) -> DBUser:
    """Return the local :class:`~lost.db.model.User` that corresponds to the
    verified OIDC claims, creating one if this is the first login.

    Lookup strategy:
    1. Try to find an existing user by ``preferred_username`` claim.
    2. If none exists, create a new user
    3. Assing the user role by mapping the openid groups

    New users receive:
    * ``user_name``  - from the ``preferred_username`` claim.
    * ``email``      - from the ``email`` claim (optional).
    * ``first_name`` - from the ``given_name`` claim (optional).
    * ``last_name``  - from the ``family_name`` claim (optional).
    * A personal default :class:`~lost.db.model.Group` (``is_user_default=True``).
    * The *Annotator* role.

    Args:
        claims: The verified JWT claims dict returned by :func:`verify_id_token`.
        roles: The roles in LOST the new user should have.

    Returns:
        DBUser: The (possibly newly-created) local user object.

    Raises:
        ValueError: If required claims (``preferred_username``) are missing.
    """
    preferred_username = claims.get("preferred_username")
    if not preferred_username:
        raise ValueError('id_token is missing the required "preferred_username" attribute')

    email = claims.get("email") or ""

    dbm = DBMan(_CONFIG)

    try:
        user = dbm.find_user_by_user_name(preferred_username)

        if user is not None:
            logger.debug("Found existing local user id=%s for username=%s", user.idx, preferred_username)
            dbm.close_session()

            # user roles could have changed on the IDP
            # check and update local rules
            update_user_roles(user, roles)
            # query user again since roles could have changed
            dbm = DBMan(_CONFIG)
            user = dbm.find_user_by_user_name(preferred_username)
            dbm.close_session()
            return user

        # ---- Create a new local user ----------------------------------------
        first_name = claims.get("given_name") or ""
        last_name = claims.get("family_name") or ""

        # Authentik stores the full name in the "name" claim when given_name/family_name
        # are not populated separately. If both are still empty and "name" contains
        # exactly two words, split them into first and last name.
        # otherwise just fill everything in the first_name attribute
        if not first_name and not last_name:
            full_name = claims.get("name", "").strip()
            name_parts = full_name.split()
            if len(name_parts) == 2:
                first_name, last_name = name_parts
            else:
                first_name = full_name

        logger.info(
            "Creating new local user username=%s email=%s from OIDC login",
            preferred_username,
            email,
        )

        new_user = DBUser(
            user_name=preferred_username,
            email=email,
            email_confirmed_at=datetime.datetime.now(datetime.UTC),
            password=secrets.token_hex(32),  # random unusable password – login is via OIDC
            first_name=first_name,
            last_name=last_name,
        )
        dbm.save_obj(new_user)

        # Personal default group (mirrors the pattern in user/endpoint.py)
        personal_group = Group(name=new_user.user_name, is_user_default=True)
        dbm.save_obj(personal_group)
        dbm.save_obj(UserGroups(group_id=personal_group.idx, user_id=new_user.idx))

        # Refresh to load relationships (roles, groups) before closing session
        dbm.session.refresh(new_user)

        dbm.close_session()

        # Assign roles according to what the IDP grants (same path as existing users)
        update_user_roles(new_user, roles)

        # query user again since roles could have changed
        dbm = DBMan(_CONFIG)
        user = dbm.find_user_by_user_name(preferred_username)
        dbm.close_session()

        return user

    except Exception:
        dbm.close_session()
        raise


def get_user_roles_from_claims(claims: dict) -> list:
    """map the groups of the openid authenticated user to LOST roles.
    Throw an exception when user has no roles (no access granted).
    """

    groups: list[str] = claims.get("groups") or []

    annotator_group_name: str = _CONFIG.openid_annotator_group_name
    designer_group_name: str = _CONFIG.openid_designer_group_name
    admin_group_name: str = _CONFIG.openid_admin_group_name

    if annotator_group_name is None or len(annotator_group_name) == 0:
        logger.warning("OpenID annotator group not set - no annotator group assignment possible")
        raise MisconfiguredException("OpenID annotator group not set - no annotator group assignment possible")

    if designer_group_name is None or len(designer_group_name) == 0:
        logger.warning("OpenID designer group not set - no designer group assignment possible")
        raise MisconfiguredException("OpenID designer group not set - no designer group assignment possible")

    if admin_group_name is None or len(admin_group_name) == 0:
        logger.warning("OpenID admin group not set - no admin group assignment possible")
        raise MisconfiguredException("OpenID admin group not set - no administrator group assignment possible")

    # check if user belongs to groups specified in config
    admin_group_name = admin_group_name.lower()
    annotator_group_name = annotator_group_name.lower()
    user_has_annotator_group: bool = annotator_group_name in map(str.lower, groups)
    user_has_designer_group: bool = designer_group_name in map(str.lower, groups)
    user_has_admin_group: bool = admin_group_name in map(str.lower, groups)

    # map groups from provider to user roles in db
    user_roles = []
    if user_has_annotator_group:
        user_roles.append(roles.ANNOTATOR)
    if user_has_designer_group:
        user_roles.append(roles.DESIGNER)
    if user_has_admin_group:
        user_roles.append(roles.ADMINISTRATOR)

    # no role = no access
    if len(user_roles) < 1:
        raise Forbidden("User does not have required groups at IDP")

    return user_roles


def update_user_roles(user: DBUser, new_roles: list[str]) -> None:
    """Sync the DB roles of *user* so they match exactly what the IDP mandates.

    Roles present in the DB but not in ``needed_roles_by_openid`` are removed.
    Roles required by the IDP but not yet in the DB are added.

    Args:
        user: The local DB user whose roles should be synchronised.
        new_roles: The roles the user should have according to IDP
    """
    needed_role_names: set[str] = set(new_roles)
    current_user_roles: list = user.roles  # list[UserRoles]
    current_role_names: set[str] = {ur.role.name for ur in current_user_roles}

    roles_to_remove = [ur for ur in current_user_roles if ur.role.name not in needed_role_names]
    roles_to_add = needed_role_names - current_role_names

    if not roles_to_remove and not roles_to_add:
        logger.debug("Roles already in sync for user id=%s", user.idx)
        return

    dbm = DBMan(_CONFIG)
    try:
        for ur in roles_to_remove:
            logger.info(
                "Removing role '%s' from user id=%s (not granted by IDP)",
                ur.role.name,
                user.idx,
            )
            dbm.delete(ur)

        for role_name in roles_to_add:
            role = dbm.get_role_by_name(role_name)
            if role is None:
                logger.warning("Role '%s' required by IDP not found in DB – skipping", role_name)
                continue
            logger.info(
                "Adding role '%s' to user id=%s (granted by IDP)",
                role_name,
                user.idx,
            )
            dbm.save_obj(UserRoles(user_id=user.idx, role_id=role.idx))

        dbm.commit()
    except Exception:
        dbm.close_session()
        raise
    else:
        dbm.close_session()


# ---------------------------------------------------------------------------
# Task 6 – Issue a local token pair, store under a temp code, and redirect
# ---------------------------------------------------------------------------


def build_token_redirect(user: DBUser):
    """Issue a local JWT pair for *user*, store it under a one-time temp code
    in the DB, and redirect the frontend to the callback page with only the
    temp code in the URL.

    Storing the actual tokens server-side and passing only a short-lived,
    single-use opaque code in the redirect prevents JWTs from appearing in
    browser history, referrer headers, or server logs.

    The browser is redirected to::

        {FRONTEND_URL}/auth/callback?code=<temp_code>

    The frontend must then POST ``{"code": "<temp_code>"}`` to
    ``/api/v1/auth/openid/token`` to exchange the code for the real tokens.
    The code expires after 60 seconds and is deleted on first use.

    Args:
        user: A fully-loaded local :class:`~lost.db.model.User` instance.

    Returns:
        A Flask :class:`~flask.Response` with status 302.
    """
    # username and password is intentionally empty
    # we already authenticated the user and just want to create the JWT
    dbm = DBMan(_CONFIG)
    lm = LoginManager(dbm, "", "")
    access_token, refresh_token = lm.create_jwt(user.idx, user.user_name, user.roles)

    temp_code = secrets.token_urlsafe(32)
    now = datetime.datetime.now(datetime.UTC)
    dbm.save_obj(
        OidcTempCode(
            code=temp_code,
            access_token=access_token,
            refresh_token=refresh_token,
            created_at=now,
            expires_at=now + datetime.timedelta(seconds=_TEMP_CODE_TTL),
        )
    )

    frontend_url = _CONFIG.frontend_url.rstrip("/")
    redirect_url = f"{frontend_url}/auth/callback?code={temp_code}"

    logger.debug("Redirecting authenticated user id=%s to frontend", user.idx)
    return redirect(redirect_url, code=302)


# ---------------------------------------------------------------------------
# Task 7 – Exchange a temp code for the real JWT pair
# ---------------------------------------------------------------------------


def exchange_temp_code(code: str) -> dict:
    """Validate and consume a one-time temp *code*, returning the JWT pair.

    Looks up the code in the db, deletes it immediately (single-use), and
    returns the stored ``{token, refreshToken}`` dict.

    Args:
        code: The opaque temp code received from the frontend.

    Returns:
        dict: ``{"token": <access_token>, "refreshToken": <refresh_token>}``

    Raises:
        ValueError: If the code is missing, expired, or has already been used.
    """
    if not code:
        raise ValueError("No code provided")

    # Atomic get-and-delete: fetch then immediately remove so the code can
    # only be used once even under concurrent requests.
    dbm = DBMan(_CONFIG)
    try:
        entry = dbm.get_and_delete_oidc_temp_code(code)
    finally:
        dbm.close_session()

    if entry is None:
        logger.warning("Temp code not found or already used: %s…", code[:8])
        raise ValueError("Invalid or expired code")

    logger.debug("Temp code exchanged successfully")
    return {"token": entry.access_token, "refreshToken": entry.refresh_token}
