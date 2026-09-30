"""User namespace — FastAPI endpoints for user management and auth.

Pass 2 CCB split, D2-pure: routes, schemas, response construction — and the
transport boundary for domain errors. Business raises PLAIN domain errors
(no HTTP vocabulary); this endpoint catches them and builds the byte-exact
legacy responses via Responses. The global DomainError handler remains only
as a loud fallback (un-transcribed error -> 500)

Routes:
    GET    /api/user                    — list users (admin)
    POST   /api/user                    — create user (admin)
    GET    /api/user/anno_task_user      — list anno task users (designer)
    GET    /api/user/self               — get current user
    PATCH  /api/user/self               — update current user
    GET    /api/user/{user_id}          — get user by ID (admin)
    DELETE /api/user/{user_id}          — delete user (admin)
    PATCH  /api/user/{user_id}          — update user (admin)
    POST   /api/user/logout             — logout (revoke token)
    POST   /api/user/refresh            — refresh token pair
    POST   /api/user/login              — login (get JWT pair)
    POST   /api/user/token              — create long-lived token
"""
from __future__ import annotations

from fastapi import APIRouter, Depends
from fastapi.security import HTTPAuthorizationCredentials
from pydantic import BaseModel

from lost.controllers.base import ProfilingRoute
from lost.controllers.Dependencies import get_current_user, get_user_coordination, oauth2_scheme, require_role
from lost.controllers.Responses import Responses
from lost.controllers.user.UserBusiness import (
    InvalidCredentialsError,
    InvalidRefreshTokenError,
    InvalidUserAuthError,
    SelfDeleteError,
    UserExistsError,
    UserNotFoundMessageError,
)
from lost.controllers.user.UserCoordination import UserCoordination
from lost.db import roles
from lost.db.model import User as DBUser

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


# --- Routes ---

@router.get("")
def get_users(
    user: DBUser = Depends(require_role(roles.ADMINISTRATOR)),
    coord: UserCoordination = Depends(get_user_coordination),
):
    """List all users (admin only). Removes user-default groups from each user."""
    return coord.get_users()


@router.post("")
def create_user(
    req: CreateUserRequest,
    user: DBUser = Depends(require_role(roles.ADMINISTRATOR)),
    coord: UserCoordination = Depends(get_user_coordination),
):
    """Create a new user (admin only). Existing name/email → 200 message."""
    try:
        result = coord.create_user(req)
    except UserExistsError:
        return Responses.ok({"message": "User already exists."})
    else:
        return result


@router.get("/anno_task_user")
def get_anno_task_users(
    user: DBUser = Depends(require_role(roles.DESIGNER)),
    coord: UserCoordination = Depends(get_user_coordination),
):
    """List all users for anno task assignment (designer). Strips sensitive info."""
    return coord.get_anno_task_users()


@router.get("/self")
def get_self(
    user: DBUser = Depends(get_current_user),
    coord: UserCoordination = Depends(get_user_coordination),
):
    """Get current authenticated user."""
    return coord.get_self(user)


@router.patch("/self")
def update_self(
    req: UpdateSelfRequest,
    user: DBUser = Depends(get_current_user),
    coord: UserCoordination = Depends(get_user_coordination),
):
    """Update current user's own profile."""
    return coord.update_self(user, req)


@router.get("/{user_id}")
def get_user_by_id(
    user_id: int,
    user: DBUser = Depends(require_role(roles.ADMINISTRATOR)),
    coord: UserCoordination = Depends(get_user_coordination),
):
    """Get a user by ID (admin only).Legacy 200-message not-found."""
    try:
        result = coord.get_user(user_id)
    except UserNotFoundMessageError:
        return Responses.ok(f"User with ID '{user_id}' not found.")
    else:
        return result


@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    user: DBUser = Depends(require_role(roles.ADMINISTRATOR)),
    coord: UserCoordination = Depends(get_user_coordination),
):
    """Delete a user by ID (admin only). Cannot delete yourself."""
    try:
        result = coord.delete_user(user, user_id)
    except SelfDeleteError:
        return Responses.ok("You are not able to delete yourself")
    except UserNotFoundMessageError:
        return Responses.ok(f"User with ID '{user_id}' not found.")
    else:
        return result


@router.patch("/{user_id}")
def update_user(
    user_id: int,
    req: UpdateUserRequest,
    user: DBUser = Depends(require_role(roles.ADMINISTRATOR)),
    coord: UserCoordination = Depends(get_user_coordination),
):
    """Update a user by ID (admin only)."""
    try:
        result = coord.update_user(user_id, req)
    except UserNotFoundMessageError:
        return Responses.ok(f"User with ID '{user_id}' not found.")
    else:
        return result


@router.post("/logout")
def logout(
    credentials: HTTPAuthorizationCredentials = Depends(oauth2_scheme),
    user: DBUser = Depends(get_current_user),
    coord: UserCoordination = Depends(get_user_coordination),
):
    """Logout — revoke current JWT."""
    return coord.logout(user, credentials.credentials)


@router.post("/refresh")
def refresh_token(
    credentials: HTTPAuthorizationCredentials = Depends(oauth2_scheme),
    coord: UserCoordination = Depends(get_user_coordination),
):
    """Refresh — return new JWT pair using refresh token."""
    try:
        result = coord.refresh(credentials.credentials)
    except InvalidRefreshTokenError:
        return Responses.ok({"message": "Invalid refresh token"})
    except InvalidUserAuthError:
        return Responses.ok({"message": "Invalid user"})
    else:
        return result


@router.post("/login")
def login(
    req: LoginRequest,
    coord: UserCoordination = Depends(get_user_coordination),
):
    """Login — return JWT pair using userName and password."""
    try:
        result = coord.login(req)
    except InvalidCredentialsError:
        return Responses.ok({"message": "Invalid credentials"})
    else:
        return result


@router.post("/token")
def create_long_lived_token(
    user: DBUser = Depends(get_current_user),
    coord: UserCoordination = Depends(get_user_coordination),
):
    """Create a long-lived token (3650 days) using an existing short-lived token."""
    return coord.long_lived_token(user)
