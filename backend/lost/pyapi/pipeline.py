import lost
from lost.logic import file_man

class PipeInfo(object):

    def __init__(self, pipe, dbm):
        self._pipe = pipe#type: lost.db.model.Pipe
        self._dbm = dbm

    @property
    def name(self):
        return self._pipe.name

    @property
    def timestamp(self):
        return self._pipe.timestamp.strftime('%Y%m%d%H%M%S')

    @property
    def timestamp_finished(self):
        return self._pipe.timestamp_finished.strftime('%Y%m%d%H%M%S')

    @property
    def description(self):
        return self._pipe.description

    @property
    def logfile_path(self):
        return self._pipe.logfile_path
    
    @logfile_path.setter
    def logfile_path(self, value):
        self._pipe.logfile_path = value
        self._dbm.add(self._pipe)
        self._dbm.commit()
