"""Golden-snapshot comparison tests for the pipeline namespace.

Handles:
- Simple GETs (no setup)
- GETs needing pipe_id / pipe_element_id / annotask_id (setup resolves by name)
- POST review navigation (setup resolves annotask_id, substitutes into path + JSON body)
"""

from __future__ import annotations

import pytest

from tests.helpers.recorder import RequestSpec, capture, save
from tests.helpers.comparator import load_golden, assert_equal
from tests.compare.pipeline_specs import get_active_pipeline_specs, RouteSpec


def _substitute(value, context: dict):
    """Replace {placeholders} in strings/dicts/lists with values from context.

    If a string is exactly '{key}' and the context value is an int, the int is
    returned directly (not stringified).
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


def _run_pipeline_spec(client, auth_headers, dbm, spec: RouteSpec, record: bool):
    """Execute a single pipeline RouteSpec."""
    context: dict = {}

    if spec.setup:
        context = spec.setup(dbm)

    if context.get("skip"):
        pytest.skip("compare_test_sia_pipe not found — run init_test_data.py")

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
        gpath = f"pipeline/{spec.name}.json"

        if record:
            save(gpath, captured)

        golden = load_golden(gpath)
        assert_equal(golden, captured, mode=spec.request.mode)

    finally:
        if spec.cleanup:
            spec.cleanup(dbm, context)


_ACTIVE_SPECS = get_active_pipeline_specs()


@pytest.mark.parametrize(
    "spec,client",
    [(s, s.target) for s in _ACTIVE_SPECS],
    indirect=["client"],
    ids=[s.name for s in _ACTIVE_SPECS],
)
def test_pipeline_route(client, auth_headers, dbm, record, spec: RouteSpec):
    """Golden-snapshot test for a pipeline namespace route."""
    _run_pipeline_spec(client, auth_headers, dbm, spec, record=record)
