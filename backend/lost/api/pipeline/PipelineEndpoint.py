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

import json
import os
import shutil
import subprocess
import traceback
from io import BytesIO

from fastapi import APIRouter, Depends, UploadFile, File
from fastapi.responses import Response, PlainTextResponse, JSONResponse
from pydantic import BaseModel

from lost.api.auth.dependencies import get_current_user, require_role
from lost.api.base import ProfilingRoute
from lost.api.pipeline import tasks
from lost.db import roles
from lost.db.access import DBMan
from lost.db.model import User as DBUser
from lost.db.session import get_db
from lost.db.vis_level import VisLevel
from lost.logic import sia
from lost.logic import template as template_service
from lost.logic.file_access import UserFileAccess
from lost.logic.file_man import AppFileMan
from lost.logic.pipeline import service as pipeline_service
from lost.logic.pipeline import template_import
from lost.settings import DATA_URL, LOST_CONFIG

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
    dbm: DBMan = Depends(get_db),
):
    """Get pipeline template by ID or list templates by visibility."""
    # Try to parse as int (template ID)
    try:
        template_id = int(template_id_or_visibility)
        # It's a template ID — require designer
        if not user.has_role(roles.DESIGNER):
            return f"You need to be {roles.DESIGNER} in order to perform this request.", 403
        result = template_service.get_template(dbm, template_id, user)
        if isinstance(result, str) or result is None:
            return JSONResponse(status_code=404, content={"message": result or "Template not found."})
        return result
    except ValueError:
        # It's a visibility level (all/global/user)
        visibility = template_id_or_visibility
        default_group = dbm.get_group_by_name(user.user_name)
        if visibility == VisLevel.USER:
            if not user.has_role(roles.DESIGNER):
                return f"You need to be {roles.DESIGNER} in order to perform this request.", 403
            result = template_service.get_templates(dbm, group_id=default_group.idx)
        elif visibility == VisLevel.GLOBAL:
            if not user.has_role(roles.ADMINISTRATOR):
                return f"You need to be {roles.DESIGNER} in order to perform this request.", 403
            result = template_service.get_templates(dbm)
        elif visibility == VisLevel.ALL:
            if not user.has_role(roles.DESIGNER):
                return f"You need to be {roles.DESIGNER} in order to perform this request.", 403
            result = template_service.get_templates(dbm, group_id=default_group.idx, add_global=True)
        else:
            return TemplatesSchema()
        # Validate through TemplatesSchema to match Flask's marshal_with(templates) — fills missing keys with null, strips extra keys
        return TemplatesSchema.model_validate(result)

@router.get("/project/{visibility}", response_model=TemplatesSchema)
def get_projects(
    visibility: str,
    user: DBUser = Depends(get_current_user),
    dbm: DBMan = Depends(get_db),
):
    """Get list of pipeline projects for given visibility (deduplicated by pipeProject)."""
    def filter_by_pipe_project(re):
        pipe_projects = []
        unique = []
        pipe_project_counter = {}
        for x in re["templates"]:
            if x["pipeProject"] in pipe_project_counter:
                pipe_project_counter[x["pipeProject"]] += x["pipelineCount"]
            else:
                pipe_project_counter[x["pipeProject"]] = x["pipelineCount"]
            if x["pipeProject"] not in pipe_projects:
                unique.append(x)
                pipe_projects.append(x["pipeProject"])
        for project_name in pipe_projects:
            for un in unique:
                if un["pipeProject"] == project_name:
                    un["pipelineCount"] = pipe_project_counter[project_name]
        return {"templates": unique}
    default_group = dbm.get_group_by_name(user.user_name)
    if visibility == VisLevel.USER:
        if not user.has_role(roles.DESIGNER):
            return f"You need to be {roles.DESIGNER} in order to perform this request.", 403
        re = template_service.get_templates(dbm, group_id=default_group.idx)
    if visibility == VisLevel.GLOBAL:
        if not user.has_role(roles.ADMINISTRATOR):
            return f"You need to be {roles.DESIGNER} in order to perform this request.", 403
        re = template_service.get_templates(dbm)
    if visibility == VisLevel.ALL:
        if not user.has_role(roles.DESIGNER):
            return f"You need to be {roles.DESIGNER} in order to perform this request.", 403
        re = template_service.get_templates(dbm, group_id=default_group.idx, add_global=True)
    else:
        return TemplatesSchema()
    return filter_by_pipe_project(re)

@router.get("/project/export/{pipe_project}")
def export_project(
    pipe_project: str,
    user: DBUser = Depends(require_role(roles.ADMINISTRATOR)),
    dbm: DBMan = Depends(get_db),
):
    """Export a pipeline project as a zip file."""
    pipe_template = dbm.get_pipe_template_by_pipe_project(pipe_project)[0]
    f = BytesIO()
    template_import.pack_pipe_project_to_stream(f, pipe_template.install_path)
    f.seek(0)
    return Response(
        content=f.read(),
        media_type="blob",
        headers={"Content-Disposition": f"attachment; filename={pipe_project}.zip"},
    )

@router.post("/project/import_zip")
async def import_zip(
    zip_file: UploadFile = File(..., alias="zip_file"),
    user: DBUser = Depends(require_role(roles.ADMINISTRATOR)),
    dbm: DBMan = Depends(get_db),
):
    """Import a pipeline project from a zip file."""
    try:
        fm = AppFileMan(LOST_CONFIG)
        contents = await zip_file.read()
        upload_path = fm.get_upload_path(user.idx, zip_file.filename)
        with open(upload_path, "wb") as f:
            f.write(contents)
        pp_path = fm.get_pipe_project_path()
        dst_dir = os.path.basename(upload_path)
        dst_dir = os.path.splitext(dst_dir)[0]
        e_path = os.path.join(os.path.split(upload_path)[0], "extract")
        extract_path = os.path.join(e_path, dst_dir)
        dst_path = os.path.join(pp_path, dst_dir)
        if os.path.exists(dst_path):
            shutil.rmtree(dst_path)
        try:
            template_import.unpack_pipe_project(upload_path, extract_path)
        except Exception:
            return "No valid pipeline found."
        shutil.copytree(extract_path, dst_path, dirs_exist_ok=True)
        dbm = __import__("lost.db.access", fromlist=["DBMan"]).DBMan(LOST_CONFIG)
        importer = template_import.PipeImporter(dst_path, dbm)
        error_message = importer.start_import()
        fm.fs.rm(upload_path, recursive=True)
        fm.fs.rm(e_path, recursive=True)
        if error_message != "":
            return error_message
        return "success"
    except template_import.JSONDecodeError:
        shutil.rmtree(upload_path, errors=True)
        return JSONResponse(status_code=500, content=traceback.format_exc())
    except Exception:
        shutil.rmtree(upload_path, errors=True)
        raise


@router.post("/project/import_git")
def import_git(
    req: ImportGitRequest,
    user: DBUser = Depends(require_role(roles.ADMINISTRATOR)),
    dbm: DBMan = Depends(get_db),
):
    """Import a pipeline project from a git repository."""
    def git(*args):
        return subprocess.check_call(["git"] + list(args))
    try:
        fm = AppFileMan(LOST_CONFIG)
        git_url = req.gitUrl
        git_branch = req.gitBranch
        git_project = os.path.splitext(os.path.basename(git_url))[0]
        upload_path = fm.get_upload_path(user.idx, git_project)
        if git_branch == "main":
            git("clone", git_url, upload_path)
        else:
            git("clone", git_url, upload_path, "-b", git_branch)
        pp_path = fm.get_pipe_project_path()
        dst_dir = os.path.basename(upload_path)
        dst_path = os.path.join(pp_path, dst_dir)
        if os.path.exists(dst_path):
            shutil.rmtree(dst_path)
        shutil.copytree(upload_path, dst_path, dirs_exist_ok=True)
        importer = template_import.PipeImporter(dst_path, dbm)
        error_message = importer.start_import()
        shutil.rmtree(upload_path)
        if error_message != "":
            return error_message
        return "success"
    except template_import.JSONDecodeError:
        shutil.rmtree(upload_path, errors=True)
        return JSONResponse(status_code=500, content=traceback.format_exc())
    except Exception:
        shutil.rmtree(upload_path, errors=True)
        raise


@router.post("/project/delete")
def delete_project(
    req: DeleteProjectRequest,
    user: DBUser = Depends(require_role(roles.ADMINISTRATOR)),
    dbm: DBMan = Depends(get_db),
):
    """Delete a pipeline project."""
    fm = AppFileMan(LOST_CONFIG)
    pipe_template = dbm.get_pipe_template_by_pipe_project(req.pipeProject)[0]
    importer = template_import.PipeImporter(pipe_template.install_path, dbm)
    importer.remove_pipe_project()
    return "success"


@router.get("/element/{pipeline_element_id}/logs")
def get_element_logs(
    pipeline_element_id: int,
    user: DBUser = Depends(require_role(roles.ANNOTATOR)),
    dbm: DBMan = Depends(get_db),
):
    """Get logs for a pipeline element."""
    user_fs = dbm.get_user_default_fs(user.idx)
    ufa = UserFileAccess(dbm, user, user_fs)
    return Response(
        content=ufa.get_pipe_log_file(pipeline_element_id),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=log.csv"},
    )

@router.get("/element/{pipeline_element_id}/review/options")
def get_review_options(
    pipeline_element_id: int,
    user: DBUser = Depends(require_role(roles.DESIGNER)),
    dbm: DBMan = Depends(get_db),
):
    """Get review options for a pipeline element."""
    return sia.reviewoptions(dbm, pipeline_element_id, user.idx)


@router.put("/element/{anno_task_id}/review")
def review_update(
    anno_task_id: int,
    data: dict,
    user: DBUser = Depends(require_role(roles.DESIGNER)),
    dbm: DBMan = Depends(get_db),
):
    """Update review annotation."""
    return sia.review_update(dbm, data, user.idx, anno_task_id)

@router.post("/element/{anno_task_id}/review")
def review(
    anno_task_id: int,
    data: dict,
    user: DBUser = Depends(require_role(roles.DESIGNER)),
    dbm: DBMan = Depends(get_db),
):
    """Get data for the next review annotation."""
    return sia.review(dbm, data, user.idx, DATA_URL)


@router.post("/start")
def start_pipeline(
    data: dict,
    user: DBUser = Depends(require_role(roles.DESIGNER)),
    dbm: DBMan = Depends(get_db),
):
    """Start a new pipeline."""
    group_id = None
    for user_group in dbm.get_user_groups_by_user_id(user.idx):
        if user_group.group.is_user_default:
            group_id = user_group.group.idx
    if group_id:
        pipeline_service.start(dbm, data, user.idx, group_id)
        return "success"
    return f"default group for user {user.idx} not found.", 400


@router.post("/updateArguments")
def update_arguments(
    data: bytes,
    user: DBUser = Depends(require_role(roles.DESIGNER)),
    dbm: DBMan = Depends(get_db),
):
    """Update pipeline arguments. Accepts raw bytes (same as Flask)."""
    return pipeline_service.updateArguments(dbm, data)


@router.post("/pause/{pipeline_id}")
def pause_pipeline(
    pipeline_id: int,
    user: DBUser = Depends(require_role(roles.DESIGNER)),
    dbm: DBMan = Depends(get_db),
):
    """Pause a pipeline."""
    pipeline_service.pause(dbm, pipeline_id)
    return "success"


@router.post("/play/{pipeline_id}")
def play_pipeline(
    pipeline_id: int,
    user: DBUser = Depends(require_role(roles.DESIGNER)),
    dbm: DBMan = Depends(get_db),
):
    """Play (resume) a pipeline."""
    pipeline_service.play(dbm, pipeline_id)
    return "success"


@router.get("")
def get_pipelines(
    user: DBUser = Depends(require_role(roles.DESIGNER)),
    dbm: DBMan = Depends(get_db),
):
    """Get all pipelines."""
    group_ids = [g.group_id for g in user.groups]
    return pipeline_service.get_pipelines(dbm, group_ids)


@router.get("/{page_index}/{page_size}")
def get_pipelines_paged(
    page_index: int,
    page_size: int,
    user: DBUser = Depends(require_role(roles.DESIGNER)),
    dbm: DBMan = Depends(get_db),
):
    """Get all pipelines paged."""
    group_ids = [g.group_id for g in user.groups]
    re, pages = pipeline_service.get_pipelines_paged(dbm, group_ids, page_index, page_size)
    return {"pipelines": re, "pages": pages}


@router.get("/{pipeline_id}")
def get_pipeline(
    pipeline_id: int,
    user: DBUser = Depends(require_role(roles.DESIGNER)),
    dbm: DBMan = Depends(get_db),
):
    """Get pipeline with given ID."""
    return pipeline_service.get_running_pipe(dbm, user.idx, pipeline_id, DATA_URL)


@router.delete("/{pipeline_id}")
def delete_pipeline(
    pipeline_id: int,
    user: DBUser = Depends(require_role(roles.DESIGNER)),
    dbm: DBMan = Depends(get_db),
):
    """Delete pipeline with given ID."""
    tasks.delete_pipe(pipeline_id)
    return "success"