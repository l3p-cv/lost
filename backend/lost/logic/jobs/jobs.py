import argparse
import logging
import os
import traceback
from datetime import datetime, timedelta
from io import BytesIO
from zipfile import ZipFile

import lost_ds as lds
from lost_ds.util import prep_parquet

from lost.logic.db_access import UserDbAccess
from lost.logic.file_access import UserFileAccess
from lost.logic.file_man import FileMan
from lost.logic.log import get_graylog_logger
from lost.pyapi import pipe_elements

try:
    import lostconfig as config
    from lost.db import access, state
    from lost.db.access import DBMan
except:
    logging.exception(traceback.format_exc())


def get_args():
    aparser = argparse.ArgumentParser(description="Execute a job.")
    aparser.add_argument("--logfile", nargs="?", action="store", help='Path logfile. ["pipe_cron.log"]')
    aparser.add_argument(
        "--debug", nargs="?", action="store", help="true, if exec_pipe should start in debug mode. [false]"
    )
    args = aparser.parse_args()

    if args.logfile is None:
        raise Exception("A logfile argument is required!")
    else:
        logfile = args.logfile

    if args.debug is None:
        debug = False
    else:
        debug = args.debug.lower() == "true"
    if debug:
        logging.basicConfig(filename=logfile, filemode="a", level=logging.DEBUG, format="%(asctime)s %(message)s")
    else:
        logging.basicConfig(filename=logfile, filemode="a", level=logging.INFO, format="%(asctime)s %(message)s")

    return config.LOSTConfig()


def _unlock_anno(anno):
    if anno.state == state.Anno.LABELED_LOCKED:
        anno.state = state.Anno.LABELED
    else:
        anno.state = state.Anno.UNLOCKED
    return anno


def force_anno_release(dbm, anno_task_id):
    """Force a release of all annotations that are currently locked by a user for annotation

    Args:
        dbm (DBMan): Database manager
        anno_task_id (int): Id of the annotation task
    """
    c_imgs = 0
    c_2dannos = 0
    for anno in dbm.get_locked_img_annos(anno_task_id):
        anno = _unlock_anno(anno)
        dbm.add(anno)
        c_imgs += 1
    for anno in dbm.get_locked_two_d_annos(anno_task_id):
        anno = _unlock_anno(anno)
        dbm.add(anno)
        c_2dannos += 1
    dbm.commit()
    return c_imgs, c_2dannos


def release_annos_by_timeout(dbm, timeout):
    """Release annotations based on timeout

    Args:
        dbm (DBMan): Database manager
        timeout (int): Timeout in minutes when annotations should be released
    """
    c_imgs = 0
    c_2dannos = 0
    present = datetime.now()
    unlock_time = present - timedelta(minutes=timeout)
    for anno_task in dbm.get_anno_task(state=state.AnnoTask.IN_PROGRESS):
        for anno in dbm.get_locked_img_annos(anno_task.idx):
            if anno.timestamp_lock is not None:
                if anno.timestamp_lock < unlock_time:
                    anno = _unlock_anno(anno)
                    dbm.add(anno)
                    c_imgs += 1
        for anno in dbm.get_locked_two_d_annos(anno_task.idx):
            if anno.timestamp_lock is not None:
                if anno.timestamp_lock < unlock_time:
                    anno = _unlock_anno(anno)
                    dbm.add(anno)
                    c_2dannos += 1
        dbm.commit()
    return c_imgs, c_2dannos


def release_user_annos(dbm, user_id):
    """Release locked annos for a specific user.

    Args:
        dbm (object): DBMan object.
        user_id (int): ID of the user to release locked annos.
    """
    # print('Was Here! User id is: {}'.format(user_id))
    for anno_task in dbm.get_anno_task(state=state.AnnoTask.IN_PROGRESS):
        locked_annos = dbm.get_locked_img_annos(anno_task.idx)
        # print('locked annos')
        # print(locked_annos)
        # for anno in locked_annos:
        #     print('UserID: {}'.format(anno.user_id))
        locked_user_annos = [anno for anno in locked_annos if anno.user_id == user_id]
        # print(locked_user_annos)
        for anno in locked_user_annos:
            anno = _unlock_anno(anno)
            dbm.add(anno)

        locked_annos = dbm.get_locked_two_d_annos(anno_task.idx)
        # print('locked 2d annos')
        # print(locked_annos)
        # for anno in locked_annos:
        #     print('UserID: {}'.format(anno.user_id))
        locked_user_annos = [anno for anno in locked_annos if anno.user_id == user_id]
        # print(locked_user_annos)
        for anno in locked_user_annos:
            anno = _unlock_anno(anno)
            dbm.add(anno)
        dbm.commit()


def release_annos_on_session_timeout():
    lostconfig = config.LOSTConfig()
    dbm = DBMan(lostconfig)
    c_imgs, c_2dannos = release_annos_by_timeout(dbm, lostconfig.session_timeout)
    dbm.close_session()
    return c_imgs, c_2dannos


def remove_empty_annos_by_timeout(dbm, timeout):
    """Remove empty annotations based on timeout

    When new annotations are created in SIA, empty annotations will be created
    in oder to get an two_d_anno ID for db, which avoids db synchronisation
    problems. If SIA will not send an annotation with the created id back to
    the backend a zombie annotation is present in db.
    This method will take care of such zombies :-)

    Args:
        dbm (DBMan): Database manager
        timeout (int): Timeout in minutes when empty annotations should be removed
    """
    c_2dannos = 0
    present = datetime.now()
    unlock_time = present - timedelta(minutes=timeout)
    anno_list = dbm.get_lonely_two_d_annos()
    for anno in anno_list:
        if anno.timestamp is not None:
            if anno.timestamp < unlock_time:
                dbm.delete(anno)
                c_2dannos += 1
    dbm.commit()
    return c_2dannos


def remove_empty_annos():
    lostconfig = config.LOSTConfig()
    dbm = DBMan(lostconfig)
    c_2dannos = remove_empty_annos_by_timeout(dbm, lostconfig.session_timeout)
    dbm.close_session()
    return c_2dannos


def get_file_ext_from_export_type(export_type):
    if export_type == "LOST_Dataset":
        return ".parquet"
    elif export_type == "CSV":
        return ".csv"
    else:
        raise NotImplementedError(f"Unsupported export type: {export_type}")


def write_df(base_path, df, export_type, zip_file=None, fs_stream=None):
    def write_stream(zip_dir, bytestream):
        if zip_file is not None:
            zip_file.writestr(zip_dir, bytestream.read())
        elif fs_stream is not None:
            fs_stream.write(bytestream.read())
        else:
            raise Exception("Either zip_file or fs_stream need to be provided!")

    df = prep_parquet(df, True)
    # ds = lds.LOSTDataset(df)
    if export_type == "LOST_Dataset":
        zip_dir = f"{base_path}.parquet"
        with BytesIO() as bytestream:
            # bytestream = BytesIO()
            df.to_parquet(bytestream)
            bytestream.seek(0)
            write_stream(zip_dir, bytestream)
            # if zip_file is not None:
            #     zip_file.writestr(zip_dir_parquet, bytestream.read())
            # elif fs_stream is not None:
            #     fs_stream.write(bytestream.read())
            # else:
            #     raise Exception('Either zip_file or fs_stream need to be provided!')
    elif export_type == "CSV":
        zip_dir_csv = f"{base_path}.csv"
        # Write csv file
        with BytesIO() as bytestream:
            df.to_csv(bytestream, sep=",", header=True, index=False)
            bytestream.seek(0)
            write_stream(zip_dir_csv, bytestream)
            # zip_file.writestr(zip_dir_csv, bytestream.read())
    else:
        raise NotImplementedError(f"Unsupported export type: {export_type}")


def export_ds(pe_id, user_id, export_id, export_name, splits, export_type, include_imgs, annotated_images_only):
    try:
        dbm = access.DBMan(config.LOSTConfig())
        ate = dbm.get_anno_task_export(anno_task_export_id=export_id)
        user = dbm.get_user(user_id)
        fs_db = dbm.get_user_default_fs(user_id)
        dba = UserDbAccess(dbm, user_id)
        ufa = UserFileAccess(dbm, user, fs_db)
        pe = dba.get_alien(pe_id)

        alien = pipe_elements.AnnoTask(pe, dbm)
        my_logger = get_graylog_logger("export_ds")
        my_logger.info(
            f"pe_id: {pe_id}, user_id: {user_id}, export_id: {export_id}, export_name: {export_name}, splits: {splits}, export_type: {export_type}, include_images: {include_imgs}, annotated_images_only: {annotated_images_only}"
        )

        df = alien.inp.to_df()
        if annotated_images_only:
            df = df[df["img_state"] == 4]
        fs_name = df.img_fs_name.unique()[0]
        # src_fs = self.get_fs(name=fs_name)
        src_fs = ufa.get_fs(name=fs_name)
        # dst_fs = self.get_fs()
        dst_fs = ufa.get_user_default_fs()
        ds = lds.LOSTDataset(df, src_fs)
        root_path = ufa.get_export_ds_path(export_id)
        root_path = os.path.join(root_path, f"{export_name}")
        # root_path = self.get_path(self.get_arg('ds_name'), context='instance')

        def progress_callback(pg):
            ate.progress = pg
            dbm.save_obj(ate)

        if not include_imgs and splits is None:
            df = ds.df
            # df['img_path'] = df['img_path'].apply(lambda x: os.path.join(*x.split('/')[-2:]))
            root_path = f"{root_path}{get_file_ext_from_export_type(export_type)}"
            ate.file_path = root_path
            dbm.save_obj(ate)
            with dst_fs.open(root_path, "wb") as f:
                write_df(root_path, df, export_type, fs_stream=f)
        else:
            root_path = f"{root_path}.zip"
            ate.file_path = root_path
            dbm.save_obj(ate)
            with dst_fs.open(root_path, "wb") as f, ZipFile(f, "w") as zip_file:
                if include_imgs:
                    df = lds.pack_ds(
                        ds.df, root_path, filesystem=src_fs, zip_file=zip_file, progress_callback=progress_callback
                    )
                    df["img_path"] = df["img_path"].apply(lambda x: os.path.join(*x.split("/")[-2:]))
                else:
                    df = ds.df
                out_base = os.path.basename(root_path)
                out_base = os.path.splitext(out_base)[0]
                if splits is not None:
                    ds = lds.LOSTDataset(df)
                    df_splits = ds.split_by_img_path(test_size=float(splits["test"]), val_size=float(splits["val"]))
                    df_names = ["train", "test", "val"]
                    for s in df_splits:
                        df_name = df_names.pop()
                        df_path = os.path.join(out_base, df_name)
                        write_df(df_path, s, export_type, zip_file)
                else:
                    df_path = os.path.join(out_base, "ds")
                    write_df(df_path, df, export_type, zip_file)
                    # Write parquet file
        my_info = dst_fs.info(root_path)

        ate.file_size = str(my_info["size"])
        ate.progress = 100
        dbm.save_obj(ate)
        dbm.close_session()
        return root_path
    except:
        my_logger.error(traceback.format_exc())


def delete_ds_export(export_id, user_id):
    dbm = access.DBMan(config.LOSTConfig())
    user = dbm.get_user(user_id)
    fs_db = dbm.get_user_default_fs(user_id)
    ufa = UserFileAccess(dbm, user, fs_db)
    export_path = ufa.get_export_ds_path(export_id)
    ufa.rm(export_path, True)
    dbm.close_session()


def delete_whole_ds_export(file_path, user_id):
    dbm = access.DBMan(config.LOSTConfig())
    user = dbm.get_user(user_id)
    fs_db = dbm.get_user_default_fs(user_id)
    ufa = UserFileAccess(dbm, user, fs_db)
    ufa.rm(file_path, True)
    dbm.close_session()


def get_all_annotask_pe_ids_for_dataset(dbm: access.DBMan, ds_id):
    res_list = list()
    child_datasets = dbm.get_child_datasets_by_parent_ds_id(ds_id)
    for cd in child_datasets:
        res_list += get_all_annotask_pe_ids_for_dataset(dbm, cd.idx)
    anno_tasks = dbm.get_anno_tasks_by_dataset_id(ds_id)
    for at in anno_tasks:
        res_list.append(at.pipe_element_id)
        # pe = dba.get_alien(at.pipe_element_id)
        # alien = pipe_elements.AnnoTask(pe, dbm)
        # res_list.append(alien)
    return res_list


def get_all_annotask_ids_for_ds(dbm: access.DBMan, ds_id):
    res_list = list()
    child_datasets = dbm.get_child_datasets_by_parent_ds_id(ds_id)
    for cd in child_datasets:
        res_list += get_all_annotask_ids_for_ds(dbm, cd.idx)
    anno_tasks = dbm.get_anno_tasks_by_dataset_id(ds_id)
    for at in anno_tasks:
        res_list.append(at.idx)
        # pe = dba.get_alien(at.pipe_element_id)
        # alien = pipe_elements.AnnoTask(pe, dbm)
        # res_list.append(alien)
    return res_list


def export_dataset_parquet(user_id, path, fs_id, dataset_id, annotated_only):
    try:
        my_logger = get_graylog_logger("export_dataset_parquet")
        my_logger.info(f"Start dataset export for ds: {dataset_id}, on fs: {fs_id} to path: {path}")
        dbm = access.DBMan(config.LOSTConfig())
        dba = UserDbAccess(dbm, user_id)
        fs_db = dbm.get_fs(fs_id=fs_id)
        fm = FileMan(fs_db=fs_db)
        store_dir = os.path.split(path)[0]
        fm.mkdirs(store_dir, exist_ok=True)
        # store_path = os.path.join(store_dir, f'{dataset_id}.parquet')
        store_path = path
        dataset = dbm.get_dataset(dataset_id)
        dataset_export = dbm.create_dataset_export(dataset_id=dataset.idx, file_path=store_path, progress=1)

        if dataset is not None:
            pe_id_list = get_all_annotask_pe_ids_for_dataset(dbm, dataset_id)

            df_list = []
            for pe_id in pe_id_list:
                try:
                    pe = dba.get_alien(pe_id)
                    alien = pipe_elements.AnnoTask(pe, dbm)
                    my_logger.info(f"Start export of annotask: **{alien.name}** with id: {alien.idx}")
                    df = alien.inp.to_df()
                    if annotated_only:
                        df = df[df["img_state"] == 4]
                    df_list.append(df)
                except:
                    my_logger.warning(traceback.format_exc())
        else:
            my_logger.warning(f"Dataset not found ds_id: {dataset_id}!")

        ds = lds.LOSTDataset(df_list, fm.fs)
        ds.to_parquet(store_path)
        my_logger.info(f"Export to {path} was successfull!")
        dataset_export.progress = 100
        dbm.commit()

    except:
        my_logger.error(traceback.format_exc())
