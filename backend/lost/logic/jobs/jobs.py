import traceback
import logging
import os
import argparse
from datetime import datetime, timedelta

try:
    from lost.db import access
    from lost.logic.pipeline import cron
    from lost.logic import config
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

def exec_pipe():
    lostconfig = get_args()
    dbm = DBMan(lostconfig)
    pipe_list = dbm.get_pipes_to_process()
    # For each task in this project
    for p in pipe_list:
       pipe_man = cron.PipeMan(dbm=dbm, pipe=p, lostconfig=lostconfig)
       pipe_man.process_pipeline()


def __release_project_annos(dbm):
    present = datetime.now()
    unlock_time = present - timedelta(hours=2)
    for anno_task in dbm.get_anno_task(state=state.AnnoTask.IN_PROGRESS):
        for anno in dbm.get_locked_img_annos(anno_task.idx):
            if anno.timestamp_lock < unlock_time:
                anno.state = state.Anno.UNLOCKED
                dbm.add(anno)
        for anno in dbm.get_locked_bbox_annos(anno_task.idx):
            if anno.timestamp_lock < unlock_time:
                anno.state = state.Anno.UNLOCKED
                dbm.add(anno)
        dbm.commit()

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

def release_annos():
    lostconfig = get_args()
    dbm = DBMan(lostconfig)
    __release_project_annos(dbm)
