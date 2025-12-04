import json
import os
import shutil
import subprocess
import traceback
from datetime import datetime

import pandas as pd
from sqlalchemy import text

import lostconfig as config
from lost.db import access, model, roles
from lost.db.db_patches.db_patcher import DBPatcher
from lost.db.db_patches.patches import patch_dict
from lost.db.model import Group, Role, User, UserGroups, UserRoles
from lost.logic.file_access import UserFileAccess, create_user_default_fs
from lost.logic.file_man import AppFileMan
from lost.logic.label import LabelTree
from lost.logic.pipeline import template_import
from lost.settings import LOST_CONFIG


def main():
    lostconfig = config.LOSTConfig()
    try:
        tempdbm = access.DBMan(lostconfig)
        perfrom_all_patches = check_if_all_patches_should_be_applied(tempdbm)
        tempdbm.close_session()
        DBPatcher(patch_map=patch_dict).check_and_update(perfrom_all_patches)
    except:
        print("Error while patching database:")
        print(traceback.format_exc())

    dbm = access.DBMan(lostconfig)
    create_roles(dbm)
    user, group = create_first_user(dbm)
    if user and group:
        create_lost_filesystem_entry(dbm, lostconfig, group.idx)
        create_user_default_fs(dbm, user, group.idx)
        import_ootb_pipelines(dbm, user)
        copy_example_images(dbm, lostconfig, user)
        copy_instruction_media(dbm, lostconfig, user)
        import_example_label_trees(dbm, lostconfig)
        create_lost_default_instruction_entry(dbm, lostconfig, group.idx)
    release_all_pipe_locks(dbm)
    dbm.close_session()


def check_if_all_patches_should_be_applied(dbm: access.DBMan):
    """Check if all db patches should be applied

    If a database is already present, but no version table is there, we have to
    deal with a lost version that prior to db_patcher and we can apply all db
    patches.
    """

    try:
        # check is db tables are created
        sql = """
            SELECT COUNT(table_schema)
            FROM information_schema.tables
            WHERE table_schema = 'lost'
            AND table_name = 'version';
        """
        res = dbm.session.execute(text(sql))
        row = res.fetchone()
        if row[0] == 0:
            return False
    except:
        print(traceback.format_exc())
        return False

    try:
        sql = """
            SELECT 1 
            FROM information_schema.tables 
            WHERE table_schema = 'lost' 
            AND table_name = 'version';
        """
        res = dbm.session.execute(text(sql))
        row = res.fetchone()
        if row is None:
            sql = """
                SELECT 1 
                FROM information_schema.tables 
                WHERE table_schema = 'lost' 
                AND table_name = 'image_anno';
            """
            res = dbm.session.execute(text(sql))
            row = res.fetchone()
            if row is not None:
                return True
        return False
    except:
        print(traceback.format_exc())
        return False


def release_all_pipe_locks(dbm: access.DBMan):
    try:
        sql = """
                UPDATE pipe 
                SET is_locked = FALSE;
            """
        dbm.session.execute(text(sql))
        dbm.commit()
        print("Released all locks for pipe processing")
    except:
        print(traceback.format_exc())


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
    if not dbm.find_user_by_user_name("admin"):
        user = User(
            user_name="admin",
            email="admin@example.com",
            email_confirmed_at=datetime.utcnow(),
            password="admin",
            first_name="LOST",
            last_name="Admin",
        )
        dbm.save_obj(user)
        # create user's default group
        g = Group(name=user.user_name, is_user_default=True)
        dbm.save_obj(g)
        ug = UserGroups(group_id=g.idx, user_id=user.idx)
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
    lost_fs = dbm.get_fs("default")
    if lost_fs is None:
        print("Create first FileSystem entry for default in database")
        lost_fs = model.FileSystem(
            connection=json.dumps(lostconfig.data_fs_args),
            name="default",
            root_path=lostconfig.data_path,
            timestamp=datetime.utcnow(),
            fs_type=lostconfig.data_fs_type,
            group_id=admin_default_group,
        )
    else:
        print("Update FileSystem entry for default fs in database")
        lost_fs.connection = json.dumps(lostconfig.data_fs_args)
        lost_fs.root_path = lostconfig.data_path
        lost_fs.fs_type = lostconfig.data_fs_type
    dbm.save_obj(lost_fs)


def create_lost_default_instruction_entry(dbm, lostconfig, admin_default_group):
    ins = dbm.session.query(model.Instruction).filter(model.Instruction.option == "Bounding Box").first()
    if ins is None:
        print("Create default instruction entry in database")
        ins = model.Instruction(
            option="Bounding Box",
            description=("Please draw bounding boxes for all objects in the image.\n\n"),
            instruction="Use the bounding box tool to annotate every object.![Image](http://localhost/api/media/media-file?path=%2Fhome%2Flost%2Fdata%2F1%2Finstruction_media%2FAnnotationExample.png)",
            is_deleted=False,
            group_id=None,
        )
        dbm.save_obj(ins)
    else:
        print("Default instruction entry already exists in database")


# def create_project_config(dbm):
#     pc = ProjectConfigMan(dbm)
#     print ('Try to create default project config!')
#     try:
#         pc.create_entry('default_language', 'en', description='Default selected language.')
#     except:
#         print('Project config already exists!')


def import_ootb_pipelines(dbm, user):

    def git(*args):
        return subprocess.check_call(["git"] + list(args))

    fm = AppFileMan(LOST_CONFIG)
    git_url = LOST_CONFIG.initial_pipeline_import_url
    if git_url != "":
        git_branch = LOST_CONFIG.initial_pipeline_import_branch
        git_project = os.path.splitext(os.path.basename(git_url))[0]
        upload_path = fm.get_upload_path(user.idx, git_project)
        if git_branch == "main":
            git("clone", git_url, upload_path)
        else:
            git("clone", git_url, upload_path, "-b", git_branch)
        pp_path = fm.get_pipe_project_path()
        dst_dir = os.path.basename(upload_path)
        dst_path = os.path.join(pp_path, dst_dir)
        shutil.copytree(upload_path, dst_path, dirs_exist_ok=True)

        importer = template_import.PipeImporter(dst_path, dbm)
        importer.start_import()
        shutil.rmtree(upload_path)

    # old way
    # fm = AppFileMan(lostconfig)
    # src_path = '/code/lost/pyapi/examples/pipes/lost'
    # pp_path = fm.get_pipe_project_path()
    # dst_path = os.path.join(pp_path, os.path.basename(src_path))
    # #try:
    # shutil.copytree(src_path, dst_path, dirs_exist_ok=False)
    # importer = template_import.PipeImporter(dst_path, dbm)
    # importer.start_import()


def copy_example_images(dbm, lostconfig, user):
    if lostconfig.add_examples:
        src_path = "/code/lost/pyapi/examples/images"
        admin_fs = dbm.get_user_default_fs(user.idx)
        ufa = UserFileAccess(dbm, user, admin_fs)
        print(f"Copy example images from {src_path} to {ufa.get_media_path()}")
        ufa.fm.fs.put(src_path, ufa.get_media_path(), recursive=True)


def copy_instruction_media(dbm, lostconfig, user):
    if lostconfig.add_examples:
        src_path = "/code/lost/pyapi/examples/instruction_media/AnnotationExample.png"
        admin_fs = dbm.get_user_default_fs(user.idx)
        ufa = UserFileAccess(dbm, user, admin_fs)
        ufa.fm.fs.put(src_path, ufa.get_instruction_media_path(), recursive=True)


def import_example_label_trees(dbm, lostconfig):
    if lostconfig.add_examples:
        tree = LabelTree(dbm)
        src_pathes = [
            "/code/lost/pyapi/examples/label_trees/pascal_voc2012.csv",
            "/code/lost/pyapi/examples/label_trees/dummy_label_tree.csv",
        ]

        for src_path in src_pathes:
            df = pd.read_csv(src_path)
            tree.import_df(df)


if __name__ == "__main__":
    main()
