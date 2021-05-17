import os
from os.path import join
from lost.db import access
from lost.logic import config
from lost.logic import file_man
from lost.db import roles
from lost.db.model import User, Role, Group
from lost.db import model
import json
from datetime import datetime

def main():
    lostconfig = config.LOSTConfig()
    # project_root = join(lostconfig.project_path, "data")
    # if not os.path.exists(project_root):
    #     os.makedirs(project_root)
    fman = file_man.FileMan(lostconfig)
    fman.create_project_folders()
    # Create Tables
    dbm = access.DBMan(lostconfig)
    dbm.create_database()
    create_first_user(dbm)
    create_lost_filesystem_entry(dbm, lostconfig)
    dbm.close_session()

def create_first_user(dbm):
    if not dbm.find_user_by_user_name('admin'):
        user = User(
            user_name = 'admin',
            email='admin@example.com',
            email_confirmed_at=datetime.utcnow(),
            password='admin',
            first_name= 'LOST',
            last_name='Admin'
        )
        user.roles.append(Role(name=roles.DESIGNER))
        user.roles.append(Role(name=roles.ANNOTATOR))
        user.groups.append(Group(name=user.user_name, is_user_default=True))
        dbm.save_obj(user)

def create_lost_filesystem_entry(dbm, lostconfig):
    lost_fs = dbm.get_fs('lost_data')
    if lost_fs is None:
        print('Create first FileSystem entry for lost_data in database')
        lost_fs = model.FileSystem(
            connection=json.dumps(lostconfig.data_fs_args),
            name='lost_data',
            root_path=lostconfig.data_path,
            timestamp=datetime.utcnow(),
            fs_type=lostconfig.data_fs_type
        )
    else:
        print('Update FileSystem entry for lost_data in database')
        lost_fs.connection = json.dumps(lostconfig.data_fs_args)
        lost_fs.root_path = lostconfig.data_path
        lost_fs.fs_type = lostconfig.data_fs_type 
    dbm.save_obj(lost_fs)

if __name__ == '__main__':
    main()
