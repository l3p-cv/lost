"""Pipeline business layer — pipeline management, templates, projects, review flows.

No module-local lost/logic move beyond ``pipeline/tasks.py`` (celery leftover,
folded in as delete_pipeline): ``logic/pipeline/service.py`` (execution
machinery), ``logic/template.py`` and ``logic/pipeline/template_import.py``
stay shared (used by worker, jobs, cli, pyapi). Review flows call the SIA
domain functions directly (business tier). Legacy error semantics are
self-describing DomainErrors (JSON-string 403 bodies, dynamic 404/500 bodies).
"""
from __future__ import annotations

import os
import shutil
import subprocess
import traceback
from io import BytesIO

from lostconfig import LOSTConfig
from lost.controllers.Exceptions import DomainError
from lost.controllers.sia.SiaBusiness import (
    review as sia_review,
    review_update as sia_review_update,
    reviewoptions as sia_reviewoptions,
)
from lost.db import roles
from lost.db.access import DBMan
from lost.db.vis_level import VisLevel
from lost.logic.file_access import UserFileAccess
from lost.logic.file_man import AppFileMan
from lost.logic.pipeline import service as pipeline_service
from lost.logic.pipeline import template_import
from lost.logic import template as template_service
from lost.settings import DATA_URL, LOST_CONFIG


class TemplateRoleError(DomainError):
    """Legacy 403 JSON-string role body."""
    http_status = 403

    def __init__(self, role_name: str) -> None:
        super().__init__(role_name)
        self.http_body = f"You need to be {role_name} in order to perform this request."


class TemplateNotFoundError(DomainError):
    http_status = 404

    def __init__(self, result) -> None:
        super().__init__(result)
        self.http_body = {"message": result or "Template not found."}


class StartNoDefaultGroupError(DomainError):
    http_status = 400

    def __init__(self, user_id: int) -> None:
        super().__init__(user_id)
        self.http_body = f"default group for user {user_id} not found."


class PipeImportJSONError(DomainError):
    """Legacy 500 traceback-string body for broken import payloads."""
    http_status = 500

    def __init__(self, trace: str) -> None:
        super().__init__(trace)
        self.http_body = trace


class PipelineBusiness:
    """Pipeline business service — templates, projects, pipelines, review flows."""

    def __init__(self, dbm) -> None:
        self.dbm = dbm

    # --- templates / projects ---

    def get_template_or_templates(self, user, id_or_visibility: str):
        """Template by int ID, or templates by visibility; None → empty schema.

        Returns: dict (single template) | list (template list) | None (unknown
        visibility — the endpoint answers with an empty TemplatesSchema).
        """
        try:
            template_id = int(id_or_visibility)
            if not user.has_role(roles.DESIGNER):
                raise TemplateRoleError(roles.DESIGNER)
            result = template_service.get_template(self.dbm, template_id, user)
            if isinstance(result, str) or result is None:
                raise TemplateNotFoundError(result)
            return result
        except ValueError:
            visibility = id_or_visibility
            default_group = self.dbm.get_group_by_name(user.user_name)
            if visibility == VisLevel.USER:
                if not user.has_role(roles.DESIGNER):
                    raise TemplateRoleError(roles.DESIGNER)
                return template_service.get_templates(self.dbm, group_id=default_group.idx)
            elif visibility == VisLevel.GLOBAL:
                if not user.has_role(roles.ADMINISTRATOR):
                    # legacy: the body names DESIGNER even though ADMINISTRATOR is checked
                    raise TemplateRoleError(roles.DESIGNER)
                return template_service.get_templates(self.dbm)
            elif visibility == VisLevel.ALL:
                if not user.has_role(roles.DESIGNER):
                    raise TemplateRoleError(roles.DESIGNER)
                return template_service.get_templates(self.dbm, group_id=default_group.idx, add_global=True)
            return None

    def get_projects(self, user, visibility: str) -> dict:
        """Pipeline projects deduplicated by pipeProject (legacy if-chain verbatim)."""
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

        default_group = self.dbm.get_group_by_name(user.user_name)
        if visibility == VisLevel.USER:
            if not user.has_role(roles.DESIGNER):
                raise TemplateRoleError(roles.DESIGNER)
            re = template_service.get_templates(self.dbm, group_id=default_group.idx)
        if visibility == VisLevel.GLOBAL:
            if not user.has_role(roles.ADMINISTRATOR):
                raise TemplateRoleError(roles.DESIGNER)
            re = template_service.get_templates(self.dbm)
        if visibility == VisLevel.ALL:
            if not user.has_role(roles.DESIGNER):
                raise TemplateRoleError(roles.DESIGNER)
            re = template_service.get_templates(self.dbm, group_id=default_group.idx, add_global=True)
        return filter_by_pipe_project(re)

    def export_project(self, pipe_project: str) -> tuple[bytes, str]:
        """(zip_bytes, project_name) for the project export."""
        pipe_template = self.dbm.get_pipe_template_by_pipe_project(pipe_project)[0]
        f = BytesIO()
        template_import.pack_pipe_project_to_stream(f, pipe_template.install_path)
        f.seek(0)
        return f.read(), pipe_project

    def import_zip(self, user, filename: str, contents: bytes) -> str:
        """Import a pipeline project from zip contents."""
        upload_path = None
        try:
            fm = AppFileMan(LOST_CONFIG)
            upload_path = fm.get_upload_path(user.idx, filename)
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
            raise PipeImportJSONError(traceback.format_exc()) from None
        except Exception:
            shutil.rmtree(upload_path, errors=True)
            raise

    def import_git(self, user, git_url: str, git_branch: str) -> str:
        """Import a pipeline project from a git repository."""
        def git(*args):
            return subprocess.check_call(["git"] + list(args))

        upload_path = None
        try:
            fm = AppFileMan(LOST_CONFIG)
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
            importer = template_import.PipeImporter(dst_path, self.dbm)
            error_message = importer.start_import()
            shutil.rmtree(upload_path)
            if error_message != "":
                return error_message
            return "success"
        except template_import.JSONDecodeError:
            shutil.rmtree(upload_path, errors=True)
            raise PipeImportJSONError(traceback.format_exc()) from None
        except Exception:
            shutil.rmtree(upload_path, errors=True)
            raise

    def delete_project(self, pipe_project: str) -> str:
        fm = AppFileMan(LOST_CONFIG)
        pipe_template = self.dbm.get_pipe_template_by_pipe_project(pipe_project)[0]
        importer = template_import.PipeImporter(pipe_template.install_path, self.dbm)
        importer.remove_pipe_project()
        return "success"

    # --- elements / review flows ---

    def get_element_logs(self, user, pipeline_element_id: int) -> str:
        user_fs = self.dbm.get_user_default_fs(user.idx)
        ufa = UserFileAccess(self.dbm, user, user_fs)
        return ufa.get_pipe_log_file(pipeline_element_id)

    def get_review_options(self, user, pipeline_element_id: int):
        return sia_reviewoptions(self.dbm, pipeline_element_id, user.idx)

    def review_update(self, user, anno_task_id: int, data: dict):
        return sia_review_update(self.dbm, data, user.idx, anno_task_id)

    def review(self, user, anno_task_id: int, data: dict):
        return sia_review(self.dbm, data, user.idx, DATA_URL)

    # --- pipeline lifecycle ---

    def start_pipeline(self, user, data: dict) -> str:
        group_id = None
        for user_group in self.dbm.get_user_groups_by_user_id(user.idx):
            if user_group.group.is_user_default:
                group_id = user_group.group.idx
        if group_id:
            pipeline_service.start(self.dbm, data, user.idx, group_id)
            return "success"
        raise StartNoDefaultGroupError(user.idx)

    def update_arguments(self, data: bytes):
        return pipeline_service.updateArguments(self.dbm, data)

    def pause_pipeline(self, pipeline_id: int) -> str:
        pipeline_service.pause(self.dbm, pipeline_id)
        return "success"

    def play_pipeline(self, pipeline_id: int) -> str:
        pipeline_service.play(self.dbm, pipeline_id)
        return "success"

    def get_pipelines(self, user):
        group_ids = [g.group_id for g in user.groups]
        return pipeline_service.get_pipelines(self.dbm, group_ids)

    def get_pipelines_paged(self, user, page_index: int, page_size: int) -> dict:
        group_ids = [g.group_id for g in user.groups]
        re, pages = pipeline_service.get_pipelines_paged(self.dbm, group_ids, page_index, page_size)
        return {"pipelines": re, "pages": pages}

    def get_pipeline(self, user, pipeline_id: int):
        return pipeline_service.get_running_pipe(self.dbm, user.idx, pipeline_id, DATA_URL)

    def delete_pipeline(self, pipeline_id: int) -> str:
        """Delete a pipeline (folded from pipeline/tasks.py — celery leftover).

        Kept verbatim: a fresh DBMan session per delete, exactly like the
        original task.
        """
        lostconfig = LOSTConfig()
        dbm = DBMan(lostconfig)
        pipeline_service.delete(dbm, pipeline_id)
        dbm.close_session()
        return "success"