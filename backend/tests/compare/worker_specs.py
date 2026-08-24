"""Worker namespace request specs for golden-snapshot testing.

2 routes: 1 active (GET list), 1 skipped (Not Implemented — always 500s).
"""

from __future__ import annotations

from tests.helpers.recorder import RequestSpec
from tests.helpers.specs import RouteSpec


def get_worker_specs() -> list[RouteSpec]:
    specs: list[RouteSpec] = []

    # 1. GET /api/worker — list workers (designer)
    specs.append(RouteSpec(
        name="GET_worker_list",
        request=RequestSpec(
            method="GET",
            path="/api/worker",
            mode="structural",
        ),
    ))

    # 2. GET /api/worker/workerlogs/1 — skip (Not Implemented, raises Exception)
    specs.append(RouteSpec(
        name="GET_worker_logs",
        request=RequestSpec(method="GET", path="/api/worker/workerlogs/1"),
        skip=True,
        skip_reason="Not Implemented — raises Exception, always 500s. Verified manually in P1.2.",
    ))

    return specs


def get_active_worker_specs() -> list[RouteSpec]:
    return [s for s in get_worker_specs() if not s.skip]
