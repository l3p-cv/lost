"""Golden-snapshot comparison tests for the MIA namespace.

Handles setup (choose compare_test_mia) + cleanup (revert to original annotask).
If compare_test_mia doesn't exist, the test is skipped.
"""

from __future__ import annotations

import pytest

from tests.helpers.recorder import RequestSpec, capture, save
from tests.helpers.comparator import load_golden, assert_equal
from tests.compare.mia_specs import get_active_mia_specs
from tests.helpers.specs import RouteSpec


def _run_mia_spec(client, auth_headers, dbm, spec: RouteSpec, record: bool):
    """Execute a single MIA RouteSpec: setup → capture → save → compare → cleanup."""
    context: dict = {}

    # Setup (choose MIA test annotask)
    if spec.setup:
        context = spec.setup(dbm)

    # Skip if test data doesn't exist
    if context.get("skip"):
        pytest.skip("compare_test_mia annotask not found — run init_test_data.py")

    try:
        # --- Primary request ---
        req = spec.request
        headers = {**auth_headers, **req.headers}

        live_spec = RequestSpec(
            method=req.method, path=req.path, headers=headers,
            json=req.json, params=req.params, mode=req.mode, label=req.label,
        )
        captured = capture(client, live_spec)
        gpath = f"mia/{spec.name}.json"

        if record:
            save(gpath, captured)

        golden = load_golden(gpath)
        assert_equal(golden, captured, mode=spec.request.mode)

    finally:
        # Cleanup (revert annotask choice)
        if spec.cleanup:
            spec.cleanup(dbm, context)


_ACTIVE_SPECS = get_active_mia_specs()


@pytest.mark.parametrize(
    "spec,client",
    [(s, s.target) for s in _ACTIVE_SPECS],
    indirect=["client"],
    ids=[s.name for s in _ACTIVE_SPECS],
)
def test_mia_route(client, auth_headers, dbm, record, spec: RouteSpec):
    """Golden-snapshot test for a MIA namespace route."""
    _run_mia_spec(client, auth_headers, dbm, spec, record=record)
