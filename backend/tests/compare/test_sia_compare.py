"""Golden-snapshot comparison tests for the SIA namespace.

Handles:
- Specs with setup/cleanup (choose compare_test_sia, revert to original)
- Path + params substitution ({image_id} → actual ID from context)
- Pure-compute POSTs (no setup needed)
- Skips if compare_test_sia doesn't exist
"""

from __future__ import annotations

import pytest

from tests.helpers.recorder import RequestSpec, capture, save
from tests.helpers.comparator import load_golden, assert_equal
from tests.compare.sia_specs import get_active_sia_specs, RouteSpec


def _substitute(value, context: dict):
    """Replace {placeholders} in a string with values from context."""
    if isinstance(value, str):
        result = value
        for key, val in context.items():
            result = result.replace(f"{{{key}}}", str(val))
        return result
    if isinstance(value, dict):
        return {k: _substitute(v, context) for k, v in value.items()}
    if isinstance(value, list):
        return [_substitute(item, context) for item in value]
    return value


def _run_sia_spec(client, auth_headers, dbm, spec: RouteSpec, record: bool):
    """Execute a single SIA RouteSpec: setup → capture → save → compare → cleanup."""
    context: dict = {}

    if spec.setup:
        context = spec.setup(dbm)

    if context.get("skip"):
        pytest.skip("compare_test_sia annotask not found — run init_test_data.py")

    try:
        # --- Primary request ---
        req = spec.request
        path = _substitute(req.path, context)
        params = _substitute(req.params, context) if req.params else None
        headers = {**auth_headers, **req.headers}

        live_spec = RequestSpec(
            method=req.method, path=path, headers=headers,
            json=req.json, params=params, mode=req.mode, label=req.label,
        )
        captured = capture(client, live_spec)
        gpath = f"sia/{spec.name}.json"

        if record:
            save(gpath, captured)

        golden = load_golden(gpath)
        assert_equal(golden, captured, mode=spec.request.mode)

    finally:
        if spec.cleanup:
            spec.cleanup(dbm, context)


_ACTIVE_SPECS = get_active_sia_specs()


@pytest.mark.parametrize("spec", _ACTIVE_SPECS, ids=[s.name for s in _ACTIVE_SPECS])
def test_sia_route(client, auth_headers, dbm, record, spec: RouteSpec):
    """Golden-snapshot test for a SIA namespace route."""
    _run_sia_spec(client, auth_headers, dbm, spec, record=record)
