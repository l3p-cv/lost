import json
from datetime import datetime

from lost.db import dtype, model, state
from lost.logic.anno_task import set_finished, update_anno_task
from lost.logic.file_man import FileMan

__author__ = "Gereon Reus"


def get_next(db_man, default_user_id, max_amount):
    """Get next ImageAnnos
    :type db_man: lost.db.access.DBMan
    """
    at = __get_mia_anno_task(db_man, default_user_id)
    if at and at.pipe_element.pipe.state != state.Pipe.PAUSED:
        config = json.loads(at.configuration)
        if config["type"] == "annoBased":
            return __get_next_two_d_anno(db_man, default_user_id, at, max_amount)
        elif config["type"] == "imageBased":
            return __get_next_image_anno(db_man, default_user_id, at, max_amount)
    images = dict()
    images["images"] = list()
    images["chunk"] = {"hasPrev": False, "id": -1}
    images["updateIds"] = []
    return images


def get_prev(db_man, default_user_id, chunk_id, update_ids):
    """Get previous MIA images
    :type db_man: lost.db.access.DBMan
    """

    at = __get_mia_anno_task(db_man, default_user_id)
    if at and at.pipe_element.pipe.state != state.Pipe.PAUSED:
        config = json.loads(at.configuration)
        if config["type"] == "annoBased":
            model_anno = model.TwoDAnno
        elif config["type"] == "imageBased":
            model_anno = model.ImageAnno
        # full_chunk = __get_has_full_chunk(db_man, update_ids, model_anno, default_user_id, at, chunk_id)
        # TODO: use full_chunk
        return __get_prev_annos(db_man, default_user_id, at, model_anno, chunk_id, update_ids)

    images = dict()
    images["images"] = list()
    images["chunk"] = {"hasPrev": False, "id": -1}
    images["updateIds"] = []
    return images


def get_first(db_man, default_user_id):
    at = __get_mia_anno_task(db_man, default_user_id)
    if at and at.pipe_element.pipe.state != state.Pipe.PAUSED:
        config = json.loads(at.configuration)
        if config["type"] == "annoBased":
            model_anno = model.TwoDAnno
        elif config["type"] == "imageBased":
            model_anno = model.ImageAnno
        annos = db_man.get_whole_chunk(default_user_id, at.idx, model_anno, chunk_id=1)
        return __serialize_annos(db_man, annos, default_user_id, False)

    images = dict()
    images["images"] = list()
    return images


def get_latest(db_man, default_user_id):
    at = __get_mia_anno_task(db_man, default_user_id)
    if at and at.pipe_element.pipe.state != state.Pipe.PAUSED:
        config = json.loads(at.configuration)
        if config["type"] == "annoBased":
            model_anno = model.TwoDAnno
        elif config["type"] == "imageBased":
            model_anno = model.ImageAnno
        chunk_id = db_man.get_latest_chunk_id(default_user_id, at.idx, model_anno=model_anno)
        update_id, other_ids = __get_latest_update_id(db_man, default_user_id, at, chunk_id, model_anno)
        annos = db_man.get_mia_update_chunk(model_anno, at.idx, chunk_id, [update_id], default_user_id)
        return __serialize_annos(db_man, annos, default_user_id, (chunk_id != 1 or len(other_ids) > 0))

    images = dict()
    images["images"] = list()
    return images


class ImageSerialize:
    def __init__(
        self,
        db_man,
        annos,
        user_id,
        has_prev=False,
        proposedLabel=True,
    ):
        self.mia_json = dict()
        self.db_man = db_man
        self.annos = annos
        self.user_id = user_id
        self.proposedLabel = proposedLabel
        self.has_prev = has_prev

    def serialize(self):
        self.mia_json["images"] = list()
        self.mia_json["proposedLabel"] = None
        self.mia_json["chunk"] = {"id": self.annos[0].chunk_id, "hasPrev": self.has_prev}
        if self.proposedLabel:
            self.mia_json["proposedLabel"] = get_proposed_label(self.db_man, self.annos[0], self.user_id)
        for anno in self.annos:
            image = dict()
            image["id"] = anno.idx
            image["updateId"] = anno.update_id
            # image['path'] = anno.img_path
            image["type"] = "imageBased"
            if anno.img_actions is not None:
                image["imgActions"] = json.loads(anno.img_actions)
            else:
                image["imgActions"] = []
            self.mia_json["images"].append(image)


class TwoDSerialize:
    def __init__(self, db_man, annos, user_id, anno_task_id, has_prev, proposedLabel=True):
        self.mia_json = dict()
        self.db_man = db_man
        self.annos = annos
        self.user_id = user_id
        self.anno_task_id = anno_task_id
        self.has_prev = has_prev
        self.file_man = FileMan(self.db_man.lostconfig)
        self.proposedLabel = proposedLabel
        self.config = json.loads(db_man.get_anno_task(anno_task_id=anno_task_id).configuration)

    def serialize(self):
        # directory = self.file_man.get_mia_crop_path(self.anno_task_id)
        self.mia_json["images"] = list()
        self.mia_json["proposedLabel"] = None
        self.mia_json["chunk"] = {"id": self.annos[0].chunk_id, "hasPrev": self.has_prev}
        if self.proposedLabel:
            self.mia_json["proposedLabel"] = get_proposed_label(self.db_man, self.annos[0], self.user_id)
        for anno in self.annos:
            image_json = dict()
            image_json["update_id"] = anno.update_id
            image_json["id"] = anno.idx
            image_json["type"] = "annoBased"
            try:
                image_json["drawAnno"] = self.config["drawAnno"]
                image_json["addContext"] = self.config["addContext"]
            except:
                pass
            # get image_anno of two_d anno
            image_anno = self.db_man.get_image_annotation(img_anno_id=anno.img_anno_id)
            self.mia_json["images"].append(image_json)


def update(db_man, user_id, data):
    at = __get_mia_anno_task(db_man, user_id)
    if at and at.pipe_element.pipe.state != state.Pipe.PAUSED:
        config = json.loads(at.configuration)
        if config["type"] == "annoBased":
            new_update_id = __get_new_update_id(db_man, user_id, at, model.TwoDAnno)
            __update_two_d_annotation(db_man, user_id, data, new_update_id)
        elif config["type"] == "imageBased":
            new_update_id = __get_new_update_id(db_man, user_id, at, model.ImageAnno)
            __update_image_annotation(db_man, user_id, data, new_update_id)

        return update_anno_task(db_man, at.idx, user_id)
    # get all labels
    # get all active images
    # add labels
    # set status locked priority of inactive
    # set status labeled
    # update anno task progress
    return "error"


def finish(db_man, user_id):
    at = __get_mia_anno_task(db_man, user_id)
    if at.idx:
        return set_finished(db_man, at.idx)
    else:
        return "error: anno_task not found"


def get_label_trees(db_man, user_id):
    """
    :type db_man: lost.db.access.DBMan
    """
    at = __get_mia_anno_task(db_man, user_id)
    label_trees_json = dict()
    label_trees_json["labels"] = list()
    if at:
        for rll in db_man.get_all_required_label_leaves(at.idx):  # type: lost.db.model.RequiredLabelLeaf
            for label_leaf in db_man.get_all_child_label_leaves(rll.label_leaf.idx):  # type: lost.db.model.LabelLeaf
                label_leaf_json = dict()
                label_leaf_json["id"] = label_leaf.idx
                label_leaf_json["label"] = label_leaf.name
                label_leaf_json["nameAndClass"] = label_leaf.name + " (" + rll.label_leaf.name + ")"
                label_leaf_json["description"] = label_leaf.description
                label_leaf_json["color"] = label_leaf.color
                label_trees_json["labels"].append(label_leaf_json)
        return label_trees_json
    else:
        label_trees = dict()
        label_trees["labels"] = list()
        return label_trees


def __get_mia_anno_task(db_man, user_id):
    for cat in db_man.get_choosen_annotask(user_id):
        if cat.anno_task.dtype == dtype.AnnoTask.MIA:
            return cat.anno_task
    return None


def __get_new_update_id(db_man, user_id, at, model_anno):
    latest_update_id = db_man.get_latest_update_id(user_id, at.idx, model_anno=model_anno)
    if latest_update_id == -1 or latest_update_id == None:
        return 1
    else:
        return latest_update_id + 1


def __get_new_chunk_id(db_man, user_id, at, model_anno):
    latest_chunk_id = db_man.get_latest_chunk_id(user_id, at.idx, model_anno=model_anno)
    if latest_chunk_id == -1 or latest_chunk_id == None:
        return 1
    else:
        return latest_chunk_id + 1


def __get_latest_update_id(db_man, user_id, at, chunk_id, model_anno):
    update_ids = db_man.get_chunk_update_ids(user_id, at.idx, model_anno, chunk_id)
    flat_update_ids = [int(x[0]) for x in update_ids]
    latest_update_id = -1 if -1 in flat_update_ids else max(flat_update_ids)
    flat_update_ids.remove(latest_update_id)
    return latest_update_id, flat_update_ids


def __check_annos_have_prev(db_man, at, annos, model_anno, user_id):
    chunk_id = annos[0].chunk_id
    if chunk_id > 1:
        return True

    chunk_update_ids = db_man.get_chunk_update_ids(user_id, at.idx, model_anno, chunk_id)
    current_update_ids = set([anno.update_id for anno in annos])
    if len(chunk_update_ids) > len(current_update_ids):
        return True
    else:
        return False


def __get_next_two_d_anno(db_man, user_id, at, max_amount):
    model_anno = model.TwoDAnno
    #################### get locked priority ########################
    annos = __get_filtered_image_annotations_by_state(
        db_man, at, state.Anno.LOCKED_PRIORITY, user_id, max_amount, model_anno
    )
    if len(annos) > 0:
        for anno in annos:
            anno.timestamp_lock = datetime.now()
            db_man.save_obj(anno)
        has_prev = __check_annos_have_prev(db_man, at, annos, model_anno, user_id)
        image_serialize = TwoDSerialize(db_man, annos, user_id, at.idx, has_prev, proposedLabel=True)
        image_serialize.serialize()
        return image_serialize.mia_json

    #################### get view locked ########################
    annos = __get_filtered_image_annotations_by_state(db_man, at, state.Anno.LOCKED, user_id, 0, model_anno)
    if len(annos) > 0:
        while len(annos) > max_amount:
            annos[len(annos) - 1].state = state.Anno.UNLOCKED
            db_man.save_obj(annos[len(annos) - 1])
            del annos[len(annos) - 1]

        if len(annos) < max_amount:
            sim_class = annos[0].sim_class
            tempannos = __get_filtered_sim_class_annos(db_man, at, sim_class, (max_amount - len(annos)), model_anno)
            for tanno in tempannos:
                tanno.state = state.Anno.LOCKED
                tanno.timestamp_lock = datetime.now()
                tanno.user_id = user_id
                annos.append(tanno)
                db_man.add(tanno)
            db_man.commit()
        for anno in annos:
            anno.timestamp_lock = datetime.now()
            db_man.save_obj(anno)
        has_prev = __check_annos_have_prev(db_man, at, annos, model_anno, user_id)
        image_serialize = TwoDSerialize(db_man, annos, user_id, at.idx, has_prev)
        image_serialize.serialize()
        return image_serialize.mia_json

    ################## get new (unlocked)############################
    # first get random sim class
    sim_class = db_man.get_random_sim_class_two_d_anno(at.idx)
    if sim_class:
        sim_class = sim_class.sim_class
    else:
        images = dict()
        images["images"] = list()
        images["chunk"] = {"hasPrev": True, "id": -1}
        images["updateIds"] = []
        return images
    annos = __get_filtered_sim_class_annos(db_man, at, sim_class, max_amount, model_anno)
    new_chunk_id = __get_new_chunk_id(db_man, user_id, at, model_anno=model.TwoDAnno)
    if len(annos) > 0:
        for anno in annos:
            anno.state = state.Anno.LOCKED
            if anno.chunk_id == -1:
                anno.chunk_id = new_chunk_id
            anno.timestamp_lock = datetime.now()
            anno.user_id = user_id
            db_man.add(anno)
        db_man.commit()
        has_prev = __check_annos_have_prev(db_man, at, annos, model_anno, user_id)
        image_serialize = TwoDSerialize(db_man, annos, user_id, at.idx, has_prev)
        image_serialize.serialize()
        return image_serialize.mia_json


def __get_next_image_anno(db_man, user_id, at, max_amount):
    ## image annotations
    model_anno = model.ImageAnno
    #################### get locked priority ########################
    annos = __get_filtered_image_annotations_by_state(
        db_man, at, state.Anno.LOCKED_PRIORITY, user_id, max_amount, model_anno
    )
    if len(annos) > 0:
        for anno in annos:
            anno.timestamp_lock = datetime.now()
            db_man.save_obj(anno)
        has_prev = __check_annos_have_prev(db_man, at, annos, model_anno, user_id)
        image_serialize = ImageSerialize(db_man, annos, user_id, has_prev)
        image_serialize.serialize()
        return image_serialize.mia_json
        #################### get view locked ########################
    annos = __get_filtered_image_annotations_by_state(db_man, at, state.Anno.LOCKED, user_id, 0, model_anno)
    if len(annos) > 0:
        while len(annos) > max_amount:
            annos[len(annos) - 1].state = state.Anno.UNLOCKED
            db_man.save_obj(annos[len(annos) - 1])
            del annos[len(annos) - 1]

        if len(annos) < max_amount:
            sim_class = annos[0].sim_class
            tempannos = __get_filtered_sim_class_annos(db_man, at, sim_class, (max_amount - len(annos)), model_anno)
            for tanno in tempannos:
                tanno.state = state.Anno.LOCKED
                tanno.timestamp_lock = datetime.now()
                tanno.user_id = user_id
                annos.append(tanno)
                db_man.add(tanno)
            db_man.commit()
        for anno in annos:
            anno.timestamp_lock = datetime.now()
            db_man.save_obj(anno)
        has_prev = __check_annos_have_prev(db_man, at, annos, model_anno, user_id)
        image_serialize = ImageSerialize(db_man, annos, user_id, has_prev)
        image_serialize.serialize()
        return image_serialize.mia_json
    # -- fill with new annos if size < max_amount
    # -- remove if size > max_amount

    ################## get new (unlocked)############################
    # first get random sim class
    sim_class = db_man.get_random_sim_class_img_anno(at.idx)
    if sim_class:
        sim_class = sim_class.sim_class
    else:
        images = dict()
        images["images"] = list()
        images["chunk"] = {"hasPrev": True, "id": -1}
        images["updateIds"] = []
        return images
    annos = __get_filtered_sim_class_annos(db_man, at, sim_class, max_amount, model_anno)
    if len(annos) > 0:
        new_chunk_id = __get_new_chunk_id(db_man, user_id, at, model_anno=model_anno)
        for anno in annos:
            anno.state = state.Anno.LOCKED
            if anno.chunk_id == -1:
                anno.chunk_id = new_chunk_id
            anno.timestamp_lock = datetime.now()
            anno.user_id = user_id
            db_man.add(anno)
        db_man.commit()
        has_prev = __check_annos_have_prev(db_man, at, annos, model_anno, user_id)
        image_serialize = ImageSerialize(db_man, annos, user_id, has_prev)
        image_serialize.serialize()
        return image_serialize.mia_json


def __get_filtered_sim_class_annos(db_man, at, sim_class, max_amount, model_anno):
    if model_anno == model.ImageAnno:
        annos = db_man.get_image_annotation_by_sim_class(at.idx, sim_class, max_amount)
    elif model_anno == model.TwoDAnno:
        annos = db_man.get_two_d_anno_by_sim_class(at.idx, sim_class, max_amount)

    return __filter_annos_by_first_chunk(annos)


def __get_filtered_image_annotations_by_state(db_man, at, state, user_id, amount, model_anno):
    if model_anno == model.ImageAnno:
        annos = db_man.get_image_annotations_by_state(at.idx, state, user_id, amount)
    elif model_anno == model.TwoDAnno:
        annos = db_man.get_two_d_annotations_by_state(at.idx, state, user_id, amount)

    return __filter_annos_by_first_chunk(annos)


def __filter_annos_by_first_chunk(annos):
    if not annos:
        return []
    target_chunk_id = annos[0].chunk_id
    filtered_annos = [anno for anno in annos if anno.chunk_id == target_chunk_id]

    return filtered_annos


def __get_prev_annos(db_man, user_id, at, model_anno, chunk_id, update_ids):
    # Helper function for rows
    def to_int(val):
        # If it's a SQLAlchemy Row or tuple, take the first element
        if hasattr(val, "_mapping") or isinstance(val, (tuple, list)):
            return int(val[0])
        # Otherwise try to convert the value directly
        return int(val)

    clean_update_ids = [to_int(x) for x in update_ids]
    raw_chunk_update_ids = db_man.get_chunk_update_ids(user_id, at.idx, model_anno, chunk_id)
    chunk_update_ids = [to_int(x) for x in raw_chunk_update_ids]
    update_set = set(clean_update_ids)
    not_included_updates = [x for x in chunk_update_ids if x not in update_set]
    if len(not_included_updates):
        prev_chunk = chunk_id
        # Append max update_id not already included
        update_set = set(update_ids)
        # update_ids.append(max((x for x in chunk_update_ids if x not in update_set), default=None))
        new_id = max((x for x in not_included_updates if x not in update_set), default=None)
        if new_id is not None:
            update_ids.append(new_id)
        has_prev = True if (len(not_included_updates) > 1) or (prev_chunk > 1) else False
    else:
        prev_chunk = chunk_id - 1
        raw_prev_update_ids = db_man.get_chunk_update_ids(user_id, at.idx, model_anno, prev_chunk)
        # prev_update_ids = [int(x[0] if isinstance(x, (tuple, list)) else x) for x in raw_prev_update_ids]
        prev_update_ids = [to_int(x) for x in raw_prev_update_ids]
        update_ids = [max(prev_update_ids)] if prev_update_ids else []
        has_prev = True if len(prev_update_ids) > 1 or (prev_chunk > 1) else False

    annos = db_man.get_mia_update_chunk(
        model_anno=model_anno, anno_task_id=at.idx, user_id=user_id, chunk_id=prev_chunk, update_ids=update_ids
    )

    return __serialize_annos(db_man, annos, user_id, has_prev)


def __serialize_annos(db_man, annos, user_id, has_prev):
    if not annos:
        return {"images": []}

    annos = sorted(annos, key=lambda a: a.idx)
    image_serialize = ImageSerialize(db_man, annos, user_id, has_prev)
    image_serialize.serialize()

    return image_serialize.mia_json


def __update_image_annotation(db_man, user_id, data, update_id):
    anno_time = None
    anno_count = len(list(filter(lambda x: x["is_active"] is True, data["images"])))
    for img in data["images"]:
        image = db_man.get_image_annotation(img_anno_id=img["id"])
        if img["is_active"]:
            image.state = state.Anno.LABELED
            image.timestamp = datetime.now()
            image.update_id = update_id
            if anno_time is None and anno_count > 0:
                anno_time = (image.timestamp - image.timestamp_lock).total_seconds()
                anno_time = anno_time / anno_count
            image.user_id = user_id
            image.anno_time = anno_time
            # Only one label is currently supported by mia -> Remove other labels if present
            for lbl in image.labels:
                db_man.delete(lbl)
            db_man.add(image)
            for label in data["labels"]:
                lab = model.Label(
                    dtype=dtype.Label.IMG_ANNO,
                    label_leaf_id=label["id"],
                    annotator_id=user_id,
                    timestamp=image.timestamp,
                    timestamp_lock=image.timestamp_lock,
                    anno_time=anno_time,
                    img_anno_id=image.idx,
                )
                db_man.add(lab)
        else:
            image.state = state.Anno.LOCKED_PRIORITY
            db_man.add(image)
        if "imgActions" in img:
            image.img_actions = json.dumps(img["imgActions"])
        db_man.commit()


def __update_two_d_annotation(db_man, user_id, data, update_id):  # TODO: update_id as part of data???
    anno_time = None
    anno_count = len(list(filter(lambda x: x["is_active"] is True, data["images"])))
    for img in data["images"]:
        two_d_anno = db_man.get_two_d_annotation(two_d_anno_id=img["id"])
        if img["is_active"]:
            two_d_anno.state = state.Anno.LABELED
            two_d_anno.timestamp = datetime.now()
            two_d_anno.update_id = update_id
            if anno_time is None and anno_count > 0:
                anno_time = (two_d_anno.timestamp - two_d_anno.timestamp_lock).total_seconds()
                anno_time = anno_time / anno_count
            two_d_anno.user_id = user_id
            two_d_anno.anno_time = anno_time
            # Only one label is currently supported by mia -> Remove other labels if present
            for lbl in two_d_anno.labels:
                db_man.delete(lbl)
            db_man.add(two_d_anno)
            for label in data["labels"]:
                lab = model.Label(
                    dtype=dtype.Label.TWO_D_ANNO,
                    label_leaf_id=label["id"],
                    annotator_id=user_id,
                    timestamp=two_d_anno.timestamp,
                    timestamp_lock=two_d_anno.timestamp_lock,
                    anno_time=anno_time,
                    two_d_anno_id=two_d_anno.idx,
                )
                db_man.add(lab)
        else:
            two_d_anno.state = state.Anno.LOCKED_PRIORITY
            db_man.add(two_d_anno)
        if "imgActions" in img:
            image = db_man.get_image_annotation(img_anno_id=two_d_anno.img_anno_id)
            if image.img_actions is not None:
                prev_actions = json.loads(image.img_actions)
            else:
                prev_actions = []
            new_actions = prev_actions + img["imgActions"]
            image.img_actions = json.dumps(new_actions)
            db_man.add(image)
        db_man.commit()


def get_proposed_label(db_man, anno, user_id):
    if anno:
        at = __get_mia_anno_task(db_man, user_id)
        config = json.loads(at.configuration)
        try:
            if "showProposedLabel" in config:
                if config["showProposedLabel"] == True:
                    label_trees = get_label_trees(db_man, user_id)
                    # for tree in label_trees['labels']:
                    for leaf in label_trees["labels"]:
                        if leaf["id"] == anno.sim_class:
                            return leaf["id"]
        except:
            return None
    return None


def get_config(db_man, user_id):
    """Get annotation tast config.

    Args:
        db_man (Object): Database manager object.
        user_id (int): Id of the user.
    Returns:
        dict: configuration dictionary.
    """
    at = __get_mia_anno_task(db_man, user_id)
    config = json.loads(at.configuration)
    return config


def get_special(db_man, user_id, mia_ids):
    at = __get_mia_anno_task(db_man, user_id)
    if at and at.pipe_element.pipe.state != state.Pipe.PAUSED:
        config = json.loads(at.configuration)
        if config["type"] == "annoBased":
            return __get_special_two_d_annos(db_man, user_id, at, mia_ids)
        elif config["type"] == "imageBased":
            return __get_special_image_annos(db_man, user_id, at, mia_ids)
    images = dict()
    images["images"] = list()
    return images


def __get_special_two_d_annos(db_man, user_id, at, mia_ids):
    annos = db_man.get_two_d_annotations_by_ids(at.idx, user_id, mia_ids)
    if len(annos) > 0:
        for anno in annos:
            anno.timestamp_lock = datetime.now()
            anno.state = state.Anno.LOCKED
            for label in anno.labels:
                if label.annotator_id == user_id:
                    db_man.delete(label)
            db_man.save_obj(anno)
            db_man.commit()
        image_serialize = TwoDSerialize(db_man, annos, user_id, at.idx, has_prev=False, proposedLabel=False)
        image_serialize.serialize()
        return image_serialize.mia_json


def __get_special_image_annos(db_man, user_id, at, mia_ids):
    annos = db_man.get_image_annotations_by_ids(at.idx, user_id, mia_ids)
    if len(annos) > 0:
        for anno in annos:
            anno.timestamp_lock = datetime.now()
            anno.state = state.Anno.LOCKED
            for label in anno.labels:
                if label.annotator_id == user_id:
                    db_man.delete(label)
            db_man.save_obj(anno)
            db_man.commit()
        image_serialize = ImageSerialize(db_man, annos, user_id)
        image_serialize.serialize()
        return image_serialize.mia_json
