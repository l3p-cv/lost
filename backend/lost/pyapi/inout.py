from lost.pyapi import anno_task
from lost.pyapi import datasource
from lost.db import access, dtype
from lost.pyapi import annos
import os

#TODO: Adjust property comments
class Input(object):
    def __init__(self, element):
        '''Init

        Args:
            element (object): Related :class:`pipe_element.Element` object.
            results (list): A list of :class:`data_model.Result`
        '''
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

