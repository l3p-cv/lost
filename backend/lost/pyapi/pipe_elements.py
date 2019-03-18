import lost
from lost.logic.pipeline import pipe_model
from lost.pyapi import inout
import os
from lost.logic import file_man
from lost.pyapi.pipeline import PipeInfo
from lost.db import model
import pandas as pd
from lost.db import dtype
from lost.pyapi import script

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

        Note:
            It is essential the same as a Datasource.
        '''
        super().__init__(pe, dbm)

    @property
    def path(self):
        '''str: Absolute path to file or folder'''
        return self._fm.get_abs_path(self._pipe_element.datasource.raw_file_path)

class Datasource(Element):

    def __init__(self, pe, dbm):
        '''Represents a file or folder in the filesystem.

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
    def idx(self):
        return self._anno_task.idx

    # @property
    # def req_categories(self):        
    #     '''Get required label categories for this Task.

    #     Returns:
    #         list: [[lbl_category_id, lbl_category_name], ..., [...]]
    #     '''
    #     lbl_cats = list()
    #     for req_cat in self._anno_task.req_label_leaves:
    #         lbl_cats.append([req_cat.label_leaf.idx,
    #                          req_cat.label_leaf.name])
    #     return lbl_cats

    @property
    def possible_label_df(self, columns='all'):
        '''Get all possible labels for this annotation task in DataFrame format

        Returns:
            pd.DataFrame: Column names are:
                'idx', 'name', 'abbreviation',
                'description', 'timestamp', 'external_id',
                'is_deleted', 'parent_leaf_id' ,'is_root'
        '''
        lbl_list = list()
        req_categories = self._anno_task.req_label_leaves
        for category in req_categories:
            parent_leaf = category.label_leaf
            for leaf in parent_leaf.label_leaves:
                lbl_list.append(leaf.to_df())
        lbl_df = pd.concat(lbl_list)
        if columns == 'all':
            return lbl_df
        else:
            return lbl_df[columns]


class MIATask(AnnoTask):
    def __init__(self, pe, dbm):
        super().__init__(pe, dbm)

class SIATask(AnnoTask):
    def __init__(self, pe, dbm):
        super().__init__(pe, dbm)


class Loop(Element):

    def __init__(self, pe, dbm):
        super().__init__(pe, dbm)
        self._loop = pe.loop #type: lost.db.model.Loop
    
    @property
    def max_iteration(self):
        '''int: Maximum number of iteration.'''
        return self._loop.max_iteration

    @property
    def iteration(self):
        '''int: Current iteration of this loop.'''
        return self._loop.iteration

    @property
    def is_broken(self):
        '''bool: True if loop is broken'''
        return self._loop.break_loop

    @property
    def pe_jump(self):
        '''PipelineElement where this loop will jump to when looping.'''
        if self._loop.pe_jump.dtype == dtype.PipeElement.ANNO_TASK:
            return AnnoTask(self._pipe_element, self._dbm)
        elif self._loop.pe_jump.dtype == dtype.PipeElement.DATA_EXPORT:
            return DataExport(self._pipe_element, self._dbm)
        elif self._loop.pe_jump.dtype == dtype.PipeElement.VISUALIZATION:
            return VisualOutput(self._pipe_element, self._dbm)
        elif self._loop.pe_jump.dtype == dtype.PipeElement.DATASOURCE:
            return Datasource(self._pipe_element, self._dbm)
        elif self._loop.pe_jump.dtype == dtype.PipeElement.SCRIPT:
            return script.Script(self._pipe_element.idx)


class DataExport(Element):

    def __init__(self, pe, dbm):
        '''Represents a DataExport element.

        Args:
            pe (object): :class:`lost.db.model.PipeElement`
            dbm (object): Database Management object.
        
        Note:
            Please note that a DataExport element can contain multiple 
            exported files.
        '''
        super().__init__(pe, dbm)
        self.data_exports = []
        for result in self._pipe_element.result_in:
            for export in result.data_exports:
                self.data_exports.append(export)

    @property
    def file_path(self):
        '''str: A list of absolute path to exported files'''
        path_list = []
        for export in self.data_exports:
            path_list.append(self._fm.get_abs_path(export.file_path))
        return path_list

    def to_dict(self):
        '''Transform a list of exports to a dictionary.
        '''
        d_list = []
        for export in self.data_exports:
            d_list.append(
                {
                    'iteration': export.iteration,
                    'file_path': self._fm.get_abs_path(export.file_path)
                }
            )
        return d_list

class VisualOutput(Element):

    def __init__(self, pe, dbm):
        '''Represents a VisualOutput element.

        Args:
            pe (object): :class:`lost.db.model.PipeElement`
            dbm (object): Database Management object.

        Note:
            A VisualOutput element can contain multiple images and 
            html strings.
        '''
        super().__init__(pe, dbm)
        self.v_outs = []
        for result in self._pipe_element.result_in:
            for v_out in result.visual_outputs:
                self.v_outs.append(v_out)

    @property
    def img_paths(self):
        '''list of absolute paths to images.'''
        path_list = []
        for v_out in self.v_outs:
            path_list.append(self._fm.get_abs_path(v_out.file_path))
        return path_list

    @property
    def html_strings(self):
        '''list of html strings.'''
        path_list = []
        for v_out in self.v_outs:
            path_list.append(self._fm.get_abs_path(v_out.file_path))
        return path_list

    def to_dict(self):
        '''Transforms a list of visualization information into a list of dicts.

        Returns:
            list of dicts: Possible keys of each dict are 
                *iteration*, *img_path*, *html_string*
        '''
        d_list = []
        for v_out in self.v_outs:
            d_list.append(
                {
                    'iteration': v_out.iteration,
                    'img_path': self._fm.get_abs_path(v_out.img_path),
                    'html_string': v_out.html_string
                }
            )
        return d_list

    
    
        