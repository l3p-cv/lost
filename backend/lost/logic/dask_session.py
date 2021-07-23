from datetime import date, datetime, timedelta
import logging
from time import sleep
# from lost.lost_session import lost_session
from lost.logic.file_man import FileMan
import lostconfig

config = lostconfig.LOSTConfig()

def _read_fs_img(fs, img_path):
    fm = FileMan(fs_db=fs)
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


ds_man = DaskSessionMan()