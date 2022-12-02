import lost
import os
import fsspec
import ast
import pandas as pd
from lost.db import dtype
from lost.pyapi.pe_base import Element
from lost.pyapi import script
from lost.logic.file_man import FileMan
from lost.logic.file_access import UserFileAccess

# class RawFile(Element):

#     def __init__(self, pe, dbm):
#         '''RawFile: Represents a file or folder in the filesystem.

#         Args:
#             pe (object): :class:`lost.db.model.PipeElement`
#             dbm (object): Database Management object.

#         Note:
#             It is essential the same as a Datasource.
#         '''
#         super().__init__(pe, dbm)

#     @property
#     def path(self):
#         '''str: Absolute path to file or folder'''
#         return self._fm.get_abs_path(self._pipe_element.datasource.raw_file_path)

class Datasource(Element):

    def __init__(self, pe, dbm):
        '''Represents a file or folder in the filesystem.

        Args:
            pe (object): :class:`lost.db.model.PipeElement`
            dbm (object): Database Management object.
        '''
        super().__init__(pe, dbm)
        self.ufa = UserFileAccess(dbm, pe.pipe.manager, pe.datasource.fs)

    @property
    def path(self):
        '''str: Relative path to file or folder'''
        return self.pe.datasource.selected_path

    def get_fs(self):
        '''Get filesystem for this datasource'''
        return self.ufa.get_fs(fs_id=self.pe.datasource.fs.idx)

class AnnoTask(Element):

    def __init__(self, pe, dbm):
        super().__init__(pe, dbm)
        self._anno_task = pe.anno_task #type: lost.db.model.AnnotationTask

    @property
    def idx(self):
        return self._anno_task.idx

    @property
    def possible_label_df(self):
        '''pd.DataFrame: Get all possible labels for this annotation task in DataFrame format

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
        return lbl_df

    @property
    def lbl_map(self):
        '''dict: Map lbl_name to idx

        Note:
            All label names will be mapped to lower case!
        '''
        df = self.possible_label_df
        my_map = dict()
        def create_map(x):
            my_map[x['name'].lower()] = x['idx'] 
        df.apply(lambda x: create_map(x),axis=1)
        return my_map
    
    @property
    def instructions(self):
        '''str: Instructions for the annotator of this AnnoTask.
        '''
        return self._anno_task.instructions

    @property
    def name(self):
        '''str: A name for this annotask.
        '''
        return self._anno_task.name
    
    @property
    def configuration(self):
        '''str: Configuration of this annotask.
        '''
        return self._anno_task.configuration

    @property
    def progress(self):
        '''float: Progress in percent.

        Value range 0...100.
        '''
        return self._anno_task.progress
        


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
        '''PipelineElement where this loop will jump to when looping.
        
        Can be of type:
            * :class:`lost.pyapi.script.Script`
            * :class:`lost.pyapi.pipe_elements.AnnoTask`
            * :class:`lost.pyapi.pipe_elements.Datasource`
            * :class:`lost.pyapi.pipe_elements.VisualOutput`
            * :class:`lost.pyapi.pipe_elements.DataExport`
            * :class:`lost.pyapi.pipe_elements.Loop`
        '''
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
        '''list of str: A list of absolute path to exported files'''
        path_list = []
        for export in self.data_exports:
            path_list.append(export.file_path)
        return path_list

    def to_dict(self):
        '''Transform a list of exports to a dictionary.

        Returns:
            list of dict: [{'iteration':int, 'file_path':str},...]
        '''
        d_list = []
        for export in self.data_exports:
            d_list.append(
                {
                    'iteration': export.iteration,
                    'file_path': export.file_path
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
        '''list of str: List of absolute paths to images.'''
        path_list = []
        for v_out in self.v_outs:
            path_list.append(v_out.file_path)
        return path_list

    @property
    def html_strings(self):
        '''list of str: list of html strings.'''
        path_list = []
        for v_out in self.v_outs:
            path_list.append(v_out.file_path)
        return path_list

    def to_dict(self):
        '''Transforms a list of visualization information into a list of dicts.

        Returns:
            list of dicts: 
            [{'iteration':int, 'img_path':str, 'html_string':str},...]
        '''
        d_list = []
        for v_out in self.v_outs:
            d_list.append(
                {
                    'iteration': v_out.iteration,
                    'img_path': v_out.img_path,
                    'html_string': v_out.html_string
                }
            )
        return d_list