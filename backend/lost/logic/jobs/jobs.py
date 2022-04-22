import traceback
import logging
import os
import argparse
from datetime import datetime, timedelta

try:
    from lost.db import access
    from lost.logic.pipeline import cron
    import lostconfig as config
    from lost.db.access import DBMan
    from lost.db import state
except:
    logging.error(traceback.format_exc())

def get_args():
    aparser = argparse.ArgumentParser(description='Execute a job.')
    aparser.add_argument('--logfile', nargs='?', action='store',
                        help='Path logfile. ["pipe_cron.log"]')
    aparser.add_argument('--debug', nargs='?', action='store',
                        help='true, if exec_pipe should start in debug mode. [false]')
    args = aparser.parse_args()

    if args.logfile is None:
        raise Exception('A logfile argument is required!')
    else:
        logfile = args.logfile

    if args.debug is None:
        debug = False
    else:
        debug = args.debug.lower() == 'true'
    if debug:
        logging.basicConfig(filename=logfile, filemode='a',level=logging.DEBUG,
                            format='%(asctime)s %(message)s')
    else:
        logging.basicConfig(filename=logfile, filemode='a',level=logging.INFO,
                            format='%(asctime)s %(message)s')

    return config.LOSTConfig()

def force_anno_release(dbm, anno_task_id):
    '''Force a release of all annotations that are currently locked by a user for annotation

    Args:
        dbm (DBMan): Database manager
        anno_task_id (int): Id of the annotation task
    '''
    c_imgs = 0
    c_2dannos = 0
    for anno in dbm.get_locked_img_annos(anno_task_id):
        anno.state = state.Anno.UNLOCKED
        dbm.add(anno)
        c_imgs += 1
    for anno in dbm.get_locked_two_d_annos(anno_task_id):
        anno.state = state.Anno.UNLOCKED
        dbm.add(anno)
        c_2dannos += 1
    dbm.commit()
    return c_imgs, c_2dannos

def release_annos_by_timeout(dbm, timeout):
    '''Release annotations based on timeout

    Args:
        dbm (DBMan): Database manager
        timeout (int): Timeout in minutes when annotations should be released
    '''
    c_imgs = 0
    c_2dannos = 0
    present = datetime.now()
    unlock_time = present - timedelta(minutes=timeout)
    for anno_task in dbm.get_anno_task(state=state.AnnoTask.IN_PROGRESS):
        for anno in dbm.get_locked_img_annos(anno_task.idx):
            if anno.timestamp_lock is not None:
                if anno.timestamp_lock < unlock_time:
                    anno.state = state.Anno.UNLOCKED
                    dbm.add(anno)
                    c_imgs += 1
        for anno in dbm.get_locked_two_d_annos(anno_task.idx):
            if anno.timestamp_lock is not None:
                if anno.timestamp_lock < unlock_time:
                    anno.state = state.Anno.UNLOCKED
                    dbm.add(anno)
                    c_2dannos += 1
        dbm.commit()
    return c_imgs, c_2dannos

def release_user_annos(dbm, user_id):
    '''Release locked annos for a specific user.

    Args:
        dbm (object): DBMan object.
        user_id (int): ID of the user to release locked annos.
    '''
    print('Was Here! User id is: {}'.format(user_id))
    for anno_task in dbm.get_anno_task(state=state.AnnoTask.IN_PROGRESS):
        locked_annos = dbm.get_locked_img_annos(anno_task.idx)
        print('locked annos')
        print(locked_annos)
        for anno in locked_annos:
            print('UserID: {}'.format(anno.user_id))
        locked_user_annos = [anno for anno in locked_annos if anno.user_id == user_id]
        print(locked_user_annos)
        for anno in locked_user_annos:
            anno.state = state.Anno.UNLOCKED
            dbm.add(anno)
                
        locked_annos = dbm.get_locked_two_d_annos(anno_task.idx)
        print('locked 2d annos')
        print(locked_annos)
        for anno in locked_annos:
            print('UserID: {}'.format(anno.user_id))
        locked_user_annos = [anno for anno in locked_annos if anno.user_id == user_id]
        print(locked_user_annos)
        for anno in locked_user_annos:
            anno.state = state.Anno.UNLOCKED
            dbm.add(anno)
        dbm.commit()

def release_annos_on_session_timeout():
    lostconfig = config.LOSTConfig()
    dbm = DBMan(lostconfig)
    c_imgs, c_2dannos = release_annos_by_timeout(dbm, lostconfig.session_timeout)
    dbm.close_session()
    return c_imgs, c_2dannos

def remove_empty_annos_by_timeout(dbm, timeout):
    '''Remove empty annotations based on timeout

    When new annotations are created in SIA, empty annotations will be created
    in oder to get an two_d_anno ID for db, which avoids db synchronisation
    problems. If SIA will not send an annotation with the created id back to
    the backend a zombie annotation is present in db. 
    This method will take care of such zombies :-) 

    Args:
        dbm (DBMan): Database manager
        timeout (int): Timeout in minutes when empty annotations should be removed
    '''
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