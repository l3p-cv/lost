"""User business layer — user management and authentication flows.

No module-specific lost/logic counterpart was moved: ``logic/user.py`` stays
in logic/ (shared — live consumers in logic/file_access.py and
FileBrowserEndpoint.py); login_manager stays in auth/ (shared infra).
Uses shared utils: logic/email, logic/dask_session, logic/file_access,
logic/user, db/redis, auth/login_manager.

Legacy failure flows returning HTTP 200 bodies are modeled as
self-describing DomainError subclasses (http_status=200).
"""
from __future__ import annotations

import datetime

import jwt as pyjwt

from lost.controllers.Exceptions import DomainError
from lost.controllers.user.login_manager import LoginManager
from lost.db import roles
from lost.db.model import Group, UserGroups, UserRoles
from lost.db.model import User as DBUser
from lost.db.redis import revoke_token
from lost.logic import dask_session, email
from lost.logic.file_access import UserFileAccess, create_user_default_fs
from lost.logic.user import get_user_default_group, release_user_annos
from lost.settings import LOST_CONFIG


class UserExistsError(DomainError):
    http_status = 200
    http_body = {"message": "User already exists."}


class UserNotFoundMessageError(DomainError):
    """Legacy 200 string-body not-found message."""
    http_status = 200

    def __init__(self, user_id: int) -> None:
        super().__init__(user_id)
        self.http_body = f"User with ID '{user_id}' not found."


class SelfDeleteError(DomainError):
    http_status = 200
    http_body = "You are not able to delete yourself"


class InvalidCredentialsError(DomainError):
    http_status = 200
    http_body = {"message": "Invalid credentials"}


class InvalidRefreshTokenError(DomainError):
    http_status = 401
    http_body = {"message": "Invalid refresh token"}


class InvalidUserAuthError(DomainError):
    http_status = 401
    http_body = {"message": "Invalid user"}


def user_to_dict(user):
    """User ORM -> dict matching Flask restx marshal_with(user) output.

    Replicates the custom Roles, Groups, DefaultGroupId formatters.
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


class UserBusiness:
    """User business service — user CRUD, auth flows, logout revocation."""

    def __init__(self, dbm) -> None:
        self.dbm = dbm

    # --- queries ---

    def list_users(self) -> dict:
        """All users; user-default groups removed per user (legacy behavior)."""
        users = self.dbm.get_users()
        for us in users:
            for g in us.groups:
                if g.group and g.group.is_user_default:
                    us.groups.remove(g)
        return {"users": [user_to_dict(us) for us in users]}

    def anno_task_users(self) -> dict:
        """All users with sensitive fields stripped."""
        result = []
        for u in self.dbm.get_users():
            d = user_to_dict(u)
            d["apiToken"] = None
            d["email"] = None
            d["email_confirmed_at"] = None
            result.append(d)
        return {"users": result}

    def get_user_dict(self, user_id: int) -> dict:
        requested = self.dbm.get_user_by_id(user_id)
        if not requested:
            raise UserNotFoundMessageError(user_id)
        return user_to_dict(requested)

    def get_self_dict(self, user) -> dict:
        """The authenticated user as API dict (no re-query is needed)"""
        return user_to_dict(user)

    # --- mutations ---

    def create_user(self, req) -> dict:
        existing = None
        if req.email:
            existing = self.dbm.find_user_by_email(req.email)
        if not existing and req.user_name:
            existing = self.dbm.find_user_by_user_name(req.user_name)
        if existing:
            raise UserExistsError(req.user_name)
        new_user = DBUser(
            user_name=req.user_name,
            email=req.email,
            email_confirmed_at=datetime.datetime.utcnow(),
            password=req.password,
        )
        self.dbm.save_obj(new_user)
        g = Group(name=new_user.user_name, is_user_default=True)
        self.dbm.save_obj(g)
        ug = UserGroups(group_id=g.idx, user_id=new_user.idx)
        self.dbm.save_obj(ug)
        anno_role = self.dbm.get_role_by_name(roles.ANNOTATOR)
        ur = UserRoles(user_id=new_user.idx, role_id=anno_role.idx)
        self.dbm.save_obj(ur)
        if req.roles:
            role_ids = [db_role.role_id for db_role in self.dbm.get_user_roles(new_user.idx)]
            for role_name in req.roles:
                for item in [item for item in dir(roles) if not item.startswith("__")]:
                    name = getattr(roles, item)
                    if role_name == name:
                        role = self.dbm.get_role_by_name(name)
                        if role.idx not in role_ids:
                            ur = UserRoles(user_id=new_user.idx, role_id=role.idx)
                            self.dbm.save_obj(ur)
        if req.groups:
            for group_name in req.groups:
                group = self.dbm.get_group_by_name(group_name)
                if group:
                    ug = UserGroups(group_id=group.idx, user_id=new_user.idx)
                    self.dbm.save_obj(ug)
        self.dbm.save_obj(new_user)
        if new_user.has_role(roles.DESIGNER) or new_user.has_role(roles.ADMINISTRATOR):
            expires = datetime.timedelta(days=365000)
            lm = LoginManager(self.dbm, new_user.user_name, "")
            api_token, _ = lm.create_jwt_pyjwt(new_user.idx, new_user.user_name, new_user.roles, expires)
            new_user.api_token = api_token
            self.dbm.save_obj(new_user)
            create_user_default_fs(self.dbm, new_user, g.idx)
        try:
            email.send_new_user(new_user, req.password)
        except Exception:
            pass
        return {"message": "success"}

    def update_self(self, user, req) -> str:
        user.email = req.email
        user.first_name = req.first_name
        user.last_name = req.last_name
        if req.password:
            user.set_password(req.password)
        self.dbm.save_obj(user)
        return "success"

    def delete_user(self, user, user_id: int) -> str:
        if user_id == user.idx:
            raise SelfDeleteError(user_id)
        requested = self.dbm.get_user_by_id(user_id)
        if not requested:
            raise UserNotFoundMessageError(user_id)
        for g in requested.groups:
            if g.group and g.group.is_user_default:
                self.dbm.delete(g.group)
                self.dbm.commit()
                self.dbm.delete(g)
                self.dbm.commit()
        for r in requested.roles:
            self.dbm.delete(r)
            self.dbm.commit()
        self.dbm.delete(requested)
        self.dbm.commit()
        fs_db = self.dbm.get_user_default_fs(requested.idx)
        if fs_db:
            ufa = UserFileAccess(self.dbm, requested, fs_db)
            ufa.delete_user_default_fs()
        return "success"

    def update_user(self, user_id: int, req) -> str:
        requested = self.dbm.get_user_by_id(user_id)
        if not requested:
            raise UserNotFoundMessageError(user_id)
        if not requested.is_external:
            requested.email = req.email
            requested.first_name = req.first_name
            requested.last_name = req.last_name
        for user_role in self.dbm.get_user_roles_by_user_id(user_id):
            if requested.user_name != "admin":
                self.dbm.delete(user_role)
                self.dbm.commit()
        user_default_group_id = get_user_default_group(self.dbm, requested.idx)
        user_role_list = []
        if requested.user_name != "admin":
            if req.roles:
                for role_name in req.roles:
                    for item in [item for item in dir(roles) if not item.startswith("__")]:
                        name = getattr(roles, item)
                        if role_name == name:
                            role = self.dbm.get_role_by_name(name)
                            user_role_list.append(role)
                            ur = UserRoles(user_id=requested.idx, role_id=role.idx)
                            self.dbm.save_obj(ur)
        if len(user_role_list) == 1:
            if requested.has_role(roles.ANNOTATOR):
                fs_db = self.dbm.get_user_default_fs(requested.idx)
                if fs_db:
                    ufa = UserFileAccess(self.dbm, requested, fs_db)
                    ufa.delete_user_default_fs()
            else:
                create_user_default_fs(self.dbm, requested, user_default_group_id)
        else:
            create_user_default_fs(self.dbm, requested, user_default_group_id)
        for user_group in self.dbm.get_user_groups_by_user_id(user_id):
            if user_group.group.is_user_default:
                continue
            self.dbm.delete(user_group)
            self.dbm.commit()
        if req.groups:
            for group_name in req.groups:
                group = self.dbm.get_group_by_name(group_name)
                if group:
                    ug = UserGroups(user_id=requested.idx, group_id=group.idx)
                    self.dbm.save_obj(ug)
        if req.password and not requested.is_external:
            requested.set_password(req.password)
        self.dbm.save_obj(requested)
        return "success"

    # --- auth flows ---

    def logout(self, user, token: str) -> dict:
        """Revoke the current JWT and release locked annos."""
        payload = pyjwt.decode(token, LOST_CONFIG.secret_key, algorithms=["HS256"])
        jti = payload.get("jti")
        expires_at = payload.get("exp")
        if jti and expires_at:
            revoke_token(jti, expires_at)
        release_user_annos(self.dbm, user.idx)
        if LOST_CONFIG.worker_management == "dynamic":
            dask_session.ds_man.shutdown_cluster(user)
        return {"msg": "Successfully logged out"}

    def refresh(self, token: str) -> dict:
        """Exchange a refresh token for a new JWT pair."""
        payload = pyjwt.decode(token, LOST_CONFIG.secret_key, algorithms=["HS256"])
        if payload.get("type") != "refresh":
            raise InvalidRefreshTokenError(token)
        user_id = int(payload.get("sub", 0))
        user = self.dbm.get_user_by_id(user_id)
        if not user:
            raise InvalidUserAuthError(user_id)
        if LOST_CONFIG.worker_management == "dynamic":
            dask_session.ds_man.refresh_user_session(user)
        lm = LoginManager(self.dbm, user.user_name, "")
        access_token, refresh_token = lm.create_jwt_pyjwt(user.idx, user.user_name, user.roles)
        if access_token and refresh_token:
            return {"token": access_token, "refresh_token": refresh_token}
        raise InvalidUserAuthError(user_id)

    def login(self, user_name: str, password: str) -> dict:
        """Authenticate and return a JWT pair."""
        user = self.dbm.find_user_by_user_name(user_name)
        lm = LoginManager(self.dbm, user_name, password)
        if user and user.check_password(password):
            access_token, refresh_token = lm.create_jwt_pyjwt(user.idx, user.user_name, user.roles)
            if LOST_CONFIG.worker_management == "dynamic":
                dask_session.ds_man.create_user_cluster(user)
            return {"token": access_token, "refresh_token": refresh_token}
        raise InvalidCredentialsError(user_name)

    def long_lived_token(self, user) -> dict:
        """Create a long-lived token (3650 days)."""
        if LOST_CONFIG.worker_management == "dynamic":
            dask_session.ds_man.refresh_user_session(user)
        lm = LoginManager(self.dbm, user.user_name, "")
        expires = datetime.timedelta(days=3650)
        access_token, _ = lm.create_jwt_pyjwt(user.idx, user.user_name, user.roles, expires)
        if access_token:
            return {"token": access_token}
