from enum import auto
import lost
import json
import os
import flask
from lost.db import dtype, state, model
from lost.logic.anno_task import set_finished, update_anno_task
from datetime import datetime
from lost.logic.file_man import FileMan
__author__ = "Gereon Reus"

def get_first(db_man, user_id, media_url):
    """ Get first image anno.
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
            current_image_number, total_image_amount = get_image_progress(db_man, at, image_anno.idx, at.pipe_element.iteration)
            sia_serialize = SiaSerialize(image_anno, user_id, media_url, True, is_last_image, current_image_number, total_image_amount)
            db_man.save_obj(image_anno)
            return sia_serialize.serialize()
    else:
        return "nothing available"
def get_next(db_man, user_id, img_id, media_url):
    # ptvsd.wait_for_attach()
    # ptvsd.break_into_debugger()
    """ Get next ImageAnno with all its TwoDAnnos
    :type db_man: lost.db.access.DBMan
    """
    at = get_sia_anno_task(db_man, user_id)
    if at and at.pipe_element.pipe.state != state.Pipe.PAUSED:
        image_anno = None
        iteration = db_man.get_pipe_element(pipe_e_id=at.pipe_element_id).iteration
        if int(img_id) == -1:
            tmp_annos =  db_man.get_next_locked_sia_anno(at.idx, user_id, iteration)
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
                tmp_annos =  db_man.get_next_locked_sia_anno(at.idx, user_id, iteration)
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
            current_image_number, total_image_amount = get_image_progress(db_man, at, image_anno.idx, at.pipe_element.iteration)
            sia_serialize = SiaSerialize(image_anno, user_id, media_url, is_first_image, is_last_image, current_image_number, total_image_amount)
            db_man.save_obj(image_anno)
            return sia_serialize.serialize()
    return "nothing available"
def get_previous(db_man, user_id, img_id, media_url):
    """ Get previous image anno
    :type db_man: lost.db.access.DBMan
    """
    at = get_sia_anno_task(db_man, user_id)
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
        current_image_number, total_image_amount = get_image_progress(db_man, at, image_anno.idx, at.pipe_element.iteration)
        sia_serialize = SiaSerialize(image_anno, user_id, media_url, is_first_image, is_last_image, current_image_number, total_image_amount)
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
    label_trees_json['labels'] = list()
    if at:
        for rll in db_man.get_all_required_label_leaves(at.idx): #type: lost.db.model.RequiredLabelLeaf
            for label_leaf in db_man.get_all_child_label_leaves(rll.label_leaf.idx): #type: lost.db.model.LabelLeaf
                label_leaf_json = dict()
                label_leaf_json['id'] = label_leaf.idx
                label_leaf_json['label'] = label_leaf.name
                label_leaf_json['nameAndClass'] = label_leaf.name + " (" + rll.label_leaf.name + ")"
                label_leaf_json['description'] = label_leaf.description
                if label_leaf.color and label_leaf.color != '':
                    label_leaf_json['color'] = label_leaf.color
                label_trees_json['labels'].append(label_leaf_json)
        return label_trees_json
    else: 
        label_trees = dict()
        label_trees['labels'] = list()
        return label_trees
        
def get_configuration(db_man, user_id):
    at = get_sia_anno_task(db_man,user_id)
    return json.loads(at.configuration)
def get_sia_anno_task(db_man, user_id): 
    for cat in db_man.get_choosen_annotask(user_id):
        if cat.anno_task.dtype == dtype.AnnoTask.SIA:
            return cat.anno_task
    return None
def get_image_progress(db_man, anno_task, img_id, iteration=None):
    '''Get image progress for current request
    
    Args:
        db_man (access.DBMan): Database manager
        anno_task (model.AnnoTask): Annotation task
        img_id (int): Id of the current image
        iteration (int): int or None. If None all annotations will be considered

    '''
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
    """ Update Image and TwoDAnnotation from SIA
    :type db_man: lost.db.access.DBMan
    """
    anno_task = get_sia_anno_task(db_man, user_id)
    sia_update = SiaUpdate(db_man, data, user_id, anno_task)
    return sia_update.update(auto_save)

def update_one_thing(db_man, data, user_id):
    """ Update Image and TwoDAnnotation from SIA
    :type db_man: lost.db.access.DBMan
    """
    anno_task = get_sia_anno_task(db_man, user_id)
    sia_update = SiaUpdateOneThing(db_man, data, user_id, anno_task)
    return sia_update.update()

def review_update(db_man, data, user_id, pe_id):
    """ Update Image and TwoDAnnotation from SIA
    :type db_man: lost.db.access.DBMan
    """
    pe = db_man.get_pipe_element(pipe_e_id=pe_id)
    at = pe.anno_task
    sia_update = SiaUpdate(db_man, data, user_id, at, sia_type='review')
    return sia_update.update()

def finish(db_man, user_id):
    at = get_sia_anno_task(db_man, user_id)
    if at.idx: 
        return set_finished(db_man, at.idx)
    else:
        return "error: anno_task not found"

def junk(db_man, user_id, img_id):
    image_anno = db_man.get_image_anno(img_id) #type: lost.db.model.ImageAnno
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
    def __init__(self, db_man, data, user_id, anno_task, sia_type='sia'):
        """
        :type db_man: lost.db.access.DBMan
        """
        img_data = data['img']
        if 'anno' in data:
            self.anno = data['anno']
        else:
            self.anno = None
        self.logger = flask.current_app.logger
        self.sia_type = sia_type
        self.timestamp = datetime.now()
        self.db_man = db_man
        self.user_id = user_id 
        self.at = anno_task #type: lost.db.model.AnnoTask
        # self.sia_history_file = FileMan(self.db_man.lostconfig).get_sia_history_path(self.at)
        self.iteration = db_man.get_pipe_element(pipe_e_id=self.at.pipe_element_id).iteration
        self.image_anno = self.db_man.get_image_annotation(img_data['imgId'])
        self.image_anno.timestamp = self.timestamp
        if self.image_anno.anno_time is None:
            self.image_anno.anno_time = 0.0
        if self.sia_type == 'sia':
            # Do not update image annotation time for sia review
            self.image_anno.anno_time = img_data['annoTime']
        if 'imgActions' in img_data:
            self.image_anno.img_actions = json.dumps(img_data['imgActions'])
        self._update_img_labels(img_data)  
        if 'isJunk' in img_data:
            self.image_anno.is_junk = img_data['isJunk']   


    def _update_img_labels(self, data):
        if 'imgLabelChanged' in data:
            if data['imgLabelChanged']:
                old = set([lbl.label_leaf_id for lbl in self.image_anno.labels])
                new = set(data['imgLabelIds'])
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
            anno_type = dtype.TwoDAnno.STR_TO_TYPE[self.anno['type'].lower()]
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
        annotation_json['unchanged'] = list()
        annotation_json['deleted'] = list()
        annotation_json['new'] = list()
        annotation_json['changed'] = list()
   
        if annotation['status'] != "database" \
        and annotation['status'] != "deleted" \
        and annotation['status'] != "new" \
        and annotation['status'] != "changed":
            error_msg = "Status: '" + str(annotation['status']) + "' is not valid."
            raise SiaStatusNotFoundError(error_msg)

        if annotation['status'] == "database":
            two_d = self.db_man.get_two_d_anno(annotation['id']) #type: lost.db.model.TwoDAnno
            two_d.user_id = self.user_id
            two_d.state = state.Anno.LABELED
            two_d.timestamp = self.timestamp
            two_d.timestamp_lock = self.image_anno.timestamp_lock
            if two_d.anno_time is None:
                two_d.anno_time = 0.0
            # two_d.anno_time += average_anno_time
            self.db_man.save_obj(two_d)
            return None
        elif annotation['status'] == "deleted":
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
            two_d = self.db_man.get_two_d_anno(annotation['id']) #type: lost.db.model.TwoDAnno
            # Do not try to delete an annotation if it has already been 
            # deleted in database <- This could be the case for auto save commands
            if two_d is not None: 
                for label in self.db_man.get_all_two_d_label(two_d.idx):
                    self.db_man.delete(label)
                self.db_man.delete(two_d)
                self.db_man.commit()
            return {'tempId':annotation['id'], 'dbId': two_d.idx, 'newStatus': 'deleted'}
        elif annotation['status'] == "new":
            annotation_data = annotation['data']
            # if 'id' in annotation:
            #     two_d = self.db_man.get_two_d_anno(annotation['id']) #type: lost.db.model.TwoDAnno    
            #     if not two_d:
            #         two_d = model.TwoDAnno()
            #         self.logger.warning(f"Could not find a previously created TwoD Anno with ID: {annotation['id']}.")
            # else:
            #     two_d = model.TwoDAnno()
            two_d = model.TwoDAnno()
            
            two_d.anno_task_id=self.at.idx
            two_d.img_anno_id=self.image_anno.idx
            two_d.timestamp=self.timestamp
            two_d.timestamp_lock=self.image_anno.timestamp_lock
            two_d.anno_time=annotation['annoTime']
            two_d.data=json.dumps(annotation_data)
            two_d.user_id=self.user_id
            two_d.iteration=self.iteration
            two_d.dtype=two_d_type
            two_d.state=state.Anno.LABELED
            for lbl in two_d.labels:
                self.db_man.delete(lbl)
            if 'comment' in annotation:
                two_d.description = annotation['comment']
            if 'isExample' in annotation:
                two_d.is_example = annotation['isExample']
            self.db_man.save_obj(two_d)
            for l_id in annotation['labelIds']:
                label = model.Label(two_d_anno_id=two_d.idx,
                                    label_leaf_id=l_id,
                                    dtype=dtype.Label.TWO_D_ANNO,
                                    timestamp=self.timestamp,
                                    annotator_id=self.user_id,
                                    timestamp_lock=self.image_anno.timestamp_lock,
                                    anno_time=annotation['annoTime'])
                self.db_man.save_obj(label)
            return {'tempId':annotation['id'], 'dbId': two_d.idx, 'newStatus': 'database'}
        elif annotation['status'] == "changed":
            annotation_data = annotation['data']
            try:
                annotation_data.pop('left')
                annotation_data.pop('right')
                annotation_data.pop('top')
                annotation_data.pop('bottom')
            except:
                pass
            two_d = self.db_man.get_two_d_anno(annotation['id']) #type: lost.db.model.TwoDAnno
            two_d.timestamp = self.timestamp
            two_d.timestamp_lock = self.image_anno.timestamp_lock
            two_d.data = json.dumps(annotation_data)
            two_d.user_id = self.user_id
            if two_d.anno_time is None:
                two_d.anno_time = 0.0
            two_d.anno_time = annotation['annoTime']
            two_d.state = state.Anno.LABELED
            if 'comment' in annotation:
                two_d.description = annotation['comment']
            if 'isExample' in annotation:
                two_d.is_example = annotation['isExample']

            l_id_list = list()
            # get all labels of that two_d_anno.
            for label in self.db_man.get_all_two_d_label(two_d.idx):
                # save id.
                l_id_list.append(label.idx)
                # delete labels, that are not in user labels list.
                if label.idx not in annotation['labelIds']:
                    self.db_man.delete(label)
                # labels that are in the list get a new anno_time
                else:   
                    if label.anno_time is None:
                        label.anno_time = 0.0
                    label.anno_time = annotation['annoTime']
                    label.timestamp = self.timestamp
                    label.annotator_id=self.user_id,
                    label.timestamp_lock = self.image_anno.timestamp_lock
                    self.db_man.save_obj(label)
            # new labels 
            for l_id in annotation['labelIds']:
                if l_id not in l_id_list:
                    label = model.Label(two_d_anno_id=two_d.idx,
                                    label_leaf_id=l_id,
                                    dtype=dtype.Label.TWO_D_ANNO,
                                    timestamp=self.timestamp,
                                    annotator_id=self.user_id,
                                    timestamp_lock=self.image_anno.timestamp_lock,
                                    anno_time=annotation['annoTime'])
                    self.db_man.save_obj(label) 
            self.db_man.save_obj(two_d)
            return {'tempId':annotation['id'], 'dbId': two_d.idx, 'newStatus': 'database'}
        if two_d is not None:
            return {'tempId':annotation['id'], 'dbId': two_d.idx}
        else:
            return None
        return "success"

class SiaUpdate(object):
    def __init__(self, db_man, data, user_id, anno_task, sia_type='sia'):
        """
        :type db_man: lost.db.access.DBMan
        """
        self.logger = flask.current_app.logger
        self.sia_type = sia_type
        self.timestamp = datetime.now()
        self.db_man = db_man
        self.user_id = user_id 
        self.at = anno_task #type: lost.db.model.AnnoTask
        # self.sia_history_file = FileMan(self.db_man.lostconfig).get_sia_history_path(self.at)
        self.iteration = db_man.get_pipe_element(pipe_e_id=self.at.pipe_element_id).iteration
        self.image_anno = self.db_man.get_image_annotation(data['imgId'])
        self.image_anno.timestamp = self.timestamp
        if self.image_anno.anno_time is None:
            self.image_anno.anno_time = 0.0
        if self.sia_type == 'sia':
            # Do not update image annotation time for sia review
            self.image_anno.anno_time = data['annoTime']
        self.b_boxes = list()
        self.points = list()
        self.lines = list()
        self.polygons = list()
        self.history_json = dict()
        self.history_json['annotations'] = dict()
        self.history_json['annotations']['new'] = list()
        self.history_json['annotations']['unchanged'] = list()
        self.history_json['annotations']['changed'] = list()
        self.history_json['annotations']['deleted'] = list()
        self._update_img_labels(data)  
        self.image_anno.is_junk = data['isJunk']   

        # store certain annotations    
        if 'bBoxes' in data['annotations']:
            self.b_boxes = data['annotations']['bBoxes']
        else:
            self.b_boxes = None
        if 'points' in data['annotations']:
            self.points = data['annotations']['points']
        else:
            self.points = None
        if  'lines' in data['annotations']:
            self.lines = data['annotations']['lines']
        else:
            self.lines = None
        if  'polygons' in data['annotations']:
            self.polygons = data['annotations']['polygons']
        else:
            self.polygons = None

    def _update_img_labels(self, data):
        if(data['imgLabelChanged']):
            old = set([lbl.label_leaf_id for lbl in self.image_anno.labels])
            new = set(data['imgLabelIds'])
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
        annotation_json['unchanged'] = list()
        annotation_json['deleted'] = list()
        annotation_json['new'] = list()
        annotation_json['changed'] = list()
   
        for annotation in annotations:
            if annotation['status'] != "database" \
            and annotation['status'] != "deleted" \
            and annotation['status'] != "new" \
            and annotation['status'] != "changed":
                error_msg = "Status: '" + str(annotation['status']) + "' is not valid."
                raise SiaStatusNotFoundError(error_msg)

        for annotation in annotations: 
            if annotation['status'] == "database":
                two_d = self.db_man.get_two_d_anno(annotation['id']) #type: lost.db.model.TwoDAnno
                two_d.user_id = self.user_id
                two_d.state = state.Anno.LABELED
                two_d.timestamp = self.timestamp
                two_d.timestamp_lock = self.image_anno.timestamp_lock
                if two_d.anno_time is None:
                    two_d.anno_time = 0.0
                # two_d.anno_time += average_anno_time
                two_d_json = self.__serialize_two_d_json(two_d)
                annotation_json['unchanged'].append(two_d_json)
                self.db_man.save_obj(two_d)
            elif annotation['status'] == "deleted":
                try:
                    two_d = self.db_man.get_two_d_anno(annotation['id']) #type: lost.db.model.TwoDAnno
                    # Do not try to delete an annotation if it has already been 
                    # deleted in database <- This could be the case for auto save commands
                    if two_d is not None: 
                        two_d_json = self.__serialize_two_d_json(two_d)
                        annotation_json['deleted'].append(two_d_json)
                        for label in self.db_man.get_all_two_d_label(two_d.idx):
                            self.db_man.delete(label)
                        self.db_man.delete(two_d)
                        self.db_man.commit()
                except KeyError:
                    print('SIA bug backend fix! Do not try to delete annotations that are not in db!')
            elif annotation['status'] == "new":
                annotation_data = annotation['data']
                try:
                    annotation_data.pop('left')
                    annotation_data.pop('right')
                    annotation_data.pop('top')
                    annotation_data.pop('bottom')
                except:
                    pass
                
                if 'id' in annotation:
                    two_d = self.db_man.get_two_d_anno(annotation['id']) #type: lost.db.model.TwoDAnno    
                    if not two_d:
                        two_d = model.TwoDAnno()
                        self.logger.warning(f"Could not find a previously created TwoD Anno with ID: {annotation['id']}.")
                else:
                    two_d = model.TwoDAnno()
                    
                
                two_d.anno_task_id=self.at.idx
                two_d.img_anno_id=self.image_anno.idx
                two_d.timestamp=self.timestamp
                two_d.timestamp_lock=self.image_anno.timestamp_lock
                two_d.anno_time=annotation['annoTime']
                two_d.data=json.dumps(annotation_data)
                two_d.user_id=self.user_id
                two_d.iteration=self.iteration
                two_d.dtype=two_d_type
                two_d.state=state.Anno.LABELED
                for lbl in two_d.labels:
                    self.db_man.delete(lbl)
                if 'comment' in annotation:
                    two_d.description = annotation['comment']
                if 'isExample' in annotation:
                    two_d.is_example = annotation['isExample']
                self.db_man.save_obj(two_d)
                for l_id in annotation['labelIds']:
                    label = model.Label(two_d_anno_id=two_d.idx,
                                     label_leaf_id=l_id,
                                     dtype=dtype.Label.TWO_D_ANNO,
                                     timestamp=self.timestamp,
                                     annotator_id=self.user_id,
                                     timestamp_lock=self.image_anno.timestamp_lock,
                                     anno_time=annotation['annoTime'])
                    self.db_man.save_obj(label)
                two_d_json = self.__serialize_two_d_json(two_d)
                annotation_json['new'].append(two_d_json)
            elif annotation['status'] == "changed":
                annotation_data = annotation['data']
                try:
                    annotation_data.pop('left')
                    annotation_data.pop('right')
                    annotation_data.pop('top')
                    annotation_data.pop('bottom')
                except:
                    pass
                two_d = self.db_man.get_two_d_anno(annotation['id']) #type: lost.db.model.TwoDAnno
                two_d.timestamp = self.timestamp
                two_d.timestamp_lock = self.image_anno.timestamp_lock
                two_d.data = json.dumps(annotation_data)
                two_d.user_id = self.user_id
                if two_d.anno_time is None:
                    two_d.anno_time = 0.0
                two_d.anno_time = annotation['annoTime']
                two_d.state = state.Anno.LABELED
                if 'comment' in annotation:
                    two_d.description = annotation['comment']
                if 'isExample' in annotation:
                    two_d.is_example = annotation['isExample']

                l_id_list = list()
                # get all labels of that two_d_anno.
                for label in self.db_man.get_all_two_d_label(two_d.idx):
                    # save id.
                    l_id_list.append(label.idx)
                    # delete labels, that are not in user labels list.
                    if label.idx not in annotation['labelIds']:
                        self.db_man.delete(label)
                    # labels that are in the list get a new anno_time
                    else:   
                        if label.anno_time is None:
                            label.anno_time = 0.0
                        label.anno_time = annotation['annoTime']
                        label.timestamp = self.timestamp
                        label.annotator_id=self.user_id,
                        label.timestamp_lock = self.image_anno.timestamp_lock
                        self.db_man.save_obj(label)
                # new labels 
                for l_id in annotation['labelIds']:
                    if l_id not in l_id_list:
                        label = model.Label(two_d_anno_id=two_d.idx,
                                        label_leaf_id=l_id,
                                        dtype=dtype.Label.TWO_D_ANNO,
                                        timestamp=self.timestamp,
                                        annotator_id=self.user_id,
                                        timestamp_lock=self.image_anno.timestamp_lock,
                                        anno_time=annotation['annoTime'])
                        self.db_man.save_obj(label) 
                self.db_man.save_obj(two_d)
                two_d_json = self.__serialize_two_d_json(two_d)
                annotation_json['changed'].append(two_d_json)
            else:
                continue
        self.history_json['annotations'] = annotation_json
        return "success"

    def __serialize_two_d_json(self, two_d):
        two_d_json = dict()
        two_d_json['id'] = two_d.idx
        two_d_json['user_id'] = two_d.user_id
        if two_d.annotator:
            two_d_json['user_name'] = two_d.annotator.first_name + " " + two_d.annotator.last_name 
        else: 
            two_d_json['user_name'] = None
        two_d_json['anno_time'] = two_d.anno_time
        two_d_json['data'] = two_d.data
        label_list_json = list()
        if two_d.labels:
            label_json = dict()
            label_json['id'] = [lbl.idx for lbl in two_d.labels]
            label_json['label_leaf_id'] = [lbl.label_leaf.idx for lbl in two_d.labels]
            label_json['label_leaf_name'] = [lbl.label_leaf.name for lbl in two_d.labels]
            label_list_json.append(label_json)

        two_d_json['labels'] = label_list_json
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
    def __init__(self, image_anno, user_id, media_url, is_first_image, is_last_image, current_image_number, total_image_amount):
        self.sia_json = dict()
        self.image_anno = image_anno #type: lost.db.model.ImageAnno
        self.user_id = user_id
        self.media_url = media_url
        self.is_first_image = is_first_image
        self.is_last_image = is_last_image
        self.current_image_number = current_image_number
        self.total_image_amount = total_image_amount

    def serialize(self):
        self.sia_json['image'] = dict()
        self.sia_json['image']['id'] = self.image_anno.idx
        self.sia_json['image']['url'] = "/" + self.image_anno.img_path
        self.sia_json['image']['isFirst'] = self.is_first_image
        self.sia_json['image']['isLast'] = self.is_last_image
        self.sia_json['image']['number'] = self.current_image_number
        self.sia_json['image']['amount'] = self.total_image_amount
        self.sia_json['image']['isJunk'] = self.image_anno.is_junk
        self.sia_json['image']['annoTime'] = self.image_anno.anno_time
        self.sia_json['image']['description'] = self.image_anno.description
        if self.image_anno.img_actions is not None:
            self.sia_json['image']['imgActions'] = json.loads(self.image_anno.img_actions)
        else:
            self.sia_json['image']['imgActions'] = []
        if self.image_anno.labels is None:
            self.sia_json['image']['labelIds'] = []
        else:
            self.sia_json['image']['labelIds'] = [lbl.label_leaf_id for lbl in self.image_anno.labels]
        self.sia_json['annotations'] = dict()
        self.sia_json['annotations']['bBoxes'] = list()
        self.sia_json['annotations']['points'] = list()
        self.sia_json['annotations']['lines'] = list()
        self.sia_json['annotations']['polygons'] = list()
        for two_d_anno in self.image_anno.twod_annos: #type: lost.db.model.TwoDAnno
            if two_d_anno.dtype == dtype.TwoDAnno.BBOX:
                bbox_json = dict()
                bbox_json['id'] = two_d_anno.idx
                bbox_json['labelIds'] = list()
                if two_d_anno.labels: #type: lost.db.model.Label
                    bbox_json['labelIds'] = [lbl.label_leaf_id for lbl in two_d_anno.labels]
                bbox_json['data'] = json.loads(two_d_anno.data)
                bbox_json['annoTime'] = two_d_anno.anno_time
                bbox_json['comment'] = two_d_anno.description
                bbox_json['isExample'] = two_d_anno.is_example
                self.sia_json['annotations']['bBoxes'].append(bbox_json)
            elif two_d_anno.dtype == dtype.TwoDAnno.POINT:
                point_json = dict()
                point_json['id'] = two_d_anno.idx
                point_json['labelIds'] = list()
                if two_d_anno.labels: #type: lost.db.model.Label
                    point_json['labelIds'] = [lbl.label_leaf_id for lbl in two_d_anno.labels]
                point_json['data'] = json.loads(two_d_anno.data)
                point_json['annoTime'] = two_d_anno.anno_time
                point_json['comment'] = two_d_anno.description
                point_json['isExample'] = two_d_anno.is_example
                self.sia_json['annotations']['points'].append(point_json)
            elif two_d_anno.dtype == dtype.TwoDAnno.LINE:
                line_json = dict()
                line_json['id'] = two_d_anno.idx
                line_json['labelIds'] = list()
                if two_d_anno.labels: #type: lost.db.model.Label
                    line_json['labelIds'] = [lbl.label_leaf_id for lbl in two_d_anno.labels]
                line_json['data'] = json.loads(two_d_anno.data)
                line_json['annoTime'] = two_d_anno.anno_time
                line_json['comment'] = two_d_anno.description
                line_json['isExample'] = two_d_anno.is_example
                self.sia_json['annotations']['lines'].append(line_json)
            elif two_d_anno.dtype == dtype.TwoDAnno.POLYGON:
                polygon_json = dict()
                polygon_json['id'] = two_d_anno.idx
                polygon_json['labelIds'] = list()
                if two_d_anno.labels: #type: lost.db.model.Label
                    polygon_json['labelIds'] = [lbl.label_leaf_id for lbl in two_d_anno.labels]
                polygon_json['data'] = json.loads(two_d_anno.data)
                polygon_json['annoTime'] = two_d_anno.anno_time
                polygon_json['comment'] = two_d_anno.description
                polygon_json['isExample'] = two_d_anno.is_example
                self.sia_json['annotations']['polygons'].append(polygon_json)
        return self.sia_json
class SiaStatusNotFoundError(Exception):
    """ Base class for SiaStatusNotFoundError
    """
    pass

def get_last_image_id(dbm, user_id):
    at = get_sia_anno_task(dbm, user_id)
    if at:
        iteration = dbm.get_pipe_element(pipe_e_id=at.pipe_element_id).iteration
        tmp_anno = dbm.get_last_edited_sia_anno(at.idx, iteration, user_id)
        if tmp_anno:
            return tmp_anno.idx -1 
    return None

def review(dbm, data, user_id, media_url):
    direction = data['direction']
    current_idx = data['image_anno_id']
    iteration = data['iteration']
    pe_id = data['pe_id']

    at = dbm.get_pipe_element(pipe_e_id=pe_id).anno_task
    first_anno = dbm.get_sia_review_first(at.idx, iteration)
    if direction == 'first':
        image_anno = first_anno
    elif direction == 'next':
        image_anno = dbm.get_sia_review_next(at.idx, current_idx, iteration)
    elif direction == 'previous':
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

        sia_serialize = SiaSerialize(image_anno, user_id, media_url, is_first_image, is_last_image, current_image_number, total_image_amount)
        return sia_serialize.serialize()
    else:
        return 'no annotation found'

def reviewoptions(dbm, pe_id, user_id):
    options = {}
    pipe_element = dbm.get_pipe_element(pipe_e_id=pe_id)
    if pipe_element.state == state.PipeElement.PENDING:
        options['max_iteration'] = pipe_element.iteration - 1 
    else:
        options['max_iteration'] = pipe_element.iteration
    options['possible_labels'] = get_label_trees(dbm, user_id, pipe_element.anno_task)['labels']
    return options