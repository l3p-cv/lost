"""Golden-snapshot comparison tests for the user namespace.

Each test:
1. Sends the request described by its TestSpec.
2. If --record: saves the response as a golden snapshot.
3. Loads the golden snapshot and compares (even when recording, for self-consistency).

For mutate-then-GET specs (POST/PATCH/DELETE):
- Runs setup to create a test entity.
- Sends the primary request (with path substitution).
- Sends the follow-up GET.
- Cleans up the test entity.
Both the primary and follow-up responses are snapshot+compared.
"""

from __future__ import annotations

import pytest

from tests.helpers.recorder import capture, save, snapshot_path
from tests.helpers.comparator import load_golden, assert_equal
from tests.compare.user_specs import get_active_user_specs, RouteSpec


def _substitute_path(path: str, context: dict) -> str:
    """Replace {placeholders} in a path with values from context."""
    result = path
    for key, value in context.items():
        result = result.replace(f"{{{key}}}", str(value))
    return result


def _run_spec(client, auth_headers, dbm, spec: RouteSpec, record: bool):
    """Execute a single TestSpec: setup → primary request → follow-up → cleanup.

    Captures, saves (if record), and compares both primary and follow-up responses.
    """
    context: dict = {}

    # Setup
    if spec.setup:
        context = spec.setup(dbm)

    try:
        # --- Primary request ---
        req = spec.request
        path = _substitute_path(req.path, context)
        # Use fresh token if the setup provided one (e.g. logout test)
        if "fresh_token" in context:
            headers = {"Authorization": f"Bearer {context['fresh_token']}", **req.headers}
        else:
            headers = {**auth_headers, **req.headers}

        from tests.helpers.recorder import RequestSpec

        primary_spec = RequestSpec(
            method=req.method,
            path=path,
            headers=headers,
            json=req.json,
            params=req.params,
            mode=req.mode,
            label=req.label,
        )
        primary_captured = capture(client, primary_spec)
        # Use the TestSpec's name for the golden filename (stable across runs)
        primary_gpath = f"user/{spec.name}.json"

        if record:
            save(primary_gpath, primary_captured)

        primary_golden = load_golden(primary_gpath)
        assert_equal(primary_golden, primary_captured, mode=spec.request.mode)

        # --- Follow-up request (mutate-then-GET) ---
        if spec.follow_up:
            fu = spec.follow_up
            fu_headers = {**auth_headers, **fu.headers}

            # For POST create, we need the created user's ID from the DB
            if spec.name == "POST_user_create":
                created = dbm.find_user_by_user_name(context.get("user_name"))
                if created:
                    context["user_id"] = created.idx

            fu_path = _substitute_path(fu.path, context)
            fu_spec = RequestSpec(
                method=fu.method,
                path=fu_path,
                headers=fu_headers,
                json=fu.json,
                params=fu.params,
                mode=fu.mode,
                label=fu.label,
            )
            fu_captured = capture(client, fu_spec)
            # Use the follow-up's label for the golden filename
            fu_gpath = f"user/{fu.label}.json"

            if record:
                save(fu_gpath, fu_captured)

            fu_golden = load_golden(fu_gpath)
            assert_equal(fu_golden, fu_captured, mode=fu.mode)

    finally:
        # Cleanup
        if spec.cleanup:
            spec.cleanup(dbm, context)


# ---------------------------------------------------------------------------
# Parametrized test — one test per active spec
# ---------------------------------------------------------------------------

_ACTIVE_SPECS = get_active_user_specs()


@pytest.mark.parametrize(
    "spec",
    _ACTIVE_SPECS,
    ids=[s.name for s in _ACTIVE_SPECS],
)
def test_user_route(client, auth_headers, dbm, record, spec: RouteSpec):
    """Golden-snapshot test for a user namespace route."""
    _run_spec(client, auth_headers, dbm, spec, record=record)
