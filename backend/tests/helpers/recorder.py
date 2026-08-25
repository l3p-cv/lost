"""Golden-snapshot recorder.

Captures HTTP responses from the test client and saves them as golden snapshots
when ``--record`` is passed. Also provides ``capture()`` for fetching live
responses (used in both record and compare paths).

Test pattern::

    spec = RequestSpec(method="GET", path="/api/user/self", headers=auth_headers)
    actual = recorder.capture(client, spec)
    gpath = recorder.snapshot_path("user", spec)

    if record:
        recorder.save(gpath, actual)

    golden = comparator.load_golden(gpath)
    comparator.assert_equal(golden, actual, mode="structural")

When ``--record`` is set, the test captures → saves → loads → compares in one
step, so a broken recording surfaces as an immediate test failure before the
developer can commit the snapshot.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import Any

from tests.helpers.comparator import normalize, save_golden


# ---------------------------------------------------------------------------
# RequestSpec — describes a single HTTP request to capture
# ---------------------------------------------------------------------------


@dataclass
class RequestSpec:
    """A single HTTP request specification for snapshot capture.

    Attributes:
        method: HTTP method (GET, POST, PATCH, DELETE, ...).
        path: URL path (e.g. "/api/user/self").
        headers: Dict of headers (e.g. Authorization).
        json: Optional JSON body (for POST/PATCH).
        params: Optional query parameters dict.
        data: Optional form data (for multipart/form-data).
        files: Optional files dict (for file uploads).
        label: Optional override for the snapshot filename
               (defaults to "<METHOD>_<sanitized_path>").
        mode: Comparison mode for this spec ("structural" | "exact" | "binary").
              Defaults to "structural".
    """

    method: str
    path: str
    headers: dict[str, str] = field(default_factory=dict)
    json: Any = None
    params: dict[str, Any] | None = None
    data: dict[str, Any] | None = None
    files: dict[str, Any] | None = None
    label: str | None = None
    mode: str = "structural"


# ---------------------------------------------------------------------------
# Path sanitization — turn "/api/user/<int:id>" into "GET_api_user_id"
# ---------------------------------------------------------------------------


def _sanitize_path(path: str) -> str:
    """Convert a URL path into a filesystem-safe filename component.

    "/api/user/self" → "api_user_self"
    "/api/user/42"   → "api_user_42"
    "/api/sia/image/5/thumbnail" → "api_sia_image_5_thumbnail"
    """
    # Replace slashes with underscores, strip leading underscore
    safe = path.strip("/").replace("/", "_")
    # Replace any remaining non-alphanumeric chars with underscores
    safe = re.sub(r"[^a-zA-Z0-9_]", "_", safe)
    return safe


def snapshot_path(namespace: str, spec: RequestSpec) -> str:
    """Generate the golden snapshot relative path for a given spec.

    Args:
        namespace: The namespace dir (e.g. "user", "sia").
        spec: The RequestSpec.

    Returns:
        Relative path like "user/GET_api_user_self.json".
    """
    if spec.label:
        name = spec.label
    else:
        name = f"{spec.method.upper()}_{_sanitize_path(spec.path)}"
    return f"{namespace}/{name}.json"


# ---------------------------------------------------------------------------
# Capture — send a request and return the normalized response
# ---------------------------------------------------------------------------


def capture(client, spec: RequestSpec) -> dict:
    """Send a request via the test client and return the normalized response.

    Args:
        client: A Flask test client (or FastAPI TestClient in P1.2).
        spec: The request specification.

    Returns:
        A dict with keys: ``{"request": {...}, "response": {"status", "headers", "body"}}``.
        The request section has Authorization redacted. The response is normalized
        (IDs/tokens/timestamps redacted, volatile headers stripped).
    """
    # Build kwargs for the client request
    kwargs: dict[str, Any] = {"headers": spec.headers}

    # Multipart upload: merge data + files into a single data dict
    is_fastapi = not hasattr(client, "open")
    if spec.files is not None:
        if is_fastapi:
            kwargs["files"] = spec.files
            if spec.data:
                kwargs["data"] = spec.data
        else:
            form_data = dict(spec.data or {})
            for field_name, file_tuple in spec.files.items():
                form_data[field_name] = file_tuple
            kwargs["data"] = form_data
            kwargs["content_type"] = "multipart/form-data"
        # FastAPI TestClient auto-detects multipart from files in data
    elif spec.data is not None:
        kwargs["data"] = spec.data
    elif spec.json is not None:
        kwargs["json"] = spec.json

    if spec.params is not None:
        # Flask: query_string, FastAPI: params
        if hasattr(client, "open"):  # Flask test client
            kwargs["query_string"] = spec.params
        else:  # FastAPI TestClient
            kwargs["params"] = spec.params

    method = spec.method.lower()
    resp = getattr(client, method)(spec.path, **kwargs)

    # Extract response data
    status = resp.status_code
    headers = dict(resp.headers)

    # Determine body: JSON if possible, else text, else binary metadata
    content_type = headers.get("Content-Type", headers.get("content-type", ""))
    # Get raw data — Flask uses get_data(), FastAPI TestClient uses .content
    raw_data = resp.get_data() if hasattr(resp, "get_data") else resp.content
    if "application/json" in content_type:
        # Handle empty bodies (e.g. 204 No Content) gracefully
        if raw_data:
            # Flask: resp.get_json(), FastAPI: resp.json()
            body = resp.get_json() if hasattr(resp, "get_json") else resp.json()
        else:
            body = None
    elif "text" in content_type or "html" in content_type:
        body = raw_data.decode("utf-8", errors="replace") if raw_data else None
    else:
        # Binary response — store metadata (JSON-serializable), not raw bytes
        if raw_data:
            import hashlib as _hashlib

            body = {
                "_binary": True,
                "content_type": content_type,
                "sha256": _hashlib.sha256(raw_data).hexdigest(),
                "size": len(raw_data),
            }
        else:
            body = None

    # Normalize response (redact, strip headers)
    normalized_response = normalize({"status": status, "headers": headers, "body": body})

    # Build request spec for storage (redact Authorization)
    stored_headers = dict(spec.headers)
    if "Authorization" in stored_headers:
        stored_headers["Authorization"] = "<AUTH>"
    stored_request = {
        "method": spec.method.upper(),
        "path": spec.path,
        "headers": stored_headers,
    }
    if spec.json is not None:
        stored_request["json"] = spec.json
    if spec.params is not None:
        stored_request["params"] = spec.params

    return {
        "request": stored_request,
        "response": normalized_response,
        "mode": spec.mode,
    }


# ---------------------------------------------------------------------------
# Save — write a captured response as a golden snapshot
# ---------------------------------------------------------------------------


def save(golden_rel_path: str, captured: dict) -> None:
    """Save a captured response as a golden snapshot.

    Args:
        golden_rel_path: Relative path under golden/ (e.g. "user/GET_api_user_self.json").
        captured: The dict returned by ``capture()``.
    """
    save_golden(golden_rel_path, captured)
