"""Conftest for OpenID Connect endpoint tests.

Sets up:
- Real RSA-2048 keypair (session-scoped)
- Config mock on openid_service._CONFIG (autouse, 12 attributes)
- JWKS client mock (autouse)
- JWKS cache reset (autouse, before each test)
- Minimal Flask app with only the openid namespace (no dask/triton/AppFileMan)
- DB session for cleanup
- Test user cleanup fixture
"""

from __future__ import annotations

import os
import pytest

# LOST_SECRET_KEY must be set before importing anything from lost
os.environ.setdefault("LOST_SECRET_KEY", "test-secret-key-for-oidc-tests")

from lost.api.auth.services import openid_service
from lost.db import access
from lost.db.model import User as DBUser
from lost.settings import LOST_CONFIG
from tests.auth.mocks import generate_rsa_keypair, _FakeJwksClient


# ---------------------------------------------------------------------------
# Session-scoped fixtures
# ---------------------------------------------------------------------------

@pytest.fixture(scope="session")
def rsa_keypair():
    """Generate a real RSA-2048 keypair once per session."""
    return generate_rsa_keypair()


@pytest.fixture(autouse=True, scope="session")
def patch_openid_config():
    """Patch openid_service._CONFIG with test values (session-scoped)."""
    cfg = openid_service._CONFIG
    original = {}
    attrs = {
        "openid_auth_endpoint": "https://fake-idp.test/auth",
        "openid_token_endpoint": "https://fake-idp.test/token",
        "openid_jwks_uri": "https://fake-idp.test/jwks",
        "openid_client_id": "test-client-id",
        "openid_client_secret": "test-secret",
        "openid_redirect_uri": "http://localhost:8000/api/auth/callback",
        "oidc_jwt_issuer": "https://fake-idp.test/issuer",
        "oidc_jwt_algorithm": "RS256",
        "frontend_url": "http://localhost:3000",
        "openid_annotator_group_name": "lost-annotators",
        "openid_designer_group_name": "lost-designers",
        "openid_admin_group_name": "lost-admins",
    }
    for key, value in attrs.items():
        original[key] = getattr(cfg, key, None)
        setattr(cfg, key, value)
    yield
    # Restore original values
    for key, value in original.items():
        setattr(cfg, key, value)


@pytest.fixture(autouse=True, scope="session")
def patch_jwks_client(rsa_keypair):
    """Patch openid_service._get_jwks_client to return a _FakeJwksClient."""
    _, public_key = rsa_keypair
    original = openid_service._get_jwks_client
    def fake_get_jwks_client():
        return _FakeJwksClient(public_key)
    openid_service._get_jwks_client = fake_get_jwks_client
    yield
    openid_service._get_jwks_client = original


@pytest.fixture(autouse=True)
def reset_jwks_cache():
    """Reset the JWKS client cache before each test so the patched factory is called fresh."""
    openid_service._jwks_client = None


# ---------------------------------------------------------------------------
# Function-scoped fixtures
# ---------------------------------------------------------------------------
@pytest.fixture
def minimal_flask_app():
    """Create a minimal Flask app with only the openid namespace.
    Creates a FRESH Api instance (not the global lost.api.api singleton)
    to avoid 'setup already finished' errors from the production app.
    """
    from flask import Flask, Blueprint
    from flask_jwt_extended import JWTManager
    from flask_restx import Api
    from lost.api.auth.OpenidEndpoint import namespace as openid_namespace
    from lost.settings import LOST_CONFIG
    app = Flask(__name__)
    app.config["SECRET_KEY"] = LOST_CONFIG.secret_key
    app.config["TESTING"] = True
    JWTManager(app)
    # Fresh Api instance — NOT the global singleton
    test_api = Api(
        title="LOST Test API",
        version="test",
        description="Minimal API for OpenID tests",
        authorizations={"apikey": {"type": "apiKey", "in": "header", "name": "Authorization"}},
    )
    test_api.add_namespace(openid_namespace)
    blueprint = Blueprint("api", __name__, url_prefix="/api")
    test_api.init_app(blueprint)
    app.register_blueprint(blueprint)
    with app.test_client() as client:
        yield app, client


@pytest.fixture
def dbm():
    """DB session for direct DB access (cleanup)."""
    db = access.DBMan(LOST_CONFIG)
    yield db
    db.close_session()


@pytest.fixture
def cleanup_oidc_user(dbm):
    """Clean up test users created during OpenID tests."""
    yield
    # Delete any test user created by the tests
    test_user = dbm.find_user_by_user_name("test_user")
    if test_user:
        # Delete user roles
        for ur in test_user.roles:
            dbm.delete(ur)
            dbm.commit()
        # Delete user groups
        for ug in test_user.groups:
            if ug.group.is_user_default:
                dbm.delete(ug.group)
                dbm.commit()
            dbm.delete(ug)
            dbm.commit()
        dbm.delete(test_user)
        dbm.commit()