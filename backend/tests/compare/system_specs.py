"""System namespace request specs for golden-snapshot testing.

4 routes: 3 active (GETs), 1 skipped (POST logs — side effect).
No setup needed — all routes use static config or admin's existing state.
"""

from __future__ import annotations

from tests.helpers.recorder import RequestSpec
from tests.compare.user_specs import RouteSpec
from tests.compare.migration_status import target_for

_TARGET = target_for("system")


def get_system_specs() -> list[RouteSpec]:
    specs: list[RouteSpec] = []

    # 1. GET /api/system/version — returns version string (no auth)
    specs.append(RouteSpec(
        name="GET_system_version",
        request=RequestSpec(
            method="GET",
            path="/api/system/version",
            mode="exact",
        ),
        target=_TARGET,
    ))

    # 2. GET /api/system/settings — returns static config dict (no auth)
    specs.append(RouteSpec(
        name="GET_system_settings",
        request=RequestSpec(
            method="GET",
            path="/api/system/settings",
            mode="exact",
        ),
        target=_TARGET,
    ))

    # 3. GET /api/system/jupyter — returns jupyter URL or empty string (admin)
    specs.append(RouteSpec(
        name="GET_system_jupyter",
        request=RequestSpec(
            method="GET",
            path="/api/system/jupyter",
            mode="structural",
        ),
        target=_TARGET,
    ))

    # 4. POST /api/system/logs/frontend — skip (Graylog side effect)
    specs.append(RouteSpec(
        name="POST_system_frontend_logs",
        request=RequestSpec(method="POST", path="/api/system/logs/frontend"),
        skip=True,
        skip_reason="Logs to Graylog — side effect, no useful response to compare. Verified manually in P1.2.",
    ))

    return specs


def get_active_system_specs() -> list[RouteSpec]:
    return [s for s in get_system_specs() if not s.skip]
