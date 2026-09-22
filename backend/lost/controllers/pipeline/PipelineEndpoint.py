"""Pipeline namespace — FastAPI endpoints for pipeline management.

Routes:
    GET    /api/pipeline/template/{visibility}                    — list templates (designer/admin)
    GET    /api/pipeline/template/{template_id}                  — get template by ID (designer)
    GET    /api/pipeline                                       — list all pipelines (designer)
    GET    /api/pipeline/{page_index}/{page_size}               — paginated list (designer)
    GET    /api/pipeline/{pipeline_id}                          — get pipeline by ID (designer)
    DELETE /api/pipeline/{pipeline_id}                          — delete pipeline (designer)
    POST   /api/pipeline/start                                 — start pipeline (designer)
    POST   /api/pipeline/updateArguments                        — update arguments (designer)
    POST   /api/pipeline/pause/{pipeline_id}                   — pause pipeline (designer)
    POST   /api/pipeline/play/{pipeline_id}                    — play pipeline (designer)
    POST   /api/pipeline/project/import_zip                     — import from zip (admin)
    POST   /api/pipeline/project/import_git                     — import from git (admin)
    GET    /api/pipeline/project/export/{pipe_project}          — export as zip (admin)
    POST   /api/pipeline/project/delete                        — delete project (admin)
    GET    /api/pipeline/project/{visibility}                  — list projects (designer/admin)
    GET    /api/pipeline/element/{pipeline_element_id}/logs    — get logs (annotator)
    POST   /api/pipeline/element/{anno_task_id}/review         — review navigation (designer)
    PUT    /api/pipeline/element/{anno_task_id}/review         — update review (designer)
    GET    /api/pipeline/element/{pipeline_element_id}/review/options — review options (designer)
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, File, Request, UploadFile
from fastapi.responses import Response
from pydantic import BaseModel

from lost.controllers.base import ProfilingRoute
from lost.controllers.Dependencies import get_current_user, get_pipeline_coordination, require_role
from lost.controllers.pipeline.PipelineCoordination import PipelineCoordination
from lost.db import roles
from lost.db.model import User as DBUser

router = APIRouter(tags=["pipeline"], route_class=ProfilingRoute)


# --- Schemas ---


class StartPipelineRequest(BaseModel):
    # Flexible — the actual structure is validated by pipeline_service.start()
    pass


class ImportGitRequest(BaseModel):
    gitUrl: str
    gitBranch: str


class DeleteProjectRequest(BaseModel):
    pipeProject: str


class ReviewRequest(BaseModel):
    direction: str
    lastImgId: int | None = None

class TemplateSchema(BaseModel):
    id: int | None = None
    group_id: int | None = None
    pipeProject: str | None = None
    description: str | None = None
    author: str | None = None
    namespace: str | None = None
    name: str | None = None
    date: str | None = None
    availableLabelTrees: dict | list | None = None
    availableGroups: dict | list | None = None
    pipelineCount: int | None = None
    elements: dict | list | None = None


class TemplatesSchema(BaseModel):
    templates: list[TemplateSchema] = []

# --- Routes ---


# Single route for /template/{id_or_visibility} — FastAPI doesn't do route fallthrough,
# so we handle both int (template ID) and str (visibility) in one function
@router.get("/template/{template_id_or_visibility}")
def get_template_or_templates(
    template_id_or_visibility: str,
    user: DBUser = Depends(get_current_user),
    coord: PipelineCoordination = Depends(get_pipeline_coordination),
):
    """Get pipeline template by ID or list templates by visibility."""
    result = coord.get_template_or_templates(user, template_id_or_visibility)
    if result is None:
        return TemplatesSchema()
    if isinstance(result, dict) and "templates" in result:
        return TemplatesSchema.model_validate(result)
    return result


@router.get("/project/{visibility}", response_model=TemplatesSchema)
def get_projects(
    visibility: str,
    user: DBUser = Depends(get_current_user),
    coord: PipelineCoordination = Depends(get_pipeline_coordination),
):
    """Get list of pipeline projects for given visibility (deduplicated by pipeProject)."""
    return coord.get_projects(user, visibility)


@router.get("/project/export/{pipe_project}")
def export_project(
    pipe_project: str,
    user: DBUser = Depends(require_role(roles.ADMINISTRATOR)),
    coord: PipelineCoordination = Depends(get_pipeline_coordination),
):
    """Export a pipeline project as a zip file."""
    zip_bytes, project_name = coord.export_project(pipe_project)
    return Response(
        content=zip_bytes,
        media_type="blob",
        headers={"Content-Disposition": f"attachment; filename={project_name}.zip"},
    )


@router.post("/project/import_zip")
async def import_zip(
    zip_file: UploadFile = File(..., alias="zip_file"),
    user: DBUser = Depends(require_role(roles.ADMINISTRATOR)),
    coord: PipelineCoordination = Depends(get_pipeline_coordination),
):
    """Import a pipeline project from a zip file."""
    contents = await zip_file.read()
    return coord.import_zip(user, zip_file.filename, contents)


@router.post("/project/import_git")
def import_git(
    req: ImportGitRequest,
    user: DBUser = Depends(require_role(roles.ADMINISTRATOR)),
    coord: PipelineCoordination = Depends(get_pipeline_coordination),
):
    """Import a pipeline project from a git repository."""
    return coord.import_git(user, req.gitUrl, req.gitBranch)


@router.post("/project/delete")
def delete_project(
    req: DeleteProjectRequest,
    user: DBUser = Depends(require_role(roles.ADMINISTRATOR)),
    coord: PipelineCoordination = Depends(get_pipeline_coordination),
):
    """Delete a pipeline project."""
    return coord.delete_project(req.pipeProject)


@router.get("/element/{pipeline_element_id}/logs")
def get_element_logs(
    pipeline_element_id: int,
    user: DBUser = Depends(require_role(roles.ANNOTATOR)),
    coord: PipelineCoordination = Depends(get_pipeline_coordination),
):
    """Get logs for a pipeline element."""
    return Response(
        content=coord.get_element_logs(user, pipeline_element_id),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=log.csv"},
    )


@router.get("/element/{pipeline_element_id}/review/options")
def get_review_options(
    pipeline_element_id: int,
    user: DBUser = Depends(require_role(roles.DESIGNER)),
    coord: PipelineCoordination = Depends(get_pipeline_coordination),
):
    """Get review options for a pipeline element."""
    return coord.get_review_options(user, pipeline_element_id)


@router.put("/element/{anno_task_id}/review")
def review_update(
    anno_task_id: int,
    data: dict,
    user: DBUser = Depends(require_role(roles.DESIGNER)),
    coord: PipelineCoordination = Depends(get_pipeline_coordination),
):
    """Update review annotation."""
    return coord.review_update(user, anno_task_id, data)


@router.post("/element/{anno_task_id}/review")
def review(
    anno_task_id: int,
    data: dict,
    user: DBUser = Depends(require_role(roles.DESIGNER)),
    coord: PipelineCoordination = Depends(get_pipeline_coordination),
):
    """Get data for the next review annotation."""
    return coord.review(user, anno_task_id, data)


@router.post("/start")
def start_pipeline(
    data: dict,
    user: DBUser = Depends(require_role(roles.DESIGNER)),
    coord: PipelineCoordination = Depends(get_pipeline_coordination),
):
    """Start a new pipeline."""
    return coord.start_pipeline(user, data)


@router.post("/updateArguments")
async def update_arguments(
    request: Request,
    user: DBUser = Depends(require_role(roles.DESIGNER)),
    coord: PipelineCoordination = Depends(get_pipeline_coordination),
):
    """Update pipeline arguments. Accepts raw bytes (same as Flask)."""
    data = await request.body()
    return coord.update_arguments(data)


@router.post("/pause/{pipeline_id}")
def pause_pipeline(
    pipeline_id: int,
    user: DBUser = Depends(require_role(roles.DESIGNER)),
    coord: PipelineCoordination = Depends(get_pipeline_coordination),
):
    """Pause a pipeline."""
    return coord.pause_pipeline(pipeline_id)


@router.post("/play/{pipeline_id}")
def play_pipeline(
    pipeline_id: int,
    user: DBUser = Depends(require_role(roles.DESIGNER)),
    coord: PipelineCoordination = Depends(get_pipeline_coordination),
):
    """Play (resume) a pipeline."""
    return coord.play_pipeline(pipeline_id)


@router.get("")
def get_pipelines(
    user: DBUser = Depends(require_role(roles.DESIGNER)),
    coord: PipelineCoordination = Depends(get_pipeline_coordination),
):
    """Get all pipelines."""
    return coord.get_pipelines(user)


@router.get("/{page_index}/{page_size}")
def get_pipelines_paged(
    page_index: int,
    page_size: int,
    user: DBUser = Depends(require_role(roles.DESIGNER)),
    coord: PipelineCoordination = Depends(get_pipeline_coordination),
):
    """Get all pipelines paged."""
    return coord.get_pipelines_paged(user, page_index, page_size)


@router.get("/{pipeline_id}")
def get_pipeline(
    pipeline_id: int,
    user: DBUser = Depends(require_role(roles.DESIGNER)),
    coord: PipelineCoordination = Depends(get_pipeline_coordination),
):
    """Get pipeline with given ID."""
    return coord.get_pipeline(user, pipeline_id)


@router.delete("/{pipeline_id}")
def delete_pipeline(
    pipeline_id: int,
    user: DBUser = Depends(require_role(roles.DESIGNER)),
    coord: PipelineCoordination = Depends(get_pipeline_coordination),
):
    """Delete pipeline with given ID."""
    return coord.delete_pipeline(pipeline_id)
