"""Annotasks coordination layer — thin routing of endpoint calls to business.

Flow
----
AnnotasksEndpoint  ->  AnnotasksCoordination  ->  AnnotasksBusiness
"""
from __future__ import annotations

from lost.controllers.annotasks.AnnotasksBusiness import AnnotasksBusiness


class AnnotasksCoordination:
    """Coordination service for the annotasks namespace — thin delegation."""

    def __init__(self, business: AnnotasksBusiness) -> None:
        self._business = business

    def get_annotasks(self, user, page_size, page, filtered_name, filtered_states) -> dict:
        """List annotasks (paged or full). Delegates to AnnotasksBusiness.get_annotasks."""
        return self._business.get_annotasks(user, page_size, page, filtered_name, filtered_states)

    def choose_annotask(self, user, annotask_id: int) -> str:
        """Choose annotask. Delegates to AnnotasksBusiness.choose_annotask."""
        return self._business.choose_annotask(user, annotask_id)

    def get_working_annotask(self, user) -> dict:
        """Current working annotask. Delegates to AnnotasksBusiness.get_working_annotask."""
        return self._business.get_working_annotask(user)

    def get_filter_labels(self) -> dict:
        """Filter labels. Delegates to AnnotasksBusiness.get_filter_labels."""
        return self._business.get_filter_labels()

    def get_annotask_statistics(self, annotask_id: int) -> dict:
        """Annotask statistics. Delegates to AnnotasksBusiness.get_annotask_statistics."""
        return self._business.get_annotask_statistics(annotask_id)

    def download_annotask_export(self, user, annotask_export_id: int) -> tuple[bytes, str]:
        """(bytes, filename). Delegates to AnnotasksBusiness.download_annotask_export."""
        return self._business.download_annotask_export(user, annotask_export_id)

    def delete_annotask_export(self, user, annotask_export_id: int) -> str:
        """Delete export. Delegates to AnnotasksBusiness.delete_annotask_export."""
        return self._business.delete_annotask_export(user, annotask_export_id)

    def get_annotask_by_id(self, user, annotask_id: int, statistics, config) -> dict:
        """Annotask details. Delegates to AnnotasksBusiness.get_annotask_by_id."""
        return self._business.get_annotask_by_id(user, annotask_id, statistics, config)

    def force_release(self, annotask_id: int) -> str:
        """Force release. Delegates to AnnotasksBusiness.force_release."""
        return self._business.force_release(annotask_id)

    def change_group(self, user, annotask_id: int, group_id: int) -> str:
        """Change group. Delegates to AnnotasksBusiness.change_group."""
        return self._business.change_group(user, annotask_id, group_id)

    def update_annotask_config(self, user, annotask_id: int, configuration) -> str:
        """Update config. Delegates to AnnotasksBusiness.update_annotask_config."""
        return self._business.update_annotask_config(user, annotask_id, configuration)

    def get_storage_settings(self, annotask_id: int) -> dict:
        """Storage settings. Delegates to AnnotasksBusiness.get_storage_settings."""
        return self._business.get_storage_settings(annotask_id)

    def update_storage_settings(self, annotask_id: int, dataset_id: int) -> None:
        """Update storage. Delegates to AnnotasksBusiness.update_storage_settings."""
        return self._business.update_storage_settings(annotask_id, dataset_id)

    def generate_export(self, user, annotask_id: int, req) -> str:
        """Generate export. Delegates to AnnotasksBusiness.generate_export."""
        return self._business.generate_export(user, annotask_id, req)

    def get_annotask_exports(self, user, annotask_id: int) -> dict:
        """List exports. Delegates to AnnotasksBusiness.get_annotask_exports."""
        return self._business.get_annotask_exports(user, annotask_id)

    def get_annotask_instruction(self, annotask_id: int) -> dict:
        """Get instruction. Delegates to AnnotasksBusiness.get_annotask_instruction."""
        return self._business.get_annotask_instruction(annotask_id)

    def update_annotask_instruction(self, annotask_id: int, instruction_id) -> dict:
        """Update instruction. Delegates to AnnotasksBusiness.update_annotask_instruction."""
        return self._business.update_annotask_instruction(annotask_id, instruction_id)

    def get_review_images(self, annotask_id: int, filter, labels, annotated_only) -> dict:
        """Review image search. Delegates to AnnotasksBusiness.get_review_images."""
        return self._business.get_review_images(annotask_id, filter, labels, annotated_only)

    def get_review_labels(self, annotask_id: int):
        """Review labels. Delegates to AnnotasksBusiness.get_review_labels."""
        return self._business.get_review_labels(annotask_id)

    def update_one_thing(self, user, annotask_id: int, req):
        """Update one thing. Delegates to AnnotasksBusiness.update_one_thing."""
        return self._business.update_one_thing(user, annotask_id, req)

    def get_review_options(self, user, annotask_id: int):
        """Review options. Delegates to AnnotasksBusiness.get_review_options."""
        return self._business.get_review_options(user, annotask_id)

    def annotask_review(self, user, annotask_id: int, data: dict):
        """Review navigation. Delegates to AnnotasksBusiness.annotask_review."""
        return self._business.annotask_review(user, annotask_id, data)