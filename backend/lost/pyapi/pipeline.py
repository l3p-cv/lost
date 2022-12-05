import lost

STRF_TIME = "%Y-%m-%dT%H:%M:%S.000Z"

class PipeInfo(object):

    def __init__(self, pipe, dbm):
        self._pipe = pipe#type: lost.db.model.Pipe
        self._dbm = dbm

    @property
    def name(self):
        '''str: Name of this pipeline
        '''
        return self._pipe.name

    @property
    def user(self):
        '''User object: User who started this pipe
        '''
        return self._pipe.manager

    @property
    def timestamp(self):
        '''str: Timestamp when pipeline was started.
        '''
        return self._pipe.timestamp.strftime(STRF_TIME)

    @property
    def timestamp_finished(self):
        '''str: Timestamp when pipeline was finished.
        '''
        return self._pipe.timestamp_finished.strftime(STRF_TIME)

    @property
    def description(self):
        '''str: Description that was defined when pipeline was started.
        '''
        return self._pipe.description

    @property
    def logfile_path(self):
        '''str: Path to pipeline log file.
        '''
        return self._pipe.logfile_path
    
    @logfile_path.setter
    def logfile_path(self, value):
        self._pipe.logfile_path = value
        self._dbm.add(self._pipe)
        self._dbm.commit()
