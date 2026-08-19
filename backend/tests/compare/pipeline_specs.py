"""Pipeline namespace request specs for golden-snapshot testing.

19 routes: 9 active (8 GETs + 1 POST review), 10 skipped (mutations + imports + binary export).

Self-contained: uses compare_test_sia_pipe + compare_test_sia annotask (created by init_test_data.py).
No new init_test_data.py additions needed.
"""

from __future__ import annotations

from tests.helpers.recorder import RequestSpec
from tests.compare.user_specs import RouteSpec


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


def get_pipeline_specs() -> list[RouteSpec]:
    specs: list[RouteSpec] = []

    # --- Simple GETs (no setup needed) ---

    # 1. GET /api/pipeline/template/all — list all templates
    specs.append(RouteSpec(
        name="GET_pipeline_templates_all",
        request=RequestSpec(method="GET", path="/api/pipeline/template/all", mode="structural"),
    ))

    # 2. GET /api/pipeline/template/global — list global templates
    specs.append(RouteSpec(
        name="GET_pipeline_templates_global",
        request=RequestSpec(method="GET", path="/api/pipeline/template/global", mode="structural"),
    ))

    # 3. GET /api/pipeline — list all pipelines
    specs.append(RouteSpec(
        name="GET_pipeline_list",
        request=RequestSpec(method="GET", path="/api/pipeline", mode="structural"),
    ))

    # 4. GET /api/pipeline/0/10 — paginated list
    specs.append(RouteSpec(
        name="GET_pipeline_paged",
        request=RequestSpec(method="GET", path="/api/pipeline/0/10", mode="structural"),
    ))

    # 5. GET /api/pipeline/project/all — list all projects
    specs.append(RouteSpec(
        name="GET_pipeline_projects_all",
        request=RequestSpec(method="GET", path="/api/pipeline/project/all", mode="structural"),
    ))

    # --- GETs needing ID lookup ---

    # 6. GET /api/pipeline/{id} — get pipeline by ID
    specs.append(RouteSpec(
        name="GET_pipeline_by_id",
        request=RequestSpec(method="GET", path="/api/pipeline/{pipe_id}", mode="structural"),
        setup=_setup_pipe_context,
    ))

    # 7. GET /api/pipeline/element/{id}/logs — get element logs
    specs.append(RouteSpec(
        name="GET_pipeline_element_logs",
        request=RequestSpec(
            method="GET", path="/api/pipeline/element/{pipe_element_id}/logs", mode="structural",
        ),
        setup=_setup_pipe_context,
    ))

    # 8. GET /api/pipeline/element/{id}/review/options — review options
    specs.append(RouteSpec(
        name="GET_pipeline_review_options",
        request=RequestSpec(
            method="GET", path="/api/pipeline/element/{annotask_id}/review/options", mode="structural",
        ),
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
        request=RequestSpec(method="GET", path="/api/pipeline/project/export/{pipe_project}"),
        skip=True,
        skip_reason="Binary zip download — recorder needs fix for binary responses. Verified manually in P1.2.",
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

    return specs


def get_active_pipeline_specs() -> list[RouteSpec]:
    return [s for s in get_pipeline_specs() if not s.skip]
