"""Golden-snapshot comparison tests for the instructions namespace.

Handles:
- Simple GET (no setup/cleanup)
- POST create + follow-up GET + cleanup (delete created instruction)
- PUT edit + follow-up GET + cleanup (create in setup, edit via API, cleanup)
- DELETE + follow-up GET (create in setup, soft-delete via API, hard-delete in cleanup)
"""

from __future__ import annotations

import pytest

from tests.helpers.recorder import RequestSpec, capture, save
from tests.helpers.comparator import load_golden, assert_equal
from tests.compare.instruction_specs import get_active_instruction_specs, RouteSpec


def _substitute_path(path: str, context: dict) -> str:
    result = path
    for key, value in context.items():
        result = result.replace(f"{{{key}}}", str(value))
    return result


def _substitute_json(json_data, context: dict):
    """Replace {placeholders} in string values within a JSON body."""
    if json_data is None:
        return None
    if isinstance(json_data, dict):
        return {k: _substitute_json(v, context) for k, v in json_data.items()}
    if isinstance(json_data, list):
        return [_substitute_json(item, context) for item in json_data]
    if isinstance(json_data, str):
        return _substitute_path(json_data, context)
    return json_data


def _run_instruction_spec(client, auth_headers, dbm, spec: RouteSpec, record: bool):
    context: dict = {}

    if spec.setup:
        context = spec.setup(dbm)

    try:
        # --- Primary request ---
        req = spec.request
        path = _substitute_path(req.path, context)
        json_body = _substitute_json(req.json, context)
        headers = {**auth_headers, **req.headers}

        primary_spec = RequestSpec(
            method=req.method, path=path, headers=headers,
            json=json_body, params=req.params, mode=req.mode, label=req.label,
        )
        captured = capture(client, primary_spec)
        gpath = f"instructions/{spec.name}.json"

        if record:
            save(gpath, captured)

        golden = load_golden(gpath)
        assert_equal(golden, captured, mode=spec.request.mode)

        # --- Follow-up request ---
        if spec.follow_up:
            fu = spec.follow_up
            fu_path = _substitute_path(fu.path, context)
            fu_headers = {**auth_headers, **fu.headers}

            fu_spec = RequestSpec(
                method=fu.method, path=fu_path, headers=fu_headers,
                json=fu.json, params=fu.params, mode=fu.mode, label=fu.label,
            )
            fu_captured = capture(client, fu_spec)
            fu_gpath = f"instructions/{fu.label}.json"

            if record:
                save(fu_gpath, fu_captured)

            fu_golden = load_golden(fu_gpath)
            assert_equal(fu_golden, fu_captured, mode=fu.mode)

    finally:
        if spec.cleanup:
            spec.cleanup(dbm, context)


_ACTIVE_SPECS = get_active_instruction_specs()


@pytest.mark.parametrize("spec", _ACTIVE_SPECS, ids=[s.name for s in _ACTIVE_SPECS])
def test_instruction_route(client, auth_headers, dbm, record, spec: RouteSpec):
    _run_instruction_spec(client, auth_headers, dbm, spec, record=record)
