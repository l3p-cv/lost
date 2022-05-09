import subprocess
import shutil
import os
import pandas as pd
import json
from datetime import datetime
from lost.settings import LOST_CONFIG
import lostconfig as config
import shutil
from lost.db import access
from lost.logic.pipeline import template_import
from lost.logic.file_man import AppFileMan
from lost.db import roles
from lost.db.model import User, Role, Group, UserGroups, UserRoles
from lost.logic.file_access import UserFileAccess
from lost.db import model
from lost.logic.label import LabelTree
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
    if user and group:
        create_lost_filesystem_entry(dbm, lostconfig, group.idx)
        create_user_default_fs(dbm, user, group.idx)
        import_ootb_pipelines(dbm, user)
        copy_example_images(dbm, lostconfig, user)
        import_example_label_trees(dbm, lostconfig)
        # create_project_config(dbm)
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
    return None, None

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

# def create_project_config(dbm):
#     pc = ProjectConfigMan(dbm)
#     print ('Try to create default project config!')
#     try:
#         pc.create_entry('default_language', 'en', description='Default selected language.')
#     except:
#         print('Project config already exists!')

def import_ootb_pipelines(dbm, user):

    def git(*args):
        return subprocess.check_call(['git'] + list(args))
    fm = AppFileMan(LOST_CONFIG)
    git_url = LOST_CONFIG.initial_pipeline_import_url
    if git_url != '':
        git_branch = LOST_CONFIG.initial_pipeline_import_branch
        git_project = os.path.splitext(os.path.basename(git_url))[0]
        upload_path = fm.get_upload_path(user.idx, git_project)
        if git_branch == 'main':
            git('clone', git_url, upload_path)
        else:
            git('clone', git_url, upload_path, '-b', git_branch)
        pp_path = fm.get_pipe_project_path()
        dst_dir = os.path.basename(upload_path)
        dst_path = os.path.join(pp_path, dst_dir)
        shutil.copytree(upload_path, dst_path,dirs_exist_ok=True)

        importer = template_import.PipeImporter(dst_path, dbm)
        importer.start_import()
        shutil.rmtree(upload_path)

    # old way
    # fm = AppFileMan(lostconfig)
    # src_path = '/code/src/backend/lost/pyapi/examples/pipes/lost'
    # pp_path = fm.get_pipe_project_path()
    # dst_path = os.path.join(pp_path, os.path.basename(src_path))
    # #try:
    # shutil.copytree(src_path, dst_path, dirs_exist_ok=False)
    # importer = template_import.PipeImporter(dst_path, dbm)
    # importer.start_import()


def copy_example_images(dbm, lostconfig, user):
    if lostconfig.add_examples:
        src_path = '/code/src/backend/lost/pyapi/examples/images'
        admin_fs = dbm.get_user_default_fs(user.idx)
        ufa = UserFileAccess(dbm, user, admin_fs)
        ufa.fm.fs.put(src_path, ufa.get_media_path(), recursive=True)


def import_example_label_trees(dbm, lostconfig):
    if lostconfig.add_examples:
        tree = LabelTree(dbm)
        src_pathes = ['/code/src/backend/lost/pyapi/examples/label_trees/pascal_voc2012.csv',
                    '/code/src/backend/lost/pyapi/examples/label_trees/dummy_label_tree.csv']
        
        for src_path in src_pathes:
            df = pd.read_csv(src_path)
            tree.import_df(df)


if __name__ == '__main__':
    main()
