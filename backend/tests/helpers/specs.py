"""RouteSpec — test case spec wrapping a RequestSpec with test metadata.

Used by all namespace specs files (user_specs.py, sia_specs.py, etc.) to
describe how each route should be tested.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Callable, Optional

from tests.helpers.recorder import RequestSpec


@dataclass
class RouteSpec:
    """A test case spec: one route + how to verify it.

    Attributes:
        name: Short identifier (used in snapshot filename + test name).
        request: The primary RequestSpec to capture.
        skip: If True, this route is skipped (non-deterministic, can't snapshot).
        skip_reason: Why it's skipped (for documentation).
        follow_up: Optional follow-up RequestSpec (for mutate-then-GET).
        setup: Optional callable(dbm) → dict to run before the primary request.
               Returns a dict of values to substitute into the request path/body
               (e.g. {"user_id": 42} for /api/user/<id>).
        cleanup: Optional callable(dbm, context) to run after the test.
        target: Which app to test against — "flask" (default) or "fastapi".
    """

    name: str
    request: RequestSpec
    skip: bool = False
    skip_reason: str = ""
    follow_up: Optional[RequestSpec] = None
    setup: Optional[Callable] = None
    cleanup: Optional[Callable] = None
    target: str = "flask"
