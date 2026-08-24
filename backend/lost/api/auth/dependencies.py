"""FastAPI auth dependencies — JWT extraction, user loading, role checks.

Replaces Flask's ``@jwt_required()`` + ``get_jwt_identity()`` + ``has_role()`` checks
with FastAPI ``Depends()``-based dependencies.

Token compatibility: tokens minted by Flask's ``flask_jwt_extended.create_access_token``
are decodable by PyJWT ``jwt.decode()`` with the same ``SECRET_KEY`` and ``HS256``.
Both frameworks share the same secret → the SPA's ``Authorization: Bearer <token>``
header works on either.

Usage in FastAPI endpoints (P1.2)::

    from lost.api.auth.dependencies import get_current_user, require_role
    from lost.db.session import get_db
    from lost.db import roles

    @router.get("")
    def list_users(
        user: User = Depends(require_role(roles.ADMINISTRATOR)),
        dbm: DBMan = Depends(get_db),
    ):
        ...

Blacklist: during the P1.2 transition, the in-memory ``set()`` in ``flaskapp.py``
is imported directly (both servers run in the same container). At P1.3, when
Flask is removed, the blacklist moves to Redis/DB and this import changes.
"""

from __future__ import annotations

import jwt as pyjwt
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer

from lost.db.model import User as DBUser
from lost.db.access import DBMan
from lost.db.session import get_db
from lost.settings import LOST_CONFIG

# Blacklist: imported from flaskapp during transition (both in same container)
# At P1.3: replaced by Redis/DB-backed revocation store
from lost.flaskapp import blacklist

# OAuth2 scheme for Swagger UI "Authorize" button
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/user/login")

SECRET_KEY = LOST_CONFIG.secret_key
ALGORITHM = "HS256"


def get_current_user(
    token: str = Depends(oauth2_scheme),
    dbm: DBMan = Depends(get_db),
) -> DBUser:
    """Decode JWT, check blacklist, load User from DB.

    Replaces:
    - ``@jwt_required()`` (token validity check)
    - ``get_jwt_identity()`` (extract user ID)
    - ``@jwt.user_lookup_loader`` (load user roles from DB)
    """
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = pyjwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload.get("sub", 0))
        jti = payload.get("jti")
    except pyjwt.PyJWTError:
        raise credentials_exception

    # Check blacklist (revoked tokens)
    if jti in blacklist:
        raise HTTPException(status_code=401, detail="Token has been revoked")

    # Load user from DB
    user = dbm.get_user_by_id(user_id)
    if user is None:
        raise credentials_exception

    return user


def require_role(*allowed_roles: str):
    """Dependency factory: require the authenticated user to have one of the given roles.

    Usage::

        @router.get("")
        def list_users(user: User = Depends(require_role(roles.ADMINISTRATOR))):
            ...

    Replaces the repeated Flask pattern::

        @jwt_required()
        def get(self):
            identity = get_jwt_identity()
            user = dbm.get_user_by_id(identity)
            if not user.has_role(roles.ADMINISTRATOR):
                return api.abort(403, "You are not authorized.")
    """

    def dependency(user: DBUser = Depends(get_current_user)) -> DBUser:
        if not user.has_role(*allowed_roles):
            raise HTTPException(
                status_code=403,
                detail=f"You need to be one of {allowed_roles} in order to perform this request.",
            )
        return user

    return dependency
