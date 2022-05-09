from datetime import datetime
from lost.logic.file_man import FileMan
from lost.db import model
from lost.logic.user import get_user_default_group
from lost.db import roles
import os

def create_user_default_fs(dbm, user, group_id):
    if user.has_role(roles.ADMINISTRATOR) or user.has_role(roles.DESIGNER):
        default = dbm.get_fs(name='default')
        user_root_path = os.path.join(default.root_path, str(user.idx))
        fs_db = dbm.get_fs_deleted_also(name=user.user_name)
        if fs_db is None:
            fs_db = model.FileSystem(name=user.user_name, group_id=group_id,
                                    connection=default.connection,
                                    root_path=user_root_path,
                                    fs_type=default.fs_type, timestamp=datetime.now(), 
                                    editable=False, user_default_id=user.idx)
            dbm.save_obj(fs_db)
            fm = FileMan(fs_db=fs_db)
            fm.create_root_path()
        elif fs_db.deleted == True:
            # Reactivate old user specific default filesystem
            fs_db.deleted = False
            dbm.save_obj(fs_db)
        return fs_db
    
class UserFileAccess(object):
    
    def __init__(self, dbm, user, fs_db):
        '''User based file system access layer.
        
        This class will manage all file access of a lost user. It will also check
        if a user is permitted to access the filesystem.
        
        Args:
            dbm (DBMan): Lost DatabaseManager
            user (model.User): User database object of the user who needs filesystem access
            fs_db (model.FileSystem): A lost FileSystem
        '''
        self.dbm = dbm
        self.user = user
        if not isinstance(fs_db, model.FileSystem):
            raise Exception('fs_db needs to be a lost FileSystem object!')
        self.fs_db = fs_db
        self.fm = FileMan(fs_db=fs_db)
        self.fs = self.fm.fs

    def load_anno_img(self,db_img):
        anno_task = self.dbm.get_anno_task(db_img.anno_task_id)
        user = self.user
        if anno_task.pipe_element.pipe.manager_id == user.idx:
            return self.fm.load_img(db_img.img_path)
        elif anno_task.group_id in [g.group_id for g in user.groups]:
            return self.fm.load_img(db_img.img_path)
        else:
            raise FsAccessNotPermitted()
    
    def load_file(self, path, option='rb'):
        if 'r' in self.get_permission():
            return self.fm.load_file(path, option)
        else:
            raise FsAccessNotPermitted()

    def rm(self, path, recursive=False):
        if 'w' in self.get_permission():
            return self.fm.rm(path, recursive=recursive)
        else:
            raise FsAccessNotPermitted()

    def ls(self, path, detail=False):
        if 'r' in self.get_permission():
            return self.fm.ls(path, detail=detail)
        else:
            raise FsAccessNotPermitted()

    def touch(self, file_path):
        if 'w' in self.get_permission():
            return self.fs.touch(file_path)
        else:
            raise FsAccessNotPermitted()

    def mkdirs(self, path, exist_ok=False):
        if 'w' in self.get_permission():
            return self.fm.mkdirs(path, exist_ok=exist_ok)
        else:
            raise FsAccessNotPermitted()

    def get_media_path(self):
        return self.fm.get_media_path()

    def get_export_ds_path(self, export_id):
        return self.fm.get_export_ds_path(export_id)

    def _user_default_required(self):
        '''Check if an action will be performed on users default fs
        
        Raises:
            UserDefaultFsRequired: Will be raised if user tries to perfrom an 
                action in any other fs than his default fs

        '''
        if self.user.idx != self.fs_db.user_default_id:
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
        
    def get_fs_db(self, name=None, fs_id=None):
        if name is not None:
            fs_db = self.dbm.get_fs(name=name)
        elif fs_id is not None:
            fs_db = self.dbm.get_fs(fs_id=fs_id)
        else:
            raise ValueError('Either name or fs_id need to be provided')
        user = self.user
        if user.has_role(roles.ADMINISTRATOR):
            return fs_db
        elif user.idx == fs_db.user_default_id:
            return fs_db
        elif fs_db.group_id is None:
            return fs_db
        elif fs_db.group_id in [g.group_id for g in user.groups]:
            return fs_db
        else:
            raise FsAccessNotPermitted()
        
    def get_fs(self, name=None, fs_id=None):
        '''Get a filesystem by name or fs_id
        
        Args:
            name (str): Name of the filesystem
            fs_id (int): Id of the lost filesystem

        Returns:
            Fsspec Filesystem
        '''
        fs_db = self.get_fs_db(name, fs_id)
        fm = FileMan(fs_db=fs_db)
        return fm.fs

    def get_user_default_fs(self):
        fs_db = self.get_user_default_fs_db()
        fm = FileMan(fs_db=fs_db)
        return fm.fs

    def get_user_default_fs_db(self):
        '''Get users default filesystem
        
        Returns:
            model.FileSystem: lost filesystem entry from database
        '''
        return self.dbm.get_user_default_fs(self.user.idx)

    def write_file(self, bytes_obj, path):
        '''Write bytes object to selected filesystem 
        
        Args:
            bytes_obj(bytes): Object to write
            path (str): Destination path where object will be saved
        '''
        if self.fs_db.root_path not in path:
            raise WriteAccessNotPermitted()
        if 'w' in self.get_permission():
            with self.fs.open(path, 'wb') as fs_stream:
                fs_stream.write(bytes_obj)
        else:
            raise WriteAccessNotPermitted()

    def delete_user_default_fs(self):
        '''Delete user default fs
        
        Returns:
            model.FileSystem: The deleted filesystem
            
        Note:
            When deleting a user default filesystem a deleted flag will be set 
            in oder to maintain data consitency.
        '''
        self._user_default_required()
        fs_db = self.fs_db
        if fs_db is not None:
            fs_db.deleted = True
            self.dbm.save_obj(fs_db)
        return fs_db

    def get_user_fs_list(self):
        '''Get a list of all filesystem that the current user may access
        
        Retruns:
            list of FileSystem: List of FileSystem objects
        '''
        dbm = self.dbm
        group_id = get_user_default_group(dbm, self.user.idx)
        fs_db_list = dbm.get_fs(group_id=group_id)
        fs_db_list += dbm.get_public_fs()
        return list(fs_db_list)
    
    def get_permission(self):
        # fs types: global, own_user_specific, other_user_specific
        # operations: read (r), read-write(rw), none 
        # admin user, user
        group_id = get_user_default_group(self.dbm, self.user.idx)
        if self.user.has_role(roles.ADMINISTRATOR):
            # global fs
            if not self.fs_db.group_id:
                return 'rw'
            # user's own fs
            if self.fs_db.group_id == group_id:
                return 'rw'
            # other user's fs
            else:
                return None
        if self.user.has_role(roles.DESIGNER):
            # global fs
            if not self.fs_db.group_id:
                return 'r'
            # user's own fs
            if self.fs_db.group_id == group_id:
                return 'rw'
            # other user's fs
            else:
                return None
        return None
    
    def get_pipe_log_file(self, pipe_id):
        self._user_default_required()
        log_path = self.get_pipe_log_path(pipe_id)
        return self.fm.get_file_stream(log_path)

class WriteAccessNotPermitted(Exception):
    '''Raise if a user is not permitted to write into filesystem'''

    def __str__(self):
        return 'User is not permitted to write to current filesystem!'
class FsAccessNotPermitted(Exception):
    '''Raise if a user is not permitted to access filesystem'''

    def __str__(self):
        return 'User is not permitted to access requested filesystem!'

class UserDefaultFsRequired(Exception):
    '''A User Default Filesystem is required to perform a specific action'''

    def __str__(self):
        return 'Action can only performed in users default file system!'