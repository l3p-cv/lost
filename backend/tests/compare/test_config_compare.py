"""Golden-snapshot comparison tests for the config namespace."""

from __future__ import annotations

import pytest

from tests.helpers.recorder import RequestSpec, capture, save
from tests.helpers.comparator import load_golden, assert_equal
from tests.compare.config_specs import get_active_config_specs, RouteSpec


def _run_config_spec(client, auth_headers, spec: RouteSpec, record: bool):
    req = spec.request
    headers = {**auth_headers, **req.headers}

    live_spec = RequestSpec(
        method=req.method, path=req.path, headers=headers,
        json=req.json, params=req.params, mode=req.mode, label=req.label,
    )
    captured = capture(client, live_spec)
    gpath = f"config/{spec.name}.json"

    if record:
        save(gpath, captured)

    golden = load_golden(gpath)
    assert_equal(golden, captured, mode=spec.request.mode)


_ACTIVE_SPECS = get_active_config_specs()


@pytest.mark.parametrize("spec", _ACTIVE_SPECS, ids=[s.name for s in _ACTIVE_SPECS])
def test_config_route(client, auth_headers, record, spec: RouteSpec):
    _run_config_spec(client, auth_headers, spec, record=record)
