"""Inference model business layer — model registry CRUD.

No legacy lost/logic counterpart; logic was inline in the endpoint. Request
validation (grpc URL / model type) stays with the endpoint's pydantic
schemas; the unique display name is enforced by the DB and translated here.
"""
from __future__ import annotations

from sqlalchemy.exc import IntegrityError

from lost.controllers.Exceptions import DomainError
from lost.db import model


class ModelNotFoundError(DomainError):
    http_status = 404
    http_body = {"message": "Model not found"}


class ModelDuplicateError(DomainError):
    http_status = 400

    def __init__(self, display_name: str) -> None:
        super().__init__(display_name)
        self.http_body = {"message": f'Model with display name "{display_name}" already exists'}


def model_to_dict(m: model.InferenceModel) -> dict:
    """InferenceModel ORM -> API dict (Flask restx model output parity)."""
    return {
        "id": m.idx,
        "name": m.name,
        "displayName": m.display_name,
        "serverUrl": m.server_url,
        "taskType": m.task_type,
        "modelType": m.model_type,
        "description": m.description,
        "lastUpdated": m.last_updated,
    }


class InferenceModelBusiness:
    """Inference model business service — CRUD for model registry entries."""

    def __init__(self, dbm) -> None:
        self.dbm = dbm

    def list_models(self) -> list[dict]:
        """All inference models, newest first."""
        return [model_to_dict(m) for m in self.dbm.get_all_inference_models()]

    def get_model(self, idx: int) -> dict:
        m = self.dbm.get_inference_model_by_id(idx)
        if m is None:
            raise ModelNotFoundError(idx)
        return model_to_dict(m)

    def create_model(self, req) -> dict:
        entry = model.InferenceModel(
            name=req.name, display_name=req.displayName, server_url=req.serverUrl,
            task_type=req.taskType, model_type=req.modelType, description=req.description,
        )
        try:
            self.dbm.save_obj(entry)
        except IntegrityError as e:
            if "Duplicate entry" in str(e):
                self.dbm.session.rollback()
                raise ModelDuplicateError(req.displayName) from e
            raise
        return model_to_dict(entry)

    def update_model(self, idx: int, req) -> dict:
        m = self.dbm.get_inference_model_by_id(idx)
        if m is None:
            raise ModelNotFoundError(idx)
        m.name = req.name
        m.display_name = req.displayName
        m.server_url = req.serverUrl
        m.task_type = req.taskType
        m.model_type = req.modelType
        m.description = req.description
        try:
            self.dbm.commit()
        except IntegrityError as e:
            if "Duplicate entry" in str(e):
                self.dbm.session.rollback()
                raise ModelDuplicateError(req.displayName) from e
            raise
        return model_to_dict(m)

    def delete_model(self, idx: int) -> None:
        """Delete a model; missing idx is a no-op (legacy 204)."""
        self.dbm.delete_inference_model(idx)
