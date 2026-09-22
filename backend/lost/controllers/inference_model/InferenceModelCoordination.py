"""Inference model coordination layer — thin routing of endpoint calls to business.

Flow
----
InferenceModelEndpoint  ->  InferenceModelCoordination  ->  InferenceModelBusiness
"""

from lost.controllers.inference_model.InferenceModelBusiness import InferenceModelBusiness


class InferenceModelCoordination:
    """Coordination service for the inference model namespace — thin delegation."""

    def __init__(self, business: InferenceModelBusiness) -> None:
        self._business = business

    def get_models(self) -> dict:
        """List inference models. Delegates to InferenceModelBusiness.list_models."""
        return self._business.list_models()

    def create_model(self, req) -> dict:
        """Add inference model. Delegates to InferenceModelBusiness.create_model."""
        return self._business.create_model(req)

    def get_model(self, idx: int) -> dict:
        """Get one inference model. Delegates to InferenceModelBusiness.get_model."""
        return self._business.get_model(idx)

    def update_model(self, idx: int, req) -> dict:
        """Edit inference model. Delegates to InferenceModelBusiness.update_model."""
        return self._business.update_model(idx, req)

    def delete_model(self, idx: int) -> dict:
        """Soft-delete inference model. Delegates to InferenceModelBusiness.delete_model."""
        return self._business.delete_model(idx)
