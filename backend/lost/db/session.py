"""Shared database session infrastructure for both Flask and FastAPI.

Centralizes SQLAlchemy engine creation so the engine is created **once** at module
import time (not per-request as ``DBMan.__init__`` does today — 144 endpoints ×
``create_engine`` per request is wasteful).

Provides ``get_db()`` — a FastAPI dependency that yields a ``DBMan``-wrapped
session and auto-closes it. Flask endpoints can also adopt this (optional).

Usage in FastAPI::

    from lost.db.session import get_db

    @router.get("")
    def list_users(dbm: DBMan = Depends(get_db)):
        return dbm.get_users()

Usage in Flask (optional, replaces per-endpoint boilerplate)::

    from lost.db.session import get_dbman

    def get(self):
        dbm = get_dbman()
        try:
            ...
        finally:
            dbm.close_session()
"""

from __future__ import annotations

from typing import Iterator

import sqlalchemy
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool

from lost.db.access import DBMan, convert_connection_str

# Import LOST_CONFIG lazily to avoid circular imports at module load time
_engine = None
_SessionLocal = None


def _get_config():
    """Get LOST_CONFIG (imported lazily to avoid early import)."""
    from lost.settings import LOST_CONFIG

    return LOST_CONFIG


def _ensure_engine():
    """Create the engine + session factory once (singleton)."""
    global _engine, _SessionLocal
    if _engine is None:
        config = _get_config()
        conn_str = convert_connection_str(config)
        _engine = sqlalchemy.create_engine(conn_str, echo=False, poolclass=NullPool)
        _SessionLocal = sessionmaker(bind=_engine)
    return _engine, _SessionLocal


def get_db() -> Iterator[DBMan]:
    """FastAPI dependency: yield a DBMan session, auto-close on exit.

    Usage::

        @router.get("")
        def list_users(dbm: DBMan = Depends(get_db)):
            ...

    The session is closed in the ``finally`` block — no manual
    ``dbm.close_session()`` needed in the endpoint body.
    """
    _ensure_engine()
    config = _get_config()
    dbm = DBMan(config)
    try:
        yield dbm
    finally:
        dbm.close_session()


def get_dbman() -> DBMan:
    """Get a DBMan session for manual use (Flask endpoints, CLI, tests).

    Caller is responsible for calling ``dbm.close_session()`` when done.

    Usage::

        dbm = get_dbman()
        try:
            users = dbm.get_users()
        finally:
            dbm.close_session()
    """
    _ensure_engine()
    config = _get_config()
    return DBMan(config)


# Compatibility: expose the engine for tools that need it directly
def get_engine() -> sqlalchemy.Engine:
    """Return the shared SQLAlchemy engine (created once)."""
    engine, _ = _ensure_engine()
    return engine


def get_session_factory() -> sessionmaker:
    """Return the shared sessionmaker (created once)."""
    _, factory = _ensure_engine()
    return factory
