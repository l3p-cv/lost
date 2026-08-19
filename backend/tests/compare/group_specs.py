"""Group namespace request specs for golden-snapshot testing.

4 routes: 4 active.
- 2 GETs (list, by_id)
- 1 POST (create test group → GET verify → cleanup)
- 1 DELETE (create test group → delete via API → GET verify 404)
"""

from __future__ import annotations

from typing import Callable

from tests.helpers.recorder import RequestSpec
from tests.helpers.seed import unique_suffix, TEST_PREFIX
from tests.compare.user_specs import RouteSpec

# Dev DB constants
GROUP_ID = 1  # admin's default group


def _create_test_group_db(dbm):
    """Create a test group directly in the DB. Returns context with group_id."""
    from lost.db.model import Group

    suffix = unique_suffix()
    g = Group(name=f"{TEST_PREFIX}{suffix}", manager_id=1)
    dbm.save_obj(g)
    dbm.commit()
    return {"group_id": g.idx, "group_name": g.name}


def _cleanup_test_group_db(dbm, context):
    """Delete a test group from the DB."""
    from lost.db.model import Group

    gid = context.get("group_id")
    if gid:
        g = dbm.get_group_by_id(gid)
        if g:
            dbm.delete(g)
            dbm.commit()


def _cleanup_created_group_by_name(dbm, context):
    """Delete a test group created via POST API, found by name."""
    name = context.get("group_name")
    if name:
        g = dbm.get_group_by_name(name)
        if g:
            dbm.delete(g)
            dbm.commit()


def get_group_specs() -> list[RouteSpec]:
    specs: list[RouteSpec] = []

    # 1. GET /api/group — list all groups (designer)
    specs.append(RouteSpec(
        name="GET_group_list",
        request=RequestSpec(method="GET", path="/api/group", mode="structural"),
    ))

    # 2. GET /api/group/1 — get group by id (jwt, no role check)
    specs.append(RouteSpec(
        name="GET_group_by_id",
        request=RequestSpec(method="GET", path=f"/api/group/{GROUP_ID}", mode="structural"),
    ))

    # 3. POST /api/group — create test group → GET verify → cleanup
    suffix = unique_suffix()
    group_name = f"{TEST_PREFIX}{suffix}"
    specs.append(RouteSpec(
        name="POST_group_create",
        request=RequestSpec(
            method="POST", path="/api/group",
            json={"group_name": group_name}, mode="structural",
        ),
        follow_up=RequestSpec(
            method="GET", path="/api/group", mode="structural",
            label="POST_group_create__then_GET",
        ),
        setup=lambda dbm: {"group_name": group_name},
        cleanup=_cleanup_created_group_by_name,
    ))

    # 4. DELETE /api/group/{id} — create test group → delete via API → GET verify
    specs.append(RouteSpec(
        name="DELETE_group",
        request=RequestSpec(
            method="DELETE", path="/api/group/{group_id}", mode="structural",
        ),
        follow_up=RequestSpec(
            method="GET", path="/api/group/{group_id}", mode="structural",
            label="DELETE_group__then_GET",
        ),
        setup=_create_test_group_db,
        cleanup=_cleanup_test_group_db,  # safe if already deleted
    ))

    return specs


def get_active_group_specs() -> list[RouteSpec]:
    return [s for s in get_group_specs() if not s.skip]
