"""Annotasks namespace — FastAPI endpoints for annotation task management.

Routes:
    GET    /api/annotasks                              — list available annotasks (annotator)
    POST   /api/annotasks                              — select an annotask (annotator)
    GET    /api/annotasks/working                      — get current working annotask (annotator)
    GET    /api/annotasks/{annotask_id}                — get annotask details (annotator)
    POST   /api/annotasks/{annotask_id}/force_release   — force release locked annos (annotator)
    PATCH  /api/annotasks/{annotask_id}/group          — change group (designer)
    PUT    /api/annotasks/{annotask_id}/config         — update config (designer)
    GET    /api/annotasks/{annotask_id}/storage_settings — get storage settings (designer)
    PATCH  /api/annotasks/{annotask_id}/storage_settings — update storage settings (designer)
    POST   /api/annotasks/{annotask_id}/exports       — generate export (annotator)
    GET    /api/annotasks/{annotask_id}/exports       — list exports (annotator)
    GET    /api/annotasks/exports/{export_id}         — download export (annotator)
    DELETE /api/annotasks/exports/{export_id}         — delete export (designer)
    GET    /api/annotasks/{annotask_id}/instruction   — get instruction (jwt)
    PATCH  /api/annotasks/{annotask_id}/instruction   — update instruction (designer)
    GET    /api/annotasks/filterLabels                 — get filter labels (annotator)
    GET    /api/annotasks/{annotask_id}/review/images  — search review images (designer)
    GET    /api/annotasks/{annotask_id}/review/labels  — get review labels (designer)
    PATCH  /api/annotasks/{annotask_id}/annotation    — update one thing (annotator)
    GET    /api/annotasks/{annotask_id}/review/options — get review options (designer)
    POST   /api/annotasks/{annotask_id}/review        — review navigation (designer)
    GET    /api/annotasks/statistics/{annotask_id}     — get statistics (annotator)

"""

from __future__ import annotations

import json
import logging
import os
from datetime import datetime

from fastapi import APIRouter, Depends, Query
from fastapi.responses import Response, JSONResponse, PlainTextResponse
from pydantic import BaseModel

from lost.api.auth.dependencies import get_current_user, require_role
from lost.api.base import ProfilingRoute
from lost.db import dtype, model, roles
from lost.db.access import DBMan
from lost.db.model import User as DBUser
from lost.db.session import get_db
from lost.logic import anno_task as annotask_service
from lost.logic import dask_session, sia
from lost.logic.db_access import UserDbAccess
from lost.logic.file_access import UserFileAccess
from lost.logic.jobs.jobs import export_ds, force_anno_release, delete_ds_export
from lost.logic.sia import SiaSerialize, SiaUpdateOneThing, get_image_progress
from lost.settings import DATA_URL, LOST_CONFIG

logger = logging.getLogger("lost.api.annotasks")
router = APIRouter(tags=["annotasks"], route_class=ProfilingRoute)


# --- Schemas ---


class ChooseAnnotaskRequest(BaseModel):
    id: int


class UpdateGroupRequest(BaseModel):
    groupId: int


class UpdateConfigRequest(BaseModel):
    id: int
    configuration: dict | None = None


class UpdateStorageRequest(BaseModel):
    datasetId: int


class GenerateExportRequest(BaseModel):
    exportName: str
    exportType: str
    includeImages: bool
    annotatedOnly: bool
    randomSplits: dict


class UpdateInstructionRequest(BaseModel):
    instructionId: int | None = None


class ReviewRequest(BaseModel):
    direction: str
    imageAnnoId: int
    iteration: int | None = None
    annotaskIdx: int | None = None


class PatchAnnotationRequest(BaseModel):
    action: str
    anno: dict | None = None
    img: dict | None = None


# --- Helpers ---


def _to_camel(s: str) -> str:
    """Convert snake_case to camelCase."""
    parts = s.split("_")
    return parts[0] + "".join(p.title() for p in parts[1:])


def _to_camel_dict(d):
    """Recursively convert dict keys from snake_case to camelCase to match Flask marshal_with output."""
    if isinstance(d, dict):
        return {_to_camel(k): _to_camel_dict(v) for k, v in d.items()}
    if isinstance(d, list):
        return [_to_camel_dict(item) for item in d]
    return d


# --- Routes ---


@router.get("")
def get_annotasks(
    page_size: int | None = Query(None, description="Page size"),
    page: int | None = Query(None, description="Page number"),
    filtered_name: str | None = Query(None, description="Name filter"),
    filtered_states: str | None = Query(None, description="State filter"),
    user: DBUser = Depends(require_role(roles.ANNOTATOR)),
    dbm: DBMan = Depends(get_db),
):
    """Retrieve a list of available annotation tasks for the authenticated user."""
    identity = user.idx
    if filtered_states:
        filtered_states = filtered_states.replace("[", "").replace("]", "").split(",")
    group_ids = [g.group.idx for g in user.groups]
    total_pages = None
    annotask_list = []
    if page_size is not None and page is not None:
        anno_tasks = dbm.get_annotasks_filtered(
            group_ids=group_ids,
            page_size=page_size,
            page=page,
            filtered_name=filtered_name,
            filtered_states=filtered_states,
        )
        total_pages = dbm.get_annotasks_total_pages(
            group_ids=group_ids,
            page_size=page_size,
            filtered_name=filtered_name,
            filtered_states=filtered_states,
        )
        for at in anno_tasks:
            annotask_list.append(annotask_service.get_at_info(dbm, at, user_id=identity))
    else:
        annotask_list = annotask_service.get_available_annotasks(dbm, group_ids, identity)
    return {"annoTasks": _to_camel_dict(annotask_list), "pages": total_pages}


@router.post("")
def choose_annotask(
    req: ChooseAnnotaskRequest,
    user: DBUser = Depends(require_role(roles.ANNOTATOR)),
    dbm: DBMan = Depends(get_db),
):
    """Select an annotation task for the authenticated user."""
    annotask_service.choose_annotask(dbm, req.id, user.idx)
    return "success"


@router.get("/working")
def get_working_annotask(
    user: DBUser = Depends(require_role(roles.ANNOTATOR)),
    dbm: DBMan = Depends(get_db),
):
    """Get currently active annotation task."""
    working_task = annotask_service.get_current_annotask(dbm, user)
    logger.info(f"Working Task {working_task}")
    if working_task is None:
        return JSONResponse(status_code=412, content={"message": "Current working annotation task not found"})
    return _to_camel_dict(working_task)


@router.get("/filterLabels")
def get_filter_labels(
    user: DBUser = Depends(require_role(roles.ANNOTATOR)),
    dbm: DBMan = Depends(get_db),
):
    """Get possible filter labels for annotation lists."""
    return {"export": [0, 1]}


# NOTE: /{annotask_id} routes must be registered AFTER specific sub-routes
# (/working, /filterLabels, /statistics/{id}, /exports/{id})
# to avoid path conflicts.
@router.get("/statistics/{annotask_id}")
def get_annotask_statistics(
    annotask_id: int,
    user: DBUser = Depends(require_role(roles.ANNOTATOR)),
    dbm: DBMan = Depends(get_db),
):
    """Get statistics for an annotation task."""
    return annotask_service.get_annotask_statistics(dbm, annotask_id)


@router.get("/exports/{annotask_export_id}")
def download_annotask_export(
    annotask_export_id: int,
    user: DBUser = Depends(get_current_user),
    dbm: DBMan = Depends(get_db),
):
    """Download an annotation task export."""
    identity = user.idx
    udb = UserDbAccess(dbm, user)
    anno_task_export = dbm.get_anno_task_export(annotask_export_id=annotask_export_id)
    anno_task = dbm.get_anno_task(anno_task_export.anno_task_id)
    if not udb.may_access_pe(anno_task.pipe_element):
        return JSONResponse(status_code=403, content={"message": "You are not authorized."})
    fs_db = dbm.get_user_default_fs(user.idx)
    ufa = UserFileAccess(dbm, user, fs_db)
    my_file = ufa.load_file(anno_task_export.file_path)
    export_name = os.path.basename(anno_task_export.file_path)
    return Response(
        content=my_file,
        media_type="blob",
        headers={"Content-Disposition": f"attachment; filename={export_name}"},
    )


@router.delete("/exports/{annotask_export_id}")
def delete_annotask_export(
    annotask_export_id: int,
    user: DBUser = Depends(require_role(roles.DESIGNER)),
    dbm: DBMan = Depends(get_db),
):
    """Delete an annotation task export (designer only)."""
    anno_task_data_export = dbm.get_anno_task_export(annotask_export_id)
    anno_task = dbm.get_anno_task(anno_task_data_export.anno_task_id)
    pipe_manager_id = anno_task.pipe_element.pipe.manager_id
    if pipe_manager_id == user.idx:
        delete_ds_export(anno_task_data_export.idx, user.idx)
        dbm.delete(anno_task_data_export)
        dbm.commit()
        return "Success"
    return JSONResponse(status_code=403, content={"message": "You are not authorized."})


@router.get("/{annotask_id}")
def get_annotask_by_id(
    annotask_id: int,
    statistics: str | None = Query(None, description="Return statistics too"),
    config: str | None = Query(None, description="Return config too"),
    user: DBUser = Depends(require_role(roles.ANNOTATOR)),
    dbm: DBMan = Depends(get_db),
):
    """Get details for an annotation task with the given id."""
    identity = user.idx
    annotask = dbm.get_anno_task(anno_task_id=annotask_id)
    annotask_dict = annotask_service.get_at_info(dbm, annotask, identity, statistics == "true")
    # add image count
    img_count = 0
    for r in dbm.count_all_image_annos(anno_task_id=annotask.idx)[0]:
        img_count = r
    annotated_img_count = 0
    for r in dbm.count_image_remaining_annos(anno_task_id=annotask.idx):
        annotated_img_count = img_count - r
    # find annotask user
    annotask_user_name = "All Users"
    if annotask.group_id:
        annotask_user_name = annotask.group.name
    # add annotask type
    annotask_type = ""
    if annotask.dtype == dtype.AnnoTask.MIA:
        annotask_type = "mia"
    elif annotask.dtype == dtype.AnnoTask.SIA:
        annotask_type = "sia"
    # add label leaves
    label_leaves = []
    db_leaves = dbm.get_all_required_label_leaves(annotask_id)
    for db_leaf in db_leaves:
        leaf = db_leaf.label_leaf
        leaf_json = {"id": leaf.idx, "name": leaf.name, "color": leaf.color}
        label_leaves.append(leaf_json)
    # collect annotask info
    annotask_dict["type"] = annotask_type
    annotask_dict["user_name"] = annotask_user_name
    annotask_dict["img_count"] = img_count
    annotask_dict["annotated_img_count"] = annotated_img_count
    annotask_dict["label_leaves"] = label_leaves
    # add annotask configuration only if available
    if annotask.configuration and config == "true":
        annotask_dict["configuration"] = json.loads(annotask.configuration)

    return _to_camel_dict(annotask_dict)


@router.post("/{annotask_id}/force_release")
def force_release(
    annotask_id: int,
    user: DBUser = Depends(require_role(roles.ANNOTATOR)),
    dbm: DBMan = Depends(get_db),
):
    """Force release of locked annotations."""
    force_anno_release(dbm, annotask_id)
    return "Success"


@router.patch("/{annotask_id}/group")
def change_group(
    annotask_id: int,
    req: UpdateGroupRequest,
    user: DBUser = Depends(require_role(roles.DESIGNER)),
    dbm: DBMan = Depends(get_db),
):
    """Update the group the annotation task is assigned to."""
    anno_task = dbm.get_anno_task(annotask_id)
    pipe_manager_id = anno_task.pipe_element.pipe.manager_id
    if pipe_manager_id == user.idx:
        anno_task.group_id = req.groupId
        dbm.save_obj(anno_task)
        return "Success"
    return JSONResponse(status_code=403, content={"message": "You are not authorized."})


@router.put("/{annotask_id}/config")
def update_annotask_config(
    annotask_id: int,
    req: UpdateConfigRequest,
    user: DBUser = Depends(require_role(roles.DESIGNER)),
    dbm: DBMan = Depends(get_db),
):
    """Update the config of the annotation task."""
    anno_task = dbm.get_anno_task(annotask_id)
    pipe_manager_id = anno_task.pipe_element.pipe.manager_id
    if pipe_manager_id == user.idx:
        anno_task.configuration = json.dumps(req.configuration)
        dbm.save_obj(anno_task)
        return "Success"
    return JSONResponse(status_code=403, content={"message": "You are not authorized."})


@router.get("/{annotask_id}/storage_settings")
def get_storage_settings(
    annotask_id: int,
    user: DBUser = Depends(require_role(roles.DESIGNER)),
    dbm: DBMan = Depends(get_db),
):
    """Get the storage settings of the annotation task."""
    anno_task = dbm.get_anno_task(annotask_id)
    return {"datasetId": anno_task.dataset_id}


@router.patch("/{annotask_id}/storage_settings")
def update_storage_settings(
    annotask_id: int,
    req: UpdateStorageRequest,
    user: DBUser = Depends(require_role(roles.DESIGNER)),
    dbm: DBMan = Depends(get_db),
):
    """Update the storage settings of the annotation task."""
    anno_task = dbm.get_anno_task(annotask_id)
    dataset_id = req.datasetId
    anno_task.dataset_id = dataset_id
    if str(dataset_id) == "-1":
        anno_task.dataset_id = None
    dbm.save_obj(anno_task)


@router.post("/{annotask_id}/exports")
def generate_export(
    annotask_id: int,
    req: GenerateExportRequest,
    user: DBUser = Depends(get_current_user),
    dbm: DBMan = Depends(get_db),
):
    """Generate an export for the annotation task."""
    identity = user.idx
    udb = UserDbAccess(dbm, user)
    anno_task = dbm.get_anno_task(annotask_id)
    if not udb.may_access_pe(anno_task.pipe_element):
        return JSONResponse(status_code=403, content={"message": "You are not authorized."})
    include_images = req.includeImages
    random_splits_active = req.randomSplits.get("active", False)
    splits = req.randomSplits if random_splits_active else None
    img_count = 0
    for r in dbm.count_all_image_annos(anno_task_id=anno_task.idx)[0]:
        img_count = r
    annotated_img_count = 0
    for r in dbm.count_image_remaining_annos(anno_task_id=anno_task.idx):
        annotated_img_count = img_count - r
    if include_images:
        if req.annotatedOnly:
            if annotated_img_count > LOST_CONFIG.img_export_limit:
                include_images = False
        if img_count > LOST_CONFIG.img_export_limit:
            include_images = False
    d_export = model.AnnoTaskExport(
        timestamp=datetime.now(),
        anno_task_id=anno_task.idx,
        name=req.exportName,
        progress=1,
        anno_task_progress=anno_task.progress,
        img_count=annotated_img_count,
    )
    dbm.save_obj(d_export)
    client = dask_session.get_client(user)
    client.submit(
        export_ds,
        anno_task.pipe_element_id,
        identity,
        d_export.idx,
        d_export.name,
        splits,
        req.exportType,
        include_images,
        req.annotatedOnly,
        workers=LOST_CONFIG.worker_name,
    )
    dask_session.close_client(user, client)
    return "Success"


@router.get("/{annotask_id}/exports")
def get_annotask_exports(
    annotask_id: int,
    user: DBUser = Depends(get_current_user),
    dbm: DBMan = Depends(get_db),
):
    """Get all exports for the annotation task."""
    identity = user.idx
    udb = UserDbAccess(dbm, user)
    anno_task = dbm.get_anno_task(annotask_id)
    if not udb.may_access_pe(anno_task.pipe_element):
        return JSONResponse(status_code=403, content={"message": "You are not authorized."})
    d_exports = dbm.get_anno_task_export(anno_task_id=anno_task.idx)
    ret_json = []
    for export in d_exports:
        export_json = export.to_dict()
        if export.file_path:
            file_type = export.file_path.split(".")[-1]
            export_json["file_type"] = file_type
        ret_json.append(export_json)
    return {"annoTasksExports": _to_camel_dict(ret_json)}
@router.get("/{annotask_id}/instruction")
def get_annotask_instruction(
    annotask_id: int,
    user: DBUser = Depends(get_current_user),
    dbm: DBMan = Depends(get_db),
):
    """Get the current instruction of the annotation task."""
    anno_task = dbm.get_anno_task(annotask_id)
    if not anno_task:
        return JSONResponse(status_code=404, content={"message": "Annotation task not found."})
    return {"instructionId": anno_task.instruction_id}


@router.patch("/{annotask_id}/instruction")
def update_annotask_instruction(
    annotask_id: int,
    req: UpdateInstructionRequest,
    user: DBUser = Depends(require_role(roles.DESIGNER)),
    dbm: DBMan = Depends(get_db),
):
    """Update the instruction of the annotation task."""
    anno_task = dbm.get_anno_task(annotask_id)
    instruction_id = req.instructionId
    if instruction_id is not None:
        if str(instruction_id) == "-1":
            anno_task.instruction_id = None
        else:
            anno_task.instruction_id = instruction_id
    else:
        anno_task.instruction_id = None
    dbm.save_obj(anno_task)
    return {"message": "Instruction successfully updated."}


@router.get("/{annotask_id}/review/images")
def get_review_images(
    annotask_id: int,
    filter: str | None = Query(None, description="Search filter"),
    labels: str | None = Query(None, description="Label filter"),
    annotated_only: str = Query("false", description="Annotated only"),
    user: DBUser = Depends(require_role(roles.DESIGNER)),
    dbm: DBMan = Depends(get_db),
):
    """Search for images in the annotation task review."""
    search_str = filter if filter else ""
    annotated_only_bool = annotated_only.lower() == "true"
    db_result = dbm.get_search_images_in_annotask(annotask_id, search_str, annotated_only=annotated_only_bool)
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
            db_result = dbm.get_images_without_annotations([annotask_id], search_str, annotated_only=annotated_only_bool)
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
            img_with_label_db_result = dbm.get_all_images_with_labels(found_image_ids, search_labels)
            img_ids_with_label = [entry.img_anno_id for entry in img_with_label_db_result]
            found_images = [img for img in found_images if img["image_id"] in img_ids_with_label]
    return {"images": found_images}


@router.get("/{annotask_id}/review/labels")
def get_review_labels(
    annotask_id: int,
    user: DBUser = Depends(require_role(roles.DESIGNER)),
    dbm: DBMan = Depends(get_db),
):
    """Get all possible labels for a given annotation task."""
    return sia.get_label_trees_by_anno_task_id(dbm, annotask_id)


@router.patch("/{annotask_id}/annotation")
def update_one_thing(
    annotask_id: int,
    req: PatchAnnotationRequest,
    user: DBUser = Depends(require_role(roles.ANNOTATOR)),
    dbm: DBMan = Depends(get_db),
):
    """Update image annotation time, junk status, or image label."""
    try:
        if req.anno is None:
            if req.action not in ["imgAnnoTimeUpdate", "imgJunkUpdate", "imgLabelUpdate"]:
                raise Exception("Expect either anno or img information!")
        anno_task = dbm.get_anno_task(anno_task_id=annotask_id)
        sia_update = SiaUpdateOneThing(dbm, req.model_dump(), user.idx, anno_task)
        return sia_update.update()
    except Exception:
        raise


@router.get("/{annotask_id}/review/options")
def get_review_options(
    annotask_id: int,
    user: DBUser = Depends(require_role(roles.DESIGNER)),
    dbm: DBMan = Depends(get_db),
):
    """Get review options for the annotation task."""
    return sia.reviewoptions_annotask(dbm, annotask_id, user.idx)


@router.post("/{annotask_id}/review")
def annotask_review(
    annotask_id: int,
    req: ReviewRequest,
    user: DBUser = Depends(require_role(roles.DESIGNER)),
    dbm: DBMan = Depends(get_db),
):
    """Get data for the next annotask review image."""
    return _review(dbm, annotask_id, user.idx, req.model_dump())
# --- Helper function (converted from Flask Resource private method) ---
def _review(dbm, annotask_id, user_id, data):
    """Review navigation logic for an annotation task."""
    annotask = dbm.get_anno_task(anno_task_id=annotask_id)
    direction = data["direction"]
    current_idx = data["imageAnnoId"]
    iteration = data.get("iteration", None)
    first_annotation = dbm.get_sia_review_first(annotask.idx, iteration)
    last_annotation = dbm.get_sia_review_last(annotask.idx, iteration)
    if not first_annotation:
        return "no annotation found"
    current_annotask_idx = data.get("annotaskIdx", annotask.idx)
    if direction == "first":
        image_anno = first_annotation
    elif direction == "next":
        image_anno = dbm.get_sia_review_next(annotask.idx, current_idx, iteration)
    elif direction == "prev":
        image_anno = dbm.get_sia_review_prev(annotask.idx, current_idx, iteration)
    elif direction in ("specificImage", "current"):
        image_anno = dbm.get_sia_review_id(annotask_id, current_idx, iteration)
    else:
        return "no annotation found"
    if not image_anno:
        return "no annotation found"
    anno_current_image_number, anno_total_image_amount = get_image_progress(
        dbm, annotask, image_anno.idx, iteration
    )
    is_first_image = first_annotation.idx == image_anno.idx
    is_last_image = last_annotation is not None and last_annotation.idx == image_anno.idx
    sia_serialize = SiaSerialize(
        image_anno,
        user_id,
        DATA_URL,
        is_first_image,
        is_last_image,
        anno_current_image_number,
        anno_total_image_amount,
    )
    json_response = sia_serialize.serialize()
    json_response["current_annotask_idx"] = current_annotask_idx
    return json_response