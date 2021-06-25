import argparse
from lost.logic.pipeline import cron
from lost.logic.pipeline import worker
from lost.logic import config
from lost.db.access import DBMan
import time
import threading
from dask.distributed import Client
from lost.logic.log import get_file_logger
from lost.logic.file_man import FileMan, AppFileMan
import logging

def process_pipes(log_name):
    lostconfig = config.LOSTConfig()
    dbm = DBMan(lostconfig)
    client = Client('{}:{}'.format(
        lostconfig.scheduler_ip, lostconfig.scheduler_port)
    )
    pipe_list = dbm.get_pipes_to_process()
    # For each task in this project
    for p in pipe_list:
        pipe_man = cron.PipeEngine(dbm=dbm, pipe=p, lostconfig=lostconfig, 
            client=client, logger_name=log_name)
        pipe_man.process_pipeline()
    dbm.close_session()

def process_pipes_loop(log_name):
    lostconfig = config.LOSTConfig()
    logger = logging.getLogger(log_name)
    logger.info('Starting process_pipes_loop')
    while True:
        process_pipes()
        time.sleep(lostconfig.pipe_schedule)

def worker_lifesign_loop(log_name):
    lostconfig = config.LOSTConfig()
    logger = logging.getLogger(log_name)
    logger.info('Starting worker_lifesign_loop')
    while True:
        worker.send_life_sign()
        time.sleep(lostconfig.worker_beat)

def release_annos_loop(log_name):
    lostconfig = config.LOSTConfig()
    logger = logging.getLogger(log_name)
    logger.info('Starting release_annos_loop')
    while True:
        c_imgs, c_annos = jobs.release_annos_on_session_timeout()
        logger.info('Released img_annos: {}, 2d_annos: {}'.format(c_imgs, c_annos))
        time.sleep(lostconfig.session_timeout*60)

def main():
    parser = argparse.ArgumentParser(description='Run LOST cronjobs')
    parser.add_argument('--debug', action='store_true',
                        help='start cronjobs just once for debugging')
    args = parser.parse_args()
    fm = AppFileMan(config.LOSTConfig())
    log_name = 'cron_jobs'
    logger = get_file_logger(log_name, fm.get_app_log_path('cron_jobs.log') )
    logger.info('Starting cron jobs!')
    if args.debug:
        t = threading.Thread(
            target=worker_lifesign_loop,
            args=(log_name,),
            daemon=True
        )
        t.start()
        process_pipes(log_name)
    else:
        jobs = [
            process_pipes_loop,
            worker_lifesign_loop,
            release_annos_loop
        ]
        threads = []
        for j in jobs:
            t = threading.Thread(
                target=j, 
                args=(log_name,),
                daemon=True
            )
            t.start()
            threads.append(t)
        [t.join() for t in threads]

if __name__ == "__main__":
    main()