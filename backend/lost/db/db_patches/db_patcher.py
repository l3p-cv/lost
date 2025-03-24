
from lost.db import access
from lost.db.model import DB_VERSION_KEY, DB_VERSION, Version
from lostconfig import LOSTConfig
from lost.db.db_patches.patches import patch_dict


class DBPatcher(object):

    def __init__(self, db_version=DB_VERSION, 
                 version_key=DB_VERSION_KEY, 
                 patch_map=None, dbm=None) -> None:
        if dbm is None:
            self.dbm = access.DBMan(LOSTConfig())
        else:
            self.dbm = dbm
        self.db_version = db_version
        self.version_key = version_key
        if patch_map is None:
            self.patch_dict = patch_dict
        else:
            self.patch_dict = patch_map

    
    def __del__(self):
        self.dbm.close_session()
    
    def version_greater(self, current_version, new_version):
        c_v = [int(x) for x in current_version.split('.')]
        n_v = [int(x) for x in new_version.split('.')]
        
        for current, new in zip(c_v, n_v):
            print(current, new)
            if current < new:
                return True
            elif current == new:
                continue
            else:
                return False
        return False
        
    def check_and_update(self):
        print('------------------------ RUN daisy-backend DBPatcher check_and_update ------------------------')
        cv = self.dbm.get_version(self.version_key)
        if cv is None:
            print('Current db version is None')
            print(f'Will create version key entry: {self.version_key}')
            self._update_version(self.db_version)
            return
        else:
            current_version = cv.version
            print(f'Current db version is {current_version}')
        new_version = self.db_version
        if self.version_greater(current_version, new_version):
        #if current_version < new_version:
            self._run_patches(current_version)
        else:
            print('Nothing to patch')
        
    def _update_version(self, new_version):
        version = self.dbm.get_version(self.version_key)
        if version is not None:
            version.version = new_version
        else:
            # If project version has not been added to database yet
            version = Version(package=self.version_key, 
                                    version=self.db_version)
        self.dbm.save_obj(version)
    
    def _extract_version_key(self, version_str):
        return tuple(map(int, version_str.split('.')))

    def _run_patches(self, current):
        patches_to_run = dict(sorted(self.patch_dict.items(), key=lambda item: self._extract_version_key(item[0])))
        patches_to_run = [v for v in patches_to_run.keys() if self.version_greater(current, v)]
        
        for v in patches_to_run:
            patch = self.patch_dict[v]
            #Run Patch -> patch_dict contains callbacks to patches!
            patch(self.dbm)
            self._update_version(v)