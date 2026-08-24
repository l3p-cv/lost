"""Statistics namespace request specs for golden-snapshot testing.

2 routes: 2 active (both GETs, read-only).
No setup needed — uses admin's existing annotation data.
"""

from __future__ import annotations

from tests.helpers.recorder import RequestSpec
from tests.helpers.specs import RouteSpec


def get_statistics_specs() -> list[RouteSpec]:
    specs: list[RouteSpec] = []

    # 1. GET /api/statistics/personal — personal annotation stats (annotator)
    specs.append(RouteSpec(
        name="GET_statistics_personal",
        request=RequestSpec(
            method="GET",
            path="/api/statistics/personal",
            mode="structural",
        ),
    ))

    # 2. GET /api/statistics/designer — designer annotation stats (designer)
    specs.append(RouteSpec(
        name="GET_statistics_designer",
        request=RequestSpec(
            method="GET",
            path="/api/statistics/designer",
            mode="structural",
        ),
    ))

    return specs


def get_active_statistics_specs() -> list[RouteSpec]:
    return [s for s in get_statistics_specs() if not s.skip]
