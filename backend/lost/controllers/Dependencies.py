"""Endpoint-layer wiring — per-request dependency factories.

Holds ALL endpoint wiring: authentication (get_current_user / require_role,
moved from auth/dependencies.py) and the per-module coordination service
factories. Layers below the endpoint (coordination/business) never import
this file — it imports fastapi and knows the whole object graph.
"""
from __future__ import annotations

import jwt as pyjwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from lost.controllers.AuthorizationService import AuthorizationService
from lost.controllers.label.LabelBusiness import LabelBusiness
from lost.controllers.label.LabelCoordination import LabelCoordination
from lost.controllers.group.GroupBusiness import GroupBusiness
from lost.controllers.group.GroupCoordination import GroupCoordination
from lost.controllers.worker.WorkerBusiness import WorkerBusiness
from lost.controllers.worker.WorkerCoordination import WorkerCoordination
from lost.controllers.system.SystemBusiness import SystemBusiness
from lost.controllers.system.SystemCoordination import SystemCoordination
from lost.controllers.config.ConfigBusiness import ConfigBusiness
from lost.controllers.config.ConfigCoordination import ConfigCoordination

from lost.db.model import User as DBUser
from lost.db.access import DBMan
from lost.db.session import get_db
from lost.db.redis import is_token_revoked
from lost.settings import LOST_CONFIG

# Bearer token scheme for Swagger UI "Authorize" button
oauth2_scheme = HTTPBearer()

SECRET_KEY = LOST_CONFIG.secret_key
ALGORITHM = "HS256"


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(oauth2_scheme),
    dbm: DBMan = Depends(get_db),
) -> DBUser:
    """Decode JWT, check blacklist, load User from DB."""
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    token = credentials.credentials
    try:
        payload = pyjwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload.get("sub", 0))
        jti = payload.get("jti")
    except pyjwt.PyJWTError:
        raise credentials_exception
    if is_token_revoked(jti):
        raise HTTPException(status_code=401, detail="Token has been revoked")
    user = dbm.get_user_by_id(user_id)
    if user is None:
        raise credentials_exception
    return user


def require_role(*allowed_roles: str):
    """Dependency factory: require the authenticated user to have one of the given roles."""

    def dependency(user: DBUser = Depends(get_current_user)) -> DBUser:
        if not user.has_role(*allowed_roles):
            raise HTTPException(
                status_code=403,
                detail=f"You need to be one of {allowed_roles} in order to perform this request.",
            )
        return user

    return dependency

def get_label_coordination(dbm: DBMan = Depends(get_db)) -> LabelCoordination:
    """Wire the label coordination service with its collaborators."""
    return LabelCoordination(LabelBusiness(dbm, AuthorizationService()))

def get_group_coordination(dbm: DBMan = Depends(get_db)) -> GroupCoordination:
    """Wire the group coordination service with its collaborators."""
    return GroupCoordination(GroupBusiness(dbm))

def get_worker_coordination(dbm: DBMan = Depends(get_db)) -> WorkerCoordination:
    """Wire the worker coordination service with its collaborators."""
    return WorkerCoordination(WorkerBusiness(dbm))

def get_system_coordination() -> SystemCoordination:
    """Wire the system coordination service with its collaborators."""
    return SystemCoordination(SystemBusiness())

def get_config_coordination(dbm: DBMan = Depends(get_db)) -> ConfigCoordination:
    """Wire the config coordination service with its collaborators."""
    return ConfigCoordination(ConfigBusiness(dbm))