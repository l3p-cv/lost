import lost
import json
import flask
from lost.db import dtype, state, model
from lost.db.access import DBMan
from lost.logic.anno_task import set_finished, update_anno_task
from datetime import datetime
from shapely.geometry import Polygon, LineString
from shapely.ops import unary_union
from shapely.errors import ShapelyError, TopologicalError
import math
import cv2
import numpy as np

__author__ = "Gereon Reus"


def get_first(db_man, user_id, media_url):
    """Get first image anno.
    :type db_man: lost.db.access.DBMan
    """
    at = get_sia_anno_task(db_man, user_id)
    iteration = db_man.get_pipe_element(pipe_e_id=at.pipe_element_id).iteration
    tmp_anno = db_man.get_first_sia_anno(at.idx, iteration, user_id)
    if tmp_anno:
        image_anno_id = tmp_anno.idx
        image_anno = db_man.get_image_anno(image_anno_id)
        if image_anno:
            image_anno.timestamp_lock = datetime.now()
            if image_anno.state == state.Anno.UNLOCKED:
                image_anno.state = state.Anno.LOCKED
            elif image_anno.state == state.Anno.LABELED:
                image_anno.state = state.Anno.LABELED_LOCKED
            is_last_image = __is_last_image__(db_man, user_id, at.idx, iteration, image_anno.idx)
            current_image_number, total_image_amount = get_image_progress(
                db_man, at, image_anno.idx, at.pipe_element.iteration
            )
            sia_serialize = SiaSerialize(
                image_anno, user_id, media_url, True, is_last_image, current_image_number, total_image_amount
            )
            db_man.save_obj(image_anno)
            return sia_serialize.serialize()
    else:
        return "nothing available"


def get_current(db_man, user_id, img_id, media_url):
    at = get_sia_anno_task(db_man, user_id)

    if at and at.pipe_element.pipe.state != state.Pipe.PAUSED:
        iteration = db_man.get_pipe_element(pipe_e_id=at.pipe_element_id).iteration
        image_anno = db_man.get_image_anno(img_id)

        is_first_image = True
        first_image_anno = db_man.get_first_sia_anno(at.idx, iteration, user_id)
        if first_image_anno is not None and first_image_anno.idx != image_anno.idx:
            is_first_image = False
        is_last_image = __is_last_image__(db_man, user_id, at.idx, iteration, image_anno.idx)
        current_image_number, total_image_amount = get_image_progress(
            db_man, at, image_anno.idx, at.pipe_element.iteration
        )
        sia_serialize = SiaSerialize(
            image_anno, user_id, media_url, is_first_image, is_last_image, current_image_number, total_image_amount
        )
        return sia_serialize.serialize()

    return "nothing available"


def set_labeled_state_for_last_image(db_man: DBMan, last_img_id):
    # Prevent to get same image again, since labeled state has not been set
    # correctly by update_one_thing. Which can be caused when update webservice
    # is slower than next webservice
    if last_img_id != -1:
        last_image_anno = db_man.get_image_anno(last_img_id)
        if last_image_anno is not None:
            if last_image_anno.state != state.Anno.LABELED:
                last_image_anno.state = state.Anno.LABELED
                db_man.save_obj(last_image_anno)


def get_next(db_man: DBMan, user_id, img_id, media_url):
    """Get next ImageAnno with all its TwoDAnnos
    :type db_man: lost.db.access.DBMan
    """
    at = get_sia_anno_task(db_man, user_id)
    # The image that has been viewed (img_id) by the annotator should alway have
    # state labeled
    set_labeled_state_for_last_image(db_man, img_id)
    if at and at.pipe_element.pipe.state != state.Pipe.PAUSED:
        image_anno = None
        iteration = db_man.get_pipe_element(pipe_e_id=at.pipe_element_id).iteration
        if int(img_id) == -1:
            tmp_annos = db_man.get_next_locked_sia_anno(at.idx, user_id, iteration)
            if len(tmp_annos) > 0:
                image_anno = tmp_annos[0]
            if image_anno is None:
                image_anno = db_man.get_next_unlocked_sia_anno(at.idx, iteration)
                if image_anno is None:
                    tmp_anno = db_man.get_last_sia_anno(at.idx, iteration, user_id)
                    if tmp_anno:
                        image_anno_id = tmp_anno.idx
                        image_anno = db_man.get_image_anno(image_anno_id)
        else:
            image_anno = db_man.get_next_sia_anno_by_last_anno(at.idx, user_id, img_id, iteration)
            if image_anno is None:
                tmp_annos = db_man.get_next_locked_sia_anno(at.idx, user_id, iteration)
                if len(tmp_annos) > 0:
                    image_anno = tmp_annos[0]
            if image_anno is None:
                image_anno = db_man.get_next_unlocked_sia_anno(at.idx, iteration)
        if image_anno:
            is_first_image = True
            image_anno.timestamp_lock = datetime.now()
            if image_anno.state == state.Anno.UNLOCKED:
                image_anno.state = state.Anno.LOCKED
            elif image_anno.state == state.Anno.LABELED:
                image_anno.state = state.Anno.LABELED_LOCKED
            image_anno.user_id = user_id
            db_man.save_obj(image_anno)
            first_image_anno = db_man.get_first_sia_anno(at.idx, iteration, user_id)
            if first_image_anno is not None and first_image_anno.idx != image_anno.idx:
                is_first_image = False
            is_last_image = __is_last_image__(db_man, user_id, at.idx, iteration, image_anno.idx)
            current_image_number, total_image_amount = get_image_progress(
                db_man, at, image_anno.idx, at.pipe_element.iteration
            )
            sia_serialize = SiaSerialize(
                image_anno, user_id, media_url, is_first_image, is_last_image, current_image_number, total_image_amount
            )
            db_man.save_obj(image_anno)
            return sia_serialize.serialize()
    return "nothing available"


def get_previous(db_man: DBMan, user_id, img_id, media_url):
    """Get previous image anno
    :type db_man: lost.db.access.DBMan
    """
    at = get_sia_anno_task(db_man, user_id)
    set_labeled_state_for_last_image(db_man, img_id)
    iteration = db_man.get_pipe_element(pipe_e_id=at.pipe_element_id).iteration
    image_anno = db_man.get_previous_sia_anno(at.idx, user_id, img_id, iteration)
    is_last_image = False
    is_first_image = False
    first_anno = db_man.get_first_sia_anno(at.idx, iteration, user_id)
    if image_anno is None:
        if first_anno:
            image_anno = db_man.get_image_anno(img_anno_id=first_anno.idx)
    if image_anno:
        if first_anno.idx == image_anno.idx:
            is_first_image = True
        image_anno.timestamp_lock = datetime.now()
        db_man.save_obj(image_anno)
        current_image_number, total_image_amount = get_image_progress(
            db_man, at, image_anno.idx, at.pipe_element.iteration
        )
        sia_serialize = SiaSerialize(
            image_anno, user_id, media_url, is_first_image, is_last_image, current_image_number, total_image_amount
        )
        return sia_serialize.serialize()
    else:
        return "nothing available"


def get_label_trees(db_man, user_id, at=None):
    """
    :type db_man: lost.db.access.DBMan
    """
    if at is None:
        at = get_sia_anno_task(db_man, user_id)
    label_trees_json = dict()
    label_trees_json["labels"] = list()
    if at:
        for rll in db_man.get_all_required_label_leaves(at.idx):  # type: lost.db.model.RequiredLabelLeaf
            for label_leaf in db_man.get_all_child_label_leaves(rll.label_leaf.idx):  # type: lost.db.model.LabelLeaf
                label_leaf_json = dict()
                label_leaf_json["id"] = label_leaf.idx
                label_leaf_json["label"] = label_leaf.name
                label_leaf_json["name"] = label_leaf.name
                label_leaf_json["nameAndClass"] = label_leaf.name + " (" + rll.label_leaf.name + ")"
                label_leaf_json["description"] = label_leaf.description
                label_leaf_json["externalId"] = label_leaf.external_id
                if label_leaf.color and label_leaf.color != "":
                    label_leaf_json["color"] = label_leaf.color
                label_trees_json["labels"].append(label_leaf_json)
        return label_trees_json
    else:
        label_trees = dict()
        label_trees["labels"] = list()
        return label_trees

def get_label_trees_by_anno_task_id(db_man, anno_task_id: int):
    """
    :type db_man: lost.db.access.DBMan
    """
    label_trees_json = {}
    label_trees_json["labels"] = []
    for rll in db_man.get_all_required_label_leaves(anno_task_id):  # type: lost.db.model.RequiredLabelLeaf
        for label_leaf in db_man.get_all_child_label_leaves(rll.label_leaf.idx):  # type: lost.db.model.LabelLeaf
            label_leaf_json = {
                "id": label_leaf.idx,
                "label": label_leaf.name,
                "name": label_leaf.name,
                "nameAndClass": label_leaf.name + " (" + rll.label_leaf.name + ")",
                "description": label_leaf.description,
                "externalId": label_leaf.external_id,
            }

            if label_leaf.color and label_leaf.color != "":
                label_leaf_json["color"] = label_leaf.color
            label_trees_json["labels"].append(label_leaf_json)
    return label_trees_json

def get_configuration(db_man, user_id):
    at = get_sia_anno_task(db_man, user_id)
    return json.loads(at.configuration)


def get_sia_anno_task(db_man, user_id):
    for cat in db_man.get_choosen_annotask(user_id):
        if cat.anno_task.dtype == dtype.AnnoTask.SIA:
            return cat.anno_task
    return None


def get_image_progress(db_man, anno_task, img_id, iteration=None):
    """Get image progress for current request

    Args:
        db_man (access.DBMan): Database manager
        anno_task (model.AnnoTask): Annotation task
        img_id (int): Id of the current image
        iteration (int): int or None. If None all annotations will be considered

    """
    anno_ids = list()
    if iteration is None:
        for anno in db_man.get_all_image_annos(anno_task.idx):
            anno_ids.append(anno.idx)
    else:
        for anno in db_man.get_all_image_annos_by_iteration(anno_task.idx, iteration):
            anno_ids.append(anno.idx)
    total_image_amount = len(anno_ids)
    current_image_number = anno_ids.index(img_id) + 1

    return current_image_number, total_image_amount


def get_total_image_amount(db_man, anno_task, iteration=None):
    anno_ids = []
    if iteration is None:
        for anno in db_man.get_all_image_annos(anno_task.idx):
            anno_ids.append(anno.idx)
    else:
        for anno in db_man.get_all_image_annos_by_iteration(anno_task.idx, iteration):
            anno_ids.append(anno.idx)
    total_image_amount = len(anno_ids)

    return total_image_amount


def __is_last_image__(db_man, user_id, at_id, iteration, img_id):
    """
    :type db_man: lost.db.access.DBMan
    """
    # three ways to check
    # first: are there some next locked annos for that user ?
    image_annos = db_man.get_next_locked_sia_anno(at_id, user_id, iteration)
    if image_annos:
        # has to be more than one, current viewed image is not part of condition
        if len(image_annos) > 1:
            return False
    # second: are we in a previous view ? - check for next allready labeled anno by last anno
    image_anno = db_man.get_next_sia_anno_by_last_anno(at_id, user_id, img_id, iteration)
    if image_anno:
        return False
    # third: is there one next free anno for that user ?
    image_anno = db_man.get_next_unlocked_sia_anno(at_id, iteration)
    if image_anno:
        # found one - lock it !
        img = db_man.get_image_anno(image_anno.idx)
        img.user_id = user_id
        img.state = state.Anno.LOCKED
        db_man.save_obj(img)
        return False
    else:
        return True


def update(db_man, data, user_id, auto_save=False):
    """Update Image and TwoDAnnotation from SIA
    :type db_man: lost.db.access.DBMan
    """
    anno_task = get_sia_anno_task(db_man, user_id)
    sia_update = SiaUpdate(db_man, data, user_id, anno_task)
    return sia_update.update(auto_save)


def update_one_thing(db_man, data, user_id):
    """Update Image and TwoDAnnotation from SIA
    :type db_man: lost.db.access.DBMan
    """
    anno_task = get_sia_anno_task(db_man, user_id)
    sia_update = SiaUpdateOneThing(db_man, data, user_id, anno_task)
    return sia_update.update()


def review_update(db_man, data, user_id, pe_id):
    """Update Image and TwoDAnnotation from SIA
    :type db_man: lost.db.access.DBMan
    """
    pe = db_man.get_pipe_element(pipe_e_id=pe_id)
    at = pe.anno_task
    sia_update = SiaUpdate(db_man, data, user_id, at, sia_type="review")
    return sia_update.update()


def review_update_annotask(db_man, data, user_id, annotask_id):
    """Update Image and TwoDAnnotation from SIA
    :type db_man: lost.db.access.DBMan
    """
    at = db_man.get_anno_task(annotask_id)
    sia_update = SiaUpdate(db_man, data, user_id, at, sia_type="review")
    return sia_update.update()


def finish(db_man, user_id):
    at = get_sia_anno_task(db_man, user_id)
    if at.idx:
        return set_finished(db_man, at.idx)
    else:
        return "error: anno_task not found"


def junk(db_man, user_id, img_id):
    image_anno = db_man.get_image_anno(img_id)  # type: lost.db.model.ImageAnno
    if image_anno:
        image_anno.state = state.Anno.JUNK
        image_anno.user_id = user_id
        image_anno.timestamp = datetime.now()
        db_man.save_obj(image_anno)
        return "success"
    else:
        return "error: image_anno not found"


def get_next_anno_id(dbman):
    anno = model.TwoDAnno(timestamp=datetime.now())
    dbman.save_obj(anno)
    return anno.idx


class SiaUpdateOneThing(object):
    def __init__(self, db_man, data, user_id, anno_task, sia_type="sia"):
        """
        :type db_man: lost.db.access.DBMan
        """
        img_data = data["img"]
        if "anno" in data:
            self.anno = data["anno"]
        else:
            self.anno = None
        self.logger = flask.current_app.logger
        self.sia_type = sia_type
        self.timestamp = datetime.now()
        self.db_man = db_man
        self.user_id = user_id
        self.at = anno_task  # type: lost.db.model.AnnoTask
        # self.sia_history_file = FileMan(self.db_man.lostconfig).get_sia_history_path(self.at)
        self.iteration = db_man.get_pipe_element(pipe_e_id=self.at.pipe_element_id).iteration
        self.image_anno = self.db_man.get_image_annotation(img_data["imgId"])
        self.image_anno.timestamp = self.timestamp
        if self.image_anno.anno_time is None:
            self.image_anno.anno_time = 0.0
        if self.sia_type == "sia":
            # Do not update image annotation time for sia review
            self.image_anno.anno_time = img_data["annoTime"]
        if "imgActions" in img_data:
            self.image_anno.img_actions = json.dumps(img_data["imgActions"])
        self._update_img_labels(img_data)
        if "isJunk" in img_data:
            self.image_anno.is_junk = img_data["isJunk"]

    def _update_img_labels(self, data):
        if "imgLabelChanged" in data:
            if data["imgLabelChanged"]:
                old = set([lbl.label_leaf_id for lbl in self.image_anno.labels])
                new = set(data["imgLabelIds"])
                to_delete = old - new
                to_add = new - old
                for lbl in self.image_anno.labels:
                    if lbl.label_leaf_id in to_delete:
                        self.image_anno.labels.remove(lbl)
                        # self.db_man.delete(lbl)
                for ll_id in to_add:
                    self.image_anno.labels.append(model.Label(label_leaf_id=ll_id))

    def update(self):
        if self.at.pipe_element.pipe.state == state.Pipe.PAUSED:
            return "pipe is paused"
        if self.anno is not None:
            anno_type = dtype.TwoDAnno.STR_TO_TYPE[self.anno["type"].lower()]
            res = self.__update_annotation(self.anno, anno_type)
        else:
            res = None
        self.image_anno.state = state.Anno.LABELED
        # Update Image Label
        # self.image_anno.labels = self.img_labels
        self.db_man.add(self.image_anno)
        self.db_man.commit()
        # self.__update_history_json_file()
        update_anno_task(self.db_man, self.at.idx, self.user_id)
        return res

    def __update_annotation(self, annotation, two_d_type):
        two_d = None
        annotation_json = dict()
        annotation_json["unchanged"] = list()
        annotation_json["deleted"] = list()
        annotation_json["new"] = list()
        annotation_json["changed"] = list()

        if (
            annotation["status"] != "database"
            and annotation["status"] != "deleted"
            and annotation["status"] != "new"
            and annotation["status"] != "changed"
        ):
            error_msg = "Status: '" + str(annotation["status"]) + "' is not valid."
            raise SiaStatusNotFoundError(error_msg)

        if annotation["status"] == "database":
            two_d = self.db_man.get_two_d_anno(annotation["id"])  # type: lost.db.model.TwoDAnno
            two_d.user_id = self.user_id
            two_d.state = state.Anno.LABELED
            two_d.timestamp = self.timestamp
            two_d.timestamp_lock = self.image_anno.timestamp_lock
            if two_d.anno_time is None:
                two_d.anno_time = 0.0
            # two_d.anno_time += average_anno_time
            self.db_man.save_obj(two_d)
            return None
        elif annotation["status"] == "deleted":
            # try:
            #     two_d = self.db_man.get_two_d_anno(annotation['id']) #type: lost.db.model.TwoDAnno
            #     # Do not try to delete an annotation if it has already been
            #     # deleted in database <- This could be the case for auto save commands
            #     if two_d is not None:
            #         for label in self.db_man.get_all_two_d_label(two_d.idx):
            #             self.db_man.delete(label)
            #         self.db_man.delete(two_d)
            #         self.db_man.commit()
            # except KeyError:
            #     print('SIA bug backend fix! Do not try to delete annotations that are not in db!')
            two_d = self.db_man.get_two_d_anno(annotation["id"])  # type: lost.db.model.TwoDAnno
            # Do not try to delete an annotation if it has already been
            # deleted in database <- This could be the case for auto save commands
            if two_d is not None:
                for label in self.db_man.get_all_two_d_label(two_d.idx):
                    self.db_man.delete(label)
                self.db_man.delete(two_d)
                self.db_man.commit()
            return {"tempId": annotation["id"], "dbId": two_d.idx, "newStatus": "deleted"}
        elif annotation["status"] == "new":
            annotation_data = annotation["data"]
            # if 'id' in annotation:
            #     two_d = self.db_man.get_two_d_anno(annotation['id']) #type: lost.db.model.TwoDAnno
            #     if not two_d:
            #         two_d = model.TwoDAnno()
            #         self.logger.warning(f"Could not find a previously created TwoD Anno with ID: {annotation['id']}.")
            # else:
            #     two_d = model.TwoDAnno()
            two_d = model.TwoDAnno()

            two_d.anno_task_id = self.at.idx
            two_d.img_anno_id = self.image_anno.idx
            two_d.timestamp = self.timestamp
            two_d.timestamp_lock = self.image_anno.timestamp_lock
            two_d.anno_time = annotation["annoTime"]
            two_d.data = json.dumps(annotation_data)
            two_d.user_id = self.user_id
            two_d.iteration = self.iteration
            two_d.dtype = two_d_type
            two_d.state = state.Anno.LABELED
            for lbl in two_d.labels:
                self.db_man.delete(lbl)
            if "comment" in annotation:
                two_d.description = annotation["comment"]
            if "isExample" in annotation:
                two_d.is_example = annotation["isExample"]
            self.db_man.save_obj(two_d)
            for l_id in annotation["labelIds"]:
                label = model.Label(
                    two_d_anno_id=two_d.idx,
                    label_leaf_id=l_id,
                    dtype=dtype.Label.TWO_D_ANNO,
                    timestamp=self.timestamp,
                    annotator_id=self.user_id,
                    timestamp_lock=self.image_anno.timestamp_lock,
                    anno_time=annotation["annoTime"],
                )
                self.db_man.save_obj(label)
            return {"tempId": annotation["id"], "dbId": two_d.idx, "newStatus": "database"}
        elif annotation["status"] == "changed":
            annotation_data = annotation["data"]
            try:
                annotation_data.pop("left")
                annotation_data.pop("right")
                annotation_data.pop("top")
                annotation_data.pop("bottom")
            except:
                pass
            two_d = self.db_man.get_two_d_anno(annotation["id"])  # type: lost.db.model.TwoDAnno
            two_d.timestamp = self.timestamp
            two_d.timestamp_lock = self.image_anno.timestamp_lock
            two_d.data = json.dumps(annotation_data)
            two_d.user_id = self.user_id
            if two_d.anno_time is None:
                two_d.anno_time = 0.0
            two_d.anno_time = annotation["annoTime"]
            two_d.state = state.Anno.LABELED
            if "comment" in annotation:
                two_d.description = annotation["comment"]
            if "isExample" in annotation:
                two_d.is_example = annotation["isExample"]

            l_id_list = list()
            # get all labels of that two_d_anno.
            for label in self.db_man.get_all_two_d_label(two_d.idx):
                # save id.
                l_id_list.append(label.idx)
                # delete labels, that are not in user labels list.
                if label.idx not in annotation["labelIds"]:
                    self.db_man.delete(label)
                # labels that are in the list get a new anno_time
                else:
                    if label.anno_time is None:
                        label.anno_time = 0.0
                    label.anno_time = annotation["annoTime"]
                    label.timestamp = self.timestamp
                    label.annotator_id = (self.user_id,)
                    label.timestamp_lock = self.image_anno.timestamp_lock
                    self.db_man.save_obj(label)
            # new labels
            for l_id in annotation["labelIds"]:
                if l_id not in l_id_list:
                    label = model.Label(
                        two_d_anno_id=two_d.idx,
                        label_leaf_id=l_id,
                        dtype=dtype.Label.TWO_D_ANNO,
                        timestamp=self.timestamp,
                        annotator_id=self.user_id,
                        timestamp_lock=self.image_anno.timestamp_lock,
                        anno_time=annotation["annoTime"],
                    )
                    self.db_man.save_obj(label)
            self.db_man.save_obj(two_d)
            return {"tempId": annotation["id"], "dbId": two_d.idx, "newStatus": "database"}
        if two_d is not None:
            return {"tempId": annotation["id"], "dbId": two_d.idx}
        else:
            return None
        return "success"


class SiaUpdate(object):
    def __init__(self, db_man, data, user_id, anno_task, sia_type="sia"):
        """
        :type db_man: lost.db.access.DBMan
        """
        self.logger = flask.current_app.logger
        self.sia_type = sia_type
        self.timestamp = datetime.now()
        self.db_man = db_man
        self.user_id = user_id
        self.at = anno_task  # type: lost.db.model.AnnoTask
        # self.sia_history_file = FileMan(self.db_man.lostconfig).get_sia_history_path(self.at)
        self.iteration = db_man.get_pipe_element(pipe_e_id=self.at.pipe_element_id).iteration
        self.image_anno = self.db_man.get_image_annotation(data["imgId"])
        self.image_anno.timestamp = self.timestamp
        if self.image_anno.anno_time is None:
            self.image_anno.anno_time = 0.0
        if self.sia_type == "sia":
            # Do not update image annotation time for sia review
            self.image_anno.anno_time = data["annoTime"]
        self.b_boxes = list()
        self.points = list()
        self.lines = list()
        self.polygons = list()
        self.history_json = dict()
        self.history_json["annotations"] = dict()
        self.history_json["annotations"]["new"] = list()
        self.history_json["annotations"]["unchanged"] = list()
        self.history_json["annotations"]["changed"] = list()
        self.history_json["annotations"]["deleted"] = list()
        self._update_img_labels(data)
        self.image_anno.is_junk = data["isJunk"]

        # store certain annotations
        if "bBoxes" in data["annotations"]:
            self.b_boxes = data["annotations"]["bBoxes"]
        else:
            self.b_boxes = None
        if "points" in data["annotations"]:
            self.points = data["annotations"]["points"]
        else:
            self.points = None
        if "lines" in data["annotations"]:
            self.lines = data["annotations"]["lines"]
        else:
            self.lines = None
        if "polygons" in data["annotations"]:
            self.polygons = data["annotations"]["polygons"]
        else:
            self.polygons = None

    def _update_img_labels(self, data):
        if data["imgLabelChanged"]:
            old = set([lbl.label_leaf_id for lbl in self.image_anno.labels])
            new = set(data["imgLabelIds"])
            to_delete = old - new
            to_add = new - old
            for lbl in self.image_anno.labels:
                if lbl.label_leaf_id in to_delete:
                    self.image_anno.labels.remove(lbl)
                    # self.db_man.delete(lbl)
            for ll_id in to_add:
                self.image_anno.labels.append(model.Label(label_leaf_id=ll_id))

    def update(self, auto_save=False):
        if self.at.pipe_element.pipe.state == state.Pipe.PAUSED:
            return "pipe is paused"
        if self.b_boxes is not None:
            self.__update_annotations(self.b_boxes, dtype.TwoDAnno.BBOX)
        if self.points is not None:
            self.__update_annotations(self.points, dtype.TwoDAnno.POINT)
        if self.lines is not None:
            self.__update_annotations(self.lines, dtype.TwoDAnno.LINE)
        if self.polygons is not None:
            self.__update_annotations(self.polygons, dtype.TwoDAnno.POLYGON)
        if not auto_save:
            self.image_anno.state = state.Anno.LABELED
        # Update Image Label
        # self.image_anno.labels = self.img_labels
        self.db_man.add(self.image_anno)
        self.db_man.commit()
        # self.__update_history_json_file()
        update_anno_task(self.db_man, self.at.idx, self.user_id)
        return "success"

    def __update_annotations(self, annotations, two_d_type):
        annotation_json = dict()
        annotation_json["unchanged"] = list()
        annotation_json["deleted"] = list()
        annotation_json["new"] = list()
        annotation_json["changed"] = list()

        for annotation in annotations:
            if (
                annotation["status"] != "database"
                and annotation["status"] != "deleted"
                and annotation["status"] != "new"
                and annotation["status"] != "changed"
            ):
                error_msg = "Status: '" + str(annotation["status"]) + "' is not valid."
                raise SiaStatusNotFoundError(error_msg)

        for annotation in annotations:
            if annotation["status"] == "database":
                two_d = self.db_man.get_two_d_anno(annotation["id"])  # type: lost.db.model.TwoDAnno
                two_d.user_id = self.user_id
                two_d.state = state.Anno.LABELED
                two_d.timestamp = self.timestamp
                two_d.timestamp_lock = self.image_anno.timestamp_lock
                if two_d.anno_time is None:
                    two_d.anno_time = 0.0
                # two_d.anno_time += average_anno_time
                two_d_json = self.__serialize_two_d_json(two_d)
                annotation_json["unchanged"].append(two_d_json)
                self.db_man.save_obj(two_d)
            elif annotation["status"] == "deleted":
                try:
                    two_d = self.db_man.get_two_d_anno(annotation["id"])  # type: lost.db.model.TwoDAnno
                    # Do not try to delete an annotation if it has already been
                    # deleted in database <- This could be the case for auto save commands
                    if two_d is not None:
                        two_d_json = self.__serialize_two_d_json(two_d)
                        annotation_json["deleted"].append(two_d_json)
                        for label in self.db_man.get_all_two_d_label(two_d.idx):
                            self.db_man.delete(label)
                        self.db_man.delete(two_d)
                        self.db_man.commit()
                except KeyError:
                    print("SIA bug backend fix! Do not try to delete annotations that are not in db!")
            elif annotation["status"] == "new":
                annotation_data = annotation["data"]
                try:
                    annotation_data.pop("left")
                    annotation_data.pop("right")
                    annotation_data.pop("top")
                    annotation_data.pop("bottom")
                except:
                    pass

                if "id" in annotation:
                    two_d = self.db_man.get_two_d_anno(annotation["id"])  # type: lost.db.model.TwoDAnno
                    if not two_d:
                        two_d = model.TwoDAnno()
                        self.logger.warning(
                            f"Could not find a previously created TwoD Anno with ID: {annotation['id']}."
                        )
                else:
                    two_d = model.TwoDAnno()

                two_d.anno_task_id = self.at.idx
                two_d.img_anno_id = self.image_anno.idx
                two_d.timestamp = self.timestamp
                two_d.timestamp_lock = self.image_anno.timestamp_lock
                two_d.anno_time = annotation["annoTime"]
                two_d.data = json.dumps(annotation_data)
                two_d.user_id = self.user_id
                two_d.iteration = self.iteration
                two_d.dtype = two_d_type
                two_d.state = state.Anno.LABELED
                for lbl in two_d.labels:
                    self.db_man.delete(lbl)
                if "comment" in annotation:
                    two_d.description = annotation["comment"]
                if "isExample" in annotation:
                    two_d.is_example = annotation["isExample"]
                self.db_man.save_obj(two_d)
                for l_id in annotation["labelIds"]:
                    label = model.Label(
                        two_d_anno_id=two_d.idx,
                        label_leaf_id=l_id,
                        dtype=dtype.Label.TWO_D_ANNO,
                        timestamp=self.timestamp,
                        annotator_id=self.user_id,
                        timestamp_lock=self.image_anno.timestamp_lock,
                        anno_time=annotation["annoTime"],
                    )
                    self.db_man.save_obj(label)
                two_d_json = self.__serialize_two_d_json(two_d)
                annotation_json["new"].append(two_d_json)
            elif annotation["status"] == "changed":
                annotation_data = annotation["data"]
                try:
                    annotation_data.pop("left")
                    annotation_data.pop("right")
                    annotation_data.pop("top")
                    annotation_data.pop("bottom")
                except:
                    pass
                two_d = self.db_man.get_two_d_anno(annotation["id"])  # type: lost.db.model.TwoDAnno
                two_d.timestamp = self.timestamp
                two_d.timestamp_lock = self.image_anno.timestamp_lock
                two_d.data = json.dumps(annotation_data)
                two_d.user_id = self.user_id
                if two_d.anno_time is None:
                    two_d.anno_time = 0.0
                two_d.anno_time = annotation["annoTime"]
                two_d.state = state.Anno.LABELED
                if "comment" in annotation:
                    two_d.description = annotation["comment"]
                if "isExample" in annotation:
                    two_d.is_example = annotation["isExample"]

                l_id_list = list()
                # get all labels of that two_d_anno.
                for label in self.db_man.get_all_two_d_label(two_d.idx):
                    # save id.
                    l_id_list.append(label.idx)
                    # delete labels, that are not in user labels list.
                    if label.idx not in annotation["labelIds"]:
                        self.db_man.delete(label)
                    # labels that are in the list get a new anno_time
                    else:
                        if label.anno_time is None:
                            label.anno_time = 0.0
                        label.anno_time = annotation["annoTime"]
                        label.timestamp = self.timestamp
                        label.annotator_id = (self.user_id,)
                        label.timestamp_lock = self.image_anno.timestamp_lock
                        self.db_man.save_obj(label)
                # new labels
                for l_id in annotation["labelIds"]:
                    if l_id not in l_id_list:
                        label = model.Label(
                            two_d_anno_id=two_d.idx,
                            label_leaf_id=l_id,
                            dtype=dtype.Label.TWO_D_ANNO,
                            timestamp=self.timestamp,
                            annotator_id=self.user_id,
                            timestamp_lock=self.image_anno.timestamp_lock,
                            anno_time=annotation["annoTime"],
                        )
                        self.db_man.save_obj(label)
                self.db_man.save_obj(two_d)
                two_d_json = self.__serialize_two_d_json(two_d)
                annotation_json["changed"].append(two_d_json)
            else:
                continue
        self.history_json["annotations"] = annotation_json
        return "success"

    def __serialize_two_d_json(self, two_d):
        two_d_json = dict()
        two_d_json["id"] = two_d.idx
        two_d_json["user_id"] = two_d.user_id
        if two_d.annotator:
            two_d_json["user_name"] = two_d.annotator.first_name + " " + two_d.annotator.last_name
        else:
            two_d_json["user_name"] = None
        two_d_json["anno_time"] = two_d.anno_time
        two_d_json["data"] = two_d.data
        label_list_json = list()
        if two_d.labels:
            label_json = dict()
            label_json["id"] = [lbl.idx for lbl in two_d.labels]
            label_json["label_leaf_id"] = [lbl.label_leaf.idx for lbl in two_d.labels]
            label_json["label_leaf_name"] = [lbl.label_leaf.name for lbl in two_d.labels]
            label_list_json.append(label_json)

        two_d_json["labels"] = label_list_json
        return two_d_json

    # def __update_history_json_file(self):
    #     # create history directory if not exist
    #     if self.sia_type == 'sia':
    #         self.history_json['timestamp'] = self.timestamp.strftime("%Y-%m-%d %H:%M:%S.%f")
    #         self.history_json['timestamp_lock'] = self.image_anno.timestamp_lock.strftime("%Y-%m-%d %H:%M:%S.%f")
    #         self.history_json['image_anno_time'] = self.image_anno.anno_time
    #     self.history_json['user_id'] = self.user_id
    #     self.history_json['user_name'] = None
    #     if self.image_anno.annotator:
    #         self.history_json['user_name'] = self.image_anno.annotator.first_name + " " + self.image_anno.annotator.last_name
    #     if not os.path.exists(self.sia_history_file):
    #         with open(self.sia_history_file, 'w') as f:
    #             event_json = dict()
    #             json.dump(event_json, f)
    #     with open(self.sia_history_file) as f:
    #         data = json.load(f)
    #         if str(self.image_anno.idx) in data:
    #             data[str(self.image_anno.idx)].append(self.history_json)
    #         else:
    #             data[str(self.image_anno.idx)] = list()
    #             data[str(self.image_anno.idx)].append(self.history_json)
    #     with open(self.sia_history_file, 'w') as f:
    #         json.dump(data, f)


class SiaSerialize(object):
    def __init__(
        self, image_anno, user_id, media_url, is_first_image, is_last_image, current_image_number, total_image_amount
    ):
        self.sia_json = dict()
        self.image_anno = image_anno  # type: lost.db.model.ImageAnno
        self.user_id = user_id
        self.media_url = media_url
        self.is_first_image = is_first_image
        self.is_last_image = is_last_image
        self.current_image_number = current_image_number
        self.total_image_amount = total_image_amount

    def serialize(self):
        self.sia_json["image"] = dict()
        self.sia_json["image"]["id"] = self.image_anno.idx
        self.sia_json["image"]["url"] = "/" + self.image_anno.img_path
        self.sia_json["image"]["isFirst"] = self.is_first_image
        self.sia_json["image"]["isLast"] = self.is_last_image
        self.sia_json["image"]["number"] = self.current_image_number
        self.sia_json["image"]["amount"] = self.total_image_amount
        self.sia_json["image"]["isJunk"] = self.image_anno.is_junk
        self.sia_json["image"]["annoTime"] = self.image_anno.anno_time
        self.sia_json["image"]["description"] = self.image_anno.description
        if self.image_anno.img_actions is not None:
            self.sia_json["image"]["imgActions"] = json.loads(self.image_anno.img_actions)
        else:
            self.sia_json["image"]["imgActions"] = []
        if self.image_anno.labels is None:
            self.sia_json["image"]["labelIds"] = []
        else:
            self.sia_json["image"]["labelIds"] = [lbl.label_leaf_id for lbl in self.image_anno.labels]
        self.sia_json["annotations"] = dict()
        self.sia_json["annotations"]["bBoxes"] = list()
        self.sia_json["annotations"]["points"] = list()
        self.sia_json["annotations"]["lines"] = list()
        self.sia_json["annotations"]["polygons"] = list()
        for two_d_anno in self.image_anno.twod_annos:  # type: lost.db.model.TwoDAnno
            if two_d_anno.dtype == dtype.TwoDAnno.BBOX:
                bbox_json = dict()
                bbox_json["id"] = two_d_anno.idx
                bbox_json["labelIds"] = list()
                if two_d_anno.labels:  # type: lost.db.model.Label
                    bbox_json["labelIds"] = [lbl.label_leaf_id for lbl in two_d_anno.labels]
                bbox_json["data"] = json.loads(two_d_anno.data)
                bbox_json["annoTime"] = two_d_anno.anno_time
                bbox_json["comment"] = two_d_anno.description
                bbox_json["isExample"] = two_d_anno.is_example
                self.sia_json["annotations"]["bBoxes"].append(bbox_json)
            elif two_d_anno.dtype == dtype.TwoDAnno.POINT:
                point_json = dict()
                point_json["id"] = two_d_anno.idx
                point_json["labelIds"] = list()
                if two_d_anno.labels:  # type: lost.db.model.Label
                    point_json["labelIds"] = [lbl.label_leaf_id for lbl in two_d_anno.labels]
                point_json["data"] = json.loads(two_d_anno.data)
                point_json["annoTime"] = two_d_anno.anno_time
                point_json["comment"] = two_d_anno.description
                point_json["isExample"] = two_d_anno.is_example
                self.sia_json["annotations"]["points"].append(point_json)
            elif two_d_anno.dtype == dtype.TwoDAnno.LINE:
                line_json = dict()
                line_json["id"] = two_d_anno.idx
                line_json["labelIds"] = list()
                if two_d_anno.labels:  # type: lost.db.model.Label
                    line_json["labelIds"] = [lbl.label_leaf_id for lbl in two_d_anno.labels]
                line_json["data"] = json.loads(two_d_anno.data)
                line_json["annoTime"] = two_d_anno.anno_time
                line_json["comment"] = two_d_anno.description
                line_json["isExample"] = two_d_anno.is_example
                self.sia_json["annotations"]["lines"].append(line_json)
            elif two_d_anno.dtype == dtype.TwoDAnno.POLYGON:
                polygon_json = dict()
                polygon_json["id"] = two_d_anno.idx
                polygon_json["labelIds"] = list()
                if two_d_anno.labels:  # type: lost.db.model.Label
                    polygon_json["labelIds"] = [lbl.label_leaf_id for lbl in two_d_anno.labels]
                polygon_json["data"] = json.loads(two_d_anno.data)
                polygon_json["annoTime"] = two_d_anno.anno_time
                polygon_json["comment"] = two_d_anno.description
                polygon_json["isExample"] = two_d_anno.is_example
                self.sia_json["annotations"]["polygons"].append(polygon_json)
        return self.sia_json


class SiaStatusNotFoundError(Exception):
    """Base class for SiaStatusNotFoundError"""

    pass


def get_last_image_id(dbm, user_id):
    at = get_sia_anno_task(dbm, user_id)
    if at:
        iteration = dbm.get_pipe_element(pipe_e_id=at.pipe_element_id).iteration
        tmp_anno = dbm.get_last_edited_sia_anno(at.idx, iteration, user_id)
        if tmp_anno:
            return tmp_anno.idx - 1
    return None


def review(dbm, data, user_id, media_url):
    direction = data["direction"]
    current_idx = data["image_anno_id"]
    iteration = data["iteration"]
    pe_id = data["pe_id"]

    at = dbm.get_pipe_element(pipe_e_id=pe_id).anno_task
    first_anno = dbm.get_sia_review_first(at.idx, iteration)
    if direction == "first":
        image_anno = first_anno
    elif direction == "next":
        image_anno = dbm.get_sia_review_next(at.idx, current_idx, iteration)
    elif direction == "previous":
        image_anno = dbm.get_sia_review_prev(at.idx, current_idx, iteration)

    if image_anno:
        # all_iterations = True
        # if iteration:
        #     all_iterations = False

        current_image_number, total_image_amount = get_image_progress(dbm, at, image_anno.idx, iteration)

        is_first_image = False
        if first_anno.idx == image_anno.idx:
            is_first_image = True

        is_last_image = False
        if current_image_number == total_image_amount:
            is_last_image = True

        sia_serialize = SiaSerialize(
            image_anno, user_id, media_url, is_first_image, is_last_image, current_image_number, total_image_amount
        )
        return sia_serialize.serialize()
    else:
        return "no annotation found"


def reviewoptions(dbm, pe_id, user_id):
    options = {}
    pipe_element = dbm.get_pipe_element(pipe_e_id=pe_id)
    if pipe_element.state == state.PipeElement.PENDING:
        options["max_iteration"] = pipe_element.iteration - 1
    else:
        options["max_iteration"] = pipe_element.iteration
    options["possible_labels"] = get_label_trees(dbm, user_id, pipe_element.anno_task)["labels"]
    return options


def reviewoptions_annotask(dbm, at_id, user_id):
    options = {}
    options["max_iteration"] = 0

    anno_task = dbm.get_anno_task(anno_task_id=at_id)
    options["possible_labels"] = get_label_trees(dbm, user_id, anno_task)["labels"]
    return options


class PolygonOperationError(Exception):
    """Custom exception for polygon operation errors."""

    def __init__(self, message):
        super().__init__(message)
        self.message = message


def bbox_to_polygon(bbox):
    x, y, w, h = bbox["x"], bbox["y"], bbox["w"], bbox["h"]
    half_w, half_h = w / 2, h / 2
    return [
        {"x": x - half_w, "y": y - half_h},
        {"x": x + half_w, "y": y - half_h},
        {"x": x + half_w, "y": y + half_h},
        {"x": x - half_w, "y": y + half_h},
    ]


def remove_duplicate_polygons(polygons):
    unique_polys = []
    seen = set()
    for poly in polygons:
        key = tuple((round(p["x"], 8), round(p["y"], 8)) for p in poly)
        if key not in seen:
            seen.add(key)
            unique_polys.append(poly)
    return unique_polys


def normalize_annotations(data):
    if "annotations" not in data or not isinstance(data["annotations"], list):
        raise PolygonOperationError("Missing or invalid 'annotations' field")

    normalized_annotations = []
    for ann in data["annotations"]:
        if "polygonCoordinates" in ann and "originalType" in ann:
            normalized_annotations.append(ann)
            continue
        new_ann = {"originalType": ann.get("type"), "type": "polygon"}
        if str.lower(ann.get("type")) == "bbox":
            new_ann["data"] = ann["data"]
            new_ann["polygonCoordinates"] = bbox_to_polygon(ann["data"])
        elif ann.get("type") == "polygon":
            new_ann["data"] = ann["data"]
            new_ann["polygonCoordinates"] = ann["data"]
        else:
            raise PolygonOperationError(f"Unsupported annotation type: {ann.get('type')}")
        normalized_annotations.append(new_ann)

    unique_polys = remove_duplicate_polygons([ann["polygonCoordinates"] for ann in normalized_annotations])
    data["annotations"] = [
        {"type": "polygon", "polygonCoordinates": poly, "originalType": ann["originalType"], "data": ann.get("data")}
        for poly, ann in zip(unique_polys, normalized_annotations)
    ]
    return data


def intersect_bboxes(bbox1, bbox2):
    x1_min, y1_min = bbox1["x"] - bbox1["w"] / 2, bbox1["y"] - bbox1["h"] / 2
    x1_max, y1_max = bbox1["x"] + bbox1["w"] / 2, bbox1["y"] + bbox1["h"] / 2
    x2_min, y2_min = bbox2["x"] - bbox2["w"] / 2, bbox2["y"] - bbox2["h"] / 2
    x2_max, y2_max = bbox2["x"] + bbox2["w"] / 2, bbox2["y"] + bbox2["h"] / 2

    ix_min, iy_min = max(x1_min, x2_min), max(y1_min, y2_min)
    ix_max, iy_max = min(x1_max, x2_max), min(y1_max, y2_max)

    if ix_min >= ix_max or iy_min >= iy_max:
        raise PolygonOperationError("Intersection of bboxes resulted in empty region")

    return {"x": (ix_min + ix_max) / 2, "y": (iy_min + iy_max) / 2, "w": ix_max - ix_min, "h": iy_max - iy_min}


def perform_polygon_union(data):
    if "annotations" not in data or not isinstance(data["annotations"], list):
        flask.current_app.logger.info("Missing or invalid 'annotations' field")
        raise PolygonOperationError("Missing or invalid 'annotations' field")

    polygons = [ann["polygonCoordinates"] for ann in data["annotations"] if "polygonCoordinates" in ann]

    if len(polygons) < 2:
        flask.current_app.logger.info("At least 2 polygons required for union")
        raise PolygonOperationError("At least 2 polygons required for union")
    shapely_polygons = []
    for poly in polygons:
        if len(poly) < 3:
            flask.current_app.logger.info("Insufficient vertices")
            raise PolygonOperationError("Each polygon must have at least 3 vertices")
        coords = []
        for p in poly:
            if not (isinstance(p.get("x"), (int, float)) and isinstance(p.get("y"), (int, float))):
                flask.current_app.logger.info("Non-numeric coordinates detected")
                raise PolygonOperationError("All coordinates must be numeric")
            if math.isnan(p["x"]) or math.isinf(p["x"]) or math.isnan(p["y"]) or math.isinf(p["y"]):
                flask.current_app.logger.info("Invalid coordinates (NaN or inf)")
                raise PolygonOperationError("Coordinates cannot be NaN or infinite")
            coords.append((p["x"], p["y"]))
        try:
            shapely_poly = Polygon(coords)
            if not shapely_poly.is_valid:
                flask.current_app.logger.info("Self-intersecting polygon detected")
                raise PolygonOperationError("Invalid polygon geometry: Self-intersection")
            shapely_polygons.append(shapely_poly)
        except (ShapelyError, TopologicalError) as e:
            flask.current_app.logger.error(f"Invalid geometry: {str(e)}")
            raise PolygonOperationError(f"Invalid polygon geometry: {str(e)}")

    try:
        result_poly = unary_union(shapely_polygons)
    except (ShapelyError, TopologicalError) as e:
        flask.current_app.logger.error(f"Topology error in union: {str(e)}")
        raise PolygonOperationError(f"Topology error during union: {str(e)}")

    if result_poly.is_empty:
        flask.current_app.logger.info("Empty result polygon")
        raise PolygonOperationError("Union resulted in an empty polygon")

    if result_poly.geom_type != "Polygon":
        flask.current_app.logger.info(f"Unexpected geometry type: {result_poly.geom_type}")
        raise PolygonOperationError(f"Unexpected geometry type: {result_poly.geom_type}")

    result_coords = [{"x": float(x), "y": float(y)} for x, y in result_poly.exterior.coords[:-1]]

    response = {"type": "polygon", "resultantPolygon": result_coords}
    flask.current_app.logger.info(f"Returning success response: {response}")
    return response


def perform_polygon_intersection(data):
    if "annotations" not in data or not isinstance(data["annotations"], list):
        raise PolygonOperationError("Missing or invalid 'annotations' field")

    annotations = data["annotations"]
    if len(annotations) != 2:
        raise PolygonOperationError("Exactly 2 annotations required for intersection")

    if len(annotations) == 2 and all(ann.get("originalType") == "bbox" and "data" in ann for ann in annotations):
        result_bbox = intersect_bboxes(annotations[0]["data"], annotations[1]["data"])
        return {"type": "bbox", "resultantBBox": result_bbox}

    polygons = [ann["polygonCoordinates"] for ann in annotations]

    shapely_polygons = []
    for poly in polygons:
        if len(poly) < 3:
            raise PolygonOperationError("Each polygon must have at least 3 vertices")
        coords = []
        for p in poly:
            if not (isinstance(p.get("x"), (int, float)) and isinstance(p.get("y"), (int, float))):
                raise PolygonOperationError("All coordinates must be numeric")
            if math.isnan(p["x"]) or math.isinf(p["x"]) or math.isnan(p["y"]) or math.isinf(p["y"]):
                raise PolygonOperationError("Coordinates cannot be NaN or infinite")
            coords.append((p["x"], p["y"]))
        try:
            shapely_poly = Polygon(coords)
            if not shapely_poly.is_valid:
                raise PolygonOperationError("Invalid polygon geometry: Self-intersection")
            shapely_polygons.append(shapely_poly)
        except (ShapelyError, TopologicalError) as e:
            raise PolygonOperationError(f"Invalid polygon geometry: {str(e)}")

    try:
        result_poly = shapely_polygons[0].intersection(shapely_polygons[1])
    except (ShapelyError, TopologicalError) as e:
        raise PolygonOperationError(f"Topology error during intersection: {str(e)}")

    if result_poly.is_empty:
        raise PolygonOperationError("Intersection resulted in an empty polygon")

    if result_poly.geom_type == "Polygon":
        result_coords = [{"x": float(x), "y": float(y)} for x, y in result_poly.exterior.coords[:-1]]
    elif result_poly.geom_type == "MultiPolygon":
        largest_poly = max(result_poly.geoms, key=lambda p: p.area)
        result_coords = [{"x": float(x), "y": float(y)} for x, y in largest_poly.exterior.coords[:-1]]
    elif result_poly.geom_type == "GeometryCollection":
        valid_polygons = [geom for geom in result_poly.geoms if geom.geom_type == "Polygon"]
        if not valid_polygons:
            raise PolygonOperationError("Intersection resulted in no valid polygons")
        largest_poly = max(valid_polygons, key=lambda p: p.area)
        result_coords = [{"x": float(x), "y": float(y)} for x, y in largest_poly.exterior.coords[:-1]]
    else:
        raise PolygonOperationError(f"Unsupported geometry type: {result_poly.geom_type}")

    return {"type": "polygon", "resultantPolygon": result_coords}


def perform_polygon_difference(data):
    if "selectedPolygon" not in data or not isinstance(data["selectedPolygon"], (dict, list)):
        raise PolygonOperationError("Missing or invalid 'selectedPolygon' field")
    if "polygonModifiers" not in data or not isinstance(data["polygonModifiers"], list):
        raise PolygonOperationError("Missing or invalid 'polygonModifiers' field")

    sel = data["selectedPolygon"]
    if isinstance(sel, dict):
        if sel.get("type") == "bbox":
            data["selectedPolygon"] = bbox_to_polygon(sel["data"])
        elif sel.get("type") == "polygon":
            data["selectedPolygon"] = sel["data"]

    for i, mod in enumerate(data.get("polygonModifiers", [])):
        if isinstance(mod, dict):
            if mod.get("type") == "bbox":
                data["polygonModifiers"][i] = bbox_to_polygon(mod["data"])
            elif mod.get("type") == "polygon":
                data["polygonModifiers"][i] = mod["data"]

    polygons = [data["selectedPolygon"]] + data["polygonModifiers"]

    shapely_polygons = []
    for poly in polygons:
        if len(poly) < 3:
            flask.current_app.logger.info("Insufficient vertices")
            raise PolygonOperationError("Each polygon must have at least 3 vertices")
        coords = []
        for p in poly:
            if not (isinstance(p.get("x"), (int, float)) and isinstance(p.get("y"), (int, float))):
                flask.current_app.logger.info("Non-numeric coordinates detected")
                raise PolygonOperationError("All coordinates must be numeric")
            if math.isnan(p["x"]) or math.isinf(p["x"]) or math.isnan(p["y"]) or math.isinf(p["y"]):
                raise PolygonOperationError("Coordinates cannot be NaN or infinite")
            coords.append((p["x"], p["y"]))
        try:
            shapely_poly = Polygon(coords)
            if not shapely_poly.is_valid:
                raise PolygonOperationError("Invalid polygon geometry: Self-intersection")
            shapely_polygons.append(shapely_poly)
        except (ShapelyError, TopologicalError) as e:
            raise PolygonOperationError(f"Invalid polygon geometry: {str(e)}")
    try:
        has_overlap = any(
            shapely_polygons[0].intersects(mod) and not shapely_polygons[0].intersection(mod).is_empty
            for mod in shapely_polygons[1:]
        )
        if not has_overlap:
            raise PolygonOperationError("No overlap detected between selected polygon and modifiers")

        result_poly = shapely_polygons[0]
        for modifier in shapely_polygons[1:]:
            result_poly = result_poly.difference(modifier)
    except (ShapelyError, TopologicalError) as e:
        raise PolygonOperationError(f"Topology error during difference: {str(e)}")

    if result_poly.is_empty:
        raise PolygonOperationError("Difference resulted in an empty polygon")

    if result_poly.geom_type == "Polygon":
        result_coords = [{"x": float(x), "y": float(y)} for x, y in result_poly.exterior.coords[:-1]]
    elif result_poly.geom_type == "MultiPolygon":
        largest_poly = max(result_poly.geoms, key=lambda p: p.area)
        result_coords = [{"x": float(x), "y": float(y)} for x, y in largest_poly.exterior.coords[:-1]]
    else:
        raise PolygonOperationError(f"Unsupported geometry type: {result_poly.geom_type}")

    return {"type": "polygon", "resultantPolygon": result_coords}


def apply_canny_edge(image, config):
    if not all(k in config for k in ("lowerThreshold", "upperThreshold")):
        raise ValueError("Both lowerThreshold and upperThreshold are required for cannyEdge filter")

    lower_threshold = config["lowerThreshold"]
    upper_threshold = config["upperThreshold"]

    if not all(isinstance(v, (int, float)) and math.isfinite(v) for v in [lower_threshold, upper_threshold]):
        raise ValueError("Threshold values must be numeric and finite")
    if not (0 <= lower_threshold <= 255 and 0 <= upper_threshold <= 255):
        raise ValueError("Threshold values must be between 0 and 255")
    if upper_threshold <= lower_threshold:
        raise ValueError("upperThreshold must be greater than lowerThreshold")

    return cv2.Canny(image, lower_threshold, upper_threshold)


def apply_clahe(image, config):
    if "clipLimit" not in config:
        raise ValueError("clipLimit is required for clahe filter")

    clip_limit = config["clipLimit"]

    if not isinstance(clip_limit, (int, float)) or not math.isfinite(clip_limit) or clip_limit <= 0:
        raise ValueError("clipLimit must be a positive finite number")

    if len(image.shape) == 3:
        image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    clahe = cv2.createCLAHE(clipLimit=clip_limit)
    return clahe.apply(image)


def apply_bilateral_blurr(image, config):
    if not all(k in config for k in ("diameter", "sigmaColor", "sigmaSpace")):
        raise ValueError("diameter, sigmaColor, and sigmaSpace are required for bilateral blurr filter")

    diameter = config["diameter"]
    sigma_color = config["sigmaColor"]
    sigma_space = config["sigmaSpace"]

    if not all(isinstance(v, (int, float)) and math.isfinite(v) for v in [diameter, sigma_color, sigma_space]):
        raise ValueError("diameter, sigmaColor, and sigmaSpace must be numeric and finite")
    if diameter <= 0 or sigma_color <= 0 or sigma_space <= 0:
        raise ValueError("diameter, sigmaColor, and sigmaSpace must be positive")

    if len(image.shape) == 3:
        image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    return cv2.bilateralFilter(image, int(diameter), float(sigma_color), float(sigma_space))


FILTERS = {
    # Implemented in this way because of potential future additional filters
    "cannyEdge": apply_canny_edge,
    "clahe": apply_clahe,
    "bilateral": apply_bilateral_blurr,
}


def apply_filters(image, filters):
    processed_image = image.copy()
    applied_filters = set()

    for filter_item in filters:
        filter_name = filter_item.get("name")
        config = filter_item.get("configuration", {})

        if filter_name in applied_filters:
            raise ValueError(f"Filter {filter_name} cannot be applied more than once")

        filter_func = FILTERS.get(filter_name)
        if not filter_func:
            raise ValueError(f"Unsupported filter: {filter_name}")

        processed_image = filter_func(processed_image, config)
        applied_filters.add(filter_name)

    return processed_image


def compute_bboxes_from_points(data):
    if not isinstance(data, dict) or "data" not in data:
        flask.current_app.logger.info("Input must be a dictionary with a 'data' key")
        raise PolygonOperationError("Input must be a dictionary with a 'data' key")

    all_point_sets = data["data"]
    if not isinstance(all_point_sets, list):
        raise PolygonOperationError("The 'data' key must contain a list of point sets")

    results = []
    for point_set in all_point_sets:
        if not isinstance(point_set, list) or len(point_set) < 3:
            raise PolygonOperationError("Each point set must contain at least 3 points")

        for point in point_set:
            if not isinstance(point, dict) or "x" not in point or "y" not in point:
                raise PolygonOperationError("Each point must be a dict with 'x' and 'y'")
            if not (isinstance(point["x"], (int, float)) and isinstance(point["y"], (int, float))):
                raise PolygonOperationError("All coordinates must be numeric")
            if not (0 <= point["x"] <= 1 and 0 <= point["y"] <= 1):
                raise PolygonOperationError("Coordinates must be in [0,1]")

        xs = [p["x"] for p in point_set]
        ys = [p["y"] for p in point_set]

        xmin, xmax = min(xs), max(xs)
        ymin, ymax = min(ys), max(ys)

        w = xmax - xmin
        h = ymax - ymin
        xc = xmin + w / 2
        yc = ymin + h / 2
        size = max(w, h)
        half = size / 2

        xc = min(max(xc, half), 1 - half)
        yc = min(max(yc, half), 1 - half)

        bbox = {
            "h": round(float(size), 8),
            "w": round(float(size), 8),
            "x": round(float(xc), 8),
            "y": round(float(yc), 8),
        }
        results.append(bbox)
        flask.current_app.logger.info(f"Computed bbox: {bbox}")

    return results
