"""Dataset business layer — dataset management, review navigation, parquet exports.

No legacy lost/logic counterpart was moved: jobs / dask_session / file_access
stay shared in logic/. Review flows compose the SIA domain classes via the
SiaBusiness module (same business tier). Helpers below moved verbatim from the
endpoint (Flask Resource private methods); only _review's error returns became
self-describing DomainErrors.
"""
from __future__ import annotations

import os
import re
from datetime import datetime

from lost.controllers.Exceptions import DomainError
from lost.controllers.sia.SiaBusiness import (
    SiaSerialize,
    get_image_progress,
    get_total_image_amount,
)
from lost.db.model import Dataset
from lost.logic import dask_session
from lost.logic.file_access import UserFileAccess
from lost.logic.jobs.jobs import (
    delete_whole_ds_export,
    export_dataset_parquet,
    get_all_annotask_ids_for_ds,
)
from lost.settings import DATA_URL, LOST_CONFIG


class DatasetParentSelfError(DomainError):
    http_status = 400
    http_body = "Dataset can't have itself as its parent"
    http_media_type = "text/plain"


class DatasetParentChildError(DomainError):
    http_status = 400
    http_body = "Chosen parent can't be a child of the current dataset"
    http_media_type = "text/plain"


class DatasetReviewNoAnnotationError(DomainError):
    """Legacy 400 JSON-string body."""
    http_status = 400
    http_body = "no annotation found"


class DatasetNotFoundError(DomainError):
    http_status = 404
    http_media_type = "text/plain"

    def __init__(self, dataset_id: int) -> None:
        super().__init__(dataset_id)
        self.http_body = f"Dataset with id {dataset_id} not found"

# --- Helper functions (converted from Flask Resource private methods) ---


def _build_dataset_children_tree(dataset):
    """Recursively build a dataset's children tree."""
    dataset.is_reviewable = False
    children = dataset.dataset_children
    if len(children) == 0:
        dataset.children = []
    subchildren = []
    for child in children:
        subchildren.append(_build_dataset_children_tree(child))
        if child.is_reviewable:
            dataset.is_reviewable = True
    annotasks = dataset.annotask_children
    if annotasks is not None:
        for annotask in annotasks:
            dataset.is_reviewable = True
            subchildren.append(annotask)
    dataset.children = subchildren
    return dataset


def _check_selected_parent_is_not_in_children(dataset, parent_id):
    """Recursively check if the parent is not a child of the dataset."""
    for child in dataset.dataset_children:
        if child.idx == parent_id:
            return False
        if not _check_selected_parent_is_not_in_children(child, parent_id):
            return False
    return True


def _get_dataset_children(dataset):
    """Recursively get all children datasets."""
    all_children = []
    direct_children = dataset.dataset_children
    all_children.extend(direct_children)
    for child in direct_children:
        all_children.extend(_get_dataset_children(child))
    return all_children


def _generate_annotask_list(dbm, dataset_id):
    """Create a list with all annotation tasks for a dataset."""
    dataset = dbm.get_dataset(dataset_id)
    datasets = [dataset]
    datasets.extend(_get_dataset_children(dataset))
    annotasks_list = []
    for ds in datasets:
        annotasks_list.extend(ds.annotask_children)
    return annotasks_list


def _next_annotask_index(annotask_keys, current_index):
    position = annotask_keys.index(current_index) + 1
    if position >= len(annotask_keys):
        return None
    return annotask_keys[position]


def _prev_annotask_index(annotask_keys, current_index):
    position = annotask_keys.index(current_index) - 1
    if position < 0:
        return None
    return annotask_keys[position]


def _collect_annotask_ids(datasets):
    ids = []
    for ds in datasets:
        for at in ds.annotask_children or []:
            ids.append(at.idx)
        for child_ds in ds.dataset_children:
            ids.extend(_collect_annotask_ids([child_ds]))
    return ids


def _build_dataset_children_tree_dict(dataset, image_counts):
    dataset.is_reviewable = False
    children_dicts = []
    total_images = 0
    for child in dataset.dataset_children:
        child_dict = _build_dataset_children_tree_dict(child, image_counts)
        if child.is_reviewable:
            dataset.is_reviewable = True
        total_images += child_dict.get("nr_images", 0)
        children_dicts.append(child_dict)
    for annotask in dataset.annotask_children or []:
        at_dict = annotask.to_dict()
        dataset.is_reviewable = True
        at_dict["nr_images"] = image_counts.get(annotask.idx, 0)
        total_images += at_dict["nr_images"]
        children_dicts.append(at_dict)
    dataset_dict = dataset.to_dict()
    dataset_dict["children"] = children_dicts
    dataset_dict["nr_images"] = total_images
    return dataset_dict


def _review(dbm, dataset_id, user_id, data):
    annotasks_list = _generate_annotask_list(dbm, dataset_id)
    annotask_lengths = {}
    annotask_keys = []
    annotasks = {}
    total_image_amount = 0
    for annotask in annotasks_list:
        annotasks[annotask.idx] = annotask
        annotask_keys.append(annotask.idx)
        annotask_length = get_total_image_amount(dbm, annotask)
        annotask_lengths[annotask.idx] = annotask_length
        total_image_amount += annotask_length
    direction = data["direction"]
    iteration = data.get("iteration", None)
    first_annotask_key = annotask_keys[0]
    first_annotask = dbm.get_sia_review_first(first_annotask_key, iteration)
    if not first_annotask:
        return DatasetReviewNoAnnotationError(status_code=400, content="no annotation found")
    last_annotask_key = annotask_keys[-1]
    last_annotask_image = dbm.get_sia_review_last(last_annotask_key, iteration)
    current_idx = data.get("imageAnnoId", None)
    image_anno = dbm.get_image_anno(current_idx)
    if direction == "first":
        current_annotask_idx = first_annotask.anno_task_id
        image_anno = first_annotask
    elif direction == "next":
        current_annotask_idx = image_anno.anno_task_id
        current_annotask = annotasks[current_annotask_idx]
        anno_current_image_number, anno_total_image_amount = get_image_progress(
            dbm, current_annotask, current_idx, iteration
        )
        if anno_current_image_number == anno_total_image_amount:
            current_annotask_idx = _next_annotask_index(annotask_keys, current_annotask_idx)
            current_annotask = annotasks[current_annotask_idx]
            image_anno = dbm.get_sia_review_first(current_annotask.idx, iteration)
        else:
            image_anno = dbm.get_sia_review_next(current_annotask.idx, current_idx, iteration)
    elif direction == "prev":
        current_annotask_idx = image_anno.anno_task_id
        current_annotask = annotasks[current_annotask_idx]
        anno_current_image_number, anno_total_image_amount = get_image_progress(
            dbm, annotasks[current_annotask_idx], current_idx, iteration
        )
        if anno_current_image_number == 1:
            current_annotask_idx = _prev_annotask_index(annotask_keys, current_annotask_idx)
            current_annotask = annotasks[current_annotask_idx]
            image_anno = dbm.get_sia_review_last(current_annotask.idx, iteration)
        else:
            image_anno = dbm.get_sia_review_prev(current_annotask.idx, current_idx, iteration)
    elif direction in ("specificImage", "current"):
        image_anno = dbm.get_image_anno(current_idx)
        current_annotask_idx = image_anno.anno_task_id
    if not image_anno:
        return DatasetReviewNoAnnotationError(status_code=400,content="no annotation found")
    anno_current_image_number, anno_total_image_amount = get_image_progress(
        dbm, annotasks[current_annotask_idx], image_anno.idx, iteration
    )
    current_image_number = anno_current_image_number
    prev_annotask_idx = _prev_annotask_index(annotask_keys, current_annotask_idx)
    while prev_annotask_idx:
        current_image_number += annotask_lengths[prev_annotask_idx]
        prev_annotask_idx = _prev_annotask_index(annotask_keys, prev_annotask_idx)
    is_first_image = first_annotask.idx == image_anno.idx
    is_last_image = last_annotask_image is not None and last_annotask_image.idx == image_anno.idx
    sia_serialize = SiaSerialize(
        image_anno, user_id, DATA_URL,
        is_first_image, is_last_image, current_image_number, total_image_amount,
    )
    json_response = sia_serialize.serialize()
    json_response["current_annotask_idx"] = current_annotask_idx
    return json_response

class DatasetBusiness:
    """Dataset business service — CRUD, trees, review flows, exports."""

    def __init__(self, dbm) -> None:
        self.dbm = dbm

    # --- listing ---

    def list_datasets(self) -> list[dict]:
        """All datasets with children trees + the meta dataset."""
        datasets = self.dbm.get_datasets_with_no_parent()
        datasets_json = []
        for dataset in datasets:
            new_ds = _build_dataset_children_tree(dataset)
            datasets_json.append(new_ds.to_dict())
        annotasks_without_dataset = self.dbm.get_annotasks_without_dataset()
        annotasks_without_dataset_json = [at.to_dict() for at in annotasks_without_dataset]
        meta_ds = {
            "isMetaDataset": True,
            "idx": "-1",
            "name": "Annotasks without a Dataset",
            "description": "Meta dataset that contains all annotation tasks that are not assigned to a dataset",
            "datastoreId": None,
            "parentId": None,
            "createdAt": "(meta dataset)",
            "children": annotasks_without_dataset_json,
        }
        datasets_json.append(meta_ds)
        return datasets_json

    def list_datasets_paged(self, page_index: int, page_size: int) -> dict:
        """Datasets paged, with image counts and the meta dataset on the last page."""
        ds_no_parent_page, pages = self.dbm.get_datasets_paged(page_index, page_size)
        all_annotask_ids = _collect_annotask_ids(ds_no_parent_page)
        image_counts = self.dbm.get_image_counts_for_annotask_list(all_annotask_ids)
        datasets_json = []
        for dataset in ds_no_parent_page:
            datasets_json.append(_build_dataset_children_tree_dict(dataset, image_counts))
        if page_index + 1 == pages:
            annotasks_without_dataset = self.dbm.get_annotasks_without_dataset()
            annotasks_without_dataset_json = [at.to_dict() for at in annotasks_without_dataset]
            meta_ds = {
                "isMetaDataset": True,
                "idx": "-1",
                "name": "Annotasks without a Dataset",
                "description": "Meta dataset that contains all annotation tasks that are not assigned to a dataset",
                "datastoreId": None,
                "parentId": None,
                "createdAt": "(meta dataset)",
                "children": annotasks_without_dataset_json,
            }
            datasets_json.append(meta_ds)
        return {"datasets": datasets_json, "pages": pages}

    def flat_datasets(self) -> dict:
        """Flat {idx: name} mapping."""
        return {dataset.idx: dataset.name for dataset in self.dbm.get_datasets()}

    # --- CRUD ---

    def create_dataset(self, req) -> dict:
        parent_id = req.parentDatasetId
        if parent_id == -1:
            parent_id = None
        db_dataset = Dataset(name=req.name, description=req.description, parent_dataset_id=parent_id)
        dataset_idx = self.dbm.save_obj_get_idx(db_dataset)
        return {"datasetId": dataset_idx}

    def update_dataset(self, req) -> None:
        """Update a dataset; raises parent-cycle errors (legacy 400 plain-text)."""
        dataset_id = req.id
        db_dataset = self.dbm.get_dataset(dataset_id)
        db_dataset.name = req.name
        db_dataset.description = req.description
        parent_id = req.parentDatasetId
        if parent_id == -1:
            parent_id = None
        else:
            if dataset_id == parent_id:
                raise DatasetParentSelfError(dataset_id)
            if not _check_selected_parent_is_not_in_children(db_dataset, parent_id):
                raise DatasetParentChildError(dataset_id)
        db_dataset.parent_id = parent_id
        self.dbm.save_obj(db_dataset)

    def delete_dataset(self, dataset_id: int) -> None:
        """Delete a dataset; orphans all child datasets and annotasks."""
        dataset_to_delete = self.dbm.get_dataset(dataset_id)
        for child_dataset in dataset_to_delete.dataset_children:
            child_dataset.parent_id = None
        for child_annotask in dataset_to_delete.annotask_children:
            child_annotask.dataset_id = None
        self.dbm.session.delete(dataset_to_delete)
        self.dbm.session.commit()

    # --- review flows ---

    def review(self, user_id: int, dataset_id: int, data: dict) -> dict:
        """Dataset review navigation (delegates to the moved _review)."""
        return _review(self.dbm, dataset_id, user_id, data)

    def review_image_search(self, dataset_id: int, filter: str, labels: str | None) -> dict:
        """Search images in the dataset review (label filter = comma-separated ints)."""
        search_str = filter if filter else ""
        anno_task_ids = get_all_annotask_ids_for_ds(self.dbm, dataset_id)
        db_result = self.dbm.get_search_images_in_annotask_list(anno_task_ids, search_str, annotated_only=True)
        found_image_ids = []
        found_images = []
        for entry in db_result:
            found_image_ids.append(entry.idx)
            found_images.append({
                "imageId": entry.idx,
                "imageName": entry.img_path,
                "annotationId": entry.anno_task_id,
                "annotationName": entry.name,
            })
        if labels is not None:
            if labels == "":
                search_labels = []
            else:
                search_labels = list(map(int, labels.split(",")))
            if len(search_labels) == 0:
                db_result = self.dbm.get_images_without_annotations(anno_task_ids, search_str, annotated_only=True)
                found_images = [
                    {
                        "imageId": entry.idx,
                        "imageName": entry.img_path,
                        "annotationId": entry.anno_task_id,
                        "annotationName": entry.name,
                    }
                    for entry in db_result
                ]
            else:
                img_with_label_db_result = self.dbm.get_all_images_with_labels(found_image_ids, search_labels)
                img_ids_with_label = [entry.img_anno_id for entry in img_with_label_db_result]
                found_images = [img for img in found_images if img["imageId"] in img_ids_with_label]
        return {"images": found_images}

    def possible_labels(self, dataset_id: int) -> list[dict]:
        anno_task_ids = get_all_annotask_ids_for_ds(self.dbm, dataset_id)
        db_result = self.dbm.get_all_annotask_labels(anno_task_ids)
        return [
            {"id": entry.idx, "name": entry.name, "color": entry.color}
            for entry in db_result
        ]

    # --- exports ---

    def export_parquet(self, user, dataset_id: int, req) -> str:
        """Submit a dask parquet-export job for the dataset."""
        dataset = self.dbm.get_dataset(dataset_id)
        if dataset is None:
            raise DatasetNotFoundError(dataset_id)
        if req.store_path:
            path = req.store_path
        else:
            fs_db = self.dbm.get_user_default_fs(user.idx)
            ufa = UserFileAccess(self.dbm, user, fs_db)
            path = ufa.get_whole_export_ds_path()
            file_name = re.sub(r"\W+", "_", dataset.name).lower()
            path = os.path.join(path, f"{file_name}_{dataset_id}_{datetime.now().strftime('%Y%m%d%H%M%S')}.parquet")
        if req.fs_id:
            fs_id = int(req.fs_id)
        else:
            fs_id = self.dbm.get_fs(name=user.user_name).idx
        client = dask_session.get_client(user)
        client.submit(
            export_dataset_parquet,
            user.idx,
            path,
            fs_id,
            dataset_id,
            req.annotated_only,
            workers=LOST_CONFIG.worker_name,
        )
        dask_session.close_client(user, client)
        return "success"

    def list_exports(self, dataset_id: int) -> dict:
        exports = self.dbm.get_all_dataset_exports_by_dataset_id(dataset_id)
        return {"exports": [
            {"id": export.idx, "datasetId": export.dataset_id,
             "filePath": export.file_path, "progress": export.progress}
            for export in exports
        ]}

    def delete_export(self, user, export_id: int) -> str:
        export = self.dbm.get_dataset_export_by_id(export_id)
        if export is not None:
            try:
                delete_whole_ds_export(export.file_path, user.idx)
            except Exception:
                pass
            self.dbm.delete_dataset_export(export.idx)
        return "success"

    def read_export(self, user, export_id: int) -> tuple[bytes, str]:
        """(file_bytes, filename) for an export download."""
        export = self.dbm.get_dataset_export_by_id(export_id)
        fs_db = self.dbm.get_user_default_fs(user.idx)
        ufa = UserFileAccess(self.dbm, user, fs_db)
        my_file = ufa.load_file(export.file_path)
        return my_file, os.path.basename(export.file_path)
