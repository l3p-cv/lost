"""Mock helpers for OpenID Connect endpoint tests.

Mocks the IDP at the HTTP boundary:
- Token endpoint: patches openid_service.requests.post
- JWKS endpoint: patches openid_service._get_jwks_client

"""

from __future__ import annotations

import json
import datetime

from types import SimpleNamespace
from typing import Callable
import jwt
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import serialization

# ---------------------------------------------------------------------------
# RSA keypair generation (real key, so jwt.decode verification works under test)
# ---------------------------------------------------------------------------
def generate_rsa_keypair() -> tuple[rsa.RSAPrivateKey, rsa.RSAPublicKey]:
    """Generate a real RSA-2048 keypair for signing/verifying test id_tokens."""
    private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    public_key = private_key.public_key()
    return private_key, public_key


def public_key_to_pem(public_key: rsa.RSAPublicKey) -> str:
    """Export public key as PEM string (for debugging only)."""
    pem = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo,
    )
    return pem.decode("utf-8")


# ---------------------------------------------------------------------------
# Fake requests.Response — mimics the subset of requests.Response used by openid_service
# ---------------------------------------------------------------------------
class _FakeResponse:
    """Mimics requests.Response: .status_code, .json(), .text."""
    def __init__(self, status_code: int = 200, payload: dict | None = None):
        self.status_code = status_code
        self._payload = payload or {}
        self.text = json.dumps(self._payload)
    def json(self) -> dict:
        return self._payload


# ---------------------------------------------------------------------------
# Fake PyJWKClient — mimics jwt.PyJWKClient.get_signing_key_from_jwt
# ---------------------------------------------------------------------------
class _FakeJwksClient:
    """Mimics PyJWKClient — returns a fixed signing key for any token."""
    def __init__(self, public_key: rsa.RSAPublicKey):
        self._key = public_key
    def get_signing_key_from_jwt(self, id_token: str) -> SimpleNamespace:
        # openid_service.verify_id_token accesses .key on the result
        return SimpleNamespace(key=self._key)


# ---------------------------------------------------------------------------
# fake_post factory — patches openid_service.requests.post
# ---------------------------------------------------------------------------
def fake_post_factory(
    id_token: str,
    status_code: int = 200,
    token_response: dict | None = None,
) -> Callable:
    """Return a fake_post function that records calls and returns a _FakeResponse.
    Args:
        id_token: The id_token to include in the response (happy path).
        status_code: HTTP status code for the token endpoint response.
        token_response: Override the full response payload (defaults to
                        {"id_token": id_token, "access_token": "fake-access"}).
    Returns:
        A function suitable for monkeypatch.setattr(openid_service.requests, "post", ...)
    """
    calls: list[dict] = []
    def fake_post(url: str, data=None, timeout=None, **kwargs) -> _FakeResponse:
        calls.append({"url": url, "data": data, "timeout": timeout})
        if status_code != 200:
            return _FakeResponse(status_code=status_code, payload={"error": "mock_error"})
        if token_response is not None:
            return _FakeResponse(status_code=200, payload=token_response)
        return _FakeResponse(
            status_code=200,
            payload={"id_token": id_token, "access_token": "fake-access", "token_type": "Bearer"},
        )
    # Attach calls list so tests can inspect what was sent
    fake_post.calls = calls  # type: ignore[attr-defined]
    return fake_post


# ---------------------------------------------------------------------------
# id_token factory — builds and signs a JWT with the test RSA private key
# ---------------------------------------------------------------------------
def default_claims(
    nonce: str,
    username: str = "test_user",
    groups: list[str] | None = None,
    issuer: str = "https://fake-idp.test/issuer",
    audience: str = "test-client-id",
) -> dict:
    """Build standard OIDC claims for a test id_token.
    Args:
        nonce: The nonce from the login session (must match).
        username: The preferred_username claim.
        groups: List of IDP group names (e.g. ["lost-admins"]).
        issuer: Must match oidc_jwt_issuer config.
        audience: Must match openid_client_id config.
    Returns:
        Claims dict suitable for jwt.encode().
    """
    now = datetime.datetime.now(datetime.timezone.utc)
    return {
        "iss": issuer,
        "aud": audience,
        "exp": now + datetime.timedelta(hours=1),
        "iat": now,
        "nonce": nonce,
        "preferred_username": username,
        "email": f"{username}@test.local",
        "given_name": "Test",
        "family_name": "User",
        "name": f"{username}",
        "groups": groups or ["lost-annotators"],
        "sub": f"fake-sub-{username}",
    }


def create_id_token(
    private_key: rsa.RSAPrivateKey,
    claims: dict,
    kid: str = "test-key",
) -> str:
    """Sign a test id_token with the RSA private key (RS256).
    Args:
        private_key: RSA private key from generate_rsa_keypair().
        claims: Claims dict from default_claims() or custom.
        kid: Key ID header (must match what _FakeJwksClient expects).
    Returns:
        Signed JWT string.
    """
    return jwt.encode(claims, private_key, algorithm="RS256", headers={"kid": kid})