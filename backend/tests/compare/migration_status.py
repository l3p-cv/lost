"""Central registry of which namespaces are migrated to FastAPI.

Update this file when a namespace is migrated in P1.2.
Add the namespace name to the MIGRATED set — all specs in that namespace
automatically use the FastAPI TestClient.

The --target global flag (e.g. --target=fastapi) overrides this for
post-P1.3 when all namespaces are on FastAPI.
"""

MIGRATED: set[str] = {
    "system",
    "worker",
    "label",
    "group",
    "user",
    "filebrowser",
    "instructions",
}


def target_for(namespace: str) -> str:
    """Return 'fastapi' if the namespace is migrated, else 'flask'."""
    return "fastapi" if namespace in MIGRATED else "flask"
