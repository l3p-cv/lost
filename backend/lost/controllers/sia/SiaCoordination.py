"""SIA coordination layer — thin routing of endpoint calls to business.

Flow
----
SiaEndpoint  ->  SiaCoordination  ->  SiaBusiness
"""
from __future__ import annotations

from lost.controllers.sia.SiaBusiness import SiaBusiness


class SiaCoordination:
    """Coordination service for the sia namespace — thin delegation."""

    def __init__(self, business: SiaBusiness) -> None:
        self._business = business

    # --- navigation ---

    def get_sia_info(self, user, direction: str, last_img_id: int):
        """Annotation info by direction. Delegates to SiaBusiness.get_sia_info."""
        return self._business.get_sia_info(user, direction, last_img_id)

    def update_sia_anno(self, user, data):
        """Update whole annotation. Delegates to SiaBusiness.update."""
        return self._business.update(user, data)

    def update_partial_sia_anno(self, user, data):
        """Update partial annotation. Delegates to SiaBusiness.update_one_thing."""
        return self._business.update_one_thing(user, data)

    # --- images ---

    def get_sia_image(self, image_id: int, angle: int | None, clip_limit: int | None) -> str:
        """Image with filters as data-URI. Delegates to SiaBusiness.get_image."""
        return self._business.get_image(image_id, angle, clip_limit)

    def get_sia_image_name(self, image_id: int) -> dict:
        """Image name. Delegates to SiaBusiness.get_image_name."""
        return self._business.get_image_name(image_id)

    def get_image_with_filters(self, image_id: int, filters: list[dict]) -> str:
        """Filtered image as data-URI. Delegates to SiaBusiness.get_image_with_filters."""
        return self._business.get_image_with_filters(image_id, filters)

    def get_sia_image_list(self, user, current_img_id: int | None) -> dict:
        """Sidebar image list. Delegates to SiaBusiness.get_image_list."""
        return self._business.get_image_list(user, current_img_id)

    def get_sia_thumbnail(self, user, image_id: int) -> str:
        """Thumbnail as data-URI. Delegates to SiaBusiness.get_thumbnail."""
        return self._business.get_thumbnail(user, image_id)

    # --- misc ---

    def get_allowed_exampler(self, user) -> bool:
        """Example-marking permission. Delegates to SiaBusiness.get_allowed_exampler."""
        return self._business.get_allowed_exampler(user)

    def get_next_anno_id(self):
        """Next annotation ID. Delegates to SiaBusiness.get_next_anno_id."""
        return self._business.get_next_anno_id()

    def finish_sia_task(self, user):
        """Finish current task. Delegates to SiaBusiness.finish."""
        return self._business.finish(user)

    def get_sia_labels(self, user):
        """Label trees. Delegates to SiaBusiness.get_label_trees."""
        return self._business.get_label_trees(user)

    def get_sia_configuration(self, user):
        """SIA configuration. Delegates to SiaBusiness.get_configuration."""
        return self._business.get_configuration(user)

    # --- polygon operations ---

    def polygon_union(self, data: dict):
        """Polygon union. Delegates to SiaBusiness.polygon_union."""
        return self._business.polygon_union(data)

    def polygon_intersection(self, data: dict):
        """Polygon intersection. Delegates to SiaBusiness.polygon_intersection."""
        return self._business.polygon_intersection(data)

    def polygon_difference(self, data: dict):
        """Polygon difference. Delegates to SiaBusiness.polygon_difference."""
        return self._business.polygon_difference(data)

    def bbox_from_points(self, data: dict):
        """Bounding boxes from points. Delegates to SiaBusiness.bbox_from_points."""
        return self._business.bbox_from_points(data)