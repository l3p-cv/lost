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
        self.fm = FileMan(fs_db=fs_db)

    def get_media_path(self):
        return self.fm.get_media_path()