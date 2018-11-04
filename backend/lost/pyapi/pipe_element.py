import lost
from lost.logic.pipeline import pipe_model
from lost.pyapi import inout
import os
from lost.logic import file_man
from lost.pyapi.pipeline import PipeInfo

class Element(object):

    def __init__(self, pe, dbm):
        self._dbm = dbm #type: lost.db.access.DBMan
        self._lostconfig = dbm.lostconfig
        self._pipe_element = pe
        self._pipe = self._dbm.get_pipe(pipe_id=self._pipe_element.pipe_id)
        self._pipe_man = pipe_model.PipeMan(self._dbm, self._pipe)
        self._inp = inout.Input(self)
        self._outp = inout.Output(self)
        self._fm = file_man.FileMan(self._lostconfig)
        self.pipe_info = PipeInfo(self._pipe, dbm)

    @property
    def inp(self):
        ''':class:`inout.Input`
        '''
        return self._inp

    @property
    def outp(self):
        ''':class:`inout.Output`
        '''
        return self._outp

    def get_rel_path(self, path):
        '''Get relativ path for current project

        Args:
            path (str): A absolute path

        Returns:
            str : Relative path
        '''
        if os.path.isabs(path):
            return self._fm.make_path_relative(path)
        else:
            return path

    def get_abs_path(self, path):
        '''Get absolute path in current file system.

        Args:
            path (str): A relative path.

        Returns:
            str: Absolute path
        '''
        if not os.path.isabs(path):
            return os.path.join(self._lostconfig.project_path, path)
        else:
            return path


