"""Pipeline coordination layer — thin routing of endpoint calls to business.

Flow
----
PipelineEndpoint  ->  PipelineCoordination  ->  PipelineBusiness
"""
from __future__ import annotations

from lost.controllers.pipeline.PipelineBusiness import PipelineBusiness


class PipelineCoordination:
    """Coordination service for the pipeline namespace — thin delegation."""

    def __init__(self, business: PipelineBusiness) -> None:
        self._business = business

    def get_template_or_templates(self, user, id_or_visibility: str):
        """Template(s) by ID or visibility. Delegates to PipelineBusiness.get_template_or_templates."""
        return self._business.get_template_or_templates(user, id_or_visibility)

    def get_projects(self, user, visibility: str) -> dict:
        """Pipeline projects. Delegates to PipelineBusiness.get_projects."""
        return self._business.get_projects(user, visibility)

    def export_project(self, pipe_project: str) -> tuple[bytes, str]:
        """(zip_bytes, name). Delegates to PipelineBusiness.export_project."""
        return self._business.export_project(pipe_project)

    def import_zip(self, user, filename: str, contents: bytes) -> str:
        """Zip import. Delegates to PipelineBusiness.import_zip."""
        return self._business.import_zip(user, filename, contents)

    def import_git(self, user, git_url: str, git_branch: str) -> str:
        """Git import. Delegates to PipelineBusiness.import_git."""
        return self._business.import_git(user, git_url, git_branch)

    def delete_project(self, pipe_project: str) -> str:
        """Delete project. Delegates to PipelineBusiness.delete_project."""
        return self._business.delete_project(pipe_project)

    def get_element_logs(self, user, pipeline_element_id: int) -> str:
        """Log file content. Delegates to PipelineBusiness.get_element_logs."""
        return self._business.get_element_logs(user, pipeline_element_id)

    def get_review_options(self, user, pipeline_element_id: int):
        """Review options. Delegates to PipelineBusiness.get_review_options."""
        return self._business.get_review_options(user, pipeline_element_id)

    def review_update(self, user, anno_task_id: int, data: dict):
        """Update review. Delegates to PipelineBusiness.review_update."""
        return self._business.review_update(user, anno_task_id, data)

    def review(self, user, anno_task_id: int, data: dict):
        """Review navigation. Delegates to PipelineBusiness.review."""
        return self._business.review(user, anno_task_id, data)

    def start_pipeline(self, user, data: dict) -> str:
        """Start pipeline. Delegates to PipelineBusiness.start_pipeline."""
        return self._business.start_pipeline(user, data)

    def update_arguments(self, data: bytes):
        """Update arguments. Delegates to PipelineBusiness.update_arguments."""
        return self._business.update_arguments(data)

    def pause_pipeline(self, pipeline_id: int) -> str:
        """Pause. Delegates to PipelineBusiness.pause_pipeline."""
        return self._business.pause_pipeline(pipeline_id)

    def play_pipeline(self, pipeline_id: int) -> str:
        """Play. Delegates to PipelineBusiness.play_pipeline."""
        return self._business.play_pipeline(pipeline_id)

    def get_pipelines(self, user):
        """All pipelines. Delegates to PipelineBusiness.get_pipelines."""
        return self._business.get_pipelines(user)

    def get_pipelines_paged(self, user, page_index: int, page_size: int) -> dict:
        """Paged pipelines. Delegates to PipelineBusiness.get_pipelines_paged."""
        return self._business.get_pipelines_paged(user, page_index, page_size)

    def get_pipeline(self, user, pipeline_id: int):
        """One pipeline. Delegates to PipelineBusiness.get_pipeline."""
        return self._business.get_pipeline(user, pipeline_id)

    def delete_pipeline(self, pipeline_id: int) -> str:
        """Delete pipeline. Delegates to PipelineBusiness.delete_pipeline."""
        return self._business.delete_pipeline(pipeline_id)