import lost
import json
import os
from lost.db import dtype, state, model
from lost.logic.anno_task import set_finished, update_anno_task
from lost.logic.file_man import FileMan
from datetime import datetime
import skimage.io
from lost.pyapi import anno_helper

__author__ = "Gereon Reus"

def get_next(db_man, default_user_id, max_amount):
    """ Get next ImageAnnos 
    :type db_man: lost.db.access.DBMan
    """
    at = __get_mia_anno_task(db_man, default_user_id)
    if at and at.pipe_element.pipe.state != state.Pipe.PAUSED:
        config = json.loads(at.configuration)
        if config['type'] == 'annoBased':
            return __get_next_two_d_anno(db_man, default_user_id, at, max_amount)
        elif config['type'] == 'imageBased':    
            return __get_next_image_anno(db_man, default_user_id, at, max_amount)
    images = dict()
    images['images'] = list()
    return images

class ImageSerialize(object):
    def __init__(self, db_man, annos, user_id,proposedLabel=True):
        self.mia_json = dict()
        self.db_man = db_man
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
        directory = self.file_man.get_mia_crop_path(self.anno_task_id)
        self.mia_json['images'] = list()
        self.mia_json['proposedLabel'] = None
        if self.proposedLabel:
            self.mia_json['proposedLabel'] = get_proposed_label(self.db_man, self.annos[0], self.user_id)
        for anno in self.annos:
            image_json = dict()
            image_json['id'] = anno.idx
            # get image_anno of two_d anno
            image_anno = self.db_man.get_image_annotation(img_anno_id=anno.img_anno_id)
            cropped_image_path = os.path.join(directory, str(anno.idx)) + '.png'
            relative_cropped_image_path = self.file_man.mia_crop_rel_path + \
            str(self.anno_task_id) + "/" + str(anno.idx) + ".png"
            if os.path.exists(cropped_image_path):
                image_json['path'] = relative_cropped_image_path 
                self.mia_json['images'].append(image_json) 
                continue
            else:    
                # crop two_d_anno out of image_anno
                config = get_config(self.db_man, self.user_id)
                draw_anno = False
                context = None
                try:
                    draw_anno = config['drawAnno']
                except:
                    pass
                try:
                    context = float(config['addContext'])
                except:
                    pass
                self._crop_twod_anno(image_anno, anno, draw_anno, 
                    context, cropped_image_path)
                image_json['path'] = relative_cropped_image_path 
                self.mia_json['images'].append(image_json) 

    def _crop_twod_anno(self, img_anno, twod_anno, draw_anno, context, out_path):
        '''Helper method to crop a bounding box for a TwoDAnnotation and store it on disc
        
        Args:
            img_anno (:class:`model.ImageAnno`): The ImageAnno where the twod_anno belongs to.
            twod_anno (:class:`model.TwoDAnno`): The 2D-anno to crop.
            draw_anno (bool): Indicates wether the annotation should be painted inside the crop.
            context (float): Value that indicates how much context should 
                be cropped around the 2D annotation.  
            out_path (str): Path to store the cropped image.
        '''
        image = skimage.io.imread(self.file_man.get_abs_path(img_anno.img_path))
        crops, _ = anno_helper.crop_boxes([twod_anno.to_vec('anno.data')],
            [twod_anno.to_vec('anno.dtype')], image, context=context, 
            draw_annotations=draw_anno)
        cropped_image = crops[0]
        skimage.io.imsave(out_path, cropped_image)

def update(db_man, user_id, data):
    at = __get_mia_anno_task(db_man, user_id)
    if at and at.pipe_element.pipe.state != state.Pipe.PAUSED:
        config = json.loads(at.configuration)
        if config['type'] == 'annoBased':
            __update_two_d_annotation(db_man, user_id, data)
        elif config['type'] == 'imageBased':
            __update_image_annotation(db_man, user_id, data)            

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
    label_trees_json['labels'] = list()
    if at:
        for rll in db_man.get_all_required_label_leaves(at.idx): #type: lost.db.model.RequiredLabelLeaf
            for label_leaf in db_man.get_all_child_label_leaves(rll.label_leaf.idx): #type: lost.db.model.LabelLeaf
                label_leaf_json = dict()
                label_leaf_json['id'] = label_leaf.idx
                label_leaf_json['label'] = label_leaf.name
                label_leaf_json['nameAndClass'] = label_leaf.name + " (" + rll.label_leaf.name + ")"
                label_leaf_json['description'] = label_leaf.description
                label_trees_json['labels'].append(label_leaf_json)
        return label_trees_json
    else: 
        label_trees = dict()
        label_trees['labels'] = list()
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
        image_serialize = ImageSerialize(db_man, annos, user_id)
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
        image_serialize = ImageSerialize(db_man, annos, user_id, proposedLabel=False)
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
        image_serialize = ImageSerialize(db_man, annos, user_id)
        image_serialize.serialize()
        return image_serialize.mia_json

def __update_image_annotation(db_man, user_id, data):
    anno_time = None
    anno_count = len(list(filter(lambda x: x['is_active'] is True, data['images'])))
    for img in data['images']:
        image = db_man.get_image_annotation(img_anno_id=img['id'])
        if img['is_active']:
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
                                annotator_id=user_id,
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
    anno_count = len(list(filter(lambda x: x['is_active'] is True, data['images'])))
    for img in data['images']:
        two_d_anno = db_man.get_two_d_annotation(two_d_anno_id=img['id'])
        if img['is_active']:
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
                                annotator_id=user_id,
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

def get_config(db_man, user_id):
    '''Get annotation tast config.

    Args:
        db_man (Object): Database manager object.
        user_id (int): Id of the user.
    Returns:
        dict: configuration dictionary.
    '''
    at = __get_mia_anno_task(db_man, user_id)
    config = json.loads(at.configuration)
    return config