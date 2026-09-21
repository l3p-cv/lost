"""Config namespace request specs for golden-snapshot testing.

2 routes: 1 active (GET), 1 skipped (PATCH — no config entries to update in dev DB).
"""

from __future__ import annotations

from tests.helpers.recorder import RequestSpec
from tests.helpers.specs import RouteSpec
from tests.compare.migration_status import target_for

_TARGET = target_for("config")


def get_config_specs() -> list[RouteSpec]:
    specs: list[RouteSpec] = []

    # 1. GET /api/config — list all config entries (admin)
    specs.append(RouteSpec(
        name="GET_config",
        request=RequestSpec(
            method="GET",
            path="/api/config",
            mode="structural",
        ),
        target=_TARGET,
    ))

    # 2. PATCH /api/config — skip (0 config entries to update)
    specs.append(RouteSpec(
        name="PATCH_config",
        request=RequestSpec(method="PATCH", path="/api/config"),
        skip=True,
        skip_reason="0 config entries in dev DB — nothing to update. Verified manually in P1.2.",
    ))

    return specs


def get_active_config_specs() -> list[RouteSpec]:
    return [s for s in get_config_specs() if not s.skip]
