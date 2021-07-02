from lost.db import model
# from celery.utils.log import get_task_logger
# from celery import task
from lostconfig import LOSTConfig
from lost.db.access import DBMan
from datetime import datetime, timedelta
import json

def register_worker(dbm, lostconfig):
    worker = model.Worker(
        env_name=lostconfig.env_name,
        worker_name=lostconfig.worker_name,
        timestamp=datetime.utcnow(),
        register_timestamp=datetime.utcnow(),
        resources='[]'
    )
    dbm.add(worker)
    dbm.commit()

def init_worker_on_startup():
    lostconfig = LOSTConfig()
    dbm = DBMan(lostconfig)
    worker = dbm.get_worker(lostconfig.worker_name)
    if worker is None:
        register_worker(dbm, lostconfig)
        print('Registered worker: {}'.format(lostconfig.worker_name))
    else:
        worker.timestamp = datetime.utcnow()
        worker.resources = '[]'
        worker.in_progress = '{}'
        dbm.add(worker)
        dbm.commit()
        print('Reset worker on startup: {}'.format(worker.worker_name))
    dbm.close_session()
    

def send_life_sign():
    # logger = get_task_logger(__name__)
    lostconfig = LOSTConfig()
    dbm = DBMan(lostconfig)
    worker = dbm.get_worker(lostconfig.worker_name)
    if worker is None:
        register_worker(dbm, lostconfig)
        # logger.info('Registered worker: {}'.format(lostconfig.worker_name))
    else:
        worker.timestamp = datetime.utcnow()
        dbm.add(worker)
        dbm.commit()
        #logger.info('Sent lifesign: {}'.format(worker.worker_name))
    dbm.close_session()
    


class WorkerMan(object):
    '''Class to manage workers in LOST'''

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

class CurrentWorker(object):
    '''Class that represant the current worker in which this code is executed
    '''

    def __init__(self, dbm, lostconfig):
        self.dbm = dbm
        self.lostconfig = lostconfig
        self.worker = self.get_worker()

    def get_worker(self):
        '''Get worker of this container
        
        Returns:
            :class:`model.Worker`
        '''
        return self.dbm.get_worker(self.lostconfig.worker_name)

    def _lock_worker(self):
        '''Lock this worker that only current script can be executed and no others'''
        self.worker.resources = json.dumps(['lock_all'])

    def _unlock_worker(self):
        self.worker.resources = json.dumps([])

    def add_script(self, pipe_e, script):
        '''Add a script that is currently executed by this worker
        
        Args:
            script (:class:`model.PipeElement`): Pipeline element that is related to script.
            script (:class:`model.Script`): Script that is executed.
        '''
        self.worker = self.dbm.get_worker_and_lock(self.lostconfig.worker_name)
        if self.worker.in_progress is not None:
            scripts = json.loads(self.worker.in_progress)
        else:
            scripts =  {}
        scripts[pipe_e.idx] = script.path
        self.worker.in_progress = json.dumps(scripts)
        if script.resources:
            if 'lock_all' in json.loads(script.resources):
                self._lock_worker()
        self.dbm.add(self.worker)
        self.dbm.commit()

    def remove_script(self, pipe_e, script):
        '''Remove a script that has finished
        
        Args:
            script (:class:`model.PipeElement`): Pipeline element that is related to script.
            script (:class:`model.Script`): Script that is executed.
        '''
        self.worker = self.dbm.get_worker_and_lock(self.lostconfig.worker_name)
        if self.worker.in_progress is not None:
            scripts = json.loads(self.worker.in_progress)
        else:
            return
        try:
            scripts.pop(str(pipe_e.idx))
        except:
            print('Could not find pipe_element id to remove script from worker!')
        self.worker.in_progress = json.dumps(scripts)
        if self.worker.resources:
            if 'lock_all' in json.loads(script.resources):
                self._unlock_worker()
        self.dbm.add(self.worker)
        self.dbm.commit()

    def enough_resources(self, script):
        '''Check if this worker has enough resources to execute a script.

         Args:
            script (:class:`model.Script`): Script that is executed.

        Returns:
            bool: True if worker has enough resources to execute script.
        '''
        worker = self.worker
        if worker.resources:
            res = json.loads(worker.resources)
            if 'lock_all' in res:
                return False
            else:
                return True
        else:
            return True