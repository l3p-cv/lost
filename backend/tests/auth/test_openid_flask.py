"""Tests for OpenID Connect endpoints (Flask).

Tests the 3 OpenID routes against the Flask app with mocked IDP:
1. GET /login → redirect to fake IDP
2. GET /callback → exchange code, verify token, create user, redirect to frontend
3. POST /token → exchange temp code for JWT pair

Mocks:
- Token endpoint: openid_service.requests.post → _FakeResponse with id_token
- JWKS endpoint: openid_service._get_jwks_client → _FakeJwksClient with test RSA key
- Config: openid_service._CONFIG patched with test values (via conftest)

"""

from __future__ import annotations

from urllib.parse import urlparse, parse_qs

import jwt
import pytest

from lost.api.auth.services import openid_service
from lost.settings import LOST_CONFIG
from tests.auth.mocks import (
    fake_post_factory,
    create_id_token,
    default_claims,
)


# ---------------------------------------------------------------------------
# Test 1: GET /login → 302 redirect to fake IDP
# ---------------------------------------------------------------------------
def test_login_redirect(minimal_flask_app):
    """GET /login should redirect to the fake IDP with state + nonce in URL."""
    app, client = minimal_flask_app
    resp = client.get("/api/auth/openid/login")
    assert resp.status_code == 302
    location = resp.headers["Location"]
    assert "https://fake-idp.test/auth" in location
    # Verify state and nonce are in the redirect URL
    params = parse_qs(urlparse(location).query)
    assert "state" in params
    assert "nonce" in params
    assert "client_id" in params
    assert params["client_id"][0] == "test-client-id"


# ---------------------------------------------------------------------------
# Test 2: GET /callback → happy path (full callback flow)
# ---------------------------------------------------------------------------
def test_callback_happy_path(minimal_flask_app, rsa_keypair, cleanup_oidc_user, monkeypatch):
    """GET /callback with valid code + state → 302 redirect to frontend with temp code."""
    app, client = minimal_flask_app
    private_key, public_key = rsa_keypair
    # Step 1: GET /login to establish session state + nonce
    resp = client.get("/api/auth/openid/login")
    assert resp.status_code == 302
    location = resp.headers["Location"]
    params = parse_qs(urlparse(location).query)
    state = params["state"][0]
    nonce = params["nonce"][0]
    # Step 2: Build a valid id_token signed with the test private key
    claims = default_claims(nonce=nonce, groups=["lost-admins"])
    id_token = create_id_token(private_key, claims)
    # Step 3: Mock the token endpoint
    fake_post = fake_post_factory(id_token=id_token)
    monkeypatch.setattr(openid_service.requests, "post", fake_post)
    # Step 4: GET /callback with the state from login + a test code
    resp = client.get(f"/api/auth/openid/callback?code=test-auth-code&state={state}")
    assert resp.status_code == 302
    redirect_url = resp.headers["Location"]
    assert "http://localhost:3000/auth/callback" in redirect_url
    assert "code=" in redirect_url
    # Step 5: Verify the temp code is in the redirect URL
    temp_code = parse_qs(urlparse(redirect_url).query).get("code", [None])[0]
    assert temp_code is not None
    # Step 6: Verify user was created in DB
    from lost.db import access
    dbm = access.DBMan(LOST_CONFIG)
    user = dbm.find_user_by_user_name("test_user")
    assert user is not None
    assert user.email == "test_user@test.local"
    dbm.close_session()
    # Step 7: Verify fake_post was called with correct params
    assert len(fake_post.calls) == 1
    call = fake_post.calls[0]
    assert call["data"]["grant_type"] == "authorization_code"
    assert call["data"]["code"] == "test-auth-code"
    assert call["data"]["client_id"] == "test-client-id"


# ---------------------------------------------------------------------------
# Test 3: GET /callback → IDP error
# ---------------------------------------------------------------------------
def test_callback_idp_error(minimal_flask_app):
    """GET /callback with error param → 401."""
    app, client = minimal_flask_app
    resp = client.get("/api/auth/openid/callback?error=access_denied&error_description=User+denied")
    assert resp.status_code == 401
    body = resp.get_json()
    assert "Authentication failed" in body["message"]


# ---------------------------------------------------------------------------
# Test 4: GET /callback → state mismatch
# ---------------------------------------------------------------------------
def test_callback_state_mismatch(minimal_flask_app):
    """GET /callback with wrong state → 400."""
    app, client = minimal_flask_app
    # First, establish a session via login
    client.get("/api/auth/openid/login")
    # Then, callback with wrong state
    resp = client.get("/api/auth/openid/callback?code=test-code&state=wrong-state")
    assert resp.status_code == 400
    body = resp.get_json()
    assert "Invalid state" in body["message"]


# ---------------------------------------------------------------------------
# Test 5: GET /callback → missing code
# ---------------------------------------------------------------------------
def test_callback_missing_code(minimal_flask_app):
    """GET /callback without code param → 400."""
    app, client = minimal_flask_app
    # Establish session
    resp = client.get("/api/auth/openid/login")
    params = parse_qs(urlparse(resp.headers["Location"]).query)
    state = params["state"][0]
    # Callback with state but no code
    resp = client.get(f"/api/auth/openid/callback?state={state}")
    assert resp.status_code == 400
    body = resp.get_json()
    assert "Missing authorization code" in body["message"]


# ---------------------------------------------------------------------------
# Test 6: POST /token → happy path (full flow: login → callback → token)
# ---------------------------------------------------------------------------
def test_token_exchange_happy_path(minimal_flask_app, rsa_keypair, cleanup_oidc_user, monkeypatch):
    """Full flow: login → callback → POST /token → 200 with JWT pair."""
    app, client = minimal_flask_app
    private_key, public_key = rsa_keypair
    # Step 1: Login
    resp = client.get("/api/auth/openid/login")
    params = parse_qs(urlparse(resp.headers["Location"]).query)
    state = params["state"][0]
    nonce = params["nonce"][0]
    # Step 2: Build id_token + mock token endpoint
    claims = default_claims(nonce=nonce, groups=["lost-annotators"])
    id_token = create_id_token(private_key, claims)
    fake_post = fake_post_factory(id_token=id_token)
    monkeypatch.setattr(openid_service.requests, "post", fake_post)
    # Step 3: Callback
    resp = client.get(f"/api/auth/openid/callback?code=test-code&state={state}")
    assert resp.status_code == 302
    temp_code = parse_qs(urlparse(resp.headers["Location"]).query)["code"][0]
    # Step 4: Exchange temp code for JWT pair
    resp = client.post(
        "/api/auth/openid/token",
        json={"code": temp_code},
    )
    assert resp.status_code == 200
    body = resp.get_json()
    assert "token" in body
    assert "refreshToken" in body
    # Step 5: Verify the token is a valid JWT
    decoded = jwt.decode(body["token"], LOST_CONFIG.secret_key, algorithms=["HS256"])
    assert decoded["sub"] is not None  # user ID
    assert "Annotator" in decoded["roles"]  # annotator group → Annotator role


# ---------------------------------------------------------------------------
# Test 7: POST /token → invalid code
# ---------------------------------------------------------------------------
def test_token_exchange_expired_code(minimal_flask_app):
    """POST /token with invalid code → 401."""
    app, client = minimal_flask_app
    resp = client.post(
        "/api/auth/openid/token",
        json={"code": "invalid-code-that-does-not-exist"},
    )
    assert resp.status_code == 401
    body = resp.get_json()
    assert "Invalid or expired" in body["message"]