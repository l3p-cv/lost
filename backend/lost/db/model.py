__author__ = 'Jonas Jaeger, Gereon Reus'
import io
from flask_user import current_user, UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, DateTime, Float, Text, Boolean, BLOB
# from sqlalchemy.dialects.mysql import DATETIME
from sqlalchemy import ForeignKey
from sqlalchemy.schema import MetaData
from sqlalchemy.orm import relationship
from sqlalchemy import orm
from lost.db import dtype
import json
import os
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
    user_name = Column(String(100), nullable=False, unique=True)
    email = Column(String(255), unique=True)
    email_confirmed_at = Column(DateTime())
    password = Column(String(255), server_default='')

    # User information
    first_name = Column(String(100), server_default='')
    last_name = Column(String(100),  server_default='')

    # roles = relationship('Role', secondary='user_roles', lazy='joined')
    # groups = relationship('Group', secondary='user_groups', lazy='joined')

    roles = relationship('UserRoles', back_populates='user', lazy='joined')
    groups = relationship('UserGroups', back_populates='user', lazy='joined')

    choosen_anno_tasks = relationship('ChoosenAnnoTask', back_populates='user', lazy='joined')

    api_token = Column(String(4096))
    is_external = Column(Boolean)
    is_online = Column(Boolean)

    def __init__(self, user_name, password=None, email=None, first_name=None, last_name=None, email_confirmed_at=None, api_token=None, is_external=False, is_online=False):
        self.user_name = user_name
        self.email = email
        self.email_confirmed_at = email_confirmed_at
        if not is_external:
            self.set_password(password)
        self.first_name = first_name
        self.last_name = last_name
        self.api_token = api_token
        self.is_external = is_external
        self.is_online = is_online

    def set_password(self, password):
        self.password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password, password)

    def has_role(self, role):
        role_names = []
        for r in self.roles:
            role_names.append(r.role.name)
        if role in role_names:
            return True
        else:
            return False




# Define the Role data-model
class Role(Base):
    __tablename__ = 'role'
    idx = Column(Integer(), primary_key=True)
    name = Column(String(50), unique=True)
    users = relationship("UserRoles", back_populates="role", lazy='joined')

# Define the UserRoles association table

class UserRoles(Base):
    __tablename__ = 'user_roles'
    idx = Column(Integer(), primary_key=True)
    user_id = Column(Integer(), ForeignKey('user.idx', ondelete='CASCADE'))
    role_id = Column(Integer(), ForeignKey('role.idx', ondelete='CASCADE'))
    role = relationship("Role", back_populates="users", lazy='joined')
    user = relationship("User", back_populates="roles", lazy='joined')

class Group(Base):
    __tablename__ = 'group'
    idx = Column(Integer(), primary_key=True)
    name = Column(String(50), unique=True)
    manager_id = Column(Integer(), ForeignKey('user.idx', ondelete='CASCADE'))
    is_user_default = Column(Boolean(), nullable=False, server_default='0')
    users = relationship("UserGroups", back_populates="group", lazy='joined')


class UserGroups(Base):
    __tablename__ = 'user_groups'
    idx = Column(Integer(), primary_key=True)
    user_id = Column(Integer(), ForeignKey('user.idx', ondelete='CASCADE'))
    group_id = Column(Integer(), ForeignKey('group.idx', ondelete='CASCADE'))
    group = relationship("Group", back_populates="users", lazy='joined')
    user = relationship("User", back_populates="groups", lazy='joined')



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
        track_id (int): The track id this TwoDAnno belongs to.
        sim_class (int): The similarity class this anno belong to.
            It is used to cluster similar annos in MIA.
        iteration (int): The iteration of a loop when this anno was created.
        user_id (int): Id of the annotator.
        img_anno_id (int) : ID of ImageAnno this TwoDAnno is appended to
        data (Text): drawing data (for e.g. x,y, width, height) of anno - depends on dtype
        dtype (int): type of TwoDAnno (for e.g. bbox, polygon)
            (see :class:`lost.db.dtype.TwoDAnno`)
        labels (list): A list of :class:`Label` objects related to the TwoDAnno.
        confidence (float): Confidence of Annotation.
        anno_time: Overall Annotation Time in ms.
        description (str): Description for this annotation. Assigned by an 
            annotator or algorithm.
        meta (str): A field for meta information added by a script
        is_example (bool): Indicates wether this annotation is an example for
            the selected label.
    """
    __tablename__ = "two_d_anno"

    idx = Column(Integer, primary_key=True)
    anno_task_id = Column(Integer, ForeignKey('anno_task.idx'))
    timestamp = Column(DateTime())
    timestamp_lock = Column(DateTime())
    state = Column(Integer)
    track_id = Column(Integer, ForeignKey('track.idx'))
    data = Column(Text)
    dtype = Column(Integer)
    sim_class = Column(Integer)
    iteration = Column(Integer)
    user_id = Column(Integer, ForeignKey('user.idx'))
    img_anno_id = Column(Integer, ForeignKey('image_anno.idx'))
    labels = relationship('Label')  # type: Label
    annotator = relationship('User', uselist=False)  # type: User
    confidence = Column(Float)
    anno_time = Column(Float)
    description = Column(Text)
    meta = Column(Text)
    meta_blob = Column(BLOB)
    is_example = Column(Boolean)

    def __init__(self, anno_task_id=None,
                 user_id=None, timestamp=None, state=None,
                 track_id=None, sim_class=None,
                 img_anno_id=None, timestamp_lock=None,
                 iteration=0, data=None, dtype=None,
                 confidence=None, anno_time=None,
                 description=None, meta=None, is_example=False, meta_blob=None
                 ):
        self.anno_task_id = anno_task_id
        self.user_id = user_id
        self.timestamp = timestamp
        self.timestamp_lock = timestamp_lock
        self.state = state
        self.track_id = track_id
        self.sim_class = sim_class
        self.img_anno_id = img_anno_id
        self.data = data
        self.dtype = dtype
        self.iteration = iteration
        self.confidence = confidence
        self.anno_time = anno_time
        self.description = description
        self.meta = meta
        self.meta_blob = meta_blob
        self.is_example = is_example
        # if label_leaf_id is not None:
        #     self.label = Label(label_leaf_id=label_leaf_id)

    def to_dict(self, style='flat'):
        '''Transform this object into a dict.

        Args:
            style (str): 'flat' or 'hierarchical'
                'flat': Return a dictionray in table style
                'hierarchical': Return a nested dictionary

        Retruns:
            dict: In flat or hierarchical style.

        Example:
            Get a dict in flat style. Note that 'anno.data',
            'anno.lbl.idx', 'anno.lbl.name' and 'anno.lbl.external_id'
            are json strings in contrast to the *hierarchical* style.

                >>> bbox.to_dict(style='flat')
                { 
                    'anno_uid': 1,
                    'anno_timestamp': datetime.datetime(2022, 10, 27, 11, 27, 31),
                    'anno_state': 4,
                    'anno_dtype': 'point',
                    'anno_sim_class': None,
                    'anno_iteration': 0,
                    'anno_user_id': 1,
                    'anno_user': 'admin',
                    'anno_confidence': None,
                    'anno_time': 2.5548,
                    'anno_lbl': ['Person'],
                    'anno_lbl_id': [16],
                    'anno_style': 'xy',
                    'anno_format': 'rel',
                    'anno_comment': None,
                    'anno_data': [[0.5683337459767269, 0.3378842004739504]]}
                }
        '''
        anno_dict = {
            'anno_uid': self.idx,
            # 'anno.anno_task_id': self.anno_task_id,
            'anno_timestamp': self.timestamp,
            # 'anno.timestamp_lock': self.timestamp_lock,
            'anno_state': self.state,
            # 'anno_track_id': self.track_id,
            'anno_dtype': None,
            'anno_sim_class': self.sim_class,
            'anno_iteration': self.iteration,
            'anno_user_id': self.user_id,
            # 'anno.img_anno_id': self.img_anno_id,
            'anno_user': None,
            'anno_confidence': self.confidence,
            'anno_time': self.anno_time,
            'anno_lbl': None,
            'anno_lbl_id': None,
            'anno_style': self.get_anno_style(),
            'anno_format': 'rel',
            'anno_comment': self.description
        }
        try:
            if self.meta_blob is not None:
                fp = io.BytesIO(self.meta_blob)
                series = pd.read_pickle(fp)
                for key, val in series.to_dict().items():
                    anno_dict[f'meta_{key}'] = val
                fp.close()
        except:
            pass
        try:
            anno_dict['anno_dtype'] = dtype.TwoDAnno.TYPE_TO_STR[self.dtype]
        except:
            pass
        try:
            anno_dict['anno_lbl'] = [
                lbl.label_leaf.name for lbl in self.labels
            ]
            anno_dict['anno_lbl_id'] = [
                lbl.label_leaf.idx for lbl in self.labels
            ]
        except:
            pass
        try:
            anno_dict['anno_user'] = self.annotator.user_name
        except:
            pass

        if style == 'flat':
            # self.data
            anno_dict['anno_data'] = self.get_anno_serialization_format()
            # anno_dict['anno.lbl.name'] = json.dumps(anno_dict['anno.lbl.name'])
            return anno_dict
        elif style == 'hierarchical':
            # self.data
            anno_dict['anno_data'] = self.get_anno_serialization_format()
            return anno_dict
        else:
            raise ValueError(
                'Unknow style argument! Needs to be "flat" or "hierarchical".')

    def to_df(self):
        '''Transform this annotation into a pandas DataFrame

        Returns:
            pandas.DataFrame: 
                A DataFrame where column names correspond
                to the keys of the dictionary returned from *to_dict()*
                method.

        Note:
            Column names are:
                'anno_uid', 'anno_timestamp', 'anno_state', 'anno_dtype',
                'anno_sim_class', 'anno_iteration', 'anno_user_id', 'anno_user',
                'anno_confidence', 'anno_time', 'anno_lbl', 'anno_lbl_id', 'anno_style',
                'anno_format', 'anno_comment', 'anno_data'
        '''
        return pd.DataFrame(self.to_dict())

    def to_vec(self, columns='all'):
        '''Tansfrom this annotation in list style.

        Args:
            columns (list of str OR str): Possible column names are:
                'all' OR
                'anno_uid', 'anno_timestamp', 'anno_state', 'anno_dtype',
                'anno_sim_class', 'anno_iteration', 'anno_user_id', 'anno_user',
                'anno_confidence', 'anno_time', 'anno_lbl', 'anno_lbl_id', 'anno_style',
                'anno_format', 'anno_comment', 'anno_data'

        Returns:
            list of objects: A list of the desired columns.

        Example:
            If you want to get only the annotation in list style 
            e.g. [xc, yc, w, h] (if this TwoDAnnotation is a bbox).

            >>> anno.to_vec('anno_data')
            [0.1, 0.1, 0.2, 0.2]
        '''
        df = self.to_df().drop(columns=['anno_data'])
        df_new = df.assign(data=[self.get_anno_vec()])
        df_new = df_new.rename(index=str, columns={'data': 'anno_data'})
        if columns == 'all':
            return df_new.values.tolist()[0]
        else:
            return df_new[columns].values.tolist()[0]

    def get_anno_style(self):
        if self.dtype == dtype.TwoDAnno.BBOX:
            return 'xcycwh'
        elif self.dtype == dtype.TwoDAnno.POINT:
            return 'xy'
        elif self.dtype == dtype.TwoDAnno.LINE or self.dtype == dtype.TwoDAnno.POLYGON:
            return 'xy'
        elif self.dtype is None:
            return ''
        else:
            raise Exception('Unknown TwoDAnno type!')

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
        val_list = [{'x': v[0], 'y':v[1]} for v in value]
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
        val_list = [{'x': v[0], 'y':v[1]} for v in value]
        self.data = json.dumps(val_list)
        self.dtype = dtype.TwoDAnno.POLYGON

    def get_anno_serialization_format(self):
        '''Get annotation data in list style parquet serialization.

        Returns:
            list of floats:
                For a POINT:
                    [[ x, y ]]

                For a BBOX:
                    [[ x, y, w, h ]]

                For a LINE and POLYGONS:
                    [[x, y], [x, y],...]

        Example:
            HowTo get a numpy array? In the following example a bounding box is returned::

                >>> np.array(twod_anno.get_anno_vec())
                array([0.1 , 0.2 , 0.3 , 0.18])
        '''

        if self.dtype is not None:
            data = json.loads(self.data)
        # data = self.data
        if self.dtype == dtype.TwoDAnno.BBOX:
            return [[data['x'], data['y'], data['w'], data['h']]]
        elif self.dtype == dtype.TwoDAnno.POINT:
            return [[data['x'], data['y']]]
        elif self.dtype == dtype.TwoDAnno.LINE:
            return [[e['x'], e['y']] for e in data]
        elif self.dtype == dtype.TwoDAnno.POLYGON:
            return [[e['x'], e['y']] for e in data]
        elif self.dtype is None:
            return [[None]]
        else:
            raise Exception('Unknown TwoDAnno type!')

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

        if self.dtype is not None:
            data = json.loads(self.data)
        # data = self.data
        if self.dtype == dtype.TwoDAnno.BBOX:
            return [data['x'], data['y'], data['w'], data['h']]
        elif self.dtype == dtype.TwoDAnno.POINT:
            return [data['x'], data['y']]
        elif self.dtype == dtype.TwoDAnno.LINE:
            return [[e['x'], e['y']] for e in data]
        elif self.dtype == dtype.TwoDAnno.POLYGON:
            return [[e['x'], e['y']] for e in data]
        elif self.dtype is None:
            return []
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
        labels (list): The related :class:`Label` object.
        twod_annos (list): A list of :class:`TwoDAnno` objects.
        img_path (str): Abs path to image in file system
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
        user_id (int): Id of the annotator.
        is_junk (bool): This image was marked as Junk.
        description (str): Description for this annotation. Assigned by an 
            annotator or algorithm.
        fs_id (int): Id of the filesystem where image is located
        meta (str): A field for meta information added by a script
        img_actions (str): Actions performed by users for this image
    """
    __tablename__ = "image_anno"

    idx = Column(Integer, primary_key=True)
    anno_task_id = Column(Integer, ForeignKey('anno_task.idx'))
    timestamp = Column(DateTime())
    timestamp_lock = Column(DateTime())
    state = Column(Integer)
    sim_class = Column(Integer)
    frame_n = Column(Integer)
    video_path = Column(String(4096))
    img_path = Column(String(4096))
    result_id = Column(Integer, ForeignKey('result.idx'))
    iteration = Column(Integer)
    user_id = Column(Integer, ForeignKey('user.idx'))
    labels = relationship('Label')
    twod_annos = relationship('TwoDAnno')
    annotator = relationship('User', uselist=False)
    anno_time = Column(Float)
    is_junk = Column(Boolean)
    description = Column(Text)
    fs_id = Column(Integer, ForeignKey('filesystem.idx'))
    fs = relationship('FileSystem', uselist=False)
    meta = Column(Text)
    meta_blob = Column(BLOB)
    img_actions = Column(Text)

    def __init__(self, anno_task_id=None, user_id=None,
                 timestamp=None, state=None,
                 sim_class=None, result_id=None, img_path=None,
                 frame_n=None,
                 video_path=None,
                 iteration=0, anno_time=None, is_junk=None,
                 description=None, fs_id=None, meta=None, meta_blob=None,
                 img_actions=None):
        self.anno_task_id = anno_task_id
        self.user_id = user_id
        self.timestamp = timestamp
        self.state = state
        self.sim_class = sim_class
        self.result_id = result_id
        self.img_path = img_path
        self.video_path = video_path
        self.frame_n = frame_n
        self.iteration = iteration
        self.anno_time = anno_time
        self.is_junk = is_junk
        self.description = description
        self.fs_id = fs_id
        self.meta = meta
        self.meta_blob = meta_blob
        self.img_actions = img_actions
        # if label_leaf_id is not None:
        #     self.label = Label(label_leaf_id=label_leaf_id)

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
                ...     print(d['img_path'], d['anno_lbl'], d['anno_dtype'])
                path/to/img1.jpg [] None
                path/to/img1.jpg ['Aeroplane'] bbox
                path/to/img1.jpg ['Bicycle'] point

            Possible keys in *flat* style:

                >>> img_anno.to_dict()[0].keys()
                dict_keys([
                    'img_uid', 'img_timestamp', 'img_state', 'img_sim_class', 
                    'img_frame_n', 'img_path', 'img_iteration', 'img_user_id', 
                    'img_anno_time', 'img_lbl', 'img_lbl_id', 'img_user', 
                    'img_is_junk', 'img_fs_name', 'anno_uid', 'anno_timestamp',
                    'anno_state', 'anno_dtype', 'anno_sim_class', 'anno_iteration',
                    'anno_user_id', 'anno_user', 'anno_confidence', 'anno_time',
                    'anno_lbl', 'anno_lbl_id', 'anno_style', 'anno_format', 
                    'anno_comment', 'anno_data'
                ])

            HowTo iterate through all TwoDAnnotations of this ImageAnno 
            dictionary in *hierarchical* style:

                >>> h_dict = img_anno.to_dict(style='hierarchical')
                >>> for d in h_dict['img_2d_annos']:
                ...     print(h_dict['img_path'], d['anno_lbl'], d['anno_dtype'])
                path/to/img1.jpg [Aeroplane] bbox
                path/to/img1.jpg [Bicycle] point

            Possible keys in *hierarchical* style:

                >>> h_dict = img_anno.to_dict(style='hierarchical')
                >>> h_dict.keys()
                dict_keys([
                    'img_uid', 'img_timestamp', 'img_state', 'img_sim_class',
                    'img_frame_n', 'img_path', 'img_iteration', 'img_user_id',
                    'img_anno_time', 'img_lbl', 'img_lbl_id', 'img_user', 
                    'img_is_junk', 'img_fs_name', 'img_2d_annos'
                ])
                >>> h_dict['img.twod_annos'][0].keys()
                dict_keys([
                    'anno_uid', 'anno_timestamp', 'anno_state', 'anno_dtype',
                    'anno_sim_class', 'anno_iteration', 'anno_user_id',
                    'anno_user', 'anno_confidence', 'anno_time', 'anno_lbl',
                    'anno_lbl_id', 'anno_style', 'anno_format', 'anno_comment',
                    'anno_data'
                ])
        '''

        img_dict = {
            'img_uid': self.idx,
            # 'img_anno_task_id': self.anno_task_id,
            'img_timestamp': self.timestamp,
            'img_state': self.state,
            'img_sim_class': self.sim_class,
            'img_frame_n': self.frame_n,
            # 'img_video_path': self.video_path,
            'img_path': self.img_path,
            # 'img_result_id': self.result_id,
            'img_iteration': self.iteration,
            'img_user_id': self.user_id,
            'img_anno_time': self.anno_time,
            'img_lbl': None,
            'img_lbl_id': None,
            'img_user': None,
            'img_is_junk': self.is_junk,
            'img_fs_name': self.fs.name
        }
        try:
            # TODO: Take care when same meta data is stored for image an 2d anno!
            if self.meta_blob is not None:
                fp = io.BytesIO(self.meta_blob)
                series = pd.read_pickle(fp)
                for key, val in series.to_dict().items():
                    img_dict[f'meta_{key}'] = val
                fp.close()
            # if self.meta is not None:
            #     for key, val in json.loads(self.meta).items():
            #         img_dict[f'meta_{key}'] = val
        except:
            pass
        try:
            img_dict['img_actions'] = json.loads(self.img_actions)
        except:
            pass
        try:
            img_dict['img_lbl'] = [
                lbl.label_leaf.name for lbl in self.labels]
            img_dict['img_lbl_id'] = [
                lbl.label_leaf.idx for lbl in self.labels]
        except:
            pass
        try:
            img_dict['img_user'] = self.annotator.user_name
        except:
            pass
        if style == 'hierarchical':
            img_dict['img_2d_annos'] = []
            for anno in self.twod_annos:
                img_dict['img_2d_annos'].append(
                    anno.to_dict(style='hierarchical')
                )
            return img_dict
        elif style == 'flat':
            # img_dict['img.lbl.name'] = json.dumps(img_dict['img.lbl.name'])
            d_list = []
            if len(self.twod_annos) > 0:
                empty_anno = TwoDAnno().to_dict()
                d_list.append(dict(img_dict, **empty_anno))
                for anno in self.twod_annos:
                    d_list.append(
                        dict(img_dict, **anno.to_dict())
                    )
                return d_list
            else:
                empty_anno = TwoDAnno().to_dict()
                return [dict(img_dict, **empty_anno)]
        else:
            raise ValueError(
                'Unknow style argument! Needs to be "flat" or "hierarchical".')

    def to_df(self):
        '''Tranform this ImageAnnotation and all related TwoDAnnotaitons into a pandas DataFrame.

        Returns:
            pandas.DataFrame: Column names are:
                'img_uid', 'img_timestamp', 'img_state', 'img_sim_class', 'img_frame_n',
                'img_path', 'img_iteration', 'img_user_id', 'img_anno_time', 'img_lbl',
                'img_lbl_id', 'img_user', 'img_is_junk', 'img_fs_name', 'anno_uid',
                'anno_timestamp', 'anno_state', 'anno_dtype', 'anno_sim_class',
                'anno_iteration', 'anno_user_id', 'anno_user', 'anno_confidence',
                'anno_time', 'anno_lbl', 'anno_lbl_id', 'anno_style', 'anno_format',
                'anno_comment', 'anno_data'
        '''
        return pd.DataFrame(self.to_dict())

    def to_vec(self, columns='all'):
        '''Transform this ImageAnnotation and all related TwoDAnnotations in list style.

        Args:
            columns (str or list of str): 'all' OR 
                'img_uid', 'img_timestamp', 'img_state', 'img_sim_class', 'img_frame_n',
                'img_path', 'img_iteration', 'img_user_id', 'img_anno_time', 'img_lbl',
                'img_lbl_id', 'img_user', 'img_is_junk', 'img_fs_name', 'anno_uid',
                'anno_timestamp', 'anno_state', 'anno_dtype', 'anno_sim_class',
                'anno_iteration', 'anno_user_id', 'anno_user', 'anno_confidence',
                'anno_time', 'anno_lbl', 'anno_lbl_id', 'anno_style', 'anno_format',
                'anno_comment', 'anno_data'
        Retruns:
            list OR list of lists: Desired columns

        Example:
            Return just a list of 2d anno labels:

                >>> img_anno.to_vec('anno_lbl')
                [['Aeroplane'], ['Bicycle']]

            Return a list of lists:

                >>> img_anno.to_vec(['img_path', 'anno_lbl'])
                [
                    ['path/to/img1.jpg', ['Aeroplane']], 
                    ['path/to/img1.jpg', ['Bicycle']]
                ]
        '''
        anno_vec = [vec.get_anno_vec() for vec in self.twod_annos]
        df = self.to_df()
        if anno_vec:
            df.update(pd.DataFrame({'anno.data': anno_vec}))
        if columns == 'all':
            return df.values.tolist()
        else:
            ret = df[columns].values.tolist()
            if ret == [None]:
                ret = []
            return ret

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
        configuration (str): Configuration of this annotask.

    Warning:
        *annotator_id = None* means that all users are assigned to this task.
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
    timestamp = Column(DateTime())
    instructions = Column(Text)
    configuration = Column(Text)
    last_activity = Column(DateTime())
    last_annotator_id = Column(Integer, ForeignKey('user.idx'))
    users = relationship("ChoosenAnnoTask", back_populates="anno_task", lazy='joined')
    last_annotator = relationship(
        "User", foreign_keys='AnnoTask.last_annotator_id', uselist=False)
    req_label_leaves = relationship('RequiredLabelLeaf')
    pipe_element = relationship(
        "PipeElement", foreign_keys='AnnoTask.pipe_element_id', uselist=False)

    def __init__(self, idx=None, manager_id=None, group_id=None, state=None,
                 progress=None, dtype=None, pipe_element_id=None,
                 timestamp=None, name=None, instructions=None,
                 configuration=None, last_activity=None, last_annotator=None):
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
        self.last_annotator = last_annotator


class Pipe(Base):
    """A general pipe (task) that defines how a video/dataset (Media) will be processed.

    Attributes:
        idx (int): Id of Pipe in database.
        name (str): Pipe Name
        manager_id : Id of user who started this pipe
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
    timestamp = Column(DateTime())
    timestamp_finished = Column(DateTime())
    description = Column(Text)
    is_debug_mode = Column(Boolean)
    is_locked = Column(Boolean)
    group_id = Column(Integer, ForeignKey('group.idx'))
    group = relationship("Group", uselist=False)
    manager = relationship("User", uselist=False)
    start_definition = Column(Text)
    pe_list = relationship("PipeElement")
    pipe_template = relationship("PipeTemplate", uselist=False)
    logfile_path = Column(String(4096))

    def __init__(self, idx=None, name=None, manager_id=None, state=None,
                 pipe_template_id=None, timestamp=None,
                 timestamp_finished=None, description=None,
                 is_locked=None, group_id=None, is_debug_mode=None, start_definition=None, logfile_path=None):
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
        self.start_definition = start_definition
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
        group_id (int): Group this template belongs to
        pipe_project (str): Pipe project, where this pipeline belongs to
        install_path (str): Installpath of pipeproject
    Note:
        group_id is None if this filesystem is available for all users!
    """
    __tablename__ = "pipe_template"
    idx = Column(Integer, primary_key=True)
    json_template = Column(Text)
    timestamp = Column(DateTime())
    is_debug_mode = Column(Boolean)
    group_id = Column(Integer, ForeignKey('group.idx'))
    pipe_project = Column(Text)
    install_path = Column(Text)

    def __init__(self, idx=None, json_template=None, timestamp=None,
                 is_debug_mode=None, group_id=None, pipe_project=None, install_path=None):
        self.idx = idx
        self.json_template = json_template
        self.timestamp = timestamp
        self.debug_mode = is_debug_mode
        self.group_id = group_id
        self.pipe_project = pipe_project
        self.install_path = install_path


class Script(Base):
    """A script that can be executed in a pipeline.

    Attributes:
        idx (int): ID in database.
        name (str): Name of the algorithm used in this script.
        path (str): Path to a script that will execute a algorithm
            on data in database.
        description (str): Description of this algorithm/ script.
        arguments (str): json object with key value pairs (arguments for script)
        envs (str): json object containing the names of environments that
            may execute this script
        resources (str): Json that defines the resources required by this script
        extra_packages (str): Json that defines extra packages that should be installed
    """
    __tablename__ = "script"
    idx = Column(Integer, primary_key=True)
    name = Column(String(100))
    path = Column(String(4096))
    description = Column(Text)
    arguments = Column(Text)
    envs = Column(Text)
    resources = Column(Text)
    extra_packages = Column(Text)

    def __init__(self, idx=None, name=None, path=None, description=None,
                 arguments=None, envs=None, resources=None, extra_packages=None):
        self.idx = idx
        self.name = name
        self.path = path
        self.description = description
        self.arguments = arguments
        self.envs = envs
        self.resources = resources
        self.extra_packages = extra_packages


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
    anno_task = relationship("AnnoTask", back_populates="users", lazy='joined')
    user = relationship("User", back_populates="choosen_anno_tasks", lazy='joined')

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
        error_reported (bool): Weather an error has been reported or not.
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
    error_reported = Column(Boolean)
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
                             secondaryjoin="Result.idx==result_link.c.result_id",
                             overlaps="pe_outs")
    result_out = relationship("Result", secondary="result_link",
                              primaryjoin="PipeElement.idx==result_link.c.pe_n",
                              secondaryjoin="Result.idx==result_link.c.result_id",
                              overlaps="pe_outs,result_in")
    anno_task = relationship("AnnoTask", uselist=False, overlaps="pipe_element")
    script = relationship("Script", uselist=False)
    iteration = Column(Integer)
    pipe_context = Column(String(4096))
    progress = Column(Float)
    arguments = Column(Text)
    loop = relationship(
        "Loop", foreign_keys='Loop.pipe_element_id', uselist=False)
    pipe = relationship("Pipe", uselist=False, overlaps="pe_list")
    datasource = relationship('Datasource', uselist=False)

    def __init__(self, idx=None, state=None, dtype=None,
                 anno_task=None, pipe_id=None, is_debug_mode=None,
                 error_msg=None, error_reported=False, warning_msg=None,
                 log_msg=None, instance_context=None, iteration=0,
                 pipe_context=None, progress=None, arguments=None):
        self.idx = idx
        self.state = state
        self.dtype = dtype
        self.anno_task = anno_task
        self.pipe_id = pipe_id
        self.is_debug_mode = is_debug_mode
        self.error_msg = error_msg
        self.error_reported = error_reported
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
    timestamp = Column(DateTime())
    img_annos = relationship("ImageAnno")
    visual_outputs = relationship("VisualOutput")
    data_exports = relationship("VisualOutput", overlaps="visual_outputs")

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
        selected_path (str): Selected path for a specific filesystem.
        pipe_element_id (int): The PipeElement this Datasource belongs to.
        fs_id (int): The filesystem this datasource belongs to.
    '''
    __tablename__ = "datasource"
    idx = Column(Integer, primary_key=True)
    selected_path = Column(String(4096))
    pipe_element_id = Column(Integer, ForeignKey('pipe_element.idx'))
    fs_id = Column(Integer, ForeignKey('filesystem.idx'))
    fs = relationship("FileSystem", uselist=False)

    def __init__(self, selected_path=None,
                 pipe_element_id=None, fs_id=None):
        self.pipe_element_id = pipe_element_id
        self.fs_id = fs_id
        self.selected_path = selected_path


class VisualOutput(Base):
    '''A VisualOutput will be used by a visulaise PipeElement to display
        statistics about data.

    Attributes:
        idx (int): db id.
        img_path (str): Path to an image that contains some useful informations. For
            example a diagram.
        html_string (str): HTML that should be presented by a visualise Element.
        result_id (int): Link to related result.
        iteration (int): Loop iteration when this output was created.
    '''
    __tablename__ = "visual_output"
    idx = Column(Integer, primary_key=True)
    img_path = Column(String(4096))
    html_string = Column(Text)
    result_id = Column(Integer, ForeignKey('result.idx'))
    iteration = Column(Integer)

    def __init__(self, img_path=None, html_string=None, result_id=None, iteration=0):
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
    result = relationship("Result", uselist=False, overlaps="result_in,result_out")

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
    fs_id = Column(Integer, ForeignKey('filesystem.idx'))
    fs = relationship('FileSystem', uselist=False)
    result_id = Column(Integer, ForeignKey('result.idx'))
    iteration = Column(Integer)

    def __init__(self, file_path=None, result_id=None, iteration=0, fs_id=None):
        self.fs_id = fs_id
        self.file_path = file_path
        self.result_id = result_id
        self.iteration = iteration

class AnnoTaskExport(Base):
    '''An AnnoTaskExport represents an arbitrary file that is the export of an AnnotationTask.

    Attributes:
        idx (str): ID in database.
        file_path (str): Path to the result file.
        file_size (str): FileSize in byte
    '''
    __tablename__ = "anno_task_export"
    idx = Column(Integer, primary_key=True)
    file_path = Column(String(4096))
    file_size = Column(String(4096))
    fs_id = Column(Integer, ForeignKey('filesystem.idx'))
    fs = relationship('FileSystem', uselist=False)
    timestamp = Column(DateTime())
    name = Column(String(4096))
    anno_task_id = Column(Integer, ForeignKey('anno_task.idx'))
    progress = Column(Integer)
    anno_task_progress = Column(Integer)
    img_count = Column(Integer)

    def __init__(self, file_path=None, fs_id=None, timestamp=None, name=None,
                 anno_task_id=None, progress=None, anno_task_progress=None, img_count=None):
        self.fs_id = fs_id
        self.file_path = file_path
        self.timestamp = timestamp
        self.name = name
        self.anno_task_id = anno_task_id
        self.anno_task_progress = anno_task_progress
        self.progress = progress
        self.img_count = img_count


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
        group_id (int): Group this Label Leaf belongs to
        color (str): Color of the label in Hex format.
        label_leafs (list of :class:`LabelLeaf`):

    Note:
        group_id is None if this filesystem is available for all users!
    '''
    __tablename__ = "label_leaf"
    idx = Column(Integer, primary_key=True)
    name = Column(String(100))
    abbreviation = Column(String(20))
    timestamp = Column(DateTime())
    description = Column(Text)
    external_id = Column(String(4096))
    is_deleted = Column(Boolean)
    is_root = Column(Boolean)
    parent_leaf_id = Column(Integer, ForeignKey('label_leaf.idx'))
    group_id = Column(Integer, ForeignKey('group.idx'))
    color = Column(String(100))

    label_leaves = relationship('LabelLeaf')

    def __init__(self, idx=None, name=None, abbreviation=None, description=None,
                 timestamp=None, external_id=None, label_tree_id=None, is_deleted=None,
                 parent_leaf_id=None, is_root=None, group_id=None, color=None):
        self.idx = idx
        self.name = name
        self.abbreviation = abbreviation
        self.description = description
        self.timestamp = timestamp
        self.external_id = external_id
        self.is_deleted = is_deleted
        self.parent_leaf_id = parent_leaf_id
        self.is_root = is_root
        self.group_id = group_id
        self.color = color

    def to_dict(self):
        '''Transform this object to a dict.

        Returns:
            dict:
        '''
        return {
            'idx': self.idx,
            'name': self.name,
            'abbreviation': self.abbreviation,
            'description': self.description,
            'timestamp': self.timestamp,
            'external_id': self.external_id,
            'is_deleted': self.is_deleted,
            'parent_leaf_id': self.parent_leaf_id,
            'is_root': self.is_root,
            'group_id': self.group_id,
            'color': self.color,
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
        annotator_id (Integer): GroupID of Annotator who has assigned this Label.
        confidence (float): Confidence of Annotation.
        anno_time (float): Time of annotaiton duration

    '''
    __tablename__ = "label"
    idx = Column(Integer, primary_key=True)
    dtype = Column(Integer)
    label_leaf_id = Column(Integer, ForeignKey(
        'label_leaf.idx'), nullable=False)
    img_anno_id = Column(Integer, ForeignKey('image_anno.idx'))
    two_d_anno_id = Column(Integer, ForeignKey('two_d_anno.idx'))
    annotator_id = Column(Integer, ForeignKey('user.idx'))
    timestamp = Column(DateTime())
    timestamp_lock = Column(DateTime())
    label_leaf = relationship('LabelLeaf', uselist=False)
    confidence = Column(Float)
    anno_time = Column(Float)

    def __init__(self, idx=None, dtype=None, label_leaf_id=None, img_anno_id=None,
                 two_d_anno_id=None, annotator_id=None,
                 timestamp_lock=None, timestamp=None,
                 confidence=None, anno_time=None):
        self.idx = idx
        self.dtype = dtype
        self.label_leaf_id = label_leaf_id
        self.img_anno_id = img_anno_id
        self.two_d_anno_id = two_d_anno_id
        self.annotator_id = annotator_id
        self.timestamp_lock = timestamp_lock
        self.timestamp = timestamp
        self.confidence = confidence
        self.anno_time = anno_time


class Track(Base):
    '''Represents a track. Multiple TwoDAnnos are assigned to one track.

    Attributes:
        idx (int): ID in database.
        track_n (int): Track number that identifies this track inside of
            an annotation session.
        anno_task_id (int): ID of the related annotation task
        name (str): A human readable name for this track.
        timestamp (DateTime): Timestamp when this track was created.
        user_id (int): Id of Annotator who has assigned this Label.
        iteration (int): Iteration in which this track was annotated
        confidence (float): A confidence value for the annotated track.
        anno_time (float): Time of annotaiton duration.

    '''
    __tablename__ = "track"
    idx = Column(Integer, primary_key=True)
    track_n = Column(Integer)
    anno_task_id = Column(Integer, ForeignKey('anno_task.idx'))
    name = Column(String(100))
    timestamp = Column(DateTime())
    user_id = Column(Integer, ForeignKey('user.idx'))
    iteration = Column(Integer)
    confidence = Column(Float)
    anno_time = Column(Float)
    twod_annos = relationship('TwoDAnno')
    annotator = relationship('User', uselist=False)

    def __init__(self, idx=None, track_n=None,
                 anno_task_id=None, name=None, timestamp=None,
                 user_id=None, iteration=None,
                 confidence=None, anno_time=None
                 ):
        self.idx = idx
        self.track_n = track_n
        self.anno_task_id = anno_task_id
        self.name = name
        self.timestamp = timestamp
        self.user_id = user_id
        self.iteration = iteration
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
    # type: lost.db.model.LabelLeaf
    label_leaf = relationship("LabelLeaf", uselist=False)

    def __init__(self, anno_task_id=None, label_leaf_id=None, max_labels=None):
        self.anno_task_id = anno_task_id
        self.label_leaf_id = label_leaf_id
        self.max_labels = max_labels


class Worker(Base):
    '''Represents a container with related worker that executes scripts.

    Attributes:
        idx (int): ID in database.
        env_name (str): Name that indicates the environment that is
            installed in this worker.
        worker_name (str): Unique name for a container/ worker. 
        timestamp (DateTime): Last life sign of worker.
        register_timestamp (DateTime): Timestamp of first registration 
            of a worker in LOST.
        resources (str): Json containing the available resources of a 
            worker.
        in_progress (str): Json dict containing scripts that are currently
            executed by this worker. {'pipe_element_id': 'script_path',...}
    '''
    __tablename__ = "worker"
    idx = Column(Integer, primary_key=True)
    env_name = Column(String(100))
    worker_name = Column(String(100))
    timestamp = Column(DateTime())
    register_timestamp = Column(DateTime())
    resources = Column(Text)
    in_progress = Column(Text)

    def __init__(self, idx=None, env_name=None,
                 worker_name=None, timestamp=None,
                 register_timestamp=None, resources=None, in_progress=None):
        self.idx = idx
        self.env_name = env_name
        self.worker_name = worker_name
        self.timestamp = timestamp
        self.register_timestamp = register_timestamp
        self.resources = resources
        self.in_progress = in_progress


class FileSystem(Base):
    '''FileSystem

    Args:
        idx (int): Id of entry.
        group_id (int): User or group who owns this filesystem.
        connection (str): Connection string to filesystem.
        root_path (str): Root path for this filesystem.
        fs_type (int): Filesystem type.
        timestamp (DateTime): Timestamp when filesystem was added to data base.
        name (str): Name of the filesystem
        deleted (bool): Indicates wether this datasource was deleted by a user, 
            but needs to be keept for data consistency.
        editable (bool): Indicates wether this datasource is editable by the user.
        user_default_id (int): Id of the user who owns this filesystem as default 
            filesystem
        
    
    Note:
        group_id is None if this filesystem is available for all users!
        user_default_id is None if this is not a default filesystem for any user!

    '''
    __tablename__ = "filesystem"
    idx = Column(Integer, primary_key=True)
    group_id = Column(Integer, ForeignKey('group.idx'))
    connection = Column(Text)
    root_path = Column(String(4096))
    fs_type = Column(String(20))
    timestamp = Column(DateTime())
    name = Column(String(200))
    deleted = Column(Boolean())
    editable = Column(Boolean())
    user_default_id = Column(Integer)

    def __init__(self, group_id=None, connection=None,
                 root_path=None, fs_type=None, name=None, 
                 timestamp=None, deleted=False, editable=True, 
                 user_default_id=None):
        self.group_id = group_id
        self.fs_type = fs_type
        self.connection = connection
        self.root_path = root_path
        self.name = name
        self.timestamp = timestamp
        self.deleted = deleted
        self.editable = editable
        self.user_default_id = user_default_id


class Config(Base):
    __tablename__ = "config"
    idx = Column(Integer, primary_key=True)
    key = Column(String(3072), unique=True)
    default_value = Column(Text)
    value = Column(Text)
    config = Column(Text)
    description = Column(Text)
    timestamp = Column(Integer)
    user_id = Column(Integer, ForeignKey('user.idx'))
    is_user_specific = Column(Boolean)

    def __init__(self, idx=None, key=None, default_value=None,
                 value=None, timestamp=None, user_id=None, description=None,  config=None, is_user_specific=False,):
        self.idx = idx
        self.key = key
        self.default_value = default_value
        self.value = value
        self.config = config
        self.timestamp = timestamp
        self.user_id = user_id
        self.description = description
        self.is_user_specific = is_user_specific

    def to_dict(self):
        return {
            'idx': self.idx,
            'key': self.key,
            'value': self.value,
            'default_value': self.default_value,
            'config': self.config,
            'timestamp': self.timestamp,
            'user_id': self.user_id,
            'description': self.description,
            'is_user_specific': self.is_user_specific

        }
