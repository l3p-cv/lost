__author__ = 'Jonas Jaeger, Gereon Reus'
from flask_user import current_user, UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, DateTime, Float, Text, Boolean
from sqlalchemy.dialects.mysql import DATETIME
from sqlalchemy import ForeignKey
from sqlalchemy.schema import MetaData
from sqlalchemy.orm import relationship
from sqlalchemy import orm
from lost.db import dtype
import json
import pandas as pd

# Set conventions for foreign key name generation
convention = {
  "ix": 'ix_%(column_0_label)s',
  "uq": "uq_%(table_name)s_%(column_0_name)s",
  # "ck": "ck_%(table_name)s_%(constraint_name)s",
  "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
  "pk": "pk_%(table_name)s"
}
metadata = MetaData(naming_convention=convention)
Base = declarative_base(metadata=metadata)

# Define the User data-model.
# NB: Make sure to add flask_user UserMixin !!!
class User(Base, UserMixin):
    __tablename__ = 'user'

    idx = Column(Integer, primary_key=True)
    is_active = Column('is_active', Boolean(), nullable=False, server_default='1')
    user_name = Column(String(100), nullable=False, unique=True)
    email = Column(String(255), unique=True)
    email_confirmed_at = Column(DateTime())
    password = Column(String(255), nullable=False, server_default='')

    # User information
    first_name = Column(String(100), server_default='')
    last_name = Column(String(100),  server_default='')

    confidence_level = Column(Integer)
    photo_path = Column(String(4096))

    roles = relationship('Role', secondary='user_roles', lazy='joined')
    groups = relationship('Group', secondary='user_groups', lazy='joined')
    choosen_anno_task = relationship('AnnoTask', secondary='choosen_anno_task', lazy='joined', uselist=False)
    
    def __init__(self, user_name, password, email=None, first_name=None, last_name=None, email_confirmed_at=None):
        self.user_name = user_name
        self.email = email
        self.email_confirmed_at = email_confirmed_at
        self.set_password(password)
        self.first_name = first_name
        self.last_name = last_name

    def set_password(self, password):
        self.password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password, password)
    
    def has_role(self, role):
        role_names = []
        for r in self.roles:
            role_names.append(r.name)
        if role in role_names:
            return True
        else:
            return False


# Define the Role data-model
class Role(Base):
    __tablename__ = 'role'
    idx = Column(Integer(), primary_key=True)
    name = Column(String(50), unique=True)

# Define the UserRoles association table
class UserRoles(Base):
    __tablename__ = 'user_roles'
    idx = Column(Integer(), primary_key=True)
    user_id = Column(Integer(), ForeignKey('user.idx', ondelete='CASCADE'))
    role_id = Column(Integer(), ForeignKey('role.idx', ondelete='CASCADE'))
    role = relationship('Role', uselist=False)

class Group(Base):
    __tablename__ = 'group'
    idx = Column(Integer(), primary_key=True)
    name = Column(String(50), unique=True)
    manager_id = Column(Integer(), ForeignKey('user.idx', ondelete='CASCADE'))
    is_user_default = Column(Boolean(), nullable=False, server_default='0')

class UserGroups(Base):
    __tablename__ = 'user_groups'
    idx = Column(Integer(), primary_key=True)
    user_id = Column(Integer(), ForeignKey('user.idx', ondelete='CASCADE'))
    group_id = Column(Integer(), ForeignKey('group.idx', ondelete='CASCADE'))
    group =  relationship('Group', uselist=False)

class TwoDAnno(Base):
    """A TwoDAnno represents a 2D annotation/ drawing for an image.

    A TwoDAnno can be of type point, line, bbox or polygon.

    Attributes:
        idx (int): ID of this TwoDAnno in database
        anno_task_id (int): ID of the anno_task this TwoDAnno
            belongs to.
        timestamp (DateTime): Timestamp created of TwoDAnno
        timestamp_lock (DateTime): Timestamp locked in view
        state (enum): can be unlocked, locked, locked_priority or labeled
            (see :class:`lost.db.state.Anno`)
        track_n (int): The track number this TwoDAnno belongs to.
        sim_class (int): The similarity class this anno belong to.
            It is used to cluster similar annos in MIA.
        iteration (int): The iteration of a loop when this anno was created.
        group_id (int): Id of the annotator.
        img_anno_id (int) : ID of ImageAnno this TwoDAnno is appended to
        data (Text): drawing data (for e.g. x,y, width, height) of anno - depends on dtype
        dtype (int): type of TwoDAnno (for e.g. bbox, polygon)
            (see :class:`lost.db.dtype.TwoDAnno`)
        labels (list): A list of :class:`Label` objects related to the TwoDAnno.
        confidence (float): Confidence of Annotation.
        anno_time: Overall Annotation Time in ms.
    """
    __tablename__ = "two_d_anno"

    idx = Column(Integer, primary_key=True)
    anno_task_id = Column(Integer, ForeignKey('anno_task.idx'))
    timestamp = Column(DATETIME(fsp=6))
    timestamp_lock = Column(DATETIME(fsp=6))
    state = Column(Integer)
    track_n = Column(Integer)
    data = Column(Text)
    dtype = Column(Integer)
    sim_class = Column(Integer)
    iteration = Column(Integer)
    group_id = Column(Integer, ForeignKey('group.idx'))
    img_anno_id = Column(Integer, ForeignKey('image_anno.idx'))
    label = relationship('Label', uselist=False) #type: Label
    annotator = relationship('Group', uselist=False) #type: Group
    confidence = Column(Float)
    anno_time = Column(Float)

    def __init__(self, anno_task_id=None,
                 group_id=None, timestamp=None, state=None,
                 track_n=None, sim_class=None,
                 img_anno_id=None, timestamp_lock=None, 
                 iteration=0, data=None, dtype=None,
                 confidence=None, anno_time=None, annotator=None,
                 label_leaf_id=None):
        self.anno_task_id = anno_task_id
        self.group_id = group_id
        self.timestamp = timestamp
        self.timestamp_lock = timestamp_lock
        self.state = state
        self.track_n = track_n
        self.sim_class = sim_class
        self.img_anno_id = img_anno_id
        self.data = data
        self.dtype = dtype
        self.iteration = iteration
        self.confidence = confidence
        self.anno_time = anno_time
        self.annotator = annotator
        if label_leaf_id is not None:
            self.label = Label(label_leaf_id=label_leaf_id)

    def to_dict(self, style='flat'):
        '''Transform this object into a dict.
        
        Args:
            style (str): 'flat' or 'hierarchical'
                'flat': Return a dictionray in table style
                'hierarchical': Return a nested dictionary
        
        Retruns:
            dict: In flat or hierarchical style.
        
        Example:
            Get a dict in flat style. Note that 'anno.data' is 
            a string in contrast to the *hierarchical* style.

                >>> bbox.to_dict(style='flat')
                {
                    'anno.idx': 88, 
                    'anno.anno_task_id': None, 
                    'anno.timestamp': None, 
                    'anno.timestamp_lock': None, 
                    'anno.state': None, 
                    'anno.track_n': None, 
                    'anno.dtype': 'bbox', 
                    'anno.sim_class': None, 
                    'anno.iteration': 0, 
                    'anno.group_id': 47, 
                    'anno.img_anno_id': None, 
                    'anno.annotator': 'test', 
                    'anno.confidence': None, 
                    'anno.anno_time': None, 
                    'anno.lbl.idx': 14, 
                    'anno.lbl.name': 'Aeroplane', 
                    'anno.lbl.external_id': '6', 
                    'anno.data': '{"x": 0.1, "y": 0.1, "w": 0.2, "h": 0.2}'
                }

            Get a dict in hierarchical style. Note that 'anno.data'
            is a dict in contrast to the *flat* style.

                >>> bbox.to_dict(style='hierarchical')
                {
                    'anno.idx': 86, 
                    'anno.anno_task_id': None, 
                    'anno.timestamp': None, 
                    'anno.timestamp_lock': None, 
                    'anno.state': None, 
                    'anno.track_n': None, 
                    'anno.dtype': 'bbox', 
                    'anno.sim_class': None, 
                    'anno.iteration': 0, 
                    'anno.group_id': 46, 
                    'anno.img_anno_id': None, 
                    'anno.annotator': 'test', 
                    'anno.confidence': None, 
                    'anno.anno_time': None, 
                    'anno.lbl.idx': 14, 
                    'anno.lbl.name': 'Aeroplane', 
                    'anno.lbl.external_id': '6', 
                    'anno.data': {
                        'x': 0.1, 'y': 0.1, 'w': 0.2, 'h': 0.2
                    }
                }
        '''
        anno_dict = {
            'anno.idx': self.idx,
            'anno.anno_task_id': self.anno_task_id,
            'anno.timestamp': self.timestamp,
            'anno.timestamp_lock': self.timestamp_lock,
            'anno.state': self.state,
            'anno.track_n': self.track_n,
            'anno.dtype': None,
            'anno.sim_class': self.sim_class,
            'anno.iteration': self.iteration,
            'anno.group_id': self.group_id,
            'anno.img_anno_id': self.img_anno_id,
            'anno.annotator': None,
            'anno.confidence': self.confidence,
            'anno.anno_time': self.anno_time,
            'anno.lbl.idx': None,
            'anno.lbl.name': None,
            'anno.lbl.external_id': None
        }
        try:
            anno_dict['anno.dtype'] = dtype.TwoDAnno.TYPE_TO_STR[self.dtype]
        except:
            pass
        try:
            anno_dict['anno.lbl.idx'] = self.label.label_leaf.idx
            anno_dict['anno.lbl.name'] = self.label.label_leaf.name
            anno_dict['anno.lbl.external_id'] = self.label.label_leaf.external_id
        except:
            pass
        try:
            anno_dict['anno.annotator'] = self.annotator.name
        except:
            pass

        if style == 'flat':
            anno_dict['anno.data'] = self.data
            return anno_dict
        elif style == 'hierarchical':
            anno_dict['anno.data'] = json.loads(self.data)
            return anno_dict
        else:
            raise ValueError('Unknow style argument! Needs to be "flat" or "hierarchical".')
    
    def to_df(self):
        '''Transform this annotation into a pandas DataFrame
        
        Returns:
            pandas.DataFrame: 
                A DataFrame where column names correspond
                to the keys of the dictionary returned from *to_dict()*
                method.
        
        Note:
            Column names are:
                ['anno.idx', 'anno.anno_task_id', 'anno.timestamp', 
                'anno.timestamp_lock', 'anno.state', 'anno.track_n', 
                'anno.dtype', 'anno.sim_class', 
                'anno.iteration', 'anno.group_id', 'anno.img_anno_id', 
                'anno.annotator', 'anno.confidence', 'anno.anno_time', 
                'anno.lbl.idx', 'anno.lbl.name', 'anno.lbl.external_id', 
                'anno.data']
        '''
        return pd.DataFrame(self.to_dict(), index=[0])

    def to_vec(self, columns='all'):
        '''Tansfrom this annotation in list style.

        Args:
            columns (list of str OR str): Possible column names are:
                'all' OR
                ['anno.idx', 'anno.anno_task_id', 'anno.timestamp', 
                'anno.timestamp_lock', 'anno.state', 'anno.track_n', 
                'anno.dtype', 'anno.sim_class', 
                'anno.iteration', 'anno.group_id', 'anno.img_anno_id', 
                'anno.annotator', 'anno.confidence', 'anno.anno_time', 
                'anno.lbl.idx', 'anno.lbl.name', 'anno.lbl.external_id', 
                'anno.data']
        Returns:
            list of objects: A list of the desired columns.
        
        Example:
            If you want to get only the annotation in list style 
            e.g. [x, y, w, h] (if this TwoDAnnotation is a bbox).

            >>> anno.to_vec('anno.data')
            [0.1, 0.1, 0.2, 0.2]

            If you want in addition also the corresponding *label name*
            and *label id* for this annotation then just add additional
            column names:

            >>> bbox.to_vec(['anno.data', 'anno.lbl.idx', 'anno.lbl.name'])
            [[0.1, 0.1, 0.2, 0.2], 14, 'Aeroplane']
        '''
        df = self.to_df().drop(columns=['anno.data'])
        df_new = df.assign(data=[self.get_anno_vec()])
        df_new = df_new.rename(index=str, columns={'data':'anno.data'})
        if columns == 'all':
            return df_new.values.tolist()[0]
        else:
            return df_new[columns].values.tolist()[0]
        
        

    def add_label(self, label_leaf_id):
        '''Add a label to this 2D annotation.

        Args:
            label_leaf_id (int): Id of the label_leaf that should be added.
        '''
        if label_leaf_id is not None:
            lbl = Label(label_leaf_id=label_leaf_id)
            self.labels.append(lbl)

    @property
    def point(self):
        '''list: POINT annotation in list style [x, y]

        Example:
            >>> anno = TwoDAnno()
            >>> anno.point = [0.1, 0.1]
            >>> anno.point
            [0.1, 0.1]
        '''
        if self.dtype == dtype.TwoDAnno.POINT:
            return self.get_anno_vec()
        else:
            raise Exception('''Can not use point property 
                since this annotation is no point! 
                It is a {}'''.format(dtype.TwoDAnno.TYPE_TO_STR[self.dtype].upper()))

    @point.setter
    def point(self, value):
        self.data = json.dumps(
            {
                'x': value[0],
                'y': value[1]
            }
        )
        self.dtype = dtype.TwoDAnno.POINT

    @property
    def bbox(self):
        '''list: BBOX annotation in list style [x, y, w, h]

        Example:
            >>> anno = TwoDAnno()
            >>> anno.bbox = [0.1, 0.1, 0.2, 0.2]
            >>> anno.bbox
            [0.1, 0.1, 0.2, 0.2]
        '''
        if self.dtype == dtype.TwoDAnno.BBOX:
            return self.get_anno_vec()
        else:
            raise Exception('''Can not use bbox property 
                since this annotation is no BBOX! 
                It is a {}'''.format(dtype.TwoDAnno.TYPE_TO_STR[self.dtype].upper()))

    @bbox.setter
    def bbox(self, value):
        self.data = json.dumps(
            {
                'x': value[0],
                'y': value[1],
                'w': value[2],
                'h': value[3]
            }
        )
        self.dtype = dtype.TwoDAnno.BBOX
    
    @property
    def line(self):
        '''list of list: LINE annotation in list style [[x, y], [x, y], ...]

        Example:
            >>> anno = TwoDAnno()
            >>> anno.line = [[0.1, 0.1], [0.2, 0.2]]
            >>> anno.line
            [[0.1, 0.1], [0.2, 0.2]]
        '''
        if self.dtype == dtype.TwoDAnno.LINE:
            return self.get_anno_vec()
        else:
            raise Exception('''Can not use line property 
                since this annotation is no line! 
                It is a {}'''.format(dtype.TwoDAnno.TYPE_TO_STR[self.dtype].upper()))

    @line.setter
    def line(self, value):
        val_list = [{'x':v[0],'y':v[1]} for v in value]
        self.data = json.dumps(val_list)
        self.dtype = dtype.TwoDAnno.LINE

    @property
    def polygon(self):
        '''list of list: polygon annotation in list style [[x, y], [x, y], ...]

        Example:
            >>> anno = TwoDAnno()
            >>> anno.polygon = [[0.1, 0.1], [0.2, 0.1], [0.15, 0.2]]
            >>> anno.polygon
            [[0.1, 0.1], [0.2, 0.1], [0.15, 0.2]]
        '''
        if self.dtype == dtype.TwoDAnno.POLYGON:
            return self.get_anno_vec()
        else:
            raise Exception('''Can not use polygon property 
                since this annotation is no polygon! 
                It is a {}'''.format(dtype.TwoDAnno.TYPE_TO_STR[self.dtype].upper()))

    @polygon.setter
    def polygon(self, value):
        val_list = [{'x':v[0],'y':v[1]} for v in value]
        self.data = json.dumps(val_list)
        self.dtype = dtype.TwoDAnno.POLYGON

    def get_anno_vec(self):
        '''Get annotation data in list style.

        Returns:
            list of floats:
                For a POINT:
                    [x, y]

                For a BBOX:
                    [x, y, w, h]

                For a LINE and POLYGONS:
                    [[x, y], [x, y],...]

        Example:
            HowTo get a numpy array? In the following example a bounding box is returned::

                >>> np.array(twod_anno.get_anno_vec())
                array([0.1 , 0.2 , 0.3 , 0.18])
        '''
        
        data = json.loads(self.data)
        if self.dtype == dtype.TwoDAnno.BBOX:
            return [data['x'], data['y'], data['w'], data['h']]
        elif self.dtype == dtype.TwoDAnno.POINT:
            return [data['x'], data['y']]
        elif self.dtype == dtype.TwoDAnno.LINE:
            return [[e['x'], e['y']] for e in data]
        elif self.dtype == dtype.TwoDAnno.POLYGON:
            return [[e['x'], e['y']] for e in data]
        else:
            raise Exception('Unknown TwoDAnno type!')
        
    # def get_lbl_vec(self, which='id'):
    #     '''Get labels for this annotations in list style.

    #     A 2D annotation can contain multiple labels 

    #     Args:
    #         which (str):

    #             'id':
    #             An id in this list is related to :class:`LabelLeaf`
    #             that is part of a LabelTree in the LOST framework.  
    #             A 2D annotation can contain multiple labels.

    #             'external_id':
    #             An external label id can be any str 
    #             and is used to map LOST-LabelLeafs to label ids from
    #             external systems like ImageNet.

    #             'name':
    #             Get label names for this annotations in list style.

    #     Retruns:
    #         list of int or str [id, ...]:

    #     Example:
    #         Get vec of label ids
            
    #         >>> twod_anno.get_lbl_vec()
    #         [2]
            
    #         Get related external ids
            
    #         >>> twod_anno.get_lbl_vec('external_id')
    #         [5]

    #         Get related label name
            
    #         >>> twod_anno.get_lbl_vec('name')
    #         ['cow']
    #     '''
    #     if which == 'id':
    #         return [lbl.label_leaf.idx for lbl in self.labels]
    #     elif which == 'external_id':
    #         return [lbl.label_leaf.external_id for lbl in self.labels]
    #     elif which == 'name':
    #         return [lbl.label_leaf.name for lbl in self.labels]
    #     else:
    #         raise Exception('Unknown argument value: {}'.format(which))

    # def get_anno_dict(self):
    #     '''Get annotation data in dict style

    #     Retruns:
    #         dict:
    #             For a POINT:
    #                 {"x": float, "y": float}

    #             For a BBOX:
    #                 {"x": float, "y": float, "w": float, "h": float}

    #             For a LINE and POLYGONS:
    #                 [{"x": float, "y": float}, {"x": float, "y": float},...]
    #     '''
    #     return json.loads(self.data)
    

class ImageAnno(Base):
    """An ImageAnno represents an image annotation.

    Multiple labels as well as 2d annotations 
    (e.g. points, lines, boxes, polygons) 
    can be assigned to an image.

    Attributes:
        label (list): The related :class:`Label` object.
        twod_annos (list): A list of :class:`TwoDAnno` objects.
        img_path (str): Path to the image where this anno belongs to.
        frame_n (int): If this image is part of an video,
            frame_n indicates the frame number.
        video_path (str): If this image is part of an video,
            this should be the path to that video in file system.
        sim_class (int): The similarity class this anno belong to.
            It is used to cluster similar annos in MIA
        anno_time: Overall annotation time in seconds.
        timestamp (DateTime): Timestamp of ImageAnno
        iteration (int): The iteration of a loop when this anno was created.        
        idx (int): ID of this ImageAnno in database
        anno_task_id (int): ID of the anno_task this
            ImageAnno belongs to.
        state (enum): See :class:`lost.db.state.Anno`
        result_id: Id of the related result.
        group_id (int): Id of the annotator.
    """
    __tablename__ = "image_anno"

    idx = Column(Integer, primary_key=True)
    anno_task_id = Column(Integer, ForeignKey('anno_task.idx'))
    timestamp = Column(DATETIME(fsp=6))
    timestamp_lock = Column(DATETIME(fsp=6))
    state = Column(Integer)
    sim_class = Column(Integer)
    frame_n = Column(Integer)
    video_path = Column(String(4096))
    img_path = Column(String(4096))
    result_id = Column(Integer, ForeignKey('result.idx'))
    iteration = Column(Integer)
    group_id = Column(Integer, ForeignKey('group.idx'))
    label = relationship('Label', uselist=False)
    twod_annos = relationship('TwoDAnno')
    annotator = relationship('Group', uselist=False)
    anno_time = Column(Float)
    def __init__(self, anno_task_id=None, group_id=None,
                 timestamp=None, label_leaf_id=None, state=None,
                 sim_class=None, result_id=None, img_path=None,
                 frame_n=None,
                 video_path=None,
                 iteration=0, anno_time=None):
        self.anno_task_id = anno_task_id
        self.group_id = group_id
        self.timestamp = timestamp
        self.state = state
        self.sim_class = sim_class
        self.result_id = result_id
        self.img_path = img_path
        self.video_path = video_path
        self.frame_n = frame_n
        self.iteration = iteration
        self.anno_time = anno_time
        if label_leaf_id is not None:
            self.label = Label(label_leaf_id=label_leaf_id)

    def to_dict(self, style='flat'):
        '''Transform this ImageAnno and all related TwoDAnnos into a dict.

        Args:
            style (str): 'flat' or 'hierarchical'. 
                Return a dict in flat or nested style. 

        Returns:
            list of dict OR dict:
                In 'flat' style return a list of dicts with one dict
                per annotation.
                In 'hierarchical' style, return a nested dictionary.
        
        Example:
            HowTo iterate through all TwoDAnnotations of this ImageAnno 
            dictionary in *flat* style:

                >>> for d in img_anno.to_dict():
                ...     print(d['img.img_path'], d['anno.lbl.name'], d['anno.dtype'])
                path/to/img1.jpg Aeroplane bbox
                path/to/img1.jpg Bicycle point

            Possible keys in *flat* style:

                >>> img_anno.to_dict()[0].keys()
                dict_keys([
                    'img.idx', 'img.anno_task_id', 'img.timestamp', 
                    'img.timestamp_lock', 'img.state', 'img.sim_class', 
                    'img.frame_n', 'img.video_path', 'img.img_path', 
                    'img.result_id', 'img.iteration', 'img.group_id', 
                    'img.anno_time', 'img.lbl.idx', 'img.lbl.name', 
                    'img.lbl.external_id', 'img.annotator', 'anno.idx', 
                    'anno.anno_task_id', 'anno.timestamp', 
                    'anno.timestamp_lock', 'anno.state', 'anno.track_n', 
                    'anno.dtype', 'anno.sim_class', 'anno.iteration', 
                    'anno.group_id', 'anno.img_anno_id', 'anno.annotator', 
                    'anno.confidence', 'anno.anno_time', 'anno.lbl.idx', 
                    'anno.lbl.name', 'anno.lbl.external_id', 'anno.data'
                ])
            
            HowTo iterate through all TwoDAnnotations of this ImageAnno 
            dictionary in *hierarchical* style:

                >>> h_dict = img_anno.to_dict(style='hierarchical')
                >>> for d in h_dict['img.twod_annos']:
                ...     print(h_dict['img.img_path'], d['anno.lbl.name'], d['anno.dtype'])
                path/to/img1.jpg Aeroplane bbox
                path/to/img1.jpg Bicycle point

            Possible keys in *hierarchical* style:

                >>> h_dict = img_anno.to_dict(style='hierarchical')
                >>> h_dict.keys()
                dict_keys([
                    'img.idx', 'img.anno_task_id', 'img.timestamp', 
                    'img.timestamp_lock', 'img.state', 'img.sim_class', 
                    'img.frame_n', 'img.video_path', 'img.img_path', 
                    'img.result_id', 'img.iteration', 'img.group_id', 
                    'img.anno_time', 'img.lbl.idx', 'img.lbl.name', 
                    'img.lbl.external_id', 'img.annotator', 'img.twod_annos'
                ])
                >>> h_dict['img.twod_annos'][0].keys()
                dict_keys([
                    'anno.idx', 'anno.anno_task_id', 'anno.timestamp', 
                    'anno.timestamp_lock', 'anno.state', 'anno.track_n', 
                    'anno.dtype', 'anno.sim_class', 'anno.iteration', 
                    'anno.group_id', 'anno.img_anno_id', 'anno.annotator', 
                    'anno.confidence', 'anno.anno_time', 'anno.lbl.idx', 
                    'anno.lbl.name', 'anno.lbl.external_id', 'anno.data'
                ])
        '''

        img_dict = {
            'img.idx':self.idx,
            'img.anno_task_id':self.anno_task_id,
            'img.timestamp':self.timestamp,
            'img.timestamp_lock': self.timestamp_lock,
            'img.state': self.state,
            'img.sim_class': self.sim_class,
            'img.frame_n': self.frame_n,
            'img.video_path': self.video_path,
            'img.img_path': self.img_path,
            'img.result_id': self.result_id,
            'img.iteration': self.iteration,
            'img.group_id': self.group_id,
            'img.anno_time': self.anno_time,
            'img.lbl.idx': None, 
            'img.lbl.name': None,
            'img.lbl.external_id': None,
            'img.annotator': None
        }
        try:
            img_dict['img.lbl.idx'] = self.label.label_leaf.idx 
            img_dict['img.lbl.name'] = self.label.label_leaf.name
            img_dict['img.lbl.external_id'] = self.label.label_leaf.external_id
        except:
            pass
        try:
            img_dict['img.annotator'] = self.annotator.name
        except:
            pass
        if style == 'hierarchical':
            img_dict['img.twod_annos'] = []
            for anno in self.twod_annos:
                img_dict['img.twod_annos'].append(
                    anno.to_dict(style='hierarchical')
                )
            return img_dict
        elif style == 'flat':
            d_list = []
            if len(self.twod_annos) > 0:
                for anno in self.twod_annos:
                    d_list.append(
                        dict(img_dict, **anno.to_dict())
                    )
                return d_list
            else:
                empty_anno = TwoDAnno().to_dict()
                return [dict(img_dict, **empty_anno)]
        else:
            raise ValueError('Unknow style argument! Needs to be "flat" or "hierarchical".')

    def to_df(self):
        '''Tranform this ImageAnnotation and all related TwoDAnnotaitons into a pandas DataFrame.

        Returns:
            pandas.DataFrame: Column names are:
                'img.idx', 'img.anno_task_id', 'img.timestamp', 
                'img.timestamp_lock', 'img.state', 'img.sim_class', 
                'img.frame_n', 'img.video_path', 'img.img_path', 
                'img.result_id', 'img.iteration', 'img.group_id', 
                'img.anno_time', 'img.lbl.idx', 'img.lbl.name', 
                'img.lbl.external_id', 'img.annotator', 'anno.idx', 
                'anno.anno_task_id', 'anno.timestamp', 
                'anno.timestamp_lock', 'anno.state', 'anno.track_n', 
                'anno.dtype', 'anno.sim_class', 'anno.iteration', 
                'anno.group_id', 'anno.img_anno_id', 'anno.annotator', 
                'anno.confidence', 'anno.anno_time', 'anno.lbl.idx', 
                'anno.lbl.name', 'anno.lbl.external_id', 'anno.data'
        '''
        return pd.DataFrame(self.to_dict())

    def to_vec(self, columns='all'):
        '''Transform this ImageAnnotation and all related TwoDAnnotations in list style.

        Args:
            columns (str or list of str): 'all' OR 
                'img.idx', 'img.anno_task_id', 'img.timestamp', 
                'img.timestamp_lock', 'img.state', 'img.sim_class', 
                'img.frame_n', 'img.video_path', 'img.img_path', 
                'img.result_id', 'img.iteration', 'img.group_id', 
                'img.anno_time', 'img.lbl.idx', 'img.lbl.name', 
                'img.lbl.external_id', 'img.annotator', 'anno.idx', 
                'anno.anno_task_id', 'anno.timestamp', 
                'anno.timestamp_lock', 'anno.state', 'anno.track_n', 
                'anno.dtype', 'anno.sim_class', 'anno.iteration', 
                'anno.group_id', 'anno.img_anno_id', 'anno.annotator', 
                'anno.confidence', 'anno.anno_time', 'anno.lbl.idx', 
                'anno.lbl.name', 'anno.lbl.external_id', 'anno.data'
        
        Retruns:
            list OR list of lists: Desired columns

        Example:
            Return just a list of 2d anno labels:

                >>> img_anno.to_vec('anno.lbl.name')
                ['Aeroplane', 'Bicycle']

            Return a list of lists:

                >>> img_anno.to_vec(['img.img_path', 'anno.lbl.name', 
                ...     'anno.lbl.idx', 'anno.dtype'])
                [
                    ['path/to/img1.jpg', 'Aeroplane', 14, 'bbox'], 
                    ['path/to/img1.jpg', 'Bicycle', 15, 'point']
                ]
        '''
        anno_vec = [vec.get_anno_vec() for vec in self.twod_annos]
        df = self.to_df()
        if anno_vec:
            df.update(pd.DataFrame({'anno.data':anno_vec}))
        if columns == 'all':
            return df.values.tolist()
        else:
            return df[columns].values.tolist()

    def iter_annos(self, anno_type='bbox'):
        '''Iterator for all related 2D annotations of this image.

        Args:
            anno_type (str): Can be bbox', 'point', 'line', 'polygon', 'all'
        
        Retruns:
            iterator of :class:`TwoDAnno` objects

        Example:
            >>> for bb in img_anno.iter_annos('bbox'):
            ...     do_something(bb)
        '''
        if anno_type == 'all':
            for anno in self.twod_annos:
                yield anno
        else:
            for anno in self.twod_annos:
                if anno.dtype == dtype.TwoDAnno.STR_TO_TYPE[anno_type]:
                    yield anno

    def get_anno_vec(self, anno_type='bbox'):
        '''Get related 2d annotations in list style.

        Args:
            anno_type (str): Can be 'bbox', 'point', 'line', 'polygon'

        Returns:
            list of list of floats:
                For POINTs:
                    [[x, y], [x, y], ...]
                For BBOXs:
                    [[x, y, w, h], [x, y, w, h], ...]
                For LINEs and POLYGONs:
                    [[[x, y], [x, y],...], [[x, y], [x, y],...]]

        Example:
            In the following example all bounding boxes 
            of the image annotation will be returned in list style::

                >>> img_anno.anno_vec()
                [[0.1 , 0.2 , 0.3 , 0.18],
                 [0.25, 0.25, 0.2, 0.4]]
                >>> img_anno.get_anno_lbl_vec('name', 'bbox') #Get related label names
                [['cow'], ['horse']]
        '''
        res = []
        for anno in self.twod_annos:
            if anno.dtype == dtype.TwoDAnno.STR_TO_TYPE[anno_type]:
                res.append(anno.get_anno_vec())
        return res

class AnnoTask(Base):
    """A object that represents a anno task.

    Attributes:
        idx (int): ID of this AnnoTask in database.
        manager_id (int): ID of the Manager who had distributed this Task
        group_id (int): ID of the assigned Group (None means: All groups are
            assigned to this task !)
        state (enum): See :class:`data_model.state.AnnoTask`
        progress (float): The Progress of the Task
        dtype (enum): See :class:`data_model.dtype.AnnoTask`
        pipe_element_id (int): ID of related pipeline element.
        timestamp (DateTime): Date and time when this anno task was created.
        instructions (str): Instructions for the annotator of this AnnoTask.
        name (str): A name for this annotask.
        configuration (str): The way the Tool should be configured

    Warning:
        *annotater_id = None* means that all users are assigned to this task.
    """
    __tablename__ = "anno_task"
    idx = Column(Integer, primary_key=True)
    manager_id = Column(Integer, ForeignKey('user.idx'))
    manager = relationship("User", foreign_keys='AnnoTask.manager_id',
                           uselist=False)
    group_id = Column(Integer, ForeignKey('group.idx'))
    group = relationship("Group", foreign_keys='AnnoTask.group_id',
                           uselist=False)
    state = Column(Integer)
    progress = Column(Float)
    name = Column(String(100))
    dtype = Column(Integer)
    pipe_element_id = Column(Integer, ForeignKey('pipe_element.idx'))
    timestamp = Column(DATETIME(fsp=6))
    instructions = Column(Text)
    configuration = Column(Text)
    last_activity = Column(DATETIME(fsp=6))
    last_annotater_id = Column(Integer, ForeignKey('user.idx'))
    last_annotater = relationship("User", foreign_keys='AnnoTask.last_annotater_id', uselist=False)
    req_label_leaves = relationship('RequiredLabelLeaf')

    def __init__(self, idx=None, manager_id=None, group_id=None, state=None,
                 progress=None, dtype=None, pipe_element_id=None,
                 timestamp=None, name=None, instructions=None,
                 configuration=None, last_activity=None, last_annotater=None):
        self.idx = idx
        self.manager_id = manager_id
        self.group_id = group_id
        self.state = state
        self.progress = progress
        self.dtype = dtype
        self.pipe_element_id = pipe_element_id
        self.timestamp = timestamp
        self.name = name
        self.instructions = instructions
        self.configuration = configuration
        self.last_activity = last_activity
        self.last_annotater = last_annotater

class Pipe(Base):
    """A general pipe (task) that defines how a video/dataset (Media) will be processed.

    Attributes:
        idx (int): Id of Pipe in database.
        name (str): Pipe Name
        manager_id : If of user who started this pipe
        state (enum): Status of this pipe. See :class:`data_model.state.Pipe`
        pipe_template_id (int): Id of related PipeTemplate
        timestamp (DateTime): Date and time when this task was created
        timestamp_finished (DateTime): Date and time when this task was finished
        description (str): A general description for this task.
        is_debug_mode (Boolean): DebugMode only visible for Developers
        group_id (int): Group which created this pipe
        is_locked (Boolean): Pipe Locked by PipeEngine
        pipe_template (PipeTemplate): Related :class:`PipeTemplate` object
        logfile_path (Text): path to logfile
    """
    __tablename__ = "pipe"
    idx = Column(Integer, primary_key=True)
    name = Column(String(100))
    manager_id = Column(Integer, ForeignKey('user.idx'))
    state = Column(Integer)
    pipe_template_id = Column(Integer, ForeignKey('pipe_template.idx'))
    timestamp = Column(DATETIME(fsp=6))
    timestamp_finished = Column(DATETIME(fsp=6))
    description = Column(Text)
    is_debug_mode = Column(Boolean)
    is_locked = Column(Boolean)
    group_id = Column(Integer, ForeignKey('group.idx'))
    group = relationship("Group", uselist=False)
    manager = relationship("User", uselist=False)
    pe_list = relationship("PipeElement")
    pipe_template = relationship("PipeTemplate", uselist=False)
    logfile_path = Column(String(4096))


    def __init__(self, idx=None, name=None, manager_id=None, state=None,
                 pipe_template_id=None, timestamp=None,
                 timestamp_finished=None, description=None, 
                 is_locked=None, group_id=None, is_debug_mode=None, logfile_path=None):
        self.idx = idx
        self.name = name
        self.manager_id = manager_id
        self.state = state
        self.pipe_template_id = pipe_template_id
        self.timestamp = timestamp
        self.timestamp_finished = timestamp_finished
        self.description = description
        self.is_locked = is_locked
        self.group_id = group_id
        self.is_debug_mode = is_debug_mode
        self.logfile_path = logfile_path

class PipeTemplate(Base):
    """A template of an pipeline that need to be copyed by Pipe.

    A PipeTemplate Object contains a sequence of PipeElement
    objects. This sequence will be instantiated when a Pipe is created that uses
    this PipeTemplate. Each Pipe will then work on his own sequence of
    PipeElements.

    Attributes:
        idx (int): ID in database.
        json_template (Text): A json sting that defines a pipeline template.
        timestamp (DateTime): Date and Time this Template was created or imported.
        is_debug_mode (Boolean): DebugMode shows weather this pipe is viewable for normal users or only for developers
    """
    __tablename__ = "pipe_template"
    idx = Column(Integer, primary_key=True)
    json_template = Column(Text)
    timestamp = Column(DATETIME(fsp=6))
    is_debug_mode = Column(Boolean)

    def __init__(self, idx=None, json_template=None, timestamp=None, 
                 is_debug_mode=None):
        self.idx = idx
        self.json_template = json_template
        self.timestamp = timestamp
        self.debug_mode = is_debug_mode
       
class Script(Base):
    """A script that can be executed in a pipeline.

    Attributes:
        idx (int): ID in database.
        name (str): Name of the algorithm used in this script.
        path (str): Path to a script that will execute a algorithm
            on data in database.
        description (str): Description of this algorithm/ script.
        arguments (str): json object with key value pairs (arguments for script)
        executors (str): json object containing the names of container which 
                         are able to run this script
    """
    __tablename__ = "script"
    idx = Column(Integer, primary_key=True)
    name = Column(String(100))
    path = Column(String(4096))
    description = Column(Text)
    arguments = Column(Text)
    executors = Column(Text)

    def __init__(self, idx=None, name=None, path=None, description=None,
        arguments=None, executors=None):
        self.idx = idx
        self.name = name
        self.path = path
        self.description = description
        self.arguments = arguments
        self.executors = executors

class ChoosenAnnoTask(Base):
    """Linking Table which connects Anno Tasks to Groups

    Attributes:
        idx (int): ID in database.
        user_id (int): ID of user who has choosen that anno task
        anno_task_id (int): ID of the anno task which is connected to the user
    """
    __tablename__ = "choosen_anno_task"
    idx = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('user.idx'), unique=True)
    anno_task_id = Column(Integer, ForeignKey('anno_task.idx'))
    anno_task = relationship("AnnoTask")

    def __init__(self, idx=None, user_id=None, anno_task_id=None):
        self.idx = idx
        self.user_id = user_id
        self.anno_task_id = anno_task_id

class PipeElement(Base):
    """One element in a workflow pipeline.

    A pipeline element can be an algorithm or an anno_task.

    Attributes:
        idx (int): ID in database.
        state (enum): Status of this pipeline element. See
            :class:`data_model.state.PipeElement`
        script_id (int): ID of related script.
        pipe_id (int): ID of related Pipe.
            "None" if this PipeElement belongs to a PipelineTemplate.
        dtype (enum): Type
            (see :class:`data_model.dtype.PipeElement`)
        error_msg (str): Exception message. When script had an error.
        debug_session (str): ssh connection string to temporary debug session.
        is_debug_mode (Boolean):  DebugMode only visible for Developers.
        instance_context (str): A path where files of instantiated PipeElement can
            be stored.
        pe_outs (list): List of linked :class:`PipeElement` objects that are
            connected to this PipeElement.
        result_in (list): List of related input :class:`Result` objects.
        result_out (list): List of related output :class:`Result` objects.
        anno_task (object): Related :class:`AnnoTask`.
        script (object): Related :class:`Script`.
        iteration (int): Current iteration. Represents the number of times this
            PipeElement has been processed.
        pipe_context (str): A path to store files that can be used by all elements
            in a pipeline.
        progress (float): Progress of PipeElement (e.g. progress of the script its running)
        arguments: In case of dtype is script - instance arguments for script
        loop (object): Related :class:`Loop`
        datasource (object): Realted :class:`Datasource`
    """
    __tablename__ = "pipe_element"
    idx = Column(Integer, primary_key=True)
    state = Column(Integer)
    script_id = Column(Integer, ForeignKey('script.idx'))
    pipe_id = Column(Integer, ForeignKey('pipe.idx'))
    dtype = Column(Integer)
    error_msg = Column(Text)
    warning_msg = Column(String(4096))
    log_msg = Column(String(4096))
    debug_session = Column(String(4096))
    is_debug_mode = Column(Boolean)
    instance_context = Column(String(4096))
    pe_outs = relationship("PipeElement", secondary="result_link",
                           primaryjoin="PipeElement.idx==result_link.c.pe_n",
                           secondaryjoin="PipeElement.idx==result_link.c.pe_out")
    result_in = relationship("Result", secondary="result_link",
                           primaryjoin="PipeElement.idx==result_link.c.pe_out",
                           secondaryjoin="Result.idx==result_link.c.result_id")
    result_out = relationship("Result", secondary="result_link",
                           primaryjoin="PipeElement.idx==result_link.c.pe_n",
                           secondaryjoin="Result.idx==result_link.c.result_id")
    anno_task = relationship("AnnoTask", uselist=False)
    script = relationship("Script", uselist=False)
    iteration = Column(Integer)
    pipe_context = Column(String(4096))
    progress = Column(Float)
    arguments = Column(Text)
    loop = relationship("Loop",foreign_keys='Loop.pipe_element_id', uselist=False)
    datasource = relationship('Datasource', uselist=False)
    
    def __init__(self, idx=None, state=None, dtype=None,
                 anno_task=None, pipe_id=None, is_debug_mode=None,
                 error_msg=None, warning_msg=None,
                 log_msg=None, instance_context=None, iteration=0,
                 pipe_context=None, progress=None, arguments=None):
        self.idx = idx
        self.state = state
        self.dtype = dtype
        self.anno_task = anno_task
        self.pipe_id = pipe_id
        self.is_debug_mode = is_debug_mode
        self.error_msg = error_msg
        self.warning_msg = warning_msg
        self.log_msg = log_msg
        self.instance_context = instance_context
        self.iteration = iteration
        self.pipe_context = pipe_context
        self.progress = progress
        self.arguments = arguments

class Result(Base):
    """The Result of an Algorithm or AnnoTask

    Attributes:
        idx (int): ID in database.
        timestamp (DateTime): Date and time when this result was created.
        img_annos (list): A list of related :class:`ImageAnno` objects.
        visual_outputs (list): A list of related :class:`VisualOutput` objects.
    """
    __tablename__ = "result"
    idx = Column(Integer, primary_key=True)
    timestamp = Column(DATETIME(fsp=6))
    img_annos = relationship("ImageAnno")
    visual_outputs = relationship("VisualOutput")
    data_exports = relationship("VisualOutput")

    def __init__(self, timestamp=None, media_id=None):
        self.timestamp = timestamp
        self.media_id = media_id

    def add_img_anno(self, img_anno):
        '''Add a :class:`ImageAnno` to this result.
        '''
        self.img_annos.append(img_anno)

    def add_visual_output(self, visual_output):
        '''Add a :class:`VisualOutput` to this result.
        '''
        self.visual_outputs.append(visual_output)

    def iter_img_annos(self):
        '''Iterate over all :class:`ImageAnno` objects in this Result.

        Returns:
            Iterator: :class:`ImageAnno` objects.
        '''
        return iter(self.img_annos)


    def iter_bbox_annos(self):
        '''Iterate over all :class:`TwoDAnno` objects in this Result.

        Returns:
            Iterator: :class:`TwoDAnno` objects.
        '''
        for img_anno in self.img_annos:
            for bb_anno in img_anno.bbox_annos:
                yield bb_anno


    def iter_visual_outputs(self):
        '''Iterate over all :class:`VisualOutput` objects in this Result.

        Returns:
            Iterator: :class:`VisualOutput`.
        '''
        return iter(self.visual_outputs)


class Datasource(Base):
    '''Datasource

    Attributes:
        idx (int): Id in databse.
        raw_file_id (int): Link to RawFile.
        dtype (enum): see :class:`data_model.dtype.Datasource`
        pipe_element_id: The PipeElement this Datasource belongs to.
    '''
    __tablename__ = "datasource"
    idx = Column(Integer, primary_key=True)
    raw_file_path = Column(String(4096))
    dtype = Column(Integer)
    pipe_element_id = Column(Integer, ForeignKey('pipe_element.idx'))

    def __init__(self, media_id=None, dtype=None,
                 pipe_element_id=None):
        self.media_id = media_id
        self.dtype = dtype
        self.pipe_element_id = pipe_element_id

class VisualOutput(Base):
    '''A VisualOutput will be used by a visulaise PipeElement to display
        statistics about data.

    Attributes:
        idx (int): db id.
        dtype (enum): Type of this VisualOutput.
        img_path (str): Path to an image that contains some useful informations. For
            example a diagram.
        html_string (str): HTML that should be presented by a visualise Element.
        result_id (int): Link to related result.
        iteration (int): Loop iteration when this output was created.
    '''
    __tablename__ = "visual_output"
    idx = Column(Integer, primary_key=True)
    dtype = Column(Integer)
    img_path = Column(String(4096))
    html_string = Column(Text)
    result_id = Column(Integer, ForeignKey('result.idx'))
    iteration = Column(Integer)

    def __init__(self, dtype=None, img_path=None, html_string=None, result_id=None, iteration=0):
        self.dtype = dtype
        self.img_path = img_path
        self.html_string = html_string
        self.result_id = result_id
        self.iteration = iteration

class ResultLink(Base):
    '''Links :class:`Result` objects to :class:`PipelineElement` objects

    Attributes:
        idx (int): db id.
        result_id (int): Id of the realated :class:`Result`.
        pe_n (int): Id of the :class:`PipelineElement` that has pe_out as output.
        pe_out (int): Id of the :class:`PipelineElement` that uses :class:`Result`
            as output.
    '''
    __tablename__ = "result_link"
    idx = Column(Integer, primary_key=True)
    result_id = Column(Integer, ForeignKey('result.idx'))
    pe_n = Column(Integer, ForeignKey('pipe_element.idx'))
    pe_out = Column(Integer, ForeignKey('pipe_element.idx'))
    result = relationship("Result", uselist=False)

    def __init__(self, pe_n=None, pe_out=None, result_id=None):
        self.pe_n = pe_n
        self.pe_out = pe_out
        self.result_id = result_id

class DataExport(Base):
    '''A DatatExport represents an arbitrary file that is the result of a pipeline.

    Attributes:
        idx (str): ID in database.
        file_path (str): Path to the result file.
        result_id (int): ID of the releated :class:`Result`.
        iteration (int): Loop iteration when this DataExport was created.
    '''
    __tablename__ = "data_export"
    idx = Column(Integer, primary_key=True)
    file_path = Column(String(4096))
    result_id = Column(Integer, ForeignKey('result.idx'))
    iteration = Column(Integer)

    def __init__(self, file_path=None, result_id=None, iteration=0):
        self.file_path = file_path
        self.result_id = result_id
        self.iteration = iteration


class Loop(Base):
    '''Defines a Loop element in a pipeline.

    Attributes:
        idx (int): ID in database.
        max_iteration (int): Number of iteration when loop will break.
        iteration (int): Current iteration of the loop.
        pe_jump_id (int): ID of the :class:`PipeElement` where this loop should jump to.
        break_loop (bool): Indicates wether a script wants to break this loop.
        pe_jump (model.PipeElement): Related PipeElement object.
        pipe_element_id (int): The PipeElement this Loop belongs to.
    '''
    __tablename__ = "loop"
    idx = Column(Integer, primary_key=True)
    max_iteration = Column(Integer)
    iteration = Column(Integer)
    pe_jump_id = Column(Integer, ForeignKey('pipe_element.idx'))
    break_loop = Column(Boolean)
    pe_jump = relationship("PipeElement", foreign_keys='Loop.pe_jump_id',
                           uselist=False)
    pipe_element_id = Column(Integer, ForeignKey('pipe_element.idx'))

    def __init__(self, max_iteration=None, iteration=0, pe_jump_id=None,
                 break_loop=False, pipe_element_id=None):
        self.max_iteration = max_iteration
        self.iteration = iteration
        self.pe_jump_id = pe_jump_id
        self.break_loop = break_loop
        self.pipe_element_id = pipe_element_id

class LabelLeaf(Base):
    '''A LabelLeaf

    Attributes:
        idx (int): ID in database.
        name (str): Name of the LabelName.
        abbreviation (str):
        description (str):
        timestamp (DateTime):
        external_id (str): Id of an external semantic label system (for e.g. synsetid of wordnet)
        is_deleted (Boolean): 
        is_root (Boolean): Indicates if this leaf is the root of a tree.
        parent_leaf_id (Integer): Reference to parent LabelLeaf.
        label_leafs (list of :class:`LabelLeaf`):
    '''
    __tablename__ = "label_leaf"
    idx = Column(Integer, primary_key=True)
    name = Column(String(100))
    abbreviation = Column(String(20))
    timestamp = Column(DATETIME(fsp=6))
    description = Column(Text)
    external_id = Column(String(4096))
    is_deleted = Column(Boolean)
    is_root = Column(Boolean)
    parent_leaf_id = Column(Integer, ForeignKey('label_leaf.idx'))
    label_leaves = relationship('LabelLeaf')

    def __init__(self, idx=None, name=None, abbreviation=None, description=None,
                 timestamp=None, external_id=None, label_tree_id=None, is_deleted=None,
                 parent_leaf_id=None, is_root=None):
        self.idx = idx
        self.name = name
        self.abbreviation = abbreviation
        self.description = description
        self.timestamp = timestamp
        self.external_id = external_id
        self.is_deleted = is_deleted
        self.parent_leaf_id = parent_leaf_id
        self.is_root = is_root

    def to_dict(self):
        '''Transform this object to a dict.

        Returns:
            dict:
        '''
        return {
            'idx' : self.idx,
            'name': self.name,
            'abbreviation' : self.abbreviation,
            'description' : self.description,
            'timestamp' : self.timestamp,
            'external_id' : self.external_id,
            'is_deleted' : self.is_deleted,
            'parent_leaf_id' : self.parent_leaf_id,
            'is_root' : self.is_root
        }
        
    def to_df(self):
        '''Transform this LabelLeaf to a pandas DataFrame.

        Returns:
            pd.DataFrame:
        '''
        return pd.DataFrame(self.to_dict(), index=[0])


class Label(Base):
    '''Represants an Label that is related to an annoation.

    Attributes:
        idx (int): ID in database.
        dtype (enum): :class:`lost.db.dtype.Result` type of this attribute.
        label_leaf_id: ID of related :class:`model.LabelLeaf`.
        img_anno_id (int):
        two_d_anno_id (int):
        timestamp (DateTime):
        timestamp_lock (DateTime):
        label_leaf (model.LabelLeaf): related :class:`model.LabelLeaf` object.
        annotater_id (Integer): GroupID of Annotater who has assigned this Label.
        confidence (float): Confidence of Annotation.
        anno_time (float): Time of annotaiton duration

    '''
    __tablename__ = "label"
    idx = Column(Integer, primary_key=True)
    dtype = Column(Integer)
    label_leaf_id = Column(Integer, ForeignKey('label_leaf.idx'), nullable=False)
    img_anno_id = Column(Integer, ForeignKey('image_anno.idx'))
    two_d_anno_id = Column(Integer, ForeignKey('two_d_anno.idx'))
    annotater_id = Column(Integer, ForeignKey('group.idx'))
    timestamp = Column(DATETIME(fsp=6))
    timestamp_lock = Column(DATETIME(fsp=6))
    label_leaf = relationship('LabelLeaf', uselist=False)
    confidence = Column(Float)
    anno_time = Column(Float)

    def __init__(self, idx=None, dtype=None, label_leaf_id=None, img_anno_id=None,
                 two_d_anno_id=None, annotater_id=None,
                 timestamp_lock=None, timestamp=None,
                 confidence=None, anno_time=None):
        self.idx = idx
        self.dtype = dtype
        self.label_leaf_id = label_leaf_id
        self.img_anno_id = img_anno_id
        self.two_d_anno_id = two_d_anno_id
        self.annotater_id = annotater_id
        self.timestamp_lock = timestamp_lock
        self.timestamp = timestamp
        self.confidence = confidence
        self.anno_time = anno_time

class RequiredLabelLeaf(Base):
    '''A RequiredLabelLeaf

    Attributes:
        idx (int): ID in database.
        anno_task_id (int):
        label_leaf_id (int):
        max_labels (int): Max count of labels that can be assinged for a specific
            :class:`AnnoTask`
        max_depth (int): Maximal depth in a tree beginning from that LabelLeaf
    '''
    __tablename__ = "required_label_leaf"
    idx = Column(Integer, primary_key=True)
    anno_task_id = Column(Integer, ForeignKey('anno_task.idx'))
    label_leaf_id = Column(Integer, ForeignKey('label_leaf.idx'))
    max_labels = Column(Integer)
    label_leaf = relationship("LabelLeaf", uselist=False) #type: lost.db.model.LabelLeaf

    def __init__(self, anno_task_id=None, label_leaf_id=None, max_labels=None):
        self.anno_task_id = anno_task_id
        self.label_leaf_id = label_leaf_id
        self.max_labels = max_labels