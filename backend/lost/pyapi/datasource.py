from lost.pyapi import pipe_element

class RawFile(pipe_element.Element):

    def __init__(self, pe, dbm):
        '''RawFile: Represents a file or folder in the filesystem.

        Args:
            pe (object): :class:`lost.db.model.PipeElement`
            dbm (object): Database Management object.
        '''
        super().__init__(pe, dbm)

    @property
    def path(self):
        '''str: Absolute path to file'''
        return self.get_abs_path(self._pipe_element.datasource.raw_file_path)