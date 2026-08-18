"""Golden-snapshot comparison tests for the SIA namespace.

Each test captures the response, saves it (if --record), loads the golden
snapshot, and compares. No setup/cleanup needed — uses existing dev DB state
(annotask 97, image 1469, admin user).
"""

from __future__ import annotations

import pytest

from tests.helpers.recorder import RequestSpec, capture, save
from tests.helpers.comparator import load_golden, assert_equal
from tests.compare.sia_specs import get_active_sia_specs, RouteSpec


def _run_sia_spec(client, auth_headers, spec: RouteSpec, record: bool):
    """Execute a single SIA RouteSpec: capture → save → load → compare.

    SIA specs are simpler than user specs:
    - No setup/cleanup (using existing dev DB state)
    - No mutate-then-GET (mutations are skipped)
    - No path substitution (image_id is hardcoded in specs)
    """
    req = spec.request
    headers = {**auth_headers, **req.headers}

    live_spec = RequestSpec(
        method=req.method,
        path=req.path,
        headers=headers,
        json=req.json,
        params=req.params,
        mode=req.mode,
        label=req.label,
    )
    captured = capture(client, live_spec)
    gpath = f"sia/{spec.name}.json"

    if record:
        save(gpath, captured)

    golden = load_golden(gpath)
    assert_equal(golden, captured, mode=spec.request.mode)


_ACTIVE_SPECS = get_active_sia_specs()


@pytest.mark.parametrize(
    "spec",
    _ACTIVE_SPECS,
    ids=[s.name for s in _ACTIVE_SPECS],
)
def test_sia_route(client, auth_headers, record, spec: RouteSpec):
    """Golden-snapshot test for a SIA namespace route."""
    _run_sia_spec(client, auth_headers, spec, record=record)
