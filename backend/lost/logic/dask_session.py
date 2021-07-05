# from lost.lost_session import lost_session
from lost.logic.file_man import FileMan
import lostconfig

def _read_fs_img(fs, img_path):
    fm = FileMan(fs_db=fs)
    img = fm.load_img(img_path)
    return img

def _user_key(user):
    return user.idx

class DaskSessionMan(object):
    def __init__(self):
        self.session = dict()
        self.lostconfig = lostconfig.LOSTConfig()

    def create_user_cluster(self, user):
        if self.lostconfig.worker_management == 'dynamic':
            #TODO: spawn cluster as specific user
            # cluster = self.lostconfig.DaskCluster(user=_user_key(user), **self.lostconfig.cluster_arguments)
            cluster = self.lostconfig.DaskCluster(**self.lostconfig.cluster_arguments)
            client = self.lostconfig.DaskClient(cluster)
            # global lost_session
            # lost_session[user] = {'client': client}
            self.session[_user_key(user)] = {'client': client}
        else:
            raise Exception('Can only use create_cluster in dynamic worker management mode!')
        return cluster, client

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
        if user in self.session:
            self.session[_user_key(user)]['client'].shutdown()
            self.session.pop(_user_key(user))
        return


    def read_fs_img(self, user, fs, img_path):
        client = self.session[_user_key(user)]['client']
        img = client.submit(_read_fs_img, fs, img_path)
        return img.result()


ds_man = DaskSessionMan()