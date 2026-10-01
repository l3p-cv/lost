"""Pipeline namespace request specs for golden-snapshot testing.

19 routes: 9 active (8 GETs + 1 POST review), 10 skipped (mutations + imports + binary export).

Self-contained: uses compare_test_sia_pipe + compare_test_sia annotask (created by init_test_data.py).
No new init_test_data.py additions needed.
"""

from __future__ import annotations

from tests.helpers.recorder import RequestSpec
from tests.helpers.specs import RouteSpec
from tests.compare.migration_status import target_for
from datetime import datetime
from tests.helpers.seed import TEST_PREFIX, cleanup_test_user, unique_suffix

_TARGET = target_for("pipeline")


def _setup_pipe_context(dbm):
    """Look up compare_test_sia_pipe + its PipeElement + the annotask ID."""
    from tests.helpers.lookups import (
        get_test_sia_pipe_id,
        get_test_sia_pipe_element_id,
        get_test_sia_annotask_id,
    )

    pipe_id = get_test_sia_pipe_id(dbm)
    if pipe_id is None:
        return {"skip": True}
    return {
        "pipe_id": pipe_id,
        "pipe_element_id": get_test_sia_pipe_element_id(dbm),
        "annotask_id": get_test_sia_annotask_id(dbm),
        "skip": False,
    }

def _setup_roleless_user(dbm) -> dict:
    """Create a test user with NO roles and mint its token (thumbnail role-quirk spec)."""
    from lost.controllers.user.login_manager import LoginManager
    from lost.db.model import Group, User, UserGroups

    user_name = f"{TEST_PREFIX}roleless_{unique_suffix()}"
    user = User(
        user_name=user_name,
        email=f"{user_name}@test.local",
        email_confirmed_at=datetime.utcnow(),
        password="test",
    )
    dbm.save_obj(user)
    g = Group(name=user_name, is_user_default=True)
    dbm.save_obj(g)
    dbm.save_obj(UserGroups(group_id=g.idx, user_id=user.idx))
    dbm.commit()
    lm = LoginManager(dbm, user_name, "")
    fresh_token, _ = lm.create_jwt_pyjwt(user.idx, user_name, user.roles)
    return {"fresh_token": fresh_token, "user_obj": user}


def _cleanup_roleless_user(dbm, context) -> None:
    """Delete the role-less test user (idempotent, rollback-first)."""
    if "user_obj" in context:
        cleanup_test_user(dbm, context["user_obj"])

def get_pipeline_specs() -> list[RouteSpec]:
    specs: list[RouteSpec] = []

    # --- Simple GETs (no setup needed) ---

    # 1. GET /api/pipeline/template/all — list all templates
    specs.append(RouteSpec(
        name="GET_pipeline_templates_all",
        request=RequestSpec(method="GET", path="/api/pipeline/template/all", mode="structural"),
        target=_TARGET
    ))

    # 2. GET /api/pipeline/template/global — list global templates
    specs.append(RouteSpec(
        name="GET_pipeline_templates_global",
        request=RequestSpec(method="GET", path="/api/pipeline/template/global", mode="structural"),
        target=_TARGET
    ))

    # 3. GET /api/pipeline — list all pipelines
    specs.append(RouteSpec(
        name="GET_pipeline_list",
        request=RequestSpec(method="GET", path="/api/pipeline", mode="structural"),
        target=_TARGET
    ))

    # 4. GET /api/pipeline/0/10 — paginated list
    specs.append(RouteSpec(
        name="GET_pipeline_paged",
        request=RequestSpec(method="GET", path="/api/pipeline/0/10", mode="structural"),
        target=_TARGET
    ))

    # 5. GET /api/pipeline/project/all — list all projects
    specs.append(RouteSpec(
        name="GET_pipeline_projects_all",
        request=RequestSpec(method="GET", path="/api/pipeline/project/all", mode="structural"),
        target=_TARGET
    ))

    # --- GETs needing ID lookup ---

    # 6. GET /api/pipeline/{id} — get pipeline by ID
    specs.append(RouteSpec(
        name="GET_pipeline_by_id",
        request=RequestSpec(method="GET", path="/api/pipeline/{pipe_id}", mode="structural"),
        target=_TARGET,
        setup=_setup_pipe_context,
    ))

    # 7. GET /api/pipeline/element/{id}/logs — get element logs
    specs.append(RouteSpec(
        name="GET_pipeline_element_logs",
        request=RequestSpec(
            method="GET", path="/api/pipeline/element/{pipe_element_id}/logs", mode="structural",
        ),
        target=_TARGET,
        setup=_setup_pipe_context,
    ))

    # 8. GET /api/pipeline/element/{id}/review/options — review options
    specs.append(RouteSpec(
        name="GET_pipeline_review_options",
        request=RequestSpec(
            method="GET", path="/api/pipeline/element/{annotask_id}/review/options", mode="structural",
        ),
        target=_TARGET,
        setup=_setup_pipe_context,
    ))

    # --- POST read (navigation) ---

    # 9. POST /api/pipeline/element/{id}/review — review navigation
    specs.append(RouteSpec(
        name="POST_pipeline_review",
        request=RequestSpec(
            method="POST", path="/api/pipeline/element/{annotask_id}/review",
            json={"direction": "first"},
            mode="structural",
        ),
        target=_TARGET,
        setup=_setup_pipe_context,
    ))

    # --- Skipped: mutations + imports + binary ---

    specs.append(RouteSpec(
        name="DELETE_pipeline",
        request=RequestSpec(method="DELETE", path="/api/pipeline/{pipe_id}"),
        skip=True,
        skip_reason="Irreversible — deletes pipeline. Verified manually in P1.2.",
    ))

    specs.append(RouteSpec(
        name="POST_pipeline_start",
        request=RequestSpec(method="POST", path="/api/pipeline/start"),
        skip=True,
        skip_reason="Creates a running pipeline (dask job). Verified manually in P1.2.",
    ))

    specs.append(RouteSpec(
        name="POST_pipeline_updateArguments",
        request=RequestSpec(method="POST", path="/api/pipeline/updateArguments"),
        skip=True,
        skip_reason="Mutation — updates pipeline arguments. Verified manually in P1.2.",
    ))

    specs.append(RouteSpec(
        name="POST_pipeline_pause",
        request=RequestSpec(method="POST", path="/api/pipeline/pause/{pipe_id}"),
        skip=True,
        skip_reason="Reversible but needs a running pipeline. Verified manually in P1.2.",
    ))

    specs.append(RouteSpec(
        name="POST_pipeline_play",
        request=RequestSpec(method="POST", path="/api/pipeline/play/{pipe_id}"),
        skip=True,
        skip_reason="Reversible but needs a paused pipeline. Verified manually in P1.2.",
    ))

    specs.append(RouteSpec(
        name="POST_pipeline_import_zip",
        request=RequestSpec(method="POST", path="/api/pipeline/project/import_zip"),
        skip=True,
        skip_reason="File upload — creates pipeline from zip. Verified manually in P1.2.",
    ))

    specs.append(RouteSpec(
        name="POST_pipeline_import_git",
        request=RequestSpec(method="POST", path="/api/pipeline/project/import_git"),
        skip=True,
        skip_reason="Git import — creates pipeline. Verified manually in P1.2.",
    ))

    specs.append(RouteSpec(
        name="GET_pipeline_export",
        request=RequestSpec(method="GET", path="/api/pipeline/project/export/found"),
        skip=True,
        skip_reason="ZIP includes .git/ contents which change between runs (git pack files, timestamps). Non-deterministic SHA256. Verified manually in P1.2.",
    ))

    specs.append(RouteSpec(
        name="POST_pipeline_project_delete",
        request=RequestSpec(method="POST", path="/api/pipeline/project/delete"),
        skip=True,
        skip_reason="Irreversible — deletes project. Verified manually in P1.2.",
    ))

    specs.append(RouteSpec(
        name="PUT_pipeline_review",
        request=RequestSpec(method="PUT", path="/api/pipeline/element/{annotask_id}/review"),
        skip=True,
        skip_reason="Mutation — updates review state. Verified manually in P1.2.",
    ))

     # GET /api/pipeline/template/999999 — nonexistent template ID → 404 (exact)
    specs.append(RouteSpec(
        name="GET_pipeline_template_not_found",
        request=RequestSpec(method="GET", path="/api/pipeline/template/999999", mode="exact"),
        target=_TARGET,
        # no setup — template.py's finally-return makes get_template return
        # the fixed message string for missing ids
    ))

    # GET /api/pipeline/template/all as a role-less user → 403 (exact)
    specs.append(RouteSpec(
        name="GET_pipeline_template_role_forbidden",
        request=RequestSpec(method="GET", path="/api/pipeline/template/all", mode="exact"),
        setup=_setup_roleless_user,
        cleanup=_cleanup_roleless_user,
        target=_TARGET,
        # the visibility-branch role check fires in business → plain signal → 403
    ))

    # GET /api/pipeline/project/all as a role-less user → 403 (exact)
    specs.append(RouteSpec(
        name="GET_pipeline_project_role_forbidden",
        request=RequestSpec(method="GET", path="/api/pipeline/project/all", mode="exact"),
        setup=_setup_roleless_user,
        cleanup=_cleanup_roleless_user,
        target=_TARGET,
        # same transcription via the get_projects branch
    ))

    return specs


def get_active_pipeline_specs() -> list[RouteSpec]:
    return [s for s in get_pipeline_specs() if not s.skip]
