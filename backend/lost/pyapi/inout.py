from lost.pyapi import anno_task
from lost.pyapi import datasource
from lost.db import access, dtype
from lost.pyapi import annos
from lost.db import model
from lost.db import state
import os

class Input(object):
    '''Class that represants an Input of a pipeline element.

    Args:
        element (object): Related :class:`pipe_element.Element` object.
        results (list): A list of :class:`data_model.Result`
    '''
    def __init__(self, element):
        self._element = element
        self._results = element._pipe_element.result_in
        self._connected_pes = element._pipe_man.get_prev_pes(element._pipe_element)

    @property
    def raw_files(self):
        res_list = []
        for pe in self._connected_pes:
            if pe.dtype == dtype.PipeElement.DATASOURCE:
                res_list.append(datasource.RawFile(pe, self._element._dbm))
        return res_list

    @property
    def mia_tasks(self):
        res_list = []
        for pe in self._connected_pes:
            if pe.dtype == dtype.PipeElement.ANNO_TASK:
                if pe.anno_task.dtype == dtype.AnnoTask.MIA:
                    res_list.append(anno_task.MIATask(pe, self._element._dbm))
        return res_list

    @property
    def anno_tasks(self):
        res_list = []
        for pe in self._connected_pes:
            if pe.dtype == dtype.PipeElement.ANNO_TASK:
                res_list.append(anno_task.AnnoTask(pe, self._element._dbm))
        return res_list

    @property
    def sia_tasks(self):
        res_list = []
        for pe in self._connected_pes:
            if pe.dtype == dtype.PipeElement.ANNO_TASK:
                if pe.anno_task.dtype == dtype.AnnoTask.SIA:
                    res_list.append(anno_task.SIATask(pe, self._element._dbm))
        return res_list

    @property
    def img_annos(self):
        '''Iterate over all :class:`lost.db.model.ImageAnnotation` objects in this Resultset.

        Returns:
            Iterator: :class:`lost.db.model.ImageAnnotation` objects.
        '''
        for result in self._results:
            for img_anno in result.img_annos:
                img = annos.Image()
                img._set_anno(img_anno)
                yield img

    @property
    def img_preds(self):
        '''Iterate over all :class:`.project.ImagePrediction` objects in this Resultset.

        Returns:
            Iterator: :class:`.project.ImagePrediction` objects.
        '''
        for result in self._results:
            for img_pred in result.img_preds:
                yield img_pred

    @property
    def bbox_annos(self):
        '''Iterate over all :class:`.project.BBoxAnnotation` objects in this Resultset.

        Returns:
            Iterator: :class:`.project.BBoxAnnotation` objects.
        '''
        for result in self._results:
            for img_anno in result.img_annos:
                for twod_anno in img_anno.two_d_annos:
                    if twod_anno.dtype == dtype.TwoDAnno.BBOX:
                        bb = annos.BBox()
                        bb._set_anno(twod_anno)
                        yield bb #type: lost.pyapi.annos.BBox
    
    @property
    def twod_annos(self):
        '''Iterate over all :class:`lost.db.TwoDAnno` objects in this Resultset.

        Returns:
            Iterator: :class:`lost.db.TwoDAnno` objects.
        '''
        for result in self._results:
            for img_anno in result.img_annos:
                for twod_anno in img_anno.two_d_annos:
                    yield twod_anno #type: lost.db.TwoDAnno

    @property
    def bbox_preds(self):
        '''Iterate over all :class:`.project.BBoxPrediction` objects in this Resultset.

        Returns:
            Iterator: :class:`.project.BBoxPrediction`.
        '''
        for result in self._results:
            for img_pred in result.img_preds:
                for bb_pred in img_pred.bbox_preds:
                    yield bb_pred


class Output(object):

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
        for pred in self.img_preds:
            self._element._dbm.delete(pred)
        for pred in self.bbox_preds:
            self._element._dbm.delete(pred)
        for vout in self.visual_outputs:
            self._element._dbm.delete(vout)
        for dexport in self.data_exports:
            self._element._dbm.delete(dexport)
        self._element._dbm.commit()
        try:
            self._element._fm.rm_instance_path(self._element._pipe_element)
        except:
            pass

    @property
    def raw_files(self):
        res_list = []
        for pe in self._connected_pes:
            if pe.dtype == dtype.PipeElement.DATASOURCE:
                res_list.append(datasource.RawFile(pe, self._element._dbm))
        return res_list

    @property
    def mia_tasks(self):
        res_list = []
        for pe in self._connected_pes:
            if pe.dtype == dtype.PipeElement.ANNO_TASK:
                if pe.anno_task.dtype == dtype.AnnoTask.MIA:
                    res_list.append(anno_task.MIATask(pe, self._element._dbm))
        return res_list

    @property
    def anno_tasks(self):
        res_list = []
        for pe in self._connected_pes:
            if pe.dtype == dtype.PipeElement.ANNO_TASK:
                res_list.append(anno_task.AnnoTask(pe, self._element._dbm))
        return res_list

    @property
    def sia_tasks(self):
        res_list = []
        for pe in self._connected_pes:
            if pe.dtype == dtype.PipeElement.ANNO_TASK:
                if pe.anno_task.dtype == dtype.AnnoTask.SIA:
                    res_list.append(anno_task.SIATask(pe, self._element._dbm))
        return res_list

    @property
    def img_annos(self):
        '''Iterate over all :class:`lost.db.model.ImageAnnotation` objects in this Resultset.

        Returns:
            Iterator: :class:`lost.db.model.ImageAnnotation` objects.
        '''
        for result in self._results:
            for img_anno in result.img_annos:
                img = annos.Image()
                img._set_anno(img_anno)
                yield img

    @property
    def img_preds(self):
        '''Iterate over all :class:`.project.ImagePrediction` objects in this Resultset.

        Returns:
            Iterator: :class:`.project.ImagePrediction` objects.
        '''
        for result in self._results:
            for img_pred in result.img_preds:
                yield img_pred

    @property
    def bbox_annos(self):
        '''Iterate over all :class:`.project.BBoxAnnotation` objects in this Resultset.

        Returns:
            Iterator: :class:`.project.BBoxAnnotation` objects.
        '''
        for result in self._results:
            for img_anno in result.img_annos:
                for twod_anno in img_anno.two_d_annos:
                    if twod_anno.dtype == dtype.TwoDAnno.BBOX:
                        bb = annos.BBox()
                        bb._set_anno(twod_anno)
                        yield bb #type: lost.pyapi.annos.BBox
    
    @property
    def twod_annos(self):
        '''Iterate over all :class:`lost.db.TwoDAnno` objects in this Resultset.

        Returns:
            Iterator: :class:`lost.db.TwoDAnno` objects.
        '''
        for result in self._results:
            for img_anno in result.img_annos:
                for twod_anno in img_anno.two_d_annos:
                    yield twod_anno #type: lost.db.TwoDAnno

    @property
    def bbox_preds(self):
        '''Iterate over all :class:`.project.BBoxPrediction` objects in this Resultset.

        Returns:
            Iterator: :class:`.project.BBoxPrediction`.
        '''
        for result in self._results:
            for img_pred in result.img_preds:
                for bb_pred in img_pred.bbox_preds:
                    yield bb_pred
    @property
    def visual_outputs(self):
        '''Iterate over all :class:`.project.VisualOutput` objects in this Resultset.

        Returns:
            Iterator: :class:`.project.VisualOutput`.
        '''
        for result in self._results:
            for v_out in result.visual_outputs:
                yield v_out

    @property
    def data_exports(self):
        for result in self._results:
            for v_out in result.data_exports:
                yield v_out

class ScriptOutput(Output):
    '''Special :class:`Output` class since :class:`lost.pyapi.script.Script` objects 
    may manipulate and request annotations.
    '''
    
    def __init__(self, script):
        super().__init__(script)
        self._script = script

    # def add_img_anno(self, anno):
    #     '''Add an ImageAnnotation to output.

    #     Args:
    #         anno (ImageAnnotation): An image annotation object.
    #     '''
    #     for pe in self._connected_pes:
    #         anno.img_path = self._script.file_man.make_path_relative(anno.img_path)
    #         anno.result_id = self._result_map[pe.idx]
    #         anno.iteration = self._script._pipe_element.iteration
    #         self._script._dbm.add(anno)

    def add_visual_output(self, img_path=None, html=None):
        if img_path is None and html is None:
            raise Exception('One of the arguments need to be not None!')
        for pe in self._connected_pes:
            if pe.dtype == dtype.PipeElement.VISUALIZATION:
                if img_path is not None:
                    rel_path = self._script.file_man.make_path_relative(img_path)
                    vo_type = dtype.VisualOutput.IMAGE
                else:
                    rel_path = None
                    vo_type = dtype.VisualOutput.HTML
                vis_out = model.VisualOutput(dtype=vo_type,
                                          img_path=rel_path,
                                          html_string=html,
                                          result_id=self._result_map[pe.idx],
                                          iteration=self._script._pipe_element.iteration)
                self._script._dbm.add(vis_out)

    def add_data_export(self, file_path):
        for pe in self._connected_pes:
            if pe.dtype == dtype.PipeElement.DATA_EXPORT:
                rel_path = self._script.file_man.make_path_relative(file_path)
                export = model.DataExport(file_path=rel_path,
                                       result_id=self._result_map[pe.idx],
                                       iteration=self._script._pipe_element.iteration)
                self._script._dbm.add(export)

    def __check_for_video(self, frame_n, video_path):
        if frame_n is None and video_path is not None:
            raise Exception('If frame_n is provided a video_path is also required!')
        if video_path is None and frame_n is not None:
            raise Exception('If video_path is provided a frame_n is also required!')

    def request_bba(self, img_path, boxes = [], label_list = [],
                    frame_n=None, video_path=None, sim_classes=[]):
        '''Request BBoxAnnotations for an image.

        Args:
            img_path (str): Path of the image.
            boxes (list) : A list of boxes [[x,y,w,h],..].
            label_list (list) : A list of labels for each box. A box can
                contain multiple lables.
                [[b0_lbl0, b0_lbl1, ...], ... , [bn_lbl0]]
            frame_n (int): If *img_path* belongs to a video *frame_n* indicates
                the framenumber.
            video_path (str): If *img_path* belongs to a video this is the path to
                this video.
            sim_classes (list): [sim_class1, sim_class2,...] 
                A list of similarity classes that is used to 
                cluster BBoxes when using MIA for annotation.

        Note:
            There are three cases when you request a bbox annotation.

            Case1: Annotate empty image
                You just want to get bounding boxes drawn by a human annotator
                for an image.
                -> Only set the img_path argument.
            Case2: Annotate image with a preset of boxes
                You want to get verified predicted bounding boxes by a human
                annotator and you have not predicted a label for the boxes.
                -> Set the img_path argument and boxes.
            Case3: Annotate image with a preset of boxes and labels
                You want to get predicted bounding boxes and the related predicted
                labels to be verified by a human annotator.
                -> Set the img_path and the bb_dict argument. For boxes you
                need to assign a list of box and a list of label_ids for label_list.
                E.g. boxes =[[0.1,0.1,0.2,0.3],...], label_list =[[1,5],...]
        
        Example:
            How to use this method in a Script::

                self.request_bba('path/to/img.png', 
                    boxes=[[0.1,0.1,0.2,0.3],[0.2,0.2,0.4,0.4]], 
                    label_list=[[0],[1]]
                )
        '''
        self.__check_for_video(frame_n, video_path)
        if video_path is not None:
            video_path = self._script.get_rel_path(video_path)
        for pe in self._connected_pes:
            if pe.dtype == dtype.PipeElement.ANNO_TASK:
                rel_img_path = self._script.file_man.make_path_relative(img_path)
                img_anno = annos.Image(anno_task_id=pe.anno_task.idx,
                                        img_path=rel_img_path,
                                        state=state.Anno.UNLOCKED,
                                        result_id=self._result_map[pe.idx],
                                        iteration=self._script._pipe_element.iteration,
                                        frame_n=frame_n,
                                        video_path=video_path)
                img_anno.add_to_context(self._script._dbm)
                for i, bb in enumerate(boxes):
                    bbox = annos.BBox(bb, pe.anno_task.idx, 
                                        self._script._pipe_element.iteration)
                    if label_list:
                        if len(label_list) != len(boxes):
                            raise ValueError('*label_list* and *boxes* need to be of same size!')
                        labels = label_list[i]
                        for label_leaf_id in labels:
                            if label_leaf_id is not None:
                                bbox.add_label(label_leaf_id)
                    if sim_classes:
                        if len(sim_classes) != len(boxes):
                            raise ValueError('*sim_classes* and *boxes* need to have same size!')
                        bbox.sim_class = sim_classes[i]
                    img_anno.add_bbox(bbox)

    def add_bba(self, img_path, boxes = [], label_list = [],
                    frame_n=None, video_path=None, sim_classes=[]):
        '''Add BBoxAnnotations to the output of this Script.

        Args:
            img_path (str): Path of the image.
            boxes (list) : A list of boxes [[x,y,w,h],..].
            label_list (list) : A list of labels for each box. A box can
                contain multiple lables.
                [[b0_lbl0, b0_lbl1, ...], ... , [bn_lbl0]]
            frame_n (int): If *img_path* belongs to a video *frame_n* indicates
                the framenumber.
            video_path (str): If *img_path* belongs to a video this is the path to
                this video.
            sim_classes (list): [sim_class1, sim_class2,...] 
                A list of similarity classes that is used to 
                cluster BBoxes when using MIA for annotation.

        Note:
            There are three cases when you request a bbox annotation.

            Case1: Annotate empty image
                You just want to get bounding boxes drawn by a human annotator
                for an image.
                -> Only set the img_path argument.
            Case2: Annotate image with a preset of boxes
                You want to get verified predicted bounding boxes by a human
                annotator and you have not predicted a label for the boxes.
                -> Set the img_path argument and boxes.
            Case3: Annotate image with a preset of boxes and labels
                You want to get predicted bounding boxes and the related predicted
                labels to be verified by a human annotator.
                -> Set the img_path and the bb_dict argument. For boxes you
                need to assign a list of box and a list of label_ids for label_list.
                E.g. boxes =[[0.1,0.1,0.2,0.3],...], label_list =[[1,5],...]
        '''
        self.__check_for_video(frame_n, video_path)
        if video_path is not None:
            video_path = self._script.get_rel_path(video_path)
        for pe in self._connected_pes:
            rel_img_path = self._script.file_man.make_path_relative(img_path)
            img_anno = annos.Image(anno_task_id=None,
                                    img_path=rel_img_path,
                                    state=state.Anno.UNLOCKED,
                                    result_id=self._result_map[pe.idx],
                                    iteration=self._script._pipe_element.iteration,
                                    frame_n=frame_n,
                                    video_path=video_path)
            img_anno.add_to_context(self._script._dbm)
            for i, bb in enumerate(boxes):
                bbox = annos.BBox(bb, None, 
                                    self._script._pipe_element.iteration)
                if label_list:
                    if len(label_list) != len(boxes):
                        raise ValueError('*label_list* and *boxes* need to be of same size!')
                    labels = label_list[i]
                    for label_leaf_id in labels:
                        if label_leaf_id is not None:
                            bbox.add_label(label_leaf_id)
                if sim_classes:
                    if len(sim_classes) != len(boxes):
                        raise ValueError('*sim_classes* and *boxes* need to have same size!')
                    bbox.sim_class = sim_classes[i]
                img_anno.add_bbox(bbox)

    def request_mia(self, img_path, sim_class=None, frame_n=None, video_path=None):
        '''Request a class label annotation for an image for MIA (MultiImageAnnotation).

        Args:
            img_path (str): Path to the image that should be annotated.
            sim_class (int): A similarity class for this image. This similarity measure
                will be used to cluster images for MultiObjectAnnoation ->
                Images with the same sim_class will be presented to the
                annotator in one step.
            frame_n (int): If *img_path* belongs to a video *frame_n* indicates
                the framenumber.
            video_path (str): If *img_path* belongs to a video this is the path to
                this video. 
        '''
        self.__check_for_video(frame_n, video_path)
        if video_path is not None:
            video_path = self._script.get_rel_path(video_path)
        if sim_class is None:
            sim_class = 1

        for pe in self._connected_pes:
            if pe.dtype == dtype.PipeElement.ANNO_TASK:
                if pe.anno_task.dtype == dtype.AnnoTask.MIA:
                    rel_img_path = self._script.file_man.make_path_relative(img_path)
                    img_anno = annos.Image(anno_task_id=pe.anno_task.idx,
                                          img_path=rel_img_path,
                                          sim_class=sim_class,
                                          state=state.Anno.UNLOCKED,
                                          result_id=self._result_map[pe.idx],
                                          iteration=self._script._pipe_element.iteration,
                                          frame_n=frame_n,
                                          video_path=video_path)
                    img_anno.add_to_context(self._script._dbm)