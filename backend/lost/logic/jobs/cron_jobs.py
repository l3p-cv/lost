import argparse
from lost.logic.pipeline import cron
from lost.logic.pipeline import worker
from lost.logic import config
from lost.db.access import DBMan
import time
import threading
from dask.distributed import Client

def process_pipes():
    lostconfig = config.LOSTConfig()
    dbm = DBMan(lostconfig)
    client = Client('{}:{}'.format(
        lostconfig.scheduler_ip, lostconfig.scheduler_port)
    )
    pipe_list = dbm.get_pipes_to_process()
    # For each task in this project
    for p in pipe_list:
        pipe_man = cron.PipeEngine(dbm=dbm, pipe=p, lostconfig=lostconfig, client=client)
        pipe_man.process_pipeline()
    dbm.close_session()

def process_pipes_loop():
    lostconfig = config.LOSTConfig()
    while True:
        process_pipes()
        time.sleep(int(lostconfig.pipe_schedule))

def worker_lifesign_loop():
    lostconfig = config.LOSTConfig()
    while True:
        worker.send_life_sign()
        time.sleep(int(lostconfig.worker_beat))

def main():
    parser = argparse.ArgumentParser(description='Run LOST cronjobs')
    parser.add_argument('--debug', action='store_true',
                        help='start cronjobs just once for debugging')
    args = parser.parse_args()
    if args.debug:
        t = threading.Thread(
            target=worker_lifesign_loop,
            daemon=True
        )
        t.start()
        process_pipes()
    else:
        jobs = [process_pipes_loop, worker_lifesign_loop]
        threads = []
        for j in jobs:
            t = threading.Thread(
                target=j, 
                daemon=True
            )
            t.start()
            threads.append(t)
        [t.join() for t in threads]

if __name__ == "__main__":
    main()