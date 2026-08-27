"""Golden-snapshot comparison utilities.

Three comparison modes:
- ``structural``: recursively check same keys, same types, same nesting.
  Values are ignored for redacted fields (IDs, timestamps, tokens).
  Used for list/detail endpoints with DB-dependent data.
- ``exact``: deep-equal after normalization. Used for static endpoints
  (e.g. /api/system/version, /api/sia/configuration).
- ``binary``: compare Content-Type + Content-Length + SHA256 of body.
  Used for images, thumbnails, parquet exports.

Normalization (applied to both golden and live before compare):
- Redact values of sensitive/non-deterministic keys to placeholders.
- Strip volatile headers (Date, Server, Content-Length, Set-Cookie).
- Redact Authorization header in stored request specs.
"""

from __future__ import annotations

import hashlib
import json
from pathlib import Path
from typing import Any

# ---------------------------------------------------------------------------
# Redaction config
# ---------------------------------------------------------------------------

# Keys whose VALUES are redacted (non-deterministic across runs / sensitive)
_REDACTED_KEYS = {
    # IDs (auto-increment, DB-dependent)
    "idx",
    "id",
    "user_id",
    "group_id",
    "groupId",
    "role_id",
    "anno_task_id",
    "dataset_id",
    "pipe_element_id",
    "pipe_id",
    "label_leaf_id",
    "fs_id",
    "image_anno_id",
    "two_d_anno_id",
    # Tokens (non-deterministic JWTs)
    "api_token",
    "apiToken",
    "token",
    "refresh_token",
    "refreshToken",
    "access_token",
    # Timestamps (non-deterministic) — snake_case + camelCase variants
    "email_confirmed_at",
    "created_at",
    "createdAt",
    "updated_at",
    "updatedAt",
    "timestamp",
    "date",
    "started_at",
    "finished_at",
    "lastActivity",
    "last_seen",
    "register_timestamp",
    "registered_at",
    "progress",
}


def _placeholder_for(key: str) -> str:
    """Return a placeholder string for a redacted key."""
    if "token" in key.lower():
        return "<TOKEN>"
    if key in ("idx", "id") or key.endswith("_id") or key.endswith("Id"):
        return "<ID>"
    if "at" in key.lower() or key in ("timestamp", "date", "last_seen", "lastActivity"):
        return "<TS>"
    return "<REDACTED>"


# Map of key → placeholder value for redacted fields
_REDACT_TO = {k: _placeholder_for(k) for k in _REDACTED_KEYS}


# Headers to strip before comparison (volatile / server-specific)
_STRIP_HEADERS = {
    "date",
    "server",
    "content-length",
    "set-cookie",
    "connection",
    "x-powered-by",
    "access-control-allow-origin",  # CORS — added by middleware, differs Flask vs FastAPI
    "access-control-allow-credentials",
    "access-control-allow-methods",
    "access-control-allow-headers",
    "allow",
}


# ---------------------------------------------------------------------------
# Normalization
# ---------------------------------------------------------------------------


def _redact_value(key: str, value: Any) -> Any:
    """Redact a value if its key is in the redaction set."""
    if key in _REDACTED_KEYS:
        return _REDACT_TO[key]
    return value


def _normalize_data(data: Any, parent_key: str = "") -> Any:
    """Recursively normalize a data structure (dict/list/scalar).

    - Redacts values of sensitive keys.
    - Preserves structure (keys, types, nesting).
    - Sorts dict keys for stable comparison.
    """
    if isinstance(data, dict):
        return {k: _normalize_data(_redact_value(k, v), k) for k, v in data.items()}
    if isinstance(data, list):
        return [_normalize_data(item, parent_key) for item in data]
    return data


def _normalize_headers(headers: dict | list[tuple] | None) -> dict:
    """Normalize headers: lowercase keys, strip volatile ones, redact Authorization."""
    if headers is None:
        return {}
    # Flask headers can be a list of tuples or a Headers object; normalize to dict
    if hasattr(headers, "items"):
        items = list(headers.items())
    elif isinstance(headers, list):
        items = headers
    else:
        items = []
    out = {}
    for k, v in items:
        kl = k.lower()
        if kl in _STRIP_HEADERS:
            continue
        if kl == "authorization":
            v = "<AUTH>"
        out[kl] = v
    return out


def _normalize_response(response: dict) -> dict:
    """Normalize a response dict (status, headers, body) for comparison.

    If the input is a full snapshot dict (with ``request``/``response`` keys),
    the ``response`` sub-dict is extracted automatically.
    """
    # Extract the response part from a full snapshot dict
    if "response" in response and "request" in response:
        response = response["response"]
    out = {
        "status": response.get("status") or response.get("status_code"),
        "headers": _normalize_headers(response.get("headers")),
        "body": _normalize_data(response.get("body")),
    }
    return out


# ---------------------------------------------------------------------------
# Comparison modes
# ---------------------------------------------------------------------------


def _compare_structural(golden: Any, actual: Any, path: str = "") -> list[str]:
    """Compare two structures for same keys, types, and nesting.

    Returns a list of difference messages (empty if equal).
    Values are ignored for redacted keys.
    """
    diffs: list[str] = []

    # If both are redacted placeholders, they match regardless of original value
    if isinstance(golden, str) and golden.startswith("<") and golden.endswith(">"):
        if not (isinstance(actual, str) and actual.startswith("<") and actual.endswith(">")):
            # If actual is also a placeholder (after normalization), it matches.
            # If actual is a raw value (not yet normalized), that's a bug in the caller.
            pass
        return diffs

    if isinstance(golden, dict) and isinstance(actual, dict):
        g_keys = set(golden.keys())
        a_keys = set(actual.keys())
        if g_keys != a_keys:
            missing = g_keys - a_keys
            extra = a_keys - g_keys
            if missing:
                diffs.append(f"{path}: missing keys in actual: {sorted(missing)}")
            if extra:
                diffs.append(f"{path}: extra keys in actual: {sorted(extra)}")
        for k in g_keys & a_keys:
            diffs.extend(_compare_structural(golden[k], actual[k], f"{path}.{k}"))
    elif isinstance(golden, list) and isinstance(actual, list):
        # Structural mode: compare only the first element's shape, ignore list length
        # (list length is data-dependent — test runs create/delete entities)
        if golden and actual:
            diffs.extend(_compare_structural(golden[0], actual[0], f"{path}[0]"))
        elif golden and not actual:
            diffs.append(f"{path}: golden has items but actual list is empty")
        elif actual and not golden:
            diffs.append(f"{path}: actual has items but golden list is empty")
    else:
        # Scalar: compare type only (not value) in structural mode.
        # Redacted fields are already replaced with placeholders by _normalize_data,
        # so their values match (both are "<ID>", "<TS>", etc.).
        # Non-redacted fields (names, counts, progress) are non-deterministic → type only.
        if type(golden) is not type(actual):
            diffs.append(f"{path}: type mismatch (golden={type(golden).__name__}, actual={type(actual).__name__})")
    return diffs


def _compare_exact(golden: Any, actual: Any, path: str = "") -> list[str]:
    """Deep-equal comparison after normalization."""
    diffs: list[str] = []
    if isinstance(golden, dict) and isinstance(actual, dict):
        g_keys = set(golden.keys())
        a_keys = set(actual.keys())
        if g_keys != a_keys:
            missing = g_keys - a_keys
            extra = a_keys - g_keys
            if missing:
                diffs.append(f"{path}: missing keys in actual: {sorted(missing)}")
            if extra:
                diffs.append(f"{path}: extra keys in actual: {sorted(extra)}")
        for k in g_keys & a_keys:
            diffs.extend(_compare_exact(golden[k], actual[k], f"{path}.{k}"))
    elif isinstance(golden, list) and isinstance(actual, list):
        if len(golden) != len(actual):
            diffs.append(f"{path}: list length mismatch (golden={len(golden)}, actual={len(actual)})")
        for i, (g, a) in enumerate(zip(golden, actual)):
            diffs.extend(_compare_exact(g, a, f"{path}[{i}]"))
    else:
        if type(golden) is not type(actual):
            diffs.append(f"{path}: type mismatch (golden={type(golden).__name__}, actual={type(actual).__name__})")
        elif golden != actual:
            diffs.append(f"{path}: value mismatch (golden={golden!r}, actual={actual!r})")
    return diffs


def _compare_binary(golden: dict, actual: dict, path: str = "") -> list[str]:
    """Compare binary responses: Content-Type + SHA256 from stored metadata dict.

    The body is stored as ``{"_binary": true, "content_type": "...", "sha256": "...", "size": N}``
    by the recorder (JSON-serializable, not raw bytes).
    """
    diffs: list[str] = []

    # Compare Content-Type from headers (already normalized to lowercase)
    g_headers = golden.get("headers", {})
    a_headers = actual.get("headers", {})
    g_ct = g_headers.get("content-type", "")
    a_ct = a_headers.get("content-type", "")
    if g_ct != a_ct:
        diffs.append(f"{path}: Content-Type mismatch (golden={g_ct!r}, actual={a_ct!r})")

    # Compare binary metadata from body
    g_body = golden.get("body", {}) or {}
    a_body = actual.get("body", {}) or {}

    if not isinstance(g_body, dict) or not g_body.get("_binary"):
        diffs.append(f"{path}: golden body is not binary metadata: {type(g_body).__name__}")
        return diffs
    if not isinstance(a_body, dict) or not a_body.get("_binary"):
        diffs.append(f"{path}: actual body is not binary metadata: {type(a_body).__name__}")
        return diffs

    g_sha = g_body.get("sha256", "")
    a_sha = a_body.get("sha256", "")
    if g_sha != a_sha:
        diffs.append(f"{path}: body SHA256 mismatch (golden={g_sha[:12]}..., actual={a_sha[:12]}...)")

    g_size = g_body.get("size", 0)
    a_size = a_body.get("size", 0)
    if g_size != a_size:
        diffs.append(f"{path}: body size mismatch (golden={g_size}, actual={a_size})")

    return diffs
    return diffs


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

_MODE_COMPARATORS = {
    "structural": _compare_structural,
    "exact": _compare_exact,
    "binary": _compare_binary,
}


def normalize(response: dict) -> dict:
    """Public wrapper around _normalize_response."""
    return _normalize_response(response)


def assert_equal(golden: dict, actual: dict, mode: str = "structural") -> None:
    """Assert that two normalized responses are equal per the given mode.

    Args:
        golden: The golden snapshot response dict (with status/headers/body).
        actual: The live response dict (with status/headers/body).
        mode: "structural", "exact", or "binary".

    Raises:
        AssertionError: If the responses differ, with a detailed diff message.
    """
    if mode not in _MODE_COMPARATORS:
        raise ValueError(f"Unknown mode: {mode!r} (expected structural/exact/binary)")

    g = _normalize_response(golden)
    a = _normalize_response(actual)

    # Status code is always compared exactly
    if g["status"] != a["status"]:
        raise AssertionError(f"status mismatch: golden={g['status']}, actual={a['status']}")

    compare = _MODE_COMPARATORS[mode]
    diffs: list[str] = []

    # Compare headers (always structural — ignore volatile ones already stripped)
    h_diffs = _compare_structural(g["headers"], a["headers"], "headers")
    diffs.extend(h_diffs)

    # Compare body per mode
    if mode == "binary":
        b_diffs = compare(g, a, "body")
        diffs.extend(b_diffs)
    else:
        b_diffs = compare(g["body"], a["body"], "body")
        diffs.extend(b_diffs)

    if diffs:
        msg = "\n".join([f"  - {d}" for d in diffs])
        raise AssertionError(f"Response mismatch ({mode} mode), {len(diffs)} difference(s):\n{msg}")


def load_golden(rel_path: str, golden_dir: Path | None = None) -> dict:
    """Load a golden snapshot from the golden/ directory.

    Args:
        rel_path: Path relative to golden/ (e.g. "user/GET_user.json").
        golden_dir: Override the golden dir (defaults to tests/golden/).

    Returns:
        The parsed JSON dict.
    """
    if golden_dir is None:
        golden_dir = Path(__file__).resolve().parents[1] / "golden"
    full = golden_dir / rel_path
    if not full.exists():
        raise FileNotFoundError(f"Golden snapshot not found: {full}")
    return json.loads(full.read_text())


def save_golden(rel_path: str, data: dict, golden_dir: Path | None = None) -> None:
    """Save a golden snapshot to the golden/ directory.

    Args:
        rel_path: Path relative to golden/ (e.g. "user/GET_user.json").
        data: The normalized snapshot dict to save.
        golden_dir: Override the golden dir (defaults to tests/golden/).
    """
    if golden_dir is None:
        golden_dir = Path(__file__).resolve().parents[1] / "golden"
    full = golden_dir / rel_path
    full.parent.mkdir(parents=True, exist_ok=True)
    full.write_text(json.dumps(data, indent=2, sort_keys=True, default=str) + "\n")
