"""Golden-snapshot comparison tests for the filebrowser namespace.

Handles:
- Simple GETs (no setup)
- Read-only POSTs (setup resolves fs_id, substitutes into JSON body with int preservation)
"""

from __future__ import annotations

import pytest

from tests.helpers.recorder import RequestSpec, capture, save
from tests.helpers.comparator import load_golden, assert_equal
from tests.compare.filebrowser_specs import get_active_filebrowser_specs, RouteSpec


def _substitute(value, context: dict):
    """Replace {placeholders} in strings/dicts/lists with values from context.

    If a string is exactly '{key}' and the context value is an int, the int is
    returned directly (not stringified) — so JSON body fields like {"id": "{fs_id}"}
    produce {"id": 1} (int), not {"id": "1"} (string).
    """
    if isinstance(value, str):
        stripped = value.strip()
        if stripped.startswith("{") and stripped.endswith("}") and stripped.count("{") == 1:
            key = stripped[1:-1]
            if key in context:
                return context[key]
        result = value
        for key, val in context.items():
            result = result.replace(f"{{{key}}}", str(val))
        return result
    if isinstance(value, dict):
        return {k: _substitute(v, context) for k, v in value.items()}
    if isinstance(value, list):
        return [_substitute(item, context) for item in value]
    return value


def _run_filebrowser_spec(client, auth_headers, dbm, spec: RouteSpec, record: bool):
    """Execute a single filebrowser RouteSpec."""
    context: dict = {}

    if spec.setup:
        context = spec.setup(dbm)

    if context.get("skip"):
        pytest.skip("default filesystem not found — run initlost.py")

    try:
        req = spec.request
        path = _substitute(req.path, context)
        json_body = _substitute(req.json, context)
        headers = {**auth_headers, **req.headers}

        live_spec = RequestSpec(
            method=req.method, path=path, headers=headers,
            json=json_body, params=req.params, mode=req.mode, label=req.label,
        )
        captured = capture(client, live_spec)
        gpath = f"filebrowser/{spec.name}.json"

        if record:
            save(gpath, captured)

        golden = load_golden(gpath)
        assert_equal(golden, captured, mode=spec.request.mode)

    finally:
        if spec.cleanup:
            spec.cleanup(dbm, context)


_ACTIVE_SPECS = get_active_filebrowser_specs()


@pytest.mark.parametrize(
    "spec,client",
    [(s, s.target) for s in _ACTIVE_SPECS],
    indirect=["client"],
    ids=[s.name for s in _ACTIVE_SPECS],
)
def test_filebrowser_route(client, auth_headers, dbm, record, spec: RouteSpec):
    """Golden-snapshot test for a filebrowser namespace route."""
    _run_filebrowser_spec(client, auth_headers, dbm, spec, record=record)
