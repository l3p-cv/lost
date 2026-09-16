from redis import Redis

from lost.settings import LOST_CONFIG


redis_client = Redis(
    host=LOST_CONFIG.redis_host,
    port=LOST_CONFIG.redis_port,
    db=LOST_CONFIG.redis_db,
    decode_responses=True,
)


def revoke_token(jti: str, expires_at: int) -> None:
    """Revoke a JWT until its natural expiration time."""
    import time

    ttl = expires_at - int(time.time())

    if ttl > 0:
        redis_client.setex(f"jwt:blacklist:{jti}", ttl, "1")


def is_token_revoked(jti: str | None) -> bool:
    """Return True if the JWT JTI has been revoked."""
    if not jti:
        return False

    return redis_client.exists(f"jwt:blacklist:{jti}") == 1
