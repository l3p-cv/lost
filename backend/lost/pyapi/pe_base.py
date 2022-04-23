from lost.logic.pipeline import pipe_model
from lost.pyapi import inout
from lost.pyapi.pipeline import PipeInfo
from lost.logic import file_man

class Element(object):

    def __init__(self, pe, dbm):
        self._dbm = dbm #type: lost.db.access.DBMan
        self._lostconfig = dbm.lostconfig
        self._pipe_element = pe
        self._pe = pe
        self._pipe = self._dbm.get_pipe(pipe_id=self._pipe_element.pipe_id)
        self._pipe_man = pipe_model.PipeEngine(self._dbm, self._pipe)
        self._inp = inout.Input(self)
        self._outp = inout.Output(self)
        self._fm = file_man.FileMan(self._lostconfig)
        self._pipe_info = PipeInfo(self._pipe, dbm)

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

    @property
    def pipe_info(self):
        ''':class:`lost.pyapi.pipeline.PipeInfo`: An object with pipeline informations
        '''
        return self._pipe_info

    @property
    def pe(self):
        return self._pipe_element