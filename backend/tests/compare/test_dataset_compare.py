"""Golden-snapshot comparison tests for the dataset namespace.

Handles:
- Simple GETs (no setup/cleanup)
- POST review (read-only navigation)
- POST create + follow-up GET + cleanup (delete created dataset)
- Reversible PATCH + follow-up GET + cleanup (revert name/description)
"""

from __future__ import annotations

import pytest

from tests.helpers.recorder import RequestSpec, capture, save
from tests.helpers.comparator import load_golden, assert_equal
from tests.compare.dataset_specs import get_active_dataset_specs, RouteSpec, DATASET_ID


def _run_dataset_spec(client, auth_headers, dbm, spec: RouteSpec, record: bool):
    """Execute a single dataset RouteSpec."""
    context: dict = {}

    # Setup (for reversible mutations)
    if spec.setup:
        context = spec.setup(dbm)

    try:
        # --- Primary request ---
        req = spec.request
        headers = {**auth_headers, **req.headers}

        primary_spec = RequestSpec(
            method=req.method,
            path=req.path,
            headers=headers,
            json=req.json,
            params=req.params,
            mode=req.mode,
            label=req.label,
        )
        primary_captured = capture(client, primary_spec)
        primary_gpath = f"dataset/{spec.name}.json"

        if record:
            save(primary_gpath, primary_captured)

        primary_golden = load_golden(primary_gpath)
        assert_equal(primary_golden, primary_captured, mode=spec.request.mode)

        # Extract created dataset ID from POST response for cleanup + follow-up
        if spec.name == "POST_dataset_create":
            body = primary_captured.get("response", {}).get("body", {})
            if isinstance(body, dict) and "datasetId" in body:
                context["dataset_id"] = body["datasetId"]

        # --- Follow-up request ---
        if spec.follow_up:
            fu = spec.follow_up
            fu_headers = {**auth_headers, **fu.headers}

            fu_spec = RequestSpec(
                method=fu.method,
                path=fu.path,
                headers=fu_headers,
                json=fu.json,
                params=fu.params,
                mode=fu.mode,
                label=fu.label,
            )
            fu_captured = capture(client, fu_spec)
            fu_gpath = f"dataset/{fu.label}.json"

            if record:
                save(fu_gpath, fu_captured)

            fu_golden = load_golden(fu_gpath)
            assert_equal(fu_golden, fu_captured, mode=fu.mode)

    finally:
        # Cleanup (delete created dataset or revert name)
        if spec.cleanup:
            spec.cleanup(dbm, context)


_ACTIVE_SPECS = get_active_dataset_specs()


@pytest.mark.parametrize(
    "spec",
    _ACTIVE_SPECS,
    ids=[s.name for s in _ACTIVE_SPECS],
)
def test_dataset_route(client, auth_headers, dbm, record, spec: RouteSpec):
    """Golden-snapshot test for a dataset namespace route."""
    _run_dataset_spec(client, auth_headers, dbm, spec, record=record)
