from lost.db import model, dtype, state
import json
import datetime

class Label(object):
    def __init__(self, idx, name):
        self.idx = idx
        self.name = name

class Annotation(object):
    def __init__(self):
        self._anno = None
    
    def _post_init(self):
        self.timestamp = datetime.datetime.now()    
    
    def _unlock(self):
        '''Unlock this annotation to be visible for an annoation tool.
        '''
        self._anno.state = state.Anno.UNLOCKED

    @property
    def iteration(self):
        return self._anno.iteration

    @property
    def labels(self):
        '''iterator: of :class:`Label` objects.'''
        for ll in self._anno.labels:#type: model.Label
            if ll is not None:
                if ll.label_leaf is not None:
                    yield Label(ll.label_leaf_id, ll.label_leaf.name)

    @property
    def label_ids(self):
        '''list: [label_id, ...]'''
        vec = []
        for ll in self._anno.labels:#type: model.Label
            if ll is not None:
                if ll.label_leaf is not None:
                    vec.append(ll.label_leaf_id)
        return vec

    @property
    def label_names(self):
        name_list = []
        for ll in self._anno.labels:
            if ll is not None:
                if ll.label_leaf is not None:
                    name_list.append(ll.label_leaf.name)
        return name_list

    @property
    def label_vec(self):
        '''list: [[label_name, label_id],...,[...]]'''
        vec = []
        for ll in self._anno.labels:#type: model.Label
            if ll is not None:
                if ll.label_leaf is not None:
                    vec.append([ll.label_leaf.name, ll.label_leaf_id])
        return vec


    @property
    def timestamp(self):
        return self._anno.timestamp

    @timestamp.setter
    def timestamp(self, value):
        self._anno.timestamp = value

    @property
    def timestamp_lock(self):
        return self._anno.timestamp_lock

    def add_label(self, label_id):
        if label_id is not None:
            lbl = model.Label(label_leaf_id=label_id,
                        dtype=dtype.LabelLeaf.CLASS)
            self._anno.labels.append(lbl)

    def _set_anno(self, anno):
        self._anno = anno

    def add_to_context(self, dbm):
        '''Add this annotation to the context of dbm.

        Args:
            dbm (Object): Database context manager.
        '''
        dbm.add(self._anno)

    @property
    def sim_class(self):
        '''int: Similarity class that is used to cluster BBoxes 
        when using MIA'''
        return self._anno.sim_class
    
    @sim_class.setter
    def sim_class(self, value):
        self._anno.sim_class = value


class Image(Annotation):
    def __init__(self, anno_task_id=None, img_path=None, 
                 state=state.Anno.UNLOCKED,
                result_id=None, iteration=0, sim_class=0,
                frame_n=None, video_path=None):
        self._anno = model.ImageAnno(anno_task_id=anno_task_id,
                                 img_path=img_path,
                                 state=state,
                                 result_id=result_id,
                                 iteration=iteration,
                                 sim_class=sim_class,
                                 frame_n=frame_n,
                                 video_path=video_path)
        self._post_init()

    @property
    def img_path(self):
        return self._anno.img_path

    @property
    def video_path(self):
        '''str: Path to the video if this image is a video frame.'''
        return self._anno.video_path
    
    @video_path.setter
    def video_path(self, value):
        self._anno.video_path = value

    @property
    def frame_n(self):
        return self._anno.frame_n

    @property
    def bbox_annos(self):
        for two_d_anno in self._anno.two_d_annos:
            if two_d_anno.dtype == dtype.TwoDAnno.BBOX:
                bb = BBox()
                bb._set_anno(two_d_anno)
                yield bb
    
    @property
    def bbox_vec(self):
        return [bb.box for bb in self.bbox_annos]
    
    @property
    def bbox_lbl_names_vec(self):
        '''list: List of label names. The first label each bbox 
        will be used as lbl name.'''
        names_vec = []
        for bb in self.bbox_annos:
            if len(bb.label_names)>0:
                names_vec.append(bb.label_names[0])
            else:
                names_vec.append(None)
        return names_vec

    def add_bbox(self, bbox):
        self._anno.two_d_annos.append(bbox._anno)

    @property
    def twod_annos(self):
        for two_d_anno in self._anno.two_d_annos:
            yield two_d_anno

    @property
    def twod_vec(self):
        '''A list of two d anno data'''
        return [json.loads(anno.data) for anno in self.twod_annos]


class BBox(Annotation):
    def __init__(self, box=None, anno_task_id=None, 
                    iteration=None, sim_class=0,
                    state=state.Anno.UNLOCKED
                    ):
        if box is not None:
            self._anno = model.TwoDAnno() 
            self._anno.data = json.dumps({'x': box[0], 'y': box[1], 
                                         'w': box[2], 'h': box[3]})
            self._anno.anno_task_id = anno_task_id
            self._anno.iteration = iteration
            self._anno.dtype = dtype.TwoDAnno.BBOX
            self._anno.sim_class = sim_class
            self._anno.state = state
            self._post_init()

    @property
    def box(self):
        data = json.loads(self._anno.data)
        return [data['x'], data['y'], data['w'], data['h']]

    @property
    def confidence(self):
        return self._anno.confidence

    @property
    def label_ids(self):
        '''list: A list of label ids that have been assigned to this BBox'''
        labels = []
        for lbl in self._anno.labels:
            labels.append(lbl.label_leaf_id)
        return labels