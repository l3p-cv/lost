import argparse
import traceback
from lost.logic import dask_session
from lost.logic.pipeline import cron
from lost.logic.pipeline import worker
import lostconfig as config
from lost.db.access import DBMan
import time
import threading
from dask.distributed import Client
from lost.logic.log import get_file_logger
from lost.logic.file_man import FileMan, AppFileMan
import logging
from lost.logic.jobs import jobs
from lost.logic.dask_session import ds_man

def process_pipes(log_name, client):
    lostconfig = config.LOSTConfig()
    dbm = DBMan(lostconfig)
    pipe_list = dbm.get_pipes_to_process()
    # For each task in this project
    for p in pipe_list:
        pipe_man = cron.PipeEngine(dbm=dbm, pipe=p, lostconfig=lostconfig, 
            client=client, logger_name=log_name)
        pipe_man.process_pipeline()
    dbm.close_session()
        
def run_loop(run, sleep_time, **kwargs):
    logger = logging.getLogger(kwargs["log_name"])
    logger.info('Starting {} loop'.format(run.__name__))
    while True:
        try:
            run(**kwargs)
            time.sleep(sleep_time)
        except Exception as e:
            logger.error(traceback.format_exc())
            time.sleep(1)
            
def process_pipes_loop(log_name):
    lostconfig = config.LOSTConfig()
    if lostconfig.worker_management != 'dynamic':
        client = Client('{}:{}'.format(
            lostconfig.scheduler_ip, lostconfig.scheduler_port)
        )
    else:
        client = None
    run_loop(process_pipes, lostconfig.pipe_schedule, log_name=log_name, client=client)

def worker_lifesign(log_name):
    worker.send_life_sign()

def worker_lifesign_loop(log_name):
    lostconfig = config.LOSTConfig()
    run_loop(worker_lifesign, lostconfig.worker_beat, log_name=log_name)

def release_annos(log_name):
    logger = logging.getLogger(log_name)
    c_imgs, c_annos = jobs.release_annos_on_session_timeout()
    logger.info('Released img_annos: {}, 2d_annos: {}'.format(c_imgs, c_annos))

def release_annos_loop(log_name):
    lostconfig = config.LOSTConfig()
    run_loop(release_annos, lostconfig.session_timeout*60, log_name=log_name)

def remove_empty_annos(log_name):
    logger = logging.getLogger(log_name)
    c_annos = jobs.remove_empty_annos()
    logger.info('Removed {} empty 2d annos'.format(c_annos))

def remove_empty_annos_loop(log_name):
    lostconfig = config.LOSTConfig()
    run_loop(remove_empty_annos, lostconfig.session_timeout*60, log_name=log_name)

def main():
    parser = argparse.ArgumentParser(description='Run LOST cronjobs')
    parser.add_argument('--debug', action='store_true',
                        help='start cronjobs just once for debugging')
    args = parser.parse_args()
    lostconfig = config.LOSTConfig()
    fm = AppFileMan(lostconfig)
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
        client = Client('{}:{}'.format(
            lostconfig.scheduler_ip, lostconfig.scheduler_port)
        )
        process_pipes(log_name, client)
    else:
        jobs = [
            process_pipes_loop,
            worker_lifesign_loop,
            release_annos_loop, 
            remove_empty_annos_loop
        ]
        if lostconfig.worker_management == 'dynamic':
            jobs.append(dask_session.release_client_by_timeout_loop)
        jobs += lostconfig.extra_cron_jobs
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