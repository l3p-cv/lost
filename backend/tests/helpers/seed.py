"""Test data creation and cleanup helpers for mutate-then-GET tests.

All test entities use the ``compare_test_`` prefix so they're easy to identify
and clean up. The ``--cleanup`` flag force-removes any leftover test data.

Usage in tests::

    def test_create_user(client, auth_headers, seed):
        suffix = seed.unique_suffix()
        # POST to create via the API
        resp = client.post("/api/user", json={"user_name": f"compare_test_{suffix}", ...},
                           headers=auth_headers)
        # ... verify ...
        # Cleanup is automatic via the seed fixture's finalizer
"""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from lost.db import roles
from lost.db.model import Group, User, UserGroups, UserRoles


# Prefix for all test entities — makes cleanup easy and avoids collisions with real data
TEST_PREFIX = "compare_test_"


def unique_suffix() -> str:
    """Generate a unique suffix for test entity names."""
    return uuid.uuid4().hex[:8]


# ---------------------------------------------------------------------------
# User creation / cleanup (direct DB, not via API)
# ---------------------------------------------------------------------------


def create_test_user(dbm, suffix: str | None = None) -> User:
    """Create a test user directly in the DB (bypasses the API).

    Creates:
    - User with user_name ``compare_test_<suffix>``
    - Default group named after the user
    - Annotator role

    Args:
        dbm: A DBMan instance.
        suffix: Optional suffix (defaults to a unique uuid hex).

    Returns:
        The created User object (with ``idx`` populated).
    """
    if suffix is None:
        suffix = unique_suffix()
    user_name = f"{TEST_PREFIX}{suffix}"

    user = User(
        user_name=user_name,
        email=f"{user_name}@test.local",
        email_confirmed_at=datetime.utcnow(),
        password="test",
        first_name="Test",
        last_name="User",
    )
    dbm.save_obj(user)

    # Default group
    g = Group(name=user_name, is_user_default=True)
    dbm.save_obj(g)
    ug = UserGroups(group_id=g.idx, user_id=user.idx)
    dbm.save_obj(ug)

    # Annotator role
    anno_role = dbm.get_role_by_name(roles.ANNOTATOR)
    ur = UserRoles(user_id=user.idx, role_id=anno_role.idx)
    dbm.save_obj(ur)

    dbm.save_obj(user)
    return user


def cleanup_test_user(dbm, user: User | int | str) -> bool:
    """Delete a test user and all associated entities (groups, roles, filesystem).

    Mirrors the delete logic in ``lost/api/user/endpoint.py:166`` (the DELETE endpoint).
    Handles already-deleted entities gracefully (the DELETE endpoint may have partially
    or fully deleted the user before raising an exception).

    Args:
        dbm: A DBMan instance.
        user: A User object, user idx (int), or user_name (str).

    Returns:
        True if the user was found and deleted, False otherwise.
    """
    # Resolve to a User object — use a fresh query to avoid stale session state
    if isinstance(user, User):
        db_user = dbm.get_user_by_id(user.idx)
    elif isinstance(user, int):
        db_user = dbm.get_user_by_id(user)
    elif isinstance(user, str):
        db_user = dbm.find_user_by_user_name(user)
    else:
        return False

    if not db_user:
        return False

    # Delete default group + user-group association (handle already-deleted gracefully)
    try:
        for g in list(db_user.groups):
            if g.group.is_user_default:
                dbm.delete(g.group)
                dbm.commit()
                dbm.delete(g)
                dbm.commit()
    except Exception:
        dbm.session.rollback()

    # Delete all role associations (handle already-deleted gracefully)
    try:
        for r in list(db_user.roles):
            dbm.delete(r)
            dbm.commit()
    except Exception:
        dbm.session.rollback()

    # Delete the user (handle already-deleted gracefully)
    try:
        dbm.delete(db_user)
        dbm.commit()
    except Exception:
        dbm.session.rollback()

    # Delete filesystem entry if exists
    try:
        from lost.logic.file_access import UserFileAccess

        fs_db = dbm.get_user_default_fs(db_user.idx)
        if fs_db:
            ufa = UserFileAccess(dbm, db_user, fs_db)
            ufa.delete_user_default_fs()
    except Exception:
        # Filesystem entry may not exist for test users — safe to ignore
        pass

    return True


# ---------------------------------------------------------------------------
# Bulk cleanup — remove all leftover compare_test_* entities
# ---------------------------------------------------------------------------


def cleanup_all_test_users(dbm) -> int:
    """Force-remove all users whose user_name starts with the test prefix.

    Use with the ``--cleanup`` flag to recover from crashed test runs.

    Args:
        dbm: A DBMan instance.

    Returns:
        Number of users deleted.
    """
    count = 0
    users = dbm.get_users()
    for user in users:
        if user.user_name.startswith(TEST_PREFIX):
            if cleanup_test_user(dbm, user):
                count += 1
    return count


# ---------------------------------------------------------------------------
# Helper for tests: build the JSON body for creating a user via the API
# ---------------------------------------------------------------------------


def user_create_payload(suffix: str | None = None, **overrides) -> dict:
    """Build a JSON payload for POST /api/user (matches create_user_parser expectations).

    Args:
        suffix: Optional suffix (defaults to unique uuid hex).
        **overrides: Override any field (user_name, password, email, groups, roles).

    Returns:
        Dict suitable for ``client.post("/api/user", json=...)``.
    """
    if suffix is None:
        suffix = unique_suffix()
    user_name = f"{TEST_PREFIX}{suffix}"
    payload = {
        "user_name": user_name,
        "password": "test",
        "email": f"{user_name}@test.local",
        "groups": [],
        "roles": [],
    }
    payload.update(overrides)
    return payload
