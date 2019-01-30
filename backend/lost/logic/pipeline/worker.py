from lost.db import model
from celery.utils.log import get_task_logger
from celery import task
from lost.logic.config import LOSTConfig
from lost.db.access import DBMan
from datetime import datetime, timedelta
import json

def register_worker(dbm, lostconfig):
    worker = model.Worker(
        env_name=lostconfig.env_name,
        worker_name=lostconfig.worker_name,
        timestamp=datetime.utcnow(),
        register_timestamp=datetime.utcnow(),
    )
    dbm.add(worker)
    dbm.commit()


@task
def send_life_sign():
    logger = get_task_logger(__name__)
    lostconfig = LOSTConfig()
    dbm = DBMan(lostconfig)
    worker = dbm.get_worker(lostconfig.worker_name)
    if worker is None:
        register_worker(dbm, lostconfig)
        logger.info('Registered worker: {}'.format(lostconfig.worker_name))
    else:
        worker.timestamp = datetime.utcnow()
        dbm.add(worker)
        dbm.commit()
        logger.info('Sent lifesign: {}'.format(worker.worker_name))


class WorkerMan(object):
    def __init__(self, dbm, lostconfig):
        self.dbm = dbm
        self.lostconfig = lostconfig

    def get_living_worker(self):
        '''Get list of worker that are alive
        
        Returns:
            list of :class:`model.Worker`
        '''
        worker_list = self.dbm.get_worker()
        to_old = datetime.utcnow() - timedelta(seconds=int(self.lostconfig.worker_timeout))
        living = list(filter(lambda x: x.timestamp > to_old, worker_list))
        return living

    def get_worker_envs(self):
        '''Get a set fo envs from all living workers
        
        Returns:
            set of str
        '''
        env_set = set()
        for w in self.get_living_worker():
            env_set.add(w.env_name)
        return env_set

    def get_worker(self):
        '''Get worker of this container
        
        Returns:
            :class:`model.Worker`
        '''
        return self.dbm.get_worker(self.lostconfig.worker_name)

    def add_script(self, pe_id, path):
        '''Add a script that is currently executed by this worker
        
        Args:
            pe_id (int): PipeElement ID related to the script.
            path (str): Path to the script
        '''
        worker = self.get_worker()
        if worker.in_progress is not None:
            scripts = json.loads(worker.in_progress)
        else:
            scripts =  {}
        scripts[pe_id] = path
        worker.in_progress = json.dumps(scripts)
        self.dbm.add(worker)
        self.dbm.commit()

    def remove_script(self, pe_id):
        '''Remove a script that has finished
        
        Args:
            pe_id (int): PipeElement ID related to the script.
        '''
        worker = self.get_worker()
        if worker.in_progress is not None:
            scripts = json.loads(worker.in_progress)
        else:
            return
        scripts.pop(str(pe_id))
        worker.in_progress = json.dumps(scripts)
        self.dbm.add(worker)
        self.dbm.commit()

