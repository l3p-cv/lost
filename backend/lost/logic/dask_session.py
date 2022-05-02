import os
from datetime import date, datetime, timedelta
from lost.logic.pipeline import exec_utils
from dask.distributed import Client
import logging
from time import sleep
# from lost.lost_session import lost_session
from lost.logic.file_man import AppFileMan, FileMan
import lostconfig

config = lostconfig.LOSTConfig()

def get_client(user):
    if config.worker_management == 'dynamic':
        client = ds_man.get_dask_client(user)
    else:
        client = Client('{}:{}'.format(
            config.scheduler_ip, config.scheduler_port)
        )
    return client
    
def _read_fs_img(fs, img_path):
    fm = FileMan(fs_db=fs)
    try:
        fm.fs.ls(img_path)
    except:
        pass
    img = fm.load_img(img_path)
    return img

def _user_key(user):
    # return user.idx
    return getattr(user, config.dask_user_key)

def release_client_by_timeout_loop(log_name):
    logger = logging.getLogger(log_name)    
    logger.info('Run release_client_by_timeout_loop')
    while True:
        ds_man.shutdown_timed_out_clients(logger)
        sleep(config.session_timeout / 2)

class DaskSessionMan(object):
    def __init__(self):
        self.session = dict()
        self.lostconfig = lostconfig.LOSTConfig()

    def create_user_cluster(self, user):
        if self.lostconfig.worker_management == 'dynamic':
            if self.lostconfig.dask_spawn_as_proxy_user:
                # Spawn cluster as specific proxy user
                cluster = self.lostconfig.DaskCluster(user=_user_key(user), **self.lostconfig.cluster_arguments)
            else:
                cluster = self.lostconfig.DaskCluster(**self.lostconfig.cluster_arguments)
            client = self.lostconfig.DaskClient(cluster)
            self.session[_user_key(user)] = {
                'client': client,
                'timestamp': datetime.utcnow()
            }
        else:
            raise Exception('Can only use create_cluster in dynamic worker management mode!')
        return cluster, client
    
    def refresh_user_session(self, user):
        if _user_key(user) in self.session: 
            self.session[_user_key(user)]['timestamp'] = datetime.utcnow()

    def shutdown_timed_out_clients(self, logger=None):
        present = datetime.utcnow()
        timeout_time = present - timedelta(seconds=self.lostconfig.session_timeout)
        keys = []
        for key, val in self.session.items():
            if val['timestamp'] < timeout_time:
                keys.append(key)
        for key in keys:
            self.session[key]['client'].shutdown()
            self.session.pop(key)
            if logger is not None:
                logger.info('Release client cluster for user: {}'.format(key))
                logger.info('Present time: {}'.format(present.isoformat()))
                logger.info('Timeout time: {}'.format(timeout_time.isoformat()))
                logger.info('Client timestamp: {}'.format(val['timestamp'].isoformat()))

    def get_dask_client(self, user):
        '''Get dask client for a specific user.

        Args:
            user (model.User): A lost user.

        Note:
            If no cluster available for this user, a new cluster will be created.

        Returns:
            dask.Client: A dask client for a specific user cluster.
        '''
        user_key = _user_key(user)
        if user_key in self.session:
            return self.session[user_key]['client']
        else:
            cluster, client = self.create_user_cluster(user)
            return client

    def shutdown_cluster(self, user):
        if _user_key(user) in self.session:
            self.session[_user_key(user)]['client'].shutdown()
            return self.session.pop(_user_key(user))

    def read_fs_img(self, user, fs, img_path):
        client = self.get_dask_client(user)
        # client = self.session[_user_key(user)]['client']
        img = client.submit(_read_fs_img, fs, img_path)
        return img.result()

class PipeProjectPackageMan(object):
    '''Remember which pipe project versions are present for which client'''

    def __init__(self):
        self.mem = dict()
        self.fm = AppFileMan(config)
    
    def _get_import_and_update(self, client, pp_path, script_import_name, pp_hash=None):
        client_id = id(client)
        if pp_hash is None:
            pp_hash = exec_utils.get_module_hash(pp_path)
        if client_id in self.mem:
            if pp_path in self.mem[client_id]:
                if pp_hash == self.mem[client_id][pp_path]['hash']:
                    return False, self.mem[client_id][pp_path]['import']
                else:
                    self.mem[client_id][pp_path]['hash'] = pp_hash
                    self.mem[client_id][pp_path]['import'] = script_import_name
                    return True, script_import_name
            else:
                self.mem[client_id][pp_path] = dict()
                self.mem[client_id][pp_path]['hash'] = pp_hash
                self.mem[client_id][pp_path]['import'] = script_import_name
                return True, script_import_name 
        else:
            self.mem[client_id] = {pp_path: dict()}
            self.mem[client_id][pp_path]['hash'] = pp_hash
            self.mem[client_id][pp_path]['import'] = script_import_name
            return True, script_import_name
    
    def prepare_import(self, client, pp_path, script_name, logger=None):
        if logger is not None:
            logger.info('pp_path: {}'.format(pp_path))
        timestamp = datetime.now().strftime("%m%d%Y%H%M%S")
        packed_pp_path = self.fm.get_packed_pipe_path(
            f'{os.path.basename(pp_path)}.zip', timestamp
        )
        if logger is not None:
            logger.info('packed_pp_path: {}'.format(packed_pp_path))
        new_import_name = exec_utils.get_import_name_by_script(
            script_name, timestamp)
        update, import_name = self._get_import_and_update(
            client, pp_path, new_import_name
        )
        if update:
            exec_utils.zipdir(pp_path, packed_pp_path, timestamp)
            upload_ret = client.upload_file(packed_pp_path)
            if logger is not None:
                logger.info(f'Upload file:{upload_ret}')
        if logger is not None:
            logger.info(f'import_name:{import_name}')
        return import_name


ppp_man = PipeProjectPackageMan()
ds_man = DaskSessionMan()