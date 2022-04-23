import os
from os.path import join
from unicodedata import name
from lost.db import access
import lostconfig as config
from lost.logic import file_man
from lost.db import roles
from lost.db.model import User, Role, Group, UserGroups, UserRoles
from lost.db import model
import json
from datetime import datetime
from lost.logic.project_config import ProjectConfigMan
from lost.logic.file_access import create_user_default_fs

def main():
    lostconfig = config.LOSTConfig()
    # project_root = join(lostconfig.project_path, "data")
    # if not os.path.exists(project_root):
    #     os.makedirs(project_root)
    # fman = file_man.FileMan(lostconfig)
    # fman.create_project_folders()
    # Create Tables
    dbm = access.DBMan(lostconfig)
    dbm.create_database()
    create_roles(dbm)
    user, group = create_first_user(dbm)
    create_lost_filesystem_entry(dbm, lostconfig, group.idx)
    create_user_default_fs(dbm, user, group.idx)
    create_project_config(dbm)
    dbm.close_session()

def create_roles(dbm):
    if not dbm.get_role_by_name(roles.ADMINISTRATOR):
        role = Role(name=roles.ADMINISTRATOR)
        dbm.save_obj(role)
    if not dbm.get_role_by_name(roles.DESIGNER):
        role = Role(name=roles.DESIGNER)
        dbm.save_obj(role)
    if not dbm.get_role_by_name(roles.ANNOTATOR):
        role = Role(name=roles.ANNOTATOR)
        dbm.save_obj(role)

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
        dbm.save_obj(user)
        # create user's default group
        g = Group(name=user.user_name, is_user_default=True)
        dbm.save_obj(g)
        ug = UserGroups(group_id=g.idx,user_id=user.idx)
        dbm.save_obj(ug)

        # add all roles to admin
        role = dbm.get_role_by_name(roles.ADMINISTRATOR)
        ur = UserRoles(user_id=user.idx, role_id=role.idx)
        dbm.save_obj(ur)
        role = dbm.get_role_by_name(roles.DESIGNER)
        ur = UserRoles(user_id=user.idx, role_id=role.idx)
        dbm.save_obj(ur)
        role = dbm.get_role_by_name(roles.ANNOTATOR)
        ur = UserRoles(user_id=user.idx, role_id=role.idx)
        dbm.save_obj(ur)
        return user, g

def create_lost_filesystem_entry(dbm, lostconfig, admin_default_group):
    lost_fs = dbm.get_fs('default')
    if lost_fs is None:
        print('Create first FileSystem entry for default in database')
        lost_fs = model.FileSystem(
            connection=json.dumps(lostconfig.data_fs_args),
            name='default',
            root_path=lostconfig.data_path,
            timestamp=datetime.utcnow(),
            fs_type=lostconfig.data_fs_type,
            group_id=admin_default_group
        )
    else:
        print('Update FileSystem entry for default fs in database')
        lost_fs.connection = json.dumps(lostconfig.data_fs_args)
        lost_fs.root_path = lostconfig.data_path
        lost_fs.fs_type = lostconfig.data_fs_type 
    dbm.save_obj(lost_fs)

def create_project_config(dbm):
    pc = ProjectConfigMan(dbm)
    print ('Try to create default project config!')
    try:
        pc.create_entry('default_language', 'en', description='Default selected language.')
    except:
        print('Project config already exists!')


if __name__ == '__main__':
    main()
