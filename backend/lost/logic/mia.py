import lost
import json
import os
from lost.db import dtype, state, model
from lost.logic.anno_task import set_finished, update_anno_task
from lost.logic.file_man import FileMan
from datetime import datetime
import skimage.io

__author__ = "Gereon Reus"

def get_next(db_man, user_id,max_amount):
    """ Get next ImageAnnos 
    :type db_man: lost.db.access.DBMan
    """
    at = __get_mia_anno_task(db_man, user_id)
    if at:
        config = json.loads(at.configuration)
        if config['type'] == 'annoBased':
            return __get_next_two_d_anno(db_man, user_id, at, max_amount)
        elif config['type'] == 'imageBased':    
            return __get_next_image_anno(db_man, user_id, at, max_amount)

    images = dict()
    images['images'] = list()
    return images

class ImageSerialize(object):
    def __init__(self, annos, user_id,proposedLabel=True):
        self.mia_json = dict()
        self.annos = annos
        self.user_id = user_id
        self.proposedLabel = proposedLabel
    def serialize(self):
        self.mia_json['images'] = list()
        self.mia_json['proposedLabel'] = None
        if self.proposedLabel:
            self.mia_json['proposedLabel'] = get_proposed_label(self.db_man, self.annos[0], self.user_id)
        for anno in self.annos:
            image = dict()
            image['id'] = anno.idx
            image['path'] = anno.img_path 
            self.mia_json['images'].append(image) 

class TwoDSerialize(object):
    def __init__(self, db_man, annos, user_id, anno_task_id,proposedLabel=True):
        self.mia_json = dict()
        self.db_man = db_man
        self.annos = annos
        self.user_id = user_id
        self.anno_task_id = anno_task_id
        self.file_man = FileMan(self.db_man.lostconfig)
        self.proposedLabel = proposedLabel
    def serialize(self):
        directory = os.path.join(self.file_man.two_d_path, str(self.anno_task_id))
        if not os.path.exists(directory):
            os.makedirs(directory)
        self.mia_json['images'] = list()
        self.mia_json['proposedLabel'] = None
        if self.proposedLabel:
            self.mia_json['proposedLabel'] = get_proposed_label(self.db_man, self.annos[0], self.user_id)
        for anno in self.annos:
            image_json = dict()
            image_json['id'] = anno.idx
            if anno.dtype == dtype.TwoDAnno.BBOX:
                # get image_anno of two_d anno
                image_anno = self.db_man.get_image_annotation(img_anno_id=anno.img_anno_id)
                cropped_image_path = os.path.join(directory, str(anno.idx)) + '.png'
                relative_cropped_image_path = self.file_man.two_d_rel_path + \
                str(self.anno_task_id) + "/" + str(anno.idx) + ".png"
                if os.path.exists(cropped_image_path):
                    image_json['path'] = relative_cropped_image_path 
                    self.mia_json['images'].append(image_json) 
                    continue
                else:    
                    # crop two_d_anno out of image_anno
                    image = skimage.io.imread(os.path.join(self.file_man.lostconfig.project_path,image_anno.img_path))
                    crop_data = json.loads(anno.data)
                    x_min = int((crop_data['x'] - crop_data['w']/2) * image.shape[1])
                    x_max = int(x_min + crop_data['w'] * image.shape[1])
                    y_min = int((crop_data['y'] - crop_data['h']/2) * image.shape[0])
                    y_max = int(y_min + crop_data['h'] * image.shape[0])
                    cropped_image = image[y_min:y_max, x_min:x_max]
                    skimage.io.imsave(cropped_image_path, cropped_image)

                    image_json['path'] = relative_cropped_image_path 
                    self.mia_json['images'].append(image_json) 
def update(db_man, user_id, data):
    at = __get_mia_anno_task(db_man, user_id)
    if at:
        config = json.loads(at.configuration)
        if config['type'] == 'annoBased':
            __update_two_d_annotation(db_man, user_id, data)
        elif config['type'] == 'imageBased':
            __update_image_annotation(db_man, user_id, data)            
            

        return update_anno_task(db_man, at.idx)
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
    label_trees_json['labelTrees'] = list()
    if at:
        for rll in db_man.get_all_required_label_leaves(at.idx): #type: lost.db.model.RequiredLabelLeaf
            label_tree_json = dict()
            label_tree_json['id'] = rll.label_leaf.idx
            label_tree_json['name'] = rll.label_leaf.name
            label_tree_json['description'] = rll.label_leaf.description
            label_tree_json['cssClass'] = rll.label_leaf.css_class
            label_tree_json['maxLabels'] = rll.max_labels
            label_tree_json['labelLeaves'] = list()
            for label_leaf in db_man.get_all_child_label_leaves(rll.label_leaf.idx):#type: lost.db.model.LabelLeaf
                label_leaf_json = dict()
                label_leaf_json['id'] = label_leaf.idx
                label_leaf_json['name'] = label_leaf.name
                label_leaf_json['nameAndClass'] = label_leaf.name + " (" + rll.label_leaf.name + ")"
                label_leaf_json['description'] = label_leaf.description
                label_leaf_json['cssClass'] = label_leaf.css_class
                label_tree_json['labelLeaves'].append(label_leaf_json)
            label_trees_json['labelTrees'].append(label_tree_json)
        return label_trees_json
    else: 
        label_trees = dict()
        label_trees['labelTrees'] = list()
        return label_trees
        
def __get_mia_anno_task(db_man, user_id):
    for cat in db_man.get_choosen_annotask(user_id):
        if cat.anno_task.dtype == dtype.AnnoTask.MIA:
            return cat.anno_task
    return None

def __get_next_two_d_anno(db_man, user_id, at, max_amount):
    #################### get locked priority ########################
    annos = db_man.get_two_d_annotations_by_state(at.idx,\
    state.Anno.LOCKED_PRIORITY, user_id, max_amount)
    if len(annos) > 0:
        for anno in annos:
            anno.timestamp_lock = datetime.now()
            db_man.save_obj(anno)
        image_serialize = TwoDSerialize(db_man, annos, user_id, at.idx, proposedLabel=False)
        image_serialize.serialize()
        return image_serialize.mia_json

    #################### get view locked ########################
    annos = db_man.get_two_d_annotations_by_state(at.idx, \
    state.Anno.LOCKED, user_id, 0)
    if len(annos) > 0:
        while int(len(annos)) > max_amount:
            annos[len(annos)-1].state = state.Anno.UNLOCKED
            db_man.save_obj(annos[len(annos)-1])
            del annos[len(annos)-1]

        if len(annos) < max_amount:
            sim_class = annos[0].sim_class
            tempannos = db_man.get_image_annotation_by_sim_class(at.idx,\
                        sim_class, (max_amount-len(annos)))
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
        image_serialize = TwoDSerialize(db_man, annos, user_id, at.idx)
        image_serialize.serialize()
        return image_serialize.mia_json

    ################## get new (unlocked)############################
        # first get random sim class
    sim_class = db_man.get_random_sim_class_two_d_anno(at.idx)
    if sim_class:
        sim_class = sim_class.sim_class
    else:
        images = dict()
        images['images'] = list()
        return images
    annos = db_man.get_two_d_anno_by_sim_class(at.idx, sim_class, max_amount)
    if len(annos) > 0:
                    for anno in annos:
                        anno.state = state.Anno.LOCKED
                        anno.timestamp_lock = datetime.now()
                        anno.user_id = user_id
                        db_man.add(anno)
                    db_man.commit()
                    image_serialize = TwoDSerialize(db_man, annos, user_id, at.idx)
                    image_serialize.serialize()
                    return image_serialize.mia_json

def __get_next_image_anno(db_man, user_id, at, max_amount):

    ## image annotations

    #################### get locked priority ########################
    annos = db_man.get_image_annotations_by_state(at.idx,\
    state.Anno.LOCKED_PRIORITY, user_id, max_amount)
    if len(annos) > 0:
        for anno in annos:
            anno.timestamp_lock = datetime.now()
            db_man.save_obj(anno)
        image_serialize = ImageSerialize(annos, user_id)
        image_serialize.serialize()
        return image_serialize.mia_json
        #################### get view locked ########################
    annos = db_man.get_image_annotations_by_state(at.idx, \
    state.Anno.LOCKED, user_id, 0)
    if len(annos) > 0:
        while int(len(annos)) > max_amount:
            annos[len(annos)-1].state = state.Anno.UNLOCKED
            db_man.save_obj(annos[len(annos)-1])
            del annos[len(annos)-1]

        if len(annos) < max_amount:
            sim_class = annos[0].sim_class
            tempannos = db_man.get_image_annotation_by_sim_class(at.idx,\
                        sim_class, (max_amount-len(annos)))
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
        image_serialize = ImageSerialize(annos, user_id, proposedLabel=False)
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
        images['images'] = list()
        return images
    annos = db_man.get_image_annotation_by_sim_class(at.idx, sim_class, max_amount)
    if len(annos) > 0:
        for anno in annos:
            anno.state = state.Anno.LOCKED
            anno.timestamp_lock = datetime.now()
            anno.user_id = user_id
            db_man.add(anno)
        db_man.commit()
        image_serialize = ImageSerialize(annos, user_id)
        image_serialize.serialize()
        return image_serialize.mia_json

def __update_image_annotation(db_man, user_id, data):
    anno_time = None
    anno_count = len(list(filter(lambda x: x['isActive'] is True, data['images'])))
    for img in data['images']:
        image = db_man.get_image_annotation(img_anno_id=img['id'])
        if img['isActive']:
            image.state = state.Anno.LABELED
            image.timestamp = datetime.now()
            if anno_time is None and anno_count > 0:
                anno_time = (image.timestamp-image.timestamp_lock).total_seconds()
                anno_time = anno_time/anno_count
            image.user_id = user_id
            image.anno_time = anno_time
            db_man.add(image)
            for label in data['labels']:
                lab = model.Label(dtype=dtype.Label.IMG_ANNO,
                                label_leaf_id=label['id'],
                                annotater_id=user_id,
                                timestamp=image.timestamp,
                                timestamp_lock=image.timestamp_lock,
                                anno_time=anno_time,
                                img_anno_id=image.idx)
                db_man.add(lab)
        else:
            image.state = state.Anno.LOCKED_PRIORITY
            db_man.add(image)
        db_man.commit()

def __update_two_d_annotation(db_man, user_id, data):
    anno_time = None
    anno_count = len(list(filter(lambda x: x['isActive'] is True, data['images'])))
    for img in data['images']:
        two_d_anno = db_man.get_two_d_annotation(two_d_anno_id=img['id'])
        if img['isActive']:
            two_d_anno.state = state.Anno.LABELED
            two_d_anno.timestamp = datetime.now()
            if anno_time is None and anno_count > 0:
                anno_time = (two_d_anno.timestamp-two_d_anno.timestamp_lock).total_seconds()
                anno_time = anno_time/anno_count
            two_d_anno.user_id = user_id
            two_d_anno.anno_time = anno_time
            db_man.add(two_d_anno)
            for label in data['labels']:
                lab = model.Label(dtype=dtype.Label.TWO_D_ANNO,
                                label_leaf_id=label['id'],
                                annotater_id=user_id,
                                timestamp=two_d_anno.timestamp,
                                timestamp_lock=two_d_anno.timestamp_lock,
                                anno_time=anno_time,
                                two_d_anno_id=two_d_anno.idx)
                db_man.add(lab)
        else:
            two_d_anno.state = state.Anno.LOCKED_PRIORITY
            db_man.add(two_d_anno)
        db_man.commit()

def get_proposed_label(db_man, anno, user_id):
    if anno:
        at = __get_mia_anno_task(db_man, user_id)
        config = json.loads(at.configuration)
        try:
            if 'showProposedLabel' in config:
                if config['showProposedLabel'] == True:
                    label_trees = get_label_trees(db_man, user_id)
                    for tree in label_trees['labelTrees']:
                        for leaf in tree['labelLeaves']:
                            if leaf['id'] == anno.sim_class:
                                return leaf['nameAndClass']
        except:
            return None
    return None