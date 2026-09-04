"""User namespace — FastAPI endpoints for user management and auth.

Routes:
    GET    /api/user                    — list users (admin)
    POST   /api/user                    — create user (admin)
    GET    /api/user/anno_task_user      — list anno task users (designer)
    GET    /api/user/{user_id}           — get user by ID (admin)
    DELETE /api/user/{user_id}          — delete user (admin)
    PATCH  /api/user/{user_id}          — update user (admin)
    GET    /api/user/self               — get current user
    PATCH  /api/user/self               — update current user
    POST   /api/user/logout             — logout (revoke token)
    POST   /api/user/refresh            — refresh token pair
    POST   /api/user/login              — login (get JWT pair)
    POST   /api/user/token              — create long-lived token
"""

from __future__ import annotations

import datetime

import jwt as pyjwt
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials
from pydantic import BaseModel

from lost.api.auth.dependencies import get_current_user, oauth2_scheme, require_role, blacklist
from lost.api.base import ProfilingRoute
from lost.api.user.login_manager import LoginManager
from lost.db import access, roles
from lost.db.model import Group, UserGroups, UserRoles
from lost.db.model import User as DBUser
from lost.db.session import get_db
from lost.logic import dask_session, email
from lost.logic.file_access import UserFileAccess, create_user_default_fs
from lost.logic.user import get_user_default_group, release_user_annos
from lost.settings import LOST_CONFIG

router = APIRouter(tags=["user"], route_class=ProfilingRoute)


# --- Schemas ---


class LoginRequest(BaseModel):
    userName: str
    password: str


class CreateUserRequest(BaseModel):
    user_name: str
    password: str
    email: str
    groups: list[str] = []
    roles: list[str] = []


class UpdateUserRequest(BaseModel):
    email: str
    first_name: str
    last_name: str
    password: str | None = None
    groups: list[str] = []
    roles: list[str] = []


class UpdateSelfRequest(BaseModel):
    email: str
    first_name: str
    last_name: str
    password: str | None = None


# --- Serialization helper (matches Flask restx marshal_with(user) output) ---


def _user_to_dict(user):
    """Convert a User ORM object to a dict matching Flask restx marshal_with(user) output.
    Replicates the custom Roles, Groups, DefaultGroupId formatters from api_definition.py.
    """
    if user is None:
        return {"idx": None, "default_group_id": None, "is_active": None,
                "user_name": None, "email": None, "email_confirmed_at": None,
                "first_name": None, "last_name": None, "confidence_level": None,
                "photo_path": None, "apiToken": None, "new_password": None,
                "groups": [], "roles": [], "is_external": None}
    default_group_id = None
    for ug in user.groups:
        if ug.group and ug.group.is_user_default:
            default_group_id = ug.group.idx
            break
    return {
        "idx": user.idx,
        "default_group_id": default_group_id,
        "is_active": None,
        "user_name": user.user_name,
        "email": user.email,
        "email_confirmed_at": user.email_confirmed_at,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "confidence_level": None,
        "photo_path": None,
        "apiToken": user.api_token,
        "new_password": None,
        "groups": [{"idx": ug.group.idx, "name": ug.group.name,
                     "isUserDefault": ug.group.is_user_default} for ug in user.groups],
        "roles": [{"idx": ur.role.idx, "name": ur.role.name} for ur in user.roles],
        "is_external": user.is_external,
    }


# --- Routes ---


@router.get("")
def get_users(
    user: DBUser = Depends(require_role(roles.ADMINISTRATOR)),
    dbm = Depends(get_db),
):
    """List all users (admin only). Removes user-default groups from each user."""
    users = dbm.get_users()
    for us in users:
        for g in us.groups:
            if g.group and g.group.is_user_default:
                us.groups.remove(g)
    return {"users": [_user_to_dict(us) for us in users]}


@router.post("")
def create_user(
    req: CreateUserRequest,
    user: DBUser = Depends(require_role(roles.ADMINISTRATOR)),
    dbm = Depends(get_db),
):
    """Create a new user (admin only)."""
    existing = None
    if req.email:
        existing = dbm.find_user_by_email(req.email)
    if not existing and req.user_name:
        existing = dbm.find_user_by_user_name(req.user_name)
    if existing:
        return {"message": "User already exists."}
    new_user = DBUser(
        user_name=req.user_name,
        email=req.email,
        email_confirmed_at=datetime.datetime.utcnow(),
        password=req.password,
    )
    dbm.save_obj(new_user)
    g = Group(name=new_user.user_name, is_user_default=True)
    dbm.save_obj(g)
    ug = UserGroups(group_id=g.idx, user_id=new_user.idx)
    dbm.save_obj(ug)
    anno_role = dbm.get_role_by_name(roles.ANNOTATOR)
    ur = UserRoles(user_id=new_user.idx, role_id=anno_role.idx)
    dbm.save_obj(ur)
    if req.roles:
        role_ids = [db_role.role_id for db_role in dbm.get_user_roles(new_user.idx)]
        for role_name in req.roles:
            for item in [item for item in dir(roles) if not item.startswith("__")]:
                name = getattr(roles, item)
                if role_name == name:
                    role = dbm.get_role_by_name(name)
                    if role.idx not in role_ids:
                        ur = UserRoles(user_id=new_user.idx, role_id=role.idx)
                        dbm.save_obj(ur)
    if req.groups:
        for group_name in req.groups:
            group = dbm.get_group_by_name(group_name)
            if group:
                ug = UserGroups(group_id=group.idx, user_id=new_user.idx)
                dbm.save_obj(ug)
    dbm.save_obj(new_user)
    if new_user.has_role(roles.DESIGNER) or new_user.has_role(roles.ADMINISTRATOR):
        expires = datetime.timedelta(days=365000)
        lm = LoginManager(dbm, new_user.user_name, "")
        api_token, _ = lm.create_jwt_pyjwt(new_user.idx, new_user.user_name, new_user.roles, expires)
        new_user.api_token = api_token
        dbm.save_obj(new_user)
        create_user_default_fs(dbm, new_user, g.idx)
    try:
        email.send_new_user(new_user, req.password)
    except Exception:
        pass
    return {"message": "success"}


@router.get("/anno_task_user")
def get_anno_task_users(
    user: DBUser = Depends(require_role(roles.DESIGNER)),
    dbm = Depends(get_db),
):
    """List all users for anno task assignment (designer). Strips sensitive info."""
    users = dbm.get_users()
    result = []
    for u in users:
        d = _user_to_dict(u)
        d["apiToken"] = None
        d["email"] = None
        d["email_confirmed_at"] = None
        # password is not in the dict, but clear it conceptually
        result.append(d)
    return {"users": result}


@router.get("/self")
def get_self(
    user: DBUser = Depends(get_current_user),
):
    """Get current authenticated user."""
    return _user_to_dict(user)


@router.patch("/self")
def update_self(
    req: UpdateSelfRequest,
    user: DBUser = Depends(get_current_user),
    dbm = Depends(get_db),
):
    """Update current user's own profile."""
    user.email = req.email
    user.first_name = req.first_name
    user.last_name = req.last_name
    if req.password:
        user.set_password(req.password)
    dbm.save_obj(user)
    return "success"


@router.get("/{user_id}")
def get_user_by_id(
    user_id: int,
    user: DBUser = Depends(require_role(roles.ADMINISTRATOR)),
    dbm = Depends(get_db),
):
    """Get a user by ID (admin only)."""
    requested = dbm.get_user_by_id(user_id)
    if requested:
        return _user_to_dict(requested)
    return f"User with ID '{user_id}' not found."


@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    user: DBUser = Depends(require_role(roles.ADMINISTRATOR)),
    dbm = Depends(get_db),
):
    """Delete a user by ID (admin only). Cannot delete yourself."""
    if user_id == user.idx:
        return "You are not able to delete yourself"
    requested = dbm.get_user_by_id(user_id)
    if not requested:
        return f"User with ID '{user_id}' not found."
    for g in requested.groups:
        if g.group and g.group.is_user_default:
            dbm.delete(g.group)
            dbm.commit()
            dbm.delete(g)
            dbm.commit()
    for r in requested.roles:
        dbm.delete(r)
        dbm.commit()
    dbm.delete(requested)
    dbm.commit()
    fs_db = dbm.get_user_default_fs(requested.idx)
    if fs_db:
        ufa = UserFileAccess(dbm, requested, fs_db)
        ufa.delete_user_default_fs()
    return "success"


@router.patch("/{user_id}")
def update_user(
    user_id: int,
    req: UpdateUserRequest,
    user: DBUser = Depends(require_role(roles.ADMINISTRATOR)),
    dbm = Depends(get_db),
):
    """Update a user by ID (admin only)."""
    requested = dbm.get_user_by_id(user_id)
    if not requested:
        return f"User with ID '{user_id}' not found."
    if not requested.is_external:
        requested.email = req.email
        requested.first_name = req.first_name
        requested.last_name = req.last_name
    for user_role in dbm.get_user_roles_by_user_id(user_id):
        if requested.user_name != "admin":
            dbm.delete(user_role)
            dbm.commit()
    user_default_group_id = get_user_default_group(dbm, requested.idx)
    user_role_list = []
    if requested.user_name != "admin":
        if req.roles:
            for role_name in req.roles:
                for item in [item for item in dir(roles) if not item.startswith("__")]:
                    name = getattr(roles, item)
                    if role_name == name:
                        role = dbm.get_role_by_name(name)
                        user_role_list.append(role)
                        ur = UserRoles(user_id=requested.idx, role_id=role.idx)
                        dbm.save_obj(ur)
    if len(user_role_list) == 1:
        if requested.has_role(roles.ANNOTATOR):
            fs_db = dbm.get_user_default_fs(requested.idx)
            if fs_db:
                ufa = UserFileAccess(dbm, requested, fs_db)
                ufa.delete_user_default_fs()
        else:
            create_user_default_fs(dbm, requested, user_default_group_id)
    else:
        create_user_default_fs(dbm, requested, user_default_group_id)
    for user_group in dbm.get_user_groups_by_user_id(user_id):
        if user_group.group.is_user_default:
            continue
        dbm.delete(user_group)
        dbm.commit()
    if req.groups:
        for group_name in req.groups:
            group = dbm.get_group_by_name(group_name)
            if group:
                ug = UserGroups(user_id=requested.idx, group_id=group.idx)
                dbm.save_obj(ug)
    if req.password and not requested.is_external:
        requested.set_password(req.password)
    dbm.save_obj(requested)
    return "success"


@router.post("/logout")
def logout(
    credentials: HTTPAuthorizationCredentials = Depends(oauth2_scheme),
    user: DBUser = Depends(get_current_user),
    dbm = Depends(get_db),
):
    """Logout — revoke current JWT."""
    payload = pyjwt.decode(credentials.credentials, LOST_CONFIG.secret_key, algorithms=["HS256"])
    jti = payload.get("jti")
    blacklist.add(jti)
    release_user_annos(dbm, user.idx)
    if LOST_CONFIG.worker_management == "dynamic":
        dask_session.ds_man.shutdown_cluster(user)
    return {"msg": "Successfully logged out"}
@router.post("/refresh")
def refresh_token(
    credentials: HTTPAuthorizationCredentials = Depends(oauth2_scheme),
    dbm = Depends(get_db),
):
    """Refresh — return new JWT pair using refresh token."""
    payload = pyjwt.decode(credentials.credentials, LOST_CONFIG.secret_key, algorithms=["HS256"])
    if payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    user_id = int(payload.get("sub", 0))
    user = dbm.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid user")
    if LOST_CONFIG.worker_management == "dynamic":
        dask_session.ds_man.refresh_user_session(user)
    lm = LoginManager(dbm, user.user_name, "")
    access_token, refresh_token = lm.create_jwt_pyjwt(user.idx, user.user_name, user.roles)
    if access_token and refresh_token:
        return {"token": access_token, "refresh_token": refresh_token}
    raise HTTPException(status_code=401, detail="Invalid user")


@router.post("/login")
def login(
    req: LoginRequest,
    dbm = Depends(get_db),
):
    """Login — return JWT pair using userName and password."""
    user = dbm.find_user_by_user_name(req.userName)
    lm = LoginManager(dbm, req.userName, req.password)
    # Authenticate
    if user and user.check_password(req.password):
        access_token, refresh_token = lm.create_jwt_pyjwt(user.idx, user.user_name, user.roles)
        if LOST_CONFIG.worker_management == "dynamic":
            dask_session.ds_man.create_user_cluster(user)
        return {"token": access_token, "refresh_token": refresh_token}
    return {"message": "Invalid credentials"}


@router.post("/token")
def create_long_lived_token(
    user: DBUser = Depends(get_current_user),
    dbm = Depends(get_db),
):
    """Create a long-lived token (3650 days) using an existing short-lived token."""
    if LOST_CONFIG.worker_management == "dynamic":
        dask_session.ds_man.refresh_user_session(user)
    lm = LoginManager(dbm, user.user_name, "")
    expires = datetime.timedelta(days=3650)
    access_token, _ = lm.create_jwt_pyjwt(user.idx, user.user_name, user.roles, expires)
    if access_token:
        return {"token": access_token}
    raise HTTPException(status_code=401, detail="Invalid user")