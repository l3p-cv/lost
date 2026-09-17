"""Label coordination layer — thin routing of endpoint calls to business.

Flow
----
LabelEndpoint  ->  LabelCoordination  ->  LabelBusiness (LabelTree)

Mirrors OpenidCoordination: coordination only maps each route to a business
function (and sequences them for multi-step flows). Visibility scoping and
authorization live in the business layer, which calls the shared
AuthorizationService utility. Domain exceptions propagate to fastapi_app's
global handlers.
"""
from __future__ import annotations

from lost.controllers.label.LabelBusiness import LabelBusiness


class LabelCoordination:
    """Coordination service for the label namespace — thin delegation."""

    def __init__(self, business: LabelBusiness) -> None:
        self._business = business

    def get_label_trees(self, user, visibility: str) -> list[dict]:
        """List label trees for a visibility level. Delegates to LabelBusiness.list_trees."""
        return self._business.list_trees(user, visibility)

    def import_label_tree(self, user, visibility: str, filename: str | None, csv_bytes: bytes):
        """Import a label tree from CSV. Delegates to LabelBusiness.import_tree."""
        self._business.import_tree(user, visibility, filename, csv_bytes)

    def get_label_leaf(self, label_leaf_id: int) -> dict:
        """Get one label leaf. Delegates to LabelBusiness.get_leaf_dict."""
        return self._business.get_leaf_dict(label_leaf_id)

    def delete_label(self, label_leaf_id: int) -> None:
        """Delete a label leaf. Delegates to LabelBusiness.delete_leaf."""
        self._business.delete_leaf(label_leaf_id)

    def export_label_tree(self, label_leaf_id: int) -> tuple[bytes, str]:
        """Export a tree as CSV. Delegates to LabelBusiness.export_csv."""
        return self._business.export_csv(label_leaf_id)

    def update_label(self, req) -> None:
        """Update a label leaf. Delegates to LabelBusiness.update_leaf."""
        self._business.update_leaf(req.id, req.name, req.description, req.abbreviation, req.external_id, req.color)

    def create_label(self, user, visibility: str, req) -> int:
        """Create a label leaf; returns its idx. Delegates to LabelBusiness.create_leaf."""
        return self._business.create_leaf(user, visibility, req)