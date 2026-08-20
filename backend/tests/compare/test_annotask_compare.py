"""Golden-snapshot comparison tests for the annotasks namespace.

Handles three spec shapes:
- Simple specs (no setup/cleanup, no follow-up): capture → save → load → compare
- Idempotent mutate-then-GET (follow-up + setup for ID lookup): capture → save → follow-up → compare
- Reversible mutations (setup + follow-up + cleanup): setup → mutate → follow-up → cleanup

All paths/params/json with {placeholders} are substituted from the setup context.
"""

from __future__ import annotations

import pytest

from tests.helpers.recorder import RequestSpec, capture, save
from tests.helpers.comparator import load_golden, assert_equal
from tests.compare.annotask_specs import get_active_annotask_specs, RouteSpec


def _substitute(value, context: dict):
    """Replace {placeholders} in strings/dicts/lists with values from context.

    If a string is exactly '{key}' and the context value is an int, the int is
    returned directly (not stringified) — so JSON body fields like {"id": "{annotask_id}"}
    produce {"id": 120} (int), not {"id": "120"} (string).
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


def _run_annotask_spec(client, auth_headers, dbm, spec: RouteSpec, record: bool):
    """Execute a single annotasks RouteSpec."""
    context: dict = {}

    # Setup (resolve IDs by name, or save original state for revert)
    if spec.setup:
        context = spec.setup(dbm)

    if context.get("skip"):
        pytest.skip("compare_test_sia annotask not found — run init_test_data.py")

    try:
        # --- Primary request ---
        req = spec.request
        path = _substitute(req.path, context)
        json_body = _substitute(req.json, context)
        params = _substitute(req.params, context) if req.params else None
        headers = {**auth_headers, **req.headers}

        primary_spec = RequestSpec(
            method=req.method, path=path, headers=headers,
            json=json_body, params=params, mode=req.mode, label=req.label,
        )
        primary_captured = capture(client, primary_spec)
        primary_gpath = f"annotasks/{spec.name}.json"

        if record:
            save(primary_gpath, primary_captured)

        primary_golden = load_golden(primary_gpath)
        assert_equal(primary_golden, primary_captured, mode=spec.request.mode)

        # --- Follow-up request (mutate-then-GET) ---
        if spec.follow_up:
            fu = spec.follow_up
            fu_path = _substitute(fu.path, context)
            fu_params = _substitute(fu.params, context) if fu.params else None
            fu_headers = {**auth_headers, **fu.headers}

            fu_spec = RequestSpec(
                method=fu.method, path=fu_path, headers=fu_headers,
                json=fu.json, params=fu_params, mode=fu.mode, label=fu.label,
            )
            fu_captured = capture(client, fu_spec)
            fu_gpath = f"annotasks/{fu.label}.json"

            if record:
                save(fu_gpath, fu_captured)

            fu_golden = load_golden(fu_gpath)
            assert_equal(fu_golden, fu_captured, mode=fu.mode)

            # Extract created export ID from follow-up GET for cleanup
            if spec.name == "POST_annotask_export":
                fu_body = fu_captured.get("response", {}).get("body", {})
                if isinstance(fu_body, dict) and "annoTasksExports" in fu_body:
                    exports = fu_body["annoTasksExports"]
                    if exports and isinstance(exports, list) and isinstance(exports[-1], dict):
                        context["export_id"] = exports[-1].get("id")

    finally:
        # Cleanup (revert for reversible mutations)
        if spec.cleanup:
            spec.cleanup(dbm, context)


_ACTIVE_SPECS = get_active_annotask_specs()


@pytest.mark.parametrize("spec", _ACTIVE_SPECS, ids=[s.name for s in _ACTIVE_SPECS])
def test_annotask_route(client, auth_headers, dbm, record, spec: RouteSpec):
    """Golden-snapshot test for an annotasks namespace route."""
    _run_annotask_spec(client, auth_headers, dbm, spec, record=record)
