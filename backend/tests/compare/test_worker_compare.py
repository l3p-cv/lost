"""Golden-snapshot comparison tests for the worker namespace."""

from __future__ import annotations

import pytest

from tests.helpers.recorder import RequestSpec, capture, save
from tests.helpers.comparator import load_golden, assert_equal
from tests.compare.worker_specs import get_active_worker_specs, RouteSpec


def _run_worker_spec(client, auth_headers, spec: RouteSpec, record: bool):
    req = spec.request
    headers = {**auth_headers, **req.headers}

    live_spec = RequestSpec(
        method=req.method, path=req.path, headers=headers,
        json=req.json, params=req.params, mode=req.mode, label=req.label,
    )
    captured = capture(client, live_spec)
    gpath = f"worker/{spec.name}.json"

    if record:
        save(gpath, captured)

    golden = load_golden(gpath)
    assert_equal(golden, captured, mode=spec.request.mode)


_ACTIVE_SPECS = get_active_worker_specs()


@pytest.mark.parametrize(
    "spec,client",
    [(s, s.target) for s in _ACTIVE_SPECS],
    indirect=["client"],
    ids=[s.name for s in _ACTIVE_SPECS],
)
def test_worker_route(client, auth_headers, record, spec: RouteSpec):
    _run_worker_spec(client, auth_headers, spec, record=record)
