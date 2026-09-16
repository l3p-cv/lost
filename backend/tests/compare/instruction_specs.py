"""Instructions namespace request specs for golden-snapshot testing.

4 routes: 4 active.
- 1 GET (list all)
- 1 POST (create test instruction → GET verify → cleanup soft-delete)
- 1 PUT (create test instruction → edit via API → GET verify → cleanup)
- 1 DELETE (create test instruction → soft-delete via API → GET verify)
"""

from __future__ import annotations

from typing import Callable

from tests.helpers.recorder import RequestSpec
from tests.helpers.seed import unique_suffix, TEST_PREFIX
from tests.helpers.specs import RouteSpec
from tests.compare.migration_status import target_for

_TARGET = target_for("instructions")


def _create_test_instruction_db(dbm):
    """Create a test instruction directly in the DB. Returns context with instruction_id."""
    from lost.db.model import Instruction

    suffix = unique_suffix()
    inst = Instruction(
        option=f"{TEST_PREFIX}{suffix}",
        description="Test instruction for golden snapshots",
        instruction="Test instruction content",
        is_deleted=False,
    )
    dbm.session.add(inst)
    dbm.session.commit()
    return {"instruction_id": inst.id, "instruction_option": inst.option}


def _cleanup_test_instruction_db(dbm, context):
    """Hard-delete a test instruction from the DB."""
    inst_id = context.get("instruction_id")
    if inst_id:
        from lost.db.model import Instruction

        inst = dbm.session.query(Instruction).filter_by(id=inst_id).first()
        if inst:
            dbm.session.delete(inst)
            dbm.session.commit()


def _cleanup_created_instruction_by_option(dbm, context):
    """Delete a test instruction created via POST API, found by option."""
    option = context.get("instruction_option")
    if option:
        from lost.db.model import Instruction

        inst = dbm.session.query(Instruction).filter_by(option=option).first()
        if inst:
            dbm.session.delete(inst)
            dbm.session.commit()


def get_instruction_specs() -> list[RouteSpec]:
    specs: list[RouteSpec] = []

    # 1. GET /api/instructions/getInstructions/all — list all instructions
    specs.append(RouteSpec(
        name="GET_instructions_all",
        request=RequestSpec(
            method="GET", path="/api/instructions/getInstructions/all", mode="structural",
        ),
        target=_TARGET,
    ))

    # 2. POST /api/instructions/addInstruction — create → GET verify → cleanup
    suffix = unique_suffix()
    option = f"{TEST_PREFIX}{suffix}"
    specs.append(RouteSpec(
        name="POST_instruction_add",
        request=RequestSpec(
            method="POST", path="/api/instructions/addInstruction",
            json={
                "option": option,
                "instruction": "Test instruction content",
                "description": "Test for golden snapshots",
                "visibility": "global",
            },
            mode="structural",
        ),
        follow_up=RequestSpec(
            method="GET", path="/api/instructions/getInstructions/all", mode="structural",
            label="POST_instruction_add__then_GET",
        ),
        setup=lambda dbm: {"instruction_option": option},
        cleanup=_cleanup_created_instruction_by_option,
        target=_TARGET,
    ))

    # 3. PUT /api/instructions/editInstruction — create test → edit → GET verify → cleanup
    specs.append(RouteSpec(
        name="PUT_instruction_edit",
        request=RequestSpec(
            method="PUT", path="/api/instructions/editInstruction",
            json={
                "id": "{instruction_id}",
                "option": f"{TEST_PREFIX}edited",
                "instruction": "Edited content",
                "description": "Edited by golden snapshot test",
            },
            mode="structural",
        ),
        follow_up=RequestSpec(
            method="GET", path="/api/instructions/getInstructions/all", mode="structural",
            label="PUT_instruction_edit__then_GET",
        ),
        setup=_create_test_instruction_db,
        cleanup=_cleanup_test_instruction_db,
        target=_TARGET,
    ))

    # 4. DELETE /api/instructions/deleteInstruction/{id} — create → soft-delete → GET verify
    specs.append(RouteSpec(
        name="DELETE_instruction",
        request=RequestSpec(
            method="DELETE", path="/api/instructions/deleteInstruction/{instruction_id}", mode="structural",
        ),
        follow_up=RequestSpec(
            method="GET", path="/api/instructions/getInstructions/all", mode="structural",
            label="DELETE_instruction__then_GET",
        ),
        setup=_create_test_instruction_db,
        cleanup=_cleanup_test_instruction_db,  # hard-delete after soft-delete test
        target=_TARGET,
    ))

    return specs


def get_active_instruction_specs() -> list[RouteSpec]:
    return [s for s in get_instruction_specs() if not s.skip]
