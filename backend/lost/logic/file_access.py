from datetime import datetime
from lost.logic.file_man import FileMan
from lost.db import model
from lost.logic.user import get_user_default_group
from lost.db import roles
import os

def create_user_default_fs(dbm, user, group_id):
    default = dbm.get_fs(name='default')
    user_root_path = os.path.join(default.root_path, 'user', str(user.idx))
    fs_db = dbm.get_fs(name=user.user_name)
    if fs_db is None:
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
            raise Exception('fs_db needs to be a lost FileSystem object!')
        self.fs_db = fs_db
        self.fm = FileMan(fs_db=fs_db)
        self.fs = self.fm.fs

    def get_media_path(self):
        return self.fm.get_media_path()


    def _user_default_required(self):
        '''Check if an action will be performed on users default fs
        
        Raises:
            UserDefaultFsRequired: Will be raised if user tries to perfrom an 
                action in any other fs than his default fs

        '''
        if self.uid != self.fs_db.user_default_id:
            raise UserDefaultFsRequired()

    def get_pipe_log_path(self, pipe_id):
        self._user_default_required()
        return self.fm.get_pipe_log_path(pipe_id)

    def get_instance_path(self, pe):
        '''Get the instance path for a :class:`lost.db.models.PipeElement`

        Args:
            pipe_element (object): :class:`lost.db.models.PipeElement`

        Returns:
            str: The absolute instance path
        '''
        self._user_default_required()
        return self.fm.get_instance_path(pe)

    def get_pipe_context_path(self, pe):
        '''Get path to pipeline context

        Args:
            pe: PipelineElement

        Returns:
            str: absolute path to pipe context
        '''
        self._user_default_required()
        return self.fm.get_pipe_context_path(pe)
        
    def get_fs(self, name):
        '''Get a filesystem by name
        
        Args:
            name (str): Name of the filesystem

        Returns:
            Fsspec Filesystem
        '''
        fs_db = self.dbm.get_fs(name=name)
        fm = FileMan(fs_db=fs_db)
        fs = fm.fs
        user = self.dbm.get_user(self.uid)
        if user.has_role(roles.ADMINISTRATOR):
            return fs
        elif self.uid == fs_db.user_default_id:
            return fs
        elif fs_db.group_id is None:
            return fs
        elif fs_db.group_id in [g.idx for g in user.groups]:
            return fs
        else:
            raise FsAccessNotPermitted()

    def get_user_default_fs(self):
        '''Get users default filesystem'''
        return self.dbm.get_user_default_fs(self.uid)

    def get_user_fs_list(self):
        '''Get a list of all filesystem that the current user may access
        
        Retruns:
            list of FileSystem: List of FileSystem objects
        '''
        dbm = self.dbm
        group_id = get_user_default_group(dbm, self.uid)
        fs_db_list = dbm.get_fs(group_id=group_id)
        fs_db_list += dbm.get_public_fs()
        return list(fs_db_list)

class FsAccessNotPermitted(Exception):
    '''Raise if a user is not permitted to access filesystem'''

    def __str__(self):
        return 'User is not permitted to access requested filesystem!'

class UserDefaultFsRequired(Exception):
    '''A User Default Filesystem is required to perform a specific action'''

    def __str__(self):
        return 'Action can only performed in users default file system!'