from datetime import datetime
from lost.logic.file_man import FileMan
from lost.db import model
import os

def create_user_default_fs(dbm, user, group_id):
    default = dbm.get_fs(name='default')
    user_root_path = os.path.join(default.root_path, 'user', str(user.idx))
    fs_db = model.FileSystem(name=user.user_name, group_id=group_id,
                             connection=default.connection,
                             root_path=user_root_path,
                             fs_type=default.fs_type, timestamp=datetime.now(), 
                             editable=False, user_default_id=user.idx)
    dbm.save_obj(fs_db)
    fm = FileMan(fs_db=fs_db)
    fm.create_root_path()
    
class UserFileAccess(object):
    
    def __init__(self, dbm, user_id, fs_db):
        '''User based file system access layer.
        
        This class will manage all file access of a lost user. It will also check
        if a user is permitted to access the filesystem.
        
        Args:
            dbm (DBMan): Lost DatabaseManager
            user_id (int): Id of the user who needs filesystem access
            fs_db (model.FileSystem): A lost FileSystem
        '''
        self.dbm = dbm
        self.uid = user_id 
        if not isinstance(fs_db, model.FileSystem):
            raise Exception('fm needs to be a FileMan object!')
        self.fs_db = fs_db
        self.fm = FileMan(fs_db=fs_db)
        self.fs = self.fm.fs

    def get_media_path(self):
        return self.fm.get_media_path()

    def get_pipe_log_path(self, pipe_id):
        if self.uid != self.fs_db.user_default_id:
            raise Exception('Can only be performed for user default file systems')
        return self.fm.get_pipe_log_path(pipe_id)

    def get_fs(self, name):
        '''Get a filesystem by name
        
        Args:
            name (str): Name of the filesystem

        Returns:
            Fsspec Filesystem
        '''
        #TODO: Check if user is permitted to access filesystem
        fs_db = self.dbm.get_fs(name=name)
        fm = FileMan(fs_db=fs_db)
        return fm.fs