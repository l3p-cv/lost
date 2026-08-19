"""Golden-snapshot comparison tests for the label namespace.

Handles:
- Simple GETs (no setup/cleanup)
- POST create + follow-up GET + cleanup (delete created label by name)
- PATCH edit + follow-up GET + cleanup (create in setup, edit via API, delete)
- DELETE + follow-up GET (create in setup, delete via API, cleanup safe)

All paths/json with {placeholders} are substituted from the setup context.
"""

from __future__ import annotations

import pytest

from tests.helpers.recorder import RequestSpec, capture, save
from tests.helpers.comparator import load_golden, assert_equal
from tests.compare.label_specs import get_active_label_specs, RouteSpec


def _substitute(value, context: dict):
    """Replace {placeholders} in strings/dicts/lists with values from context."""
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


def _run_label_spec(client, auth_headers, dbm, spec: RouteSpec, record: bool):
    """Execute a single label RouteSpec."""
    context: dict = {}

    if spec.setup:
        context = spec.setup(dbm)

    try:
        # --- Primary request ---
        req = spec.request
        path = _substitute(req.path, context)
        json_body = _substitute(req.json, context)
        headers = {**auth_headers, **req.headers}

        primary_spec = RequestSpec(
            method=req.method, path=path, headers=headers,
            json=json_body, params=req.params, mode=req.mode, label=req.label,
        )
        captured = capture(client, primary_spec)
        gpath = f"label/{spec.name}.json"

        if record:
            save(gpath, captured)

        golden = load_golden(gpath)
        assert_equal(golden, captured, mode=spec.request.mode)

        # --- Follow-up request ---
        if spec.follow_up:
            fu = spec.follow_up
            fu_path = _substitute(fu.path, context)
            fu_headers = {**auth_headers, **fu.headers}

            fu_spec = RequestSpec(
                method=fu.method, path=fu_path, headers=fu_headers,
                json=fu.json, params=fu.params, mode=fu.mode, label=fu.label,
            )
            fu_captured = capture(client, fu_spec)
            fu_gpath = f"label/{fu.label}.json"

            if record:
                save(fu_gpath, fu_captured)

            fu_golden = load_golden(fu_gpath)
            assert_equal(fu_golden, fu_captured, mode=fu.mode)

    finally:
        if spec.cleanup:
            spec.cleanup(dbm, context)


_ACTIVE_SPECS = get_active_label_specs()


@pytest.mark.parametrize("spec", _ACTIVE_SPECS, ids=[s.name for s in _ACTIVE_SPECS])
def test_label_route(client, auth_headers, dbm, record, spec: RouteSpec):
    """Golden-snapshot test for a label namespace route."""
    _run_label_spec(client, auth_headers, dbm, spec, record=record)
