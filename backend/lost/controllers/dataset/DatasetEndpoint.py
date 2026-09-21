"""Dataset namespace — FastAPI endpoints for dataset management.

Routes:
    GET    /api/datasets                              — list all datasets (designer)
    POST   /api/datasets                              — create dataset (designer, 201)
    PATCH  /api/datasets                              — update dataset (designer, 204)
    DELETE /api/datasets/{dataset_id}                 — delete dataset (designer)
    GET    /api/datasets/paged/{page_index}/{page_size} — paginated list (designer)
    GET    /api/datasets/flat                         — flat dict {id: name} (designer)
    POST   /api/datasets/{dataset_id}/review          — review navigation (designer)
    GET    /api/datasets/{dataset_id}/review/images   — search images (designer)
    GET    /api/datasets/{dataset_id}/review/possibleLabels — get labels (designer)
    POST   /api/datasets/export_ds_parquet/{dataset_id} — export parquet (designer)
    GET    /api/datasets/{dataset_id}/ds_exports      — list exports (designer)
    DELETE /api/datasets/ds_exports/{export_id}      — delete export (designer)
    GET    /api/datasets/ds_exports/{export_id}       — download export (designer)
"""


from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from fastapi.responses import Response, PlainTextResponse
from pydantic import BaseModel, field_validator

from lost.controllers.Dependencies import require_role
from lost.controllers.base import ProfilingRoute
from lost.db import roles
from lost.db.model import  User as DBUser
from lost.controllers.dataset.DatasetCoordination import DatasetCoordination
from lost.controllers.Dependencies import get_dataset_coordination

router = APIRouter(tags=["datasets"], route_class=ProfilingRoute)


# --- Schemas ---


class CreateDatasetRequest(BaseModel):
    name: str
    description: str
    parentDatasetId: int = -1
    @field_validator("name", "description")
    @classmethod
    def check_length(cls, v):
        if len(v) < 1 or len(v) > 254:
            raise ValueError("Field must be between 1 and 254 characters")
        return v


class UpdateDatasetRequest(CreateDatasetRequest):
    id: int


class DatasetReviewRequest(BaseModel):
    direction: str
    iteration: int | None = None
    imageAnnoId: int | None = None


class ExportParquetRequest(BaseModel):
    store_path: str | None = None
    fs_id: int | None = None
    annotated_only: bool = True


# --- Routes ---

@router.get("")
def get_datasets(
    user: DBUser = Depends(require_role(roles.DESIGNER)),
    coord: DatasetCoordination = Depends(get_dataset_coordination),
):
    """List all available datasets with children and annotation tasks."""
    return coord.get_datasets()


@router.post("", status_code=201)
def create_dataset(
    req: CreateDatasetRequest,
    user: DBUser = Depends(require_role(roles.DESIGNER)),
    coord: DatasetCoordination = Depends(get_dataset_coordination),
):
    """Create a new dataset."""
    return coord.create_dataset(req)


@router.patch("", status_code=204)
def update_dataset(
    req: UpdateDatasetRequest,
    user: DBUser = Depends(require_role(roles.DESIGNER)),
    coord: DatasetCoordination = Depends(get_dataset_coordination),
):
    """Update a single dataset."""
    coord.update_dataset(req)
    return PlainTextResponse("", status_code=204)


@router.delete("/{dataset_id}")
def delete_dataset(
    dataset_id: int,
    user: DBUser = Depends(require_role(roles.DESIGNER)),
    coord: DatasetCoordination = Depends(get_dataset_coordination),
):
    """Delete a dataset. Orphans all child datasets and annotasks."""
    coord.delete_dataset(dataset_id)


@router.get("/paged/{page_index}/{page_size}")
def get_datasets_paged(
    page_index: int, page_size: int,
    user: DBUser = Depends(require_role(roles.DESIGNER)),
    coord: DatasetCoordination = Depends(get_dataset_coordination),
):
    """Get all datasets paged."""
    return coord.get_datasets_paged(page_index, page_size)


@router.get("/flat")
def get_datasets_flat(
    user: DBUser = Depends(require_role(roles.DESIGNER)),
    coord: DatasetCoordination = Depends(get_dataset_coordination),
):
    """List all available datasets in a flat dict."""
    return coord.get_datasets_flat()


@router.post("/{dataset_id}/review")
def dataset_review(
    dataset_id: int,
    req: DatasetReviewRequest,
    user: DBUser = Depends(require_role(roles.DESIGNER)),
    coord: DatasetCoordination = Depends(get_dataset_coordination),
):
    """Get data for the next dataset review annotation."""
    return coord.dataset_review(user, dataset_id, req.model_dump())


@router.get("/{dataset_id}/review/images")
def dataset_review_image_search(
    dataset_id: int,
    filter: str = Query(""),
    labels: str | None = Query(None),
    user: DBUser = Depends(require_role(roles.DESIGNER)),
    coord: DatasetCoordination = Depends(get_dataset_coordination),
):
    """Search for images in the dataset review."""
    return coord.dataset_review_image_search(dataset_id, filter, labels)


@router.get("/{dataset_id}/review/possibleLabels")
def get_possible_labels(
    dataset_id: int,
    user: DBUser = Depends(require_role(roles.DESIGNER)),
    coord: DatasetCoordination = Depends(get_dataset_coordination),
):
    """Get all possible labels for a dataset."""
    return coord.get_possible_labels(dataset_id)


@router.post("/export_ds_parquet/{dataset_id}")
def export_ds_parquet(
    dataset_id: int,
    req: ExportParquetRequest,
    user: DBUser = Depends(require_role(roles.DESIGNER)),
    coord: DatasetCoordination = Depends(get_dataset_coordination),
):
    """Export dataset as parquet to a given file system."""
    return coord.export_ds_parquet(user, dataset_id, req)


@router.get("/{dataset_id}/ds_exports")
def get_dataset_exports(
    dataset_id: int,
    user: DBUser = Depends(require_role(roles.DESIGNER)),
    coord: DatasetCoordination = Depends(get_dataset_coordination),
):
    """Get all exports of a dataset."""
    return coord.get_dataset_exports(dataset_id)


@router.delete("/ds_exports/{export_id}")
def delete_dataset_export(
    export_id: int,
    user: DBUser = Depends(require_role(roles.DESIGNER)),
    coord: DatasetCoordination = Depends(get_dataset_coordination),
):
    """Delete a single export of a dataset."""
    return coord.delete_dataset_export(user, export_id)


@router.get("/ds_exports/{export_id}")
def download_dataset_export(
    export_id: int,
    user: DBUser = Depends(require_role(roles.DESIGNER)),
    coord: DatasetCoordination = Depends(get_dataset_coordination),
):
    """Download a single export of a dataset."""
    my_file, export_name = coord.download_dataset_export(user, export_id)
    return Response(
        content=my_file,
        media_type="application/octet-stream",
        headers={"Content-Disposition": f"attachment; filename={export_name}"},
    )