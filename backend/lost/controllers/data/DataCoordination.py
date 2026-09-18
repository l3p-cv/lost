"""Data coordination layer — thin routing of endpoint calls to business.

Flow
----
DataEndpoint  ->  DataCoordination  ->  DataBusiness
"""
from __future__ import annotations

from lost.controllers.data.DataBusiness import DataBusiness


class DataCoordination:
    """Coordination service for the data namespace — thin delegation."""

    def __init__(self, business: DataBusiness) -> None:
        self._business = business

    def get_data_export(self, deid: int) -> bytes:
        """Export bytes. Delegates to DataBusiness.read_export."""
        return self._business.read_export(deid)

    def get_image(self, user, image_id: int, type: str, context: float, draw_anno: bool) -> str:
        """Base64 image. Delegates to DataBusiness.image_b64."""
        return self._business.image_b64(user, image_id, type, context, draw_anno)

    def get_store_keys(self) -> dict:
        """Datastore keys. Delegates to DataBusiness.store_keys."""
        return self._business.store_keys()