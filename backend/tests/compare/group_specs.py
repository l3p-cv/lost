"""Group namespace request specs for golden-snapshot testing.

7 routes: 7 active.
- 2 GETs (list, by_id)
- 1 POST (create test group → GET verify → cleanup)
- 1 DELETE (create test group → delete via API → GET verify 404)
- 3 error-path specs (D2 pilot — exact mode, byte-exact legacy bodies):
  duplicate create → 409, empty name → 400, missing-id delete → 400
"""

from __future__ import annotations

from tests.compare.migration_status import target_for
from tests.helpers.recorder import RequestSpec
from tests.helpers.seed import TEST_PREFIX, unique_suffix
from tests.helpers.specs import RouteSpec

_TARGET = target_for("group")

# Dev DB constants
GROUP_ID = 1  # admin's default group (always prsent after initlost)


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
    gid = context.get("group_id")
    if gid:
        g = dbm.get_group_by_id(gid)
        if g:
            dbm.delete(g)
            dbm.commit()


def _cleanup_created_group_by_name(dbm, context):
    """Delete a test group created via POST API, found by name."""
    dbm.session.rollback()  # in case the POST failed and left a transaction open
    name = context.get("group_name")
    if name:
        g = dbm.get_group_by_name(name)
        if g:
            dbm.delete(g)
            dbm.commit()


def _ensure_group_exists(dbm):
    """Ensure the fixed-name duplicate-spec group exists (reuse if leaked by a prior run)."""
    name = f"{TEST_PREFIX}dup_group"
    g = dbm.get_group_by_name(name)
    if g is None:
        from lost.db.model import Group

        g = Group(name=name, manager_id=1)
        dbm.save_obj(g)
        dbm.commit()
    return {"group_id": g.idx, "group_name": name}


def get_group_specs() -> list[RouteSpec]:
    specs: list[RouteSpec] = []

    # 1. GET /api/group — list all groups (designer)
    specs.append(RouteSpec(
        name="GET_group_list",
        request=RequestSpec(method="GET", path="/api/group", mode="structural"),
        target=_TARGET,
    ))

    # 2. GET /api/group/1 — get group by id (jwt, no role check)
    specs.append(RouteSpec(
        name="GET_group_by_id",
        request=RequestSpec(method="GET", path=f"/api/group/{GROUP_ID}", mode="structural"),
        target=_TARGET,
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
        target=_TARGET,
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
        target=_TARGET,
    ))

    # 5. POST /api/group — duplicate name → 409 (exact: FIXED name for determinism —
    #    error-path specs never use run-generated values in exact-mode bodies)
    specs.append(RouteSpec(
        name="POST_group_create_duplicate",
        request=RequestSpec(
            method="POST", path="/api/group", json={"group_name": f"{TEST_PREFIX}dup_group"}, mode="exact",
        ),
        target=_TARGET,
        setup=_ensure_group_exists,
        cleanup=_cleanup_test_group_db,  # setup-created/reused group survives the 409
    ))

    # 6. POST /api/group — empty name → 400 (exact)
    specs.append(RouteSpec(
        name="POST_group_create_no_name",
        request=RequestSpec(
            method="POST", path="/api/group", json={"group_name": ""}, mode="exact",
        ),
        target=_TARGET,
    ))

    # 7. DELETE /api/group/{id} — nonexistent id → 400 (exact; hardcoded
    #    implausible id for determinism — no setup, no cleanup)
    specs.append(RouteSpec(
        name="DELETE_group_not_found",
        request=RequestSpec(
            method="DELETE", path="/api/group/999999", mode="exact",
        ),
        target=_TARGET,
    ))

    return specs


def get_active_group_specs() -> list[RouteSpec]:
    return [s for s in get_group_specs() if not s.skip]
