"""Annotasks business layer — annotation task management.

``lost/logic/anno_task.py`` moved verbatim to this module 

The :class: `AnnotasksBusiness` service at the bottom
binds the functions to the request-scoped dbm and holds the route logic moved
from the endpoint (camelCase mapping, review flows composing SIA domain
classes, exports). 
Method names mirror module functions they call — bare
calls inside methods resolve to module globals.
"""

import json
from datetime import datetime
import os
import logging

from lost import settings
from lost.db import access, dtype, model, state
from lost.logic import email
from lost.pyapi import pipe_elements


from lost.controllers.Exceptions import DomainError, NotAuthorizedError
from lost.controllers.sia.SiaBusiness import (
    SiaSerialize,
    SiaUpdateOneThing,
    get_image_progress,
    get_label_trees_by_anno_task_id,
    reviewoptions_annotask,
)
from lost.logic import dask_session
from lost.logic.db_access import UserDbAccess
from lost.logic.file_access import UserFileAccess
from lost.logic.jobs.jobs import delete_ds_export, export_ds, force_anno_release
from lost.settings import DATA_URL, LOST_CONFIG

logger = logging.getLogger("lost.controllers.annotasks")

class WorkingTaskNotFoundError(DomainError):
    http_status = 412
    http_body = {"message": "Current working annotation task not found"}


class AnnotaskInstructionNotFoundError(DomainError):
    http_status = 404
    http_body = {"message": "Annotation task not found."}


def update_anno_task(dbm, anno_task_id, user_id=None):
    remaining = None
    available = None
    response = dict()
    anno_task = dbm.get_anno_task(anno_task_id=anno_task_id)
    if anno_task.dtype == dtype.AnnoTask.SIA or anno_task.dtype == dtype.AnnoTask.MIA:
        pipe_element = dbm.get_pipe_element(pipe_e_id=anno_task.pipe_element_id)
        # TODO: count only from current iteration remaining annos
        remaining = None
        available = None

        # if MIA: check type (annoBased or imageBased) and decide which annos to count
        if anno_task.dtype == dtype.AnnoTask.MIA:
            config = json.loads(anno_task.configuration)
            if config["type"] == "annoBased":
                remaining, available = __get_two_d_anno_counts(dbm, anno_task_id, pipe_element.iteration)
            elif config["type"] == "imageBased":
                remaining, available = __get_image_anno_counts(dbm, anno_task_id, pipe_element.iteration)

        # in case of SIA always count imageBased
        else:
            remaining, available = __get_image_anno_counts(dbm, anno_task_id, pipe_element.iteration)

        if available:
            try:
                progress = 100 * float(available - remaining) / available
            except Exception:
                print("ZeroDivisionError: AnnoTask Progress couldn`t be calculated. No annotations foound.")
        else:
            progress = float(100)
        response["progress"] = int(progress)
        response["remainingAnnos"] = remaining
        annotask = dbm.get_anno_task(anno_task_id)
        annotask.progress = progress
        if user_id:
            annotask.last_activity = datetime.now()
            annotask.last_annotator_id = user_id
        dbm.save_obj(annotask)
        return response


def __get_image_anno_counts(dbm, anno_task_id, iteration):
    remaining = dbm.count_image_remaining_annos(anno_task_id=anno_task_id).r
    available = None
    for r in dbm.count_all_image_annos(anno_task_id=anno_task_id, iteration=iteration)[0]:
        available = r
    return remaining, available


def __get_two_d_anno_counts(dbm, anno_task_id, iteration):
    remaining = dbm.count_two_d_remaining_annos(anno_task_id=anno_task_id).r
    available = None
    for r in dbm.count_all_two_d_annos(anno_task_id=anno_task_id, iteration=iteration)[0]:
        available = r
    return remaining, available


def set_finished(dbm: access.DBMan, anno_task_id):
    anno_task = dbm.get_anno_task(anno_task_id=anno_task_id)
    pipe_e = dbm.get_pipe_element(pipe_e_id=anno_task.pipe_element_id)

    if anno_task.state == state.AnnoTask.FINISHED:
        return "already finished"
    if anno_task.state == state.AnnoTask.IN_PROGRESS or anno_task.state == state.AnnoTask.PAUSED:
        progress = update_anno_task(dbm, anno_task_id)
        if progress["remainingAnnos"] is None:
            return "error: annotations not found"
        if int(progress["remainingAnnos"]) == 0:
            anno_task.progress = progress["progress"]
            anno_task.state = state.AnnoTask.FINISHED
            dbm.add(anno_task)
            pipe_e.state = state.PipeElement.FINISHED
            dbm.add(pipe_e)
            pipe = dbm.get_pipe(pipe_e.pipe_id)
            pipe.changed_by_element += 1
            dbm.add(pipe)
            dbm.commit()
            try:
                email.send_annotask_finished(dbm, anno_task)
            except:
                pass
                # msg = "Could not send Email. \n"
                # msg += traceback.format_exc()
                # self.logger.error(msg)
            for chat in dbm.get_choosen_annotask(anno_task_id=anno_task_id):
                dbm.delete(chat)
                dbm.commit()
            return "success"
        else:
            return "not finished, remaining: " + str(progress["remainingAnnos"])


def get_current_annotask(dbm, user):
    if len(user.choosen_anno_tasks) > 0:
        anno_task = user.choosen_anno_tasks[0].anno_task
        return get_at_info(dbm, anno_task, user.idx, True)
    return None


def get_available_annotasks(dbm, group_ids, user_id):
    """get all available  annotation task for user

    Args:
        dbm: Project Manager
        user_id(int): user id
        anno_type(int): type of annotation task

    Returns:
        json with all data of the available tasks
    """
    available_annotasks = list()
    for annotask in dbm.get_available_annotask(group_ids):
        if annotask.pipe_element.pipe.state == state.Pipe.PAUSED:
            pass
        else:
            available_annotasks.append(get_at_info(dbm, annotask, user_id))
    return available_annotasks


def get_at_info(dbm, annotask, user_id, amount_per_label=False):
    if annotask.pipe_element_id is None:
        raise Exception("No PipeElement for AnnoTask")
    pipeelement = dbm.get_pipe_element(pipe_e_id=annotask.pipe_element_id)
    pipeline = dbm.get_pipe(pipe_id=pipeelement.pipe_id)
    at = dict()
    at["name"] = annotask.name
    at["id"] = annotask.idx
    at["progress"] = annotask.progress
    at["pipeline_name"] = pipeline.name
    at["pipeline_creator"] = pipeline.manager.user_name
    at["group"] = annotask.group.name
    at["instruction_id"] = annotask.instruction_id
    at["created_at"] = None
    if annotask.timestamp:
        at["created_at"] = annotask.timestamp.strftime(settings.STRF_TIME)
    at["last_activity"] = None
    if annotask.last_activity:
        at["last_activity"] = annotask.last_activity.strftime(settings.STRF_TIME)
    at["last_annotator"] = "N/A"
    if annotask.last_annotator:
        at["last_annotator"] = annotask.last_annotator.user_name
    at["locked_img_count"] = len(dbm.get_locked_img_annos(annotask.idx))
    at["type"] = None
    at["finished"] = None
    at["size"] = None
    at["status"] = None
    if annotask.state == state.AnnoTask.PENDING:
        at["status"] = "pending"
    elif annotask.state == state.AnnoTask.IN_PROGRESS:
        at["status"] = "inProgress"
    elif annotask.state == state.AnnoTask.FINISHED:
        at["status"] = "finished"
    elif annotask.state == state.AnnoTask.PAUSED:
        at["status"] = "paused"
    at["statistic"] = dict()
    at["statistic"]["amount_per_label"] = []
    at["statistic"]["seconds_per_anno"] = None
    if annotask.dtype == dtype.AnnoTask.MIA:
        at["type"] = "MIA"
        config = json.loads(annotask.configuration)
        if config["type"] == "imageBased":
            remaining, available = __get_image_anno_counts(dbm, annotask.idx, pipeelement.iteration)
            finished = available - remaining
            at["finished"] = finished
            at["size"] = available
            if amount_per_label:
                at["statistic"]["amount_per_label"] = __get_amount_per_label(dbm, pipeelement, finished, "imageBased")
                at["statistic"]["seconds_per_anno"] = __get_seconds_per_anno(dbm, pipeelement, user_id, "imageBased")
        elif config["type"] == "annoBased":
            remaining, available = __get_two_d_anno_counts(dbm, annotask.idx, pipeelement.iteration)
            finished = available - remaining
            at["finished"] = finished
            at["size"] = available
            if amount_per_label:
                at["statistic"]["amount_per_label"] = __get_amount_per_label(dbm, pipeelement, finished, "annoBased")
                at["statistic"]["seconds_per_anno"] = __get_seconds_per_anno(dbm, pipeelement, user_id, "annoBased")
    else:
        at["type"] = "SIA"
        remaining, available = __get_image_anno_counts(dbm, annotask.idx, pipeelement.iteration)
        finished = available - remaining
        at["finished"] = finished
        at["size"] = available
        if amount_per_label:
            at["statistic"]["amount_per_label"] = __get_amount_per_label(dbm, pipeelement, finished, "annoBased")
            at["statistic"]["seconds_per_anno"] = __get_seconds_per_anno(dbm, pipeelement, user_id, "annoBased")

    return at


def choose_annotask(dbm, anno_task_id, user_id):
    # first delete all previous choosen annotasks
    anno_task = dbm.get_anno_task(anno_task_id=anno_task_id)
    for chat in dbm.get_choosen_annotask(user_id):
        if not chat.anno_task_id == anno_task.idx:
            dbm.delete(chat)
            dbm.commit()
    # choose new one
    if anno_task.state == state.AnnoTask.IN_PROGRESS or anno_task.state == state.AnnoTask.PAUSED:
        if not anno_task.timestamp:
            anno_task.timestamp = datetime.now()
            dbm.save_obj(anno_task)
        try:
            newcat = model.ChoosenAnnoTask(user_id=user_id, anno_task_id=anno_task_id)
            dbm.save_obj(newcat)
        except:
            pass


def has_annotation(dbm, anno_task_id):
    if dbm.count_annos(anno_task_id) > 0:
        return True
    else:
        return False


def has_annotation_in_iteration(dbm, anno_task_id, iteration):
    if dbm.count_annos(anno_task_id, iteration) > 0:
        return True
    else:
        return False


def __get_seconds_per_anno(dbm, pipeelement, anno_type, user_id=None):
    mean_time = dbm.mean_anno_time(pipeelement.anno_task.idx, user_id, anno_type)[0]
    if mean_time is not None:
        return f"{mean_time:.2f}"
    return None


def __get_amount_per_label(dbm, pipeelement, finished, anno_type):
    dist = list()
    annotask = pipe_elements.AnnoTask(pipeelement, dbm)
    for index, row in annotask.possible_label_df.iterrows():
        row["idx"]
        result = dbm.get_amount_per_label(annotask.idx, row["idx"], anno_type)[0]
        if result > 0:
            dist.append({"label": row["name"], "amount": result, "color": row["color"]})
    return dist


def get_annotask_statistics(dbm, annotask_id):
    anno_task = dbm.get_anno_task(anno_task_id=annotask_id)
    return get_at_info(dbm, anno_task, None, True)


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

class AnnotasksBusiness:
    """Annotasks business service — the largest business surface."""

    def __init__(self, dbm) -> None:
        self.dbm = dbm

    # --- listing / selection ---

    def get_annotasks(self, user, page_size, page, filtered_name, filtered_states) -> dict:
        identity = user.idx
        if filtered_states:
            filtered_states = filtered_states.replace("[", "").replace("]", "").split(",")
        group_ids = [g.group.idx for g in user.groups]
        total_pages = None
        annotask_list = []
        if page_size is not None and page is not None:
            anno_tasks = self.dbm.get_annotasks_filtered(
                group_ids=group_ids, page_size=page_size, page=page,
                filtered_name=filtered_name, filtered_states=filtered_states,
            )
            total_pages = self.dbm.get_annotasks_total_pages(
                group_ids=group_ids, page_size=page_size,
                filtered_name=filtered_name, filtered_states=filtered_states,
            )
            for at in anno_tasks:
                annotask_list.append(get_at_info(self.dbm, at, user_id=identity))
        else:
            annotask_list = get_available_annotasks(self.dbm, group_ids, identity)
        return {"annoTasks": _to_camel_dict(annotask_list), "pages": total_pages}

    def choose_annotask(self, user, annotask_id: int) -> str:
        choose_annotask(self.dbm, annotask_id, user.idx)
        return "success"

    def get_working_annotask(self, user) -> dict:
        working_task = get_current_annotask(self.dbm, user)
        logger.info(f"Working Task {working_task}")
        if working_task is None:
            raise WorkingTaskNotFoundError(user.idx)
        return working_task

    def get_filter_labels(self) -> dict:
        return {"export": [0, 1]}

    def get_annotask_statistics(self, annotask_id: int) -> dict:
        return _to_camel_dict(get_annotask_statistics(self.dbm, annotask_id))

    # --- exports ---

    def download_annotask_export(self, user, annotask_export_id: int) -> tuple[bytes, str]:
        udb = UserDbAccess(self.dbm, user)
        anno_task_export = self.dbm.get_anno_task_export(anno_task_export_id=annotask_export_id)
        anno_task = self.dbm.get_anno_task(anno_task_export.anno_task_id)
        if not udb.may_access_pe(anno_task.pipe_element):
            raise NotAuthorizedError(user.idx)
        fs_db = self.dbm.get_user_default_fs(user.idx)
        ufa = UserFileAccess(self.dbm, user, fs_db)
        my_file = ufa.load_file(anno_task_export.file_path)
        return my_file, os.path.basename(anno_task_export.file_path)

    def delete_annotask_export(self, user, annotask_export_id: int) -> str:
        anno_task_data_export = self.dbm.get_anno_task_export(annotask_export_id)
        anno_task = self.dbm.get_anno_task(anno_task_data_export.anno_task_id)
        pipe_manager_id = anno_task.pipe_element.pipe.manager_id
        if pipe_manager_id == user.idx:
            delete_ds_export(anno_task_data_export.idx, user.idx)
            self.dbm.delete(anno_task_data_export)
            self.dbm.commit()
            return "Success"
        raise NotAuthorizedError(user.idx)

    def generate_export(self, user, annotask_id: int, req) -> str:
        identity = user.idx
        udb = UserDbAccess(self.dbm, user)
        anno_task = self.dbm.get_anno_task(annotask_id)
        if not udb.may_access_pe(anno_task.pipe_element):
            raise NotAuthorizedError(identity)
        include_images = req.includeImages
        random_splits_active = req.randomSplits.get("active", False)
        splits = req.randomSplits if random_splits_active else None
        img_count = 0
        for r in self.dbm.count_all_image_annos(anno_task_id=anno_task.idx)[0]:
            img_count = r
        annotated_img_count = 0
        for r in self.dbm.count_image_remaining_annos(anno_task_id=anno_task.idx):
            annotated_img_count = img_count - r
        if include_images:
            if req.annotatedOnly:
                if annotated_img_count > LOST_CONFIG.img_export_limit:
                    include_images = False
            if img_count > LOST_CONFIG.img_export_limit:
                include_images = False
        d_export = model.AnnoTaskExport(
            timestamp=datetime.now(), anno_task_id=anno_task.idx,
            name=req.exportName, progress=1,
            anno_task_progress=anno_task.progress, img_count=annotated_img_count,
        )
        self.dbm.save_obj(d_export)
        client = dask_session.get_client(user)
        client.submit(
            export_ds, anno_task.pipe_element_id, identity, d_export.idx, d_export.name,
            splits, req.exportType, include_images, req.annotatedOnly,
            workers=LOST_CONFIG.worker_name,
        )
        dask_session.close_client(user, client)
        return "Success"

    def get_annotask_exports(self, user, annotask_id: int) -> dict:
        udb = UserDbAccess(self.dbm, user)
        anno_task = self.dbm.get_anno_task(annotask_id)
        if not udb.may_access_pe(anno_task.pipe_element):
            raise NotAuthorizedError(user.idx)
        d_exports = self.dbm.get_anno_task_export(anno_task_id=anno_task.idx)
        ret_json = []
        for export in d_exports:
            export_json = export.to_dict()
            export_json["id"] = export_json.pop("idx")
            export_json["annotaskProgress"] = export_json.pop("anno_task_progress")
            if export.file_path:
                export_json["file_type"] = export.file_path.split(".")[-1]
            ret_json.append(export_json)
        return {"annoTasksExports": _to_camel_dict(ret_json)}

    # --- details / mutations ---

    def get_annotask_by_id(self, user, annotask_id: int, statistics: str | None, config: str | None) -> dict:
        identity = user.idx
        annotask = self.dbm.get_anno_task(anno_task_id=annotask_id)
        annotask_dict = get_at_info(self.dbm, annotask, identity, statistics == "true")
        img_count = 0
        for r in self.dbm.count_all_image_annos(anno_task_id=annotask.idx)[0]:
            img_count = r
        annotated_img_count = 0
        for r in self.dbm.count_image_remaining_annos(anno_task_id=annotask.idx):
            annotated_img_count = img_count - r
        annotask_user_name = "All Users"
        if annotask.group_id:
            annotask_user_name = annotask.group.name
        annotask_type = ""
        if annotask.dtype == dtype.AnnoTask.MIA:
            annotask_type = "mia"
        elif annotask.dtype == dtype.AnnoTask.SIA:
            annotask_type = "sia"
        label_leaves = []
        for db_leaf in self.dbm.get_all_required_label_leaves(annotask_id):
            leaf = db_leaf.label_leaf
            label_leaves.append({"id": leaf.idx, "name": leaf.name, "color": leaf.color})
        annotask_dict["type"] = annotask_type
        annotask_dict["user_name"] = annotask_user_name
        annotask_dict["img_count"] = img_count
        annotask_dict["annotated_img_count"] = annotated_img_count
        annotask_dict["label_leaves"] = label_leaves
        if annotask.configuration and config == "true":
            annotask_dict["configuration"] = json.loads(annotask.configuration)
        return _to_camel_dict(annotask_dict)

    def force_release(self, annotask_id: int) -> str:
        force_anno_release(self.dbm, annotask_id)
        return "Success"

    def change_group(self, user, annotask_id: int, group_id: int) -> str:
        anno_task = self.dbm.get_anno_task(annotask_id)
        pipe_manager_id = anno_task.pipe_element.pipe.manager_id
        if pipe_manager_id == user.idx:
            anno_task.group_id = group_id
            self.dbm.save_obj(anno_task)
            return "Success"
        raise NotAuthorizedError(user.idx)

    def update_annotask_config(self, user, annotask_id: int, configuration) -> str:
        anno_task = self.dbm.get_anno_task(annotask_id)
        pipe_manager_id = anno_task.pipe_element.pipe.manager_id
        if pipe_manager_id == user.idx:
            anno_task.configuration = json.dumps(configuration)
            self.dbm.save_obj(anno_task)
            return "Success"
        raise NotAuthorizedError(user.idx)

    def get_storage_settings(self, annotask_id: int) -> dict:
        anno_task = self.dbm.get_anno_task(annotask_id)
        return {"datasetId": anno_task.dataset_id}

    def update_storage_settings(self, annotask_id: int, dataset_id: int) -> None:
        anno_task = self.dbm.get_anno_task(annotask_id)
        anno_task.dataset_id = dataset_id
        if str(dataset_id) == "-1":
            anno_task.dataset_id = None
        self.dbm.save_obj(anno_task)

    # --- instruction ---

    def get_annotask_instruction(self, annotask_id: int) -> dict:
        anno_task = self.dbm.get_anno_task(annotask_id)
        if not anno_task:
            raise AnnotaskInstructionNotFoundError(annotask_id)
        return {"instructionId": anno_task.instruction_id}

    def update_annotask_instruction(self, annotask_id: int, instruction_id: int | None) -> dict:
        anno_task = self.dbm.get_anno_task(annotask_id)
        if instruction_id is not None:
            if str(instruction_id) == "-1":
                anno_task.instruction_id = None
            else:
                anno_task.instruction_id = instruction_id
        else:
            anno_task.instruction_id = None
        self.dbm.save_obj(anno_task)
        return {"message": "Instruction successfully updated."}

    # --- review flows (compose SIA domain classes — last `as sia` bridge retired) ---

    def get_review_images(self, annotask_id: int, filter: str | None, labels: str | None, annotated_only: str) -> dict:
        search_str = filter if filter else ""
        annotated_only_bool = annotated_only.lower() == "true"
        db_result = self.dbm.get_search_images_in_annotask(annotask_id, search_str, annotated_only=annotated_only_bool)
        found_image_ids = []
        found_images = []
        for entry in db_result:
            found_image_ids.append(entry.idx)
            found_images.append({
                "imageId": entry.idx, "imageName": entry.img_path,
                "annotationId": entry.anno_task_id, "annotationName": entry.name,
            })
        if labels is not None:
            if labels == "":
                search_labels = []
            else:
                search_labels = list(map(int, labels.split(",")))
            if len(search_labels) == 0:
                db_result = self.dbm.get_images_without_annotations([annotask_id], search_str, annotated_only=annotated_only_bool)
                found_images = [
                    {"imageId": entry.idx, "imageName": entry.img_path,
                     "annotationId": entry.anno_task_id, "annotationName": entry.name}
                    for entry in db_result
                ]
            else:
                img_with_label_db_result = self.dbm.get_all_images_with_labels(found_image_ids, search_labels)
                img_ids_with_label = [entry.img_anno_id for entry in img_with_label_db_result]
                found_images = [img for img in found_images if img["imageId"] in img_ids_with_label]
        return {"images": found_images}

    def get_review_labels(self, annotask_id: int):
        return get_label_trees_by_anno_task_id(self.dbm, annotask_id)

    def update_one_thing(self, user, annotask_id: int, req) -> dict:
        if req.anno is None:
            if req.action not in ["imgAnnoTimeUpdate", "imgJunkUpdate", "imgLabelUpdate"]:
                raise Exception("Expect either anno or img information!")
        anno_task = self.dbm.get_anno_task(anno_task_id=annotask_id)
        sia_update = SiaUpdateOneThing(self.dbm, req.model_dump(), user.idx, anno_task)
        return sia_update.update()

    def get_review_options(self, user, annotask_id: int):
        return reviewoptions_annotask(self.dbm, annotask_id, user.idx)

    def annotask_review(self, user, annotask_id: int, data: dict):
        return _review(self.dbm, annotask_id, user.idx, data)