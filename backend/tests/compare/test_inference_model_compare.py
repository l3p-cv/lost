"""Golden-snapshot comparison tests for the inference_model namespace.

Handles:
- Simple GETs (list, by_id of seeded model)
- POST create + follow-up GET + cleanup (delete created model by name)
- PUT update + follow-up GET + cleanup
- DELETE + follow-up GET (create test model in setup, delete via API, cleanup)
"""

from __future__ import annotations

import pytest

from tests.helpers.recorder import RequestSpec, capture, save
from tests.helpers.comparator import load_golden, assert_equal
from tests.compare.inference_model_specs import get_active_inference_model_specs
from tests.helpers.specs import RouteSpec


def _substitute_path(path: str, context: dict) -> str:
    result = path
    for key, value in context.items():
        result = result.replace(f"{{{key}}}", str(value))
    return result


def _run_inference_model_spec(client, auth_headers, dbm, spec: RouteSpec, record: bool):
    context: dict = {}

    if spec.setup:
        dbm.session.commit()
        context = spec.setup(dbm)

    if context.get("skip"):
        pytest.skip("compare_test Dummy YOLO not found — run init_test_data.py")

    try:
        # --- Primary request ---
        req = spec.request
        path = _substitute_path(req.path, context)
        headers = {**auth_headers, **req.headers}

        primary_spec = RequestSpec(
            method=req.method, path=path, headers=headers,
            json=req.json, params=req.params, mode=req.mode, label=req.label,
        )
        captured = capture(client, primary_spec)
        gpath = f"inference_model/{spec.name}.json"

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
            fu_gpath = f"inference_model/{fu.label}.json"

            if record:
                save(fu_gpath, fu_captured)

            fu_golden = load_golden(fu_gpath)
            assert_equal(fu_golden, fu_captured, mode=fu.mode)

    finally:
        if spec.cleanup:
            dbm.session.commit()
            spec.cleanup(dbm, context)


_ACTIVE_SPECS = get_active_inference_model_specs()


@pytest.mark.parametrize(
    "spec,client",
    [(s, s.target) for s in _ACTIVE_SPECS],
    indirect=["client"],
    ids=[s.name for s in _ACTIVE_SPECS],
)
def test_inference_model_route(client, auth_headers, dbm, record, spec: RouteSpec):
    _run_inference_model_spec(client, auth_headers, dbm, spec, record=record)
