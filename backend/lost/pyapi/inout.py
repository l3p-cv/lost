from shutil import ExecError
import io
from lost.logic import file_man
from lost.logic.user import get_user_default_group
from lost.pyapi import pipe_elements
from lost.logic.file_man import DummyFileMan
from lost.logic.file_access import UserFileAccess
from lost.db import access, dtype
from lost.db import model
from lost.db import state
import os
import pandas as pd
import numpy as np
import json
from datetime import date, datetime

def _json_default(obj):
    """Try to serialize dates to isoformat"""

    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    raise TypeError ("Type %s not serializable" % type(obj))
class Input(object):
    '''Class that represants an input of a pipeline element.

    Args:
        element (object): Related :class:`lost.db.model.PipeElement` object.
    '''
    def __init__(self, element):
        self._element = element
        self._results = element._pipe_element.result_in
        self._connected_pes = element._pipe_man.get_prev_pes(element._pipe_element)

    @property
    def datasources(self):
        '''list of :class:`lost.pyapi.pipe_elements.Datasource` objects'''
        res_list = []
        for pe in self._connected_pes:
            if pe.dtype == dtype.PipeElement.DATASOURCE:
                res_list.append(pipe_elements.Datasource(pe, self._element._dbm))
        return res_list

    @property
    def mia_tasks(self):
        '''list of :class:`lost.pyapi.pipe_elements.MIATask` objects'''
        res_list = []
        for pe in self._connected_pes:
            if pe.dtype == dtype.PipeElement.ANNO_TASK:
                if pe.anno_task.dtype == dtype.AnnoTask.MIA:
                    res_list.append(pipe_elements.MIATask(pe, self._element._dbm))
        return res_list

    @property
    def anno_tasks(self):
        '''list of :class:`lost.pyapi.pipe_elements.AnnoTask` objects'''
        res_list = []
        for pe in self._connected_pes:
            if pe.dtype == dtype.PipeElement.ANNO_TASK:
                res_list.append(pipe_elements.AnnoTask(pe, self._element._dbm))
        return res_list

    @property
    def sia_tasks(self):
        '''list of :class:`lost.pyapi.pipe_elements.SIATask` objects'''
        res_list = []
        for pe in self._connected_pes:
            if pe.dtype == dtype.PipeElement.ANNO_TASK:
                if pe.anno_task.dtype == dtype.AnnoTask.SIA:
                    res_list.append(pipe_elements.SIATask(pe, self._element._dbm))
        return res_list

    @property
    def visual_outputs(self):
        '''list of :class:`lost.pyapi.pipe_elements.VisualOutput` objects.
        '''
        res_list = []
        for pe in self._connected_pes:
            if pe.dtype == dtype.PipeElement.VISUALIZATION:
                res_list.append(pipe_elements.VisualOutput(pe, self._element._dbm))
        return res_list


    @property
    def data_exports(self):
        '''list of :class:`lost.pyapi.pipe_elements.VisualOutput` objects.
        '''
        res_list = []
        for pe in self._connected_pes:
            if pe.dtype == dtype.PipeElement.DATA_EXPORT:
                res_list.append(pipe_elements.DataExport(pe, self._element._dbm))
        return res_list

    @property
    def img_annos(self):
        '''Iterate over all :class:`lost.db.model.ImageAnno` objects in this Resultset.

        Returns:
            Iterator of :class:`lost.db.model.ImageAnno` objects.
        '''
        for result in self._results:
            for img_anno in result.img_annos:
                yield img_anno #type: lost.db.model.ImageAnno
    
    def to_vec(self, columns='all'):
        '''Get a vector of all Annotations related to this object.

        Args:
            columns (str or list of str): 'all' OR 
                'img_uid', img_timestamp', img_state', img_sim_class', img_frame_n',
                'img_path','img_iteration','img_user_id','img_anno_time','img_lbl',
                'img_lbl_id','img_user','img_is_junk','img_fs_name','anno_uid',
                'anno_timestamp','anno_state','anno_dtype','anno_sim_class',
                'anno_iteration','anno_user_id','anno_user','anno_confidence',
                'anno_time','anno_lbl','anno_lbl_id','anno_style','anno_format',
                'anno_comment','anno_data'
        
        Retruns:
            list OR list of lists: Desired columns

        Example:
            Return just a list of 2d anno labels:

                >>> self.outp.to_vec('anno_lbl')
                [['Person'],[],['Cat'],[],['Car'],['Person'],[],['Bird'],['Bird']]

            Return a list of lists:

                >>> self.outp.to_vec(['img_path', 'anno_lbl', 
                ...     'anno_data', 'anno_dtype'])
                [
                    ['path/to/img1.jpg', ['Aeroplane'], [[0.1, 0.1, 0.2, 0.2]], 'bbox'], 
                    ['path/to/img1.jpg', ['Bicycle'], [[0.1, 0.1]], 'point'], 
                    ['path/to/img2.jpg', ['Bottle'], [[0.1, 0.1], [0.2, 0.2]], 'line'],
                    ['path/to/img3.jpg', ['Horse'], [[0.2, 0.15, 0.3, 0.18]], 'bbox'] 
                ]
        '''
        vec_list = []
        for result in self._results:
            for img_anno in result.img_annos:
                vec_list += img_anno.to_vec(columns)
        return vec_list

    def to_df(self):
        '''Get a pandas DataFrame of all annotations related to this object.

        Returns:
            pandas.DataFrame: Column names are:
                'img_uid', img_timestamp', img_state', img_sim_class', img_frame_n',
                'img_path','img_iteration','img_user_id','img_anno_time','img_lbl',
                'img_lbl_id','img_user','img_is_junk','img_fs_name','anno_uid',
                'anno_timestamp','anno_state','anno_dtype','anno_sim_class',
                'anno_iteration','anno_user_id','anno_user','anno_confidence',
                'anno_time','anno_lbl','anno_lbl_id','anno_style','anno_format',
                'anno_comment','anno_data'
        '''
        df_list = []
        for result in self._results:
            for img_anno in result.img_annos:
                df_list.append(img_anno.to_df())
        return pd.concat(df_list)

    @property
    def twod_annos(self):
        '''Iterate over 2D-annotations.

        Returns:
            Iterator: of :class:`lost.db.model.TwoDAnno` objects.
        '''
        for result in self._results:
            for img_anno in result.img_annos:
                for twod_anno in img_anno.twod_annos:
                    yield twod_anno #type: lost.db.model.TwoDAnno

    @property
    def bbox_annos(self):
        '''Iterate over all bbox annotation.

        Returns:
            Iterator of :class:`lost.db.model.TwoDAnno`.
        '''
        for result in self._results:
            for img_anno in result.img_annos:
                for bb in img_anno.bbox_annos:
                    yield bb #type: lost.db.model.TwoDAnno

    @property
    def point_annos(self):
        '''Iterate over all point annotations.

        Returns:
            Iterator of :class:`lost.db.model.TwoDAnno`.
        '''
        for result in self._results:
            for img_anno in result.img_annos:
                for bb in img_anno.point_annos:
                    yield bb #type: lost.db.model.TwoDAnno
    
    @property
    def line_annos(self):
        '''Iterate over all line annotations.

        Returns:
            Iterator of :class:`lost.db.model.TwoDAnno` objects.
        '''
        for result in self._results:
            for img_anno in result.img_annos:
                for tda in img_anno.line_annos:
                    yield tda #type: lost.db.model.TwoDAnno

    @property
    def polygon_annos(self):
        '''Iterate over all polygon annotations.

        Returns:
            Iterator of :class:`lost.db.model.TwoDAnno` objects.
        '''
        for result in self._results:
            for img_anno in result.img_annos:
                for tda in img_anno.polygon_annos:
                    yield tda #type: lost.db.model.TwoDAnno


class Output(Input):

    def __init__(self, element):
        self._element = element
        self._results = element._pipe_element.result_out
        self._result_map = dict()
        for rl in self._element._dbm.get_resultlinks_pe_n(self._element._pipe_element.idx):
            self._result_map[rl.pe_out] = rl.result_id
        self._connected_pes = self._element._pipe_man.get_next_pes(self._element._pipe_element)

    def clean_up(self):
        for anno in self.img_annos:
            self._element._dbm.delete(anno)
        for anno in self.bbox_annos:
            self._element._dbm.delete(anno)
        for vout in self.visual_outputs:
            self._element._dbm.delete(vout)
        for dexport in self.data_exports:
            self._element._dbm.delete(dexport)
        self._element._dbm.commit()
        try:
            self._element._fm.rm_instance_path(self._element._pipe_element)
        except:
            pass

class ScriptOutput(Output):
    '''Special :class:`Output` class since :class:`lost.pyapi.script.Script` objects 
    may manipulate and request annotations.
    '''
    
    def __init__(self, script):
        super().__init__(script)
        self._script = script
        self.ufa = script.ufa

    def add_visual_output(self, img_path=None, html=None):
        '''Display an image and html in the web gui via a VisualOutput element.

        Args:
            img_path (str): Path in the lost filesystem to the image 
                to display.
            html (str): HTML text to display.
        '''
        if img_path is None and html is None:
            raise Exception('One of the arguments need to be not None!')
        for pe in self._connected_pes:
            if pe.dtype == dtype.PipeElement.VISUALIZATION:
                vis_out = model.VisualOutput(img_path=img_path,
                                          html_string=html,
                                          result_id=self._result_map[pe.idx],
                                          iteration=self._script._pipe_element.iteration)
                self._script._dbm.add(vis_out)
                self._script._dbm.commit()

    def add_data_export(self, file_path, fs):
        '''Serve a file for download inside the web gui via a DataExport element.

        Args:
            file_path (str): Path to the file that should be provided 
                for download.
            fs (filesystem): Filesystem, where file_path is valid.
        '''
        for pe in self._connected_pes:
            if pe.dtype == dtype.PipeElement.DATA_EXPORT:
                # rel_path = self._script.file_man.make_path_relative(file_path)
                export = model.DataExport(file_path=file_path,
                                       result_id=self._result_map[pe.idx],
                                       fs_id = fs.lost_fs.idx,
                                       iteration=self._script._pipe_element.iteration)
                self._script._dbm.add(export)
                self._script._dbm.commit()

    def __check_for_video(self, frame_n, video_path):
        if frame_n is None and video_path is not None:
            raise Exception('If frame_n is provided a video_path is also required!')
        if video_path is None and frame_n is not None:
            raise Exception('If video_path is provided a frame_n is also required!')

    def request_annos(self, img, img_labels=None, img_sim_class=None, 
        annos=[], anno_types=[], anno_labels=[], anno_sim_classes=[], frame_n=None, 
        video_path=None, fs=None, img_meta=None, anno_meta=None, img_comment=None):
        '''Request annotations for a subsequent annotaiton task.

        Args:
            img (str or ImageAnno): Path to the image or database image where annotations will be requested for
            img_label (list of int): Labels that will be assigned to the image. The labels should be
                represented by a label_leaf_id. An image may have multiple labels.
            img_sim_class (int): A culster id that will be used to cluster this image
                in the MIA annotation tool.
            annos (list of list): A list of
                POINTs: [x,y]
                BBOXes: [x,y,w,h]
                LINEs or POLYGONs: [[x,y], [x,y], ...]
            anno_types (list of str): Can be 'point', 'bbox', 'line', 'polygon'
            anno_labels (list of int): Labels for the twod annos. 
                Each label in the list is represented by a label_leaf_id.
                (see also :class:`LabelLeaf`).
            anno_sim_classes (list of ints): List of arbitrary cluster ids 
                that are used to cluster annotations in the MIA annotation tool.
            frame_n (int): If *img_path* belongs to a video *frame_n* indicates
                the framenumber.
            video_path (str): If *img_path* belongs to a video this is the path to
                this video.
            fs (fsspec.spec.AbstractFileSystem): The filesystem where image is located. 
                Use lost standard filesystem if no filesystem was given.
                You can get this Filesystem object from a DataSource-Element by calling
                get_fm method.
            img_meta (dict): Dictionary with meta information that should be added to the
                image annotation. Each meta key will be added as column during annotation export. 
                the dict-value will be row content.
            anno_meta (list of dict): List of dictionaries with meta information that 
                should be added to a specific annotation. Each meta key will be 
                added as column during annotation export. The dict-value will be row content.
            img_comment (str): A comment that will be added to this image.
        
        Example:
            Request human annotations for an image with annotation proposals::

                 >>> self.outp.request_annos('path/to/img.jpg',
                ...     annos = [
                ...         [0.1, 0.1, 0.2, 0.2], 
                ...         [0.1, 0.2], 
                ...         [[0.1, 0.3], [0.2, 0.3], [0.15, 0.1]]
                ...     ],
                ...     anno_types=['bbox', 'point', 'polygon'],
                ...     anno_labels=[
                ...         [1], 
                ...         [1], 
                ...         [4]
                ...     ],
                ...     anno_sim_classes=[10, 10, 15]
                ... )

            Reqest human annotations for an image without porposals::

            >>> self.outp.request_annos('path/to/img.jpg')
        '''
        for pe in self._connected_pes:
            if pe.dtype == dtype.PipeElement.ANNO_TASK:
                self._add_annos(pe, img,
                    img_labels=img_labels,
                    img_sim_class=img_sim_class,
                    annos=annos,
                    anno_types=anno_types,
                    anno_labels=anno_labels,
                    anno_sim_classes=anno_sim_classes,
                    frame_n=frame_n,
                    video_path=video_path,
                    anno_task_id=pe.anno_task.idx,
                    fs=fs, img_meta=img_meta, anno_meta=anno_meta,
                    img_comment=img_comment)

    def _get_lds_fm(self, df, fs_cache=dict(), fs=None):
        if 'img_fs_name' in df:
            fs_name = df['img_fs_name'].values[0]
            if not fs_name:
                if fs is not None:
                    return fs
                fs_name = 'default'
        else:
            if fs is not None:
                return fs
            fs_name = 'default'
        if fs_name in fs_cache:
            return fs_cache[fs_name]
        else:
            dbm = self._script._dbm
            fs_db_list = self.ufa.get_user_fs_list()
            res = list(filter(lambda x: x.name == fs_name, fs_db_list))
            if len(res) > 0:
                fs_db = res[0]
                fm = file_man.FileMan(fs_db=fs_db)
                fs_cache[fs_name] = fm.fs
                return fm.fs
            else:
                raise Exception('No possible filesystem found')

    def request_lds_annos(self, lds, fs=None, anno_meta_keys=[], img_meta_keys=[], img_path_key='img_path'):
        '''Request annos from LOSTDataset.
        
        Args:
            lds (LOSTDataset): A lost dataset object. Request all annotation in this 
                dataset again.
            fs (fsspec.spec.AbstractFileSystem): The filesystem where image is located. 
                Use lost standard filesystem if no filesystem was given.
                You can get this Filesystem object from a DataSource-Element by calling
                get_fm method.
            img_meta_keys (list): Keys that should be used for img_anno meta information
            anno_meta_keys (list): Keys that should be used for two_d_anno meta information
        '''
        for pe in self._connected_pes:
            if pe.dtype == dtype.PipeElement.ANNO_TASK:
                self._request_lds(pe, lds, fs, anno_meta_keys, img_meta_keys, img_path_key)


    def _request_lds(self, pe, lds, fs=None, anno_meta_keys=[], img_meta_keys=[], img_path_key='img_path'):
        '''Request annos from LOSTDataset.
        
        Args:
            lds (LOSTDataset): A lost dataset object. Request all annotation in this 
                dataset again.
            pe (PipelineElement): PipelineElement of the annotations task where 
                annotations should be requested for.
            fs (fsspec.spec.AbstractFileSystem): The filesystem where image is located. 
                Use lost standard filesystem if no filesystem was given.
                You can get this Filesystem object from a DataSource-Element by calling
                get_fm method.
            img_meta_keys (list): Keys that should be used for img_anno meta information
            anno_meta_keys (list or *all*): Keys that should be used for two_d_anno meta information.
                If all, all keys of lds will be added as meta information.
            img_path_key (str): Column that should be used as img_path
        
        Note:
            Annos for images are requested in same order as in the input lost 
            dataset.
        '''
        if 'anno_format' in lds.df:
            if len( lds.df[lds.df['anno_format'] != 'rel'] ) > 0:
                raise Exception('All anno in LOSTDataset need to be in rel format!')
        else:
            self._script.logger.warning('anno_format column is missing in lds')
        if 'anno_style' in lds.df:
            bb_df =  lds.df[lds.df['anno_dtype'] == 'bbox']
            if len(bb_df[bb_df['anno_style'] != 'xcycwh']) > 0:
                raise Exception('All anno in bboxes need to be in xcycwh anno_style!')
        else:
            self._script.logger.warning('anno_style column is missing in lds')
        fs_cache = dict()
        # db_anno_task = self._script._dbm.get_anno_task(anno_task_id=anno_task_id)
        anno_task = pipe_elements.AnnoTask(pe, self._script._dbm)
        lbl_map = anno_task.lbl_map
        for img_path, df in lds.df.groupby(img_path_key, sort=False):
            fs = self._get_lds_fm(df, fs_cache, fs)
            if 'img_sim_class' in df:
                if df['img_sim_class'].values[0]:
                    img_sim_class = df['img_sim_class'].values[0]
                else:
                    img_sim_class = 1
            else:
                img_sim_class = 1
            # rel_img_path = fm.make_path_relative(img_path)
            anno_task_id = pe.anno_task.idx
            img_anno = model.ImageAnno(anno_task_id=anno_task_id,
                                    img_path=img_path,
                                    state=state.Anno.UNLOCKED,
                                    result_id=self._result_map[pe.idx],
                                    iteration=self._script._pipe_element.iteration,
                                    # frame_n=df['img_frame_n'].values[0],
                                    sim_class=img_sim_class,
                                    fs_id=fs.lost_fs.idx)
            if len(img_meta_keys) > 0:
                # anno.meta = json.dumps(row[img_meta_keys].to_dict())
                fp = io.BytesIO()
                # img_anno.meta = json.dumps(df.iloc[0][img_meta_keys].to_dict(), default=_json_default)
                df.iloc[0][img_meta_keys].to_pickle(fp)
                img_anno.meta_blob = fp.getvalue()
                fp.close()
            self._script._dbm.add(img_anno)
            # if img_labels is not None:
            if 'img_lbl' in df:
                img_lbls = df['img_lbl'].values[0]
                if img_lbls:
                    if len(img_lbls) > 0:
                        self._update_labels(img_lbls, img_anno, lbl_map)
            if 'anno_data' in df:
                anno_df = df[~df['anno_data'].isnull()]
                if len(anno_df) > 0:
                    # for i, vec in enumerate(annos):
                    for idx, row in anno_df.iterrows():
                        anno = model.TwoDAnno(iteration=self._script._pipe_element.iteration,
                            anno_task_id=anno_task_id, state=state.Anno.UNLOCKED)
                        if len(anno_meta_keys) > 0:
                            if anno_meta_keys == 'all':
                                fp = io.BytesIO()
                                row.to_pickle(fp)
                                anno.meta_blob = fp.getvalue()
                                fp.close()
                                # anno.meta = json.dumps(row.to_dict(), default=_json_default)
                            else:
                                fp = io.BytesIO()
                                row[anno_meta_keys].to_pickle(fp)
                                anno.meta_blob = fp.getvalue()
                                fp.close()
                                # anno.meta = json.dumps(row[anno_meta_keys].to_dict(), default=_json_default)
                        if row['anno_dtype'] == 'point':
                            anno.point = row['anno_data']
                        elif row['anno_dtype'] == 'bbox':
                            anno.bbox = row['anno_data']
                        elif row['anno_dtype'] == 'line':
                            anno.line = row['anno_data']
                        elif row['anno_dtype'] == 'polygon':
                            anno.polygon = row['anno_data']
                        if 'anno_comment' in row:
                            anno.description = row['anno_comment']
                        if 'anno_lbl' in row:
                            if len(row['anno_lbl']) > 0 :
                                # if len(anno_labels) != len(annos):
                                #     raise ValueError('*anno_labels* and *annos* need to be of same size!')
                                # label_leaf_ids = anno_labels[i]
                                self._update_labels(row['anno_lbl'], anno, lbl_map)
                        if 'anno_sim_class' in row:
                            if row['anno_sim_class']:
                                # if len(anno_sim_classes) != len(annos):
                                #     raise ValueError('*anno_sim_classes* and *annos* need to have same size!')
                                anno.sim_class = row['anno_sim_class']
                        else:
                            anno.sim_class = 1
                        img_anno.twod_annos.append(anno)
            self._script._dbm.commit()

    def _add_annos(self, pe, img, img_labels=None, img_sim_class=None, 
        annos=[], anno_types=[], anno_labels=[], anno_sim_classes=[], frame_n=None, 
        video_path=None, anno_task_id=None, fs=None, img_meta=None, anno_meta=None, 
        img_comment=None):
        '''Add annos in list style to an image.
        
        Args:
            pe (PipeElement): The connected PipeElement where annotation should be provided for.
            img (str or ImageAnno): Path to the image or database image where annotations will be requested for
            img_labels (list of int or str): Labels that will be assigned to the image. The label should
                represented by a label_leaf_id or label_name.
            img_sim_class (int): A culster id that will be used to cluster this image
                in the MIA annotation tool.
            annos (list of list): A list of
                POINTs: [x,y]
                BBOXes: [x,y,w,h]
                LINEs or POLYGONs: [[x,y], [x,y], ...]
            anno_types (list of str): Can be 'point', 'bbox', 'line', 'polygon'
            anno_labels (list of int): Labels for the twod annos. 
                Each label in the list is represented by a label_leaf_id.
                (see also :class:`model.LabelLeaf`).
            anno_sim_classes (list of ints): List of arbitrary cluster ids 
                that are used to cluster annotations in the MIA annotation tool.
            frame_n (int): If *img_path* belongs to a video *frame_n* indicates
                the framenumber.
            video_path (str): If *img_path* belongs to a video this is the path to
                this video.
            anno_task_id (int): Id of the assigned annotation task.
            fs (fsspec.spec.AbstractFileSystem): The filesystem where image is located. 
                Use lost standard filesystem if no filesystem was given.
                You can get this Filesystem object from a DataSource-Element by calling
                get_fm method.
            img_meta (dict): Dictionary with meta information that should be added to the
                image annotation. Each meta key will be added as column during annotation export. 
                the dict-value will be row content.
            anno_meta (list of dict): List of dictionaries with meta information that 
                should be added to a specific annotation. Each meta key will be 
                added as column during annotation export. The dict-value will be row content.
            img_comment (str): A comment that will be added to this image.
        '''
        if isinstance(img, model.ImageAnno):
            img_path = img.img_path
            if frame_n is None:
                frame_n = img.frame_n
            if video_path is None:
                video_path = img.video_path
            if img_sim_class is None:
                img_sim_class = img.sim_class
            if img_comment is None:
                img_comment = img.description
            if fs is None:
                # fs_db = self.ufa.get_fs_db(fs_id=img.fs_id)
                fs = self.ufa.get_fs(fs_id=img.fs_id)
                # fs = file_man.FileMan(fs_db=fs_db).fs
        else:
            img_path = img
        if img_sim_class is None:
            img_sim_class = 1
        if fs is None:
            fs_db = self.ufa.get_user_default_fs_db()
            fm = file_man.FileMan(fs_db=fs_db)
            fs = fm.fs
        if fs.isfile(img_path):
            img_anno = model.ImageAnno(anno_task_id=anno_task_id,
                                    img_path=img_path,
                                    state=state.Anno.UNLOCKED,
                                    result_id=self._result_map[pe.idx],
                                    iteration=self._script._pipe_element.iteration,
                                    frame_n=frame_n,
                                    video_path=video_path,
                                    sim_class=img_sim_class,
                                    fs_id=fs.lost_fs.idx,
                                    description=img_comment)
            anno_task = pipe_elements.AnnoTask(pe, self._script._dbm)
            lbl_map = anno_task.lbl_map
            if img_meta is not None:
                img_anno.meta = json.dumps(img_meta, default=_json_default)
            self._script._dbm.add(img_anno)
            if img_labels is not None:
                self._update_labels(img_labels, img_anno, lbl_map)
            if len(annos) != len(anno_types):
                raise ValueError('*anno_types* and *annos* need to be of same size!')            
            for i, vec in enumerate(annos):
                anno = model.TwoDAnno(iteration=self._script._pipe_element.iteration,
                    anno_task_id=anno_task_id, state=state.Anno.UNLOCKED)
                if anno_meta is not None:
                    if len(annos) != len(anno_meta):
                        raise ValueError('*anno_meta* and *annos* need to be of same size!')            
                    anno.meta = json.dumps(anno_meta[i], default=_json_default)
                if anno_types[i] == 'point':
                    anno.point = vec
                elif anno_types[i] == 'bbox':
                    anno.bbox = vec
                elif anno_types[i] == 'line':
                    anno.line = vec
                elif anno_types[i] == 'polygon':
                    anno.polygon = vec
                if anno_labels:
                    if len(anno_labels) != len(annos):
                        raise ValueError('*anno_labels* and *annos* need to be of same size!')
                    label_leaf_ids = anno_labels[i]
                    self._update_labels(label_leaf_ids, anno, lbl_map)
                if anno_sim_classes:
                    if len(anno_sim_classes) != len(annos):
                        raise ValueError('*anno_sim_classes* and *annos* need to have same size!')
                    anno.sim_class = anno_sim_classes[i]
                else:
                    anno.sim_class = 1
                img_anno.twod_annos.append(anno)
            self._script._dbm.commit()
        else:
            self._script.logger.warning(f'Will ignore {img_path} since it is not a file!')
    
    def _lbl_name_to_id(self, lbl, lbl_map=None):
        if isinstance(lbl, str):
            lbl_name = lbl.lower()
            if lbl_map is None:
                raise Exception(f'Cannot transform label_name: {lbl_name} to label_idx. No lbl_map provided!')
            if lbl_name in lbl_map:
                return lbl_map[lbl_name]
            else:
                self._script.logger.warning(f'{lbl_name} is no valid label for subsequent annotation task. Will ignore label.')
                return None
        else:
            return lbl

    def _update_labels(self, ll_ids, anno, lbl_map=None):
        if isinstance(ll_ids, list) or isinstance(ll_ids, np.ndarray):
            if len(ll_ids) > 0:
                for ll_id in ll_ids:
                    if ll_id is not None:
                        ll_id = self._lbl_name_to_id(ll_id, lbl_map)
                        if ll_id is not None:
                            anno.labels.append(model.Label(label_leaf_id=ll_id))
        else:
            if ll_ids is not None:
                ll_ids = self._lbl_name_to_id(ll_ids, lbl_map)
                if ll_ids is not None:
                    anno.labels.append(model.Label(label_leaf_id=ll_ids))
