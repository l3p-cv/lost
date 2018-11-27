import lost
from lost.logic.pipeline import pipe_model
from lost.pyapi import inout
import os
from lost.logic import file_man
from lost.pyapi.pipeline import PipeInfo
from lost.db import model

class Element(object):

    def __init__(self, pe, dbm):
        self._dbm = dbm #type: lost.db.access.DBMan
        self._lostconfig = dbm.lostconfig
        self._pipe_element = pe
        self._pipe = self._dbm.get_pipe(pipe_id=self._pipe_element.pipe_id)
        self._pipe_man = pipe_model.PipeEngine(self._dbm, self._pipe)
        self._inp = inout.Input(self)
        self._outp = inout.Output(self)
        self._fm = file_man.FileMan(self._lostconfig)
        self.pipe_info = PipeInfo(self._pipe, dbm)

    @property
    def inp(self):
        ''':class:`lost.pyapi.inout.Input`: Input of this pipeline element
        '''
        return self._inp

    @property
    def outp(self):
        ''':class:`lost.pyapi.inout.Output`: Output of this pipeline element
        '''
        return self._outp


class RawFile(Element):

    def __init__(self, pe, dbm):
        '''RawFile: Represents a file or folder in the filesystem.

        Args:
            pe (object): :class:`lost.db.model.PipeElement`
            dbm (object): Database Management object.
        '''
        super().__init__(pe, dbm)

    @property
    def path(self):
        '''str: Absolute path to file or folder'''
        return self._fm.get_abs_path(self._pipe_element.datasource.raw_file_path)

class AnnoTask(Element):

    def __init__(self, pe, dbm):
        super().__init__(pe, dbm)
        self._anno_task = pe.anno_task #type: lost.db.model.AnnotationTask

    @property
    def req_categories(self):        
        '''Get required label categories for this Task.

        Returns:
            list: [[lbl_category_id, lbl_category_name], ..., [...]]
        '''
        lbl_cats = list()
        for req_cat in self._anno_task.req_label_leaves:
            lbl_cats.append([req_cat.label_leaf.idx,
                             req_cat.label_leaf.name])
        return lbl_cats

    @property
    def possible_labels(self):
        '''Get all possible labels for this annotation task

        Returns:
            list: [[lbl_id, lbl_name],...,[..]]
        '''
        lbl_list = list()
        req_categories = self._anno_task.req_label_leaves
        for category in req_categories:
            parent_leaf = category.label_leaf
            for leaf in parent_leaf.children:
                lbl_list.append([leaf.idx, leaf.name, leaf.leaf_id])
        return lbl_list

class MIATask(AnnoTask):
    def __init__(self, pe, dbm):
        super().__init__(pe, dbm)

class SIATask(AnnoTask):
    def __init__(self, pe, dbm):
        super().__init__(pe, dbm)