from ast import literal_eval
import subprocess
import logging
from os import environ as env
from time import sleep
import importlib
from dask.distributed import Client
# from dask_yarn import YarnCluster

def eval_env(name):
    try:
        res = literal_eval(env[name])
    except:
        res = literal_eval(f"'{env[name]}'")
    return res

def ge(name, default):
    '''Get env entry or default

    Args:
        name (str): Name of env variable
        default (*): Default value that will be used if no env variable exists.
    '''
    if name in env:
        return eval_env(name)
    else:
        return default

def import_by_string(full_name):
    module_name, unit_name = full_name.rsplit('.', 1)
    mod = importlib.import_module(module_name)
    return getattr(mod, unit_name)
 
def keytab_renewer_loop(logger_name):
    def kinit(logger, local_keytab_path, principal):
        try:
            logger.debug(f"performing kinit -kt {local_keytab_path} {principal}")
            p = subprocess.run([ 'kinit', '-kt', local_keytab_path, principal], capture_output=True)
            logger.debug(f"stdout of subprocess: {str(p.stdout)}")
        except:
            logger.error(f"stderr of subprocess: {str(p.stderr)}")
    logger = logging.getLogger('{}.{}'.format(logger_name,'keytab_renewer_loop'))
    keytab = eval_env('LOST_KINIT_KEYTAB')
    principal = eval_env('LOST_KINIT_PRINCIPAL')
    sleep_time = ge('LOST_KINIT_SLEEP_TIME',60*60*6) # Sleep for 6 hours
    local_keytab_path = f"{env['HOME']}/.{keytab.split('/')[-1]}"
    while True:
        kinit(logger, local_keytab_path, principal)
        logger.info('Sleep for {} seconds'.format(sleep_time))
        sleep(sleep_time)
class LOSTConfig(object):

    def __init__(self):

        self.use_docker = ge('LOST_USE_DOCKER', True)
        self.debug = ge('LOST_DEBUG_MODE', True)

        # Storage for application related data
        self.app_path = '/home/lost/app'
        if not self.use_docker:
            self.app_path = ge('LOST_APP_PATH',self.app_path)

        # Storage for user/pipeline related data
        self.data_fs_type = ge('LOST_DATA_FS_TYPE', 'file')
        
        self.data_path = '/home/lost/data'
        if not self.use_docker:
            self.data_path = ge('LOST_DATA_PATH', self.data_path)
        self.data_fs_args = ge('LOST_DATA_FS_ARGS',{})

        self.py3_init = ge('LOST_PY3_INIT','')

        # Database access
        self.lost_db_user = ge('LOST_DB_USER','lost')
        self.lost_db_name = ge('LOST_DB_NAME','lost')
        self.lost_db_pwd = ge('LOST_DB_PASSWORD','LostDevLost')
        self.lost_db_port = str(ge('LOST_DB_PORT','3306'))
        self.lost_db_ip = str(ge('LOST_DB_IP',"db-lost"))
        self.db_connector = ge('LOST_DB_CONNECTOR',"mysql+mysqldb")

        # Worker management
        # Unique name for this container worker
        self.worker_name = ge('LOST_WORKER_NAME','lost')
        # Name of the environment that is installed in this container and used to execute scripts
        self.env_name = self.worker_name
        # Can be static or dynamic
        self.worker_management = ge('LOST_WORKER_MANAGEMENT','static')

        if self.worker_management == 'dynamic':
            # Yarn jobs
            # self.extra_cron_jobs = [keytab_renewer_loop]
            # from dask.distributed import Client, LocalCluster
            # self.DaskCluster = LocalCluster
            self.DaskCluster = import_by_string(
                ge('LOST_DASK_CLUSTER','dask.distributed.LocalCluster'))
            self.cluster_arguments = {'n_workers':1, 'processes':False}
            self.DaskClient = Client
            #Can be any attribute from model.User that identifies a unique user
            self.dask_user_key = ge('LOST_DASK_USER_KEY','idx')
            self.dask_spawn_as_proxy_user = ge('LOST_DASK_SPAWN_AS_PROXY_USER', False)
        else:
            # DASK scheduler properties
            self.scheduler_ip = ge('LOST_SCHEDULER_IP','localhost')
            self.scheduler_port = ge('LOST_SCHEDULER_PORT',8786)
        self.extra_cron_jobs = []
        self.kinit_active = ge('LOST_KINIT_ACTIVE', False)
        if self.kinit_active:
            self.extra_cron_jobs.append(keytab_renewer_loop)

        # Cron job stuff
        # Timeout when a worker is considered to be dead
        self.worker_timeout = ge('LOST_WORKER_TIMEOUT',30)
        # Intervall in seconds in which a worker should give a lifesign
        self.worker_beat = ge('LOST_WORKER_BEAT',10)
        self.pipe_schedule = ge('LOST_PIPE_SCHEDULE',5)
        self.session_timeout = ge('LOST_SESSION_TIME_OUT',30*60)

        # Timout when a user get automatically logged out
        self.session_timeout = ge('LOST_SESSION_TIMEOUT',30*60)

        # LDAP Configuation
        self.ldap_config = dict()
        self.ldap_config['LDAP_ACTIVE'] = ge('LOST_LDAP_ACTIVE', False)
        self.ldap_config['LDAP_PORT'] = ge('LOST_LDAP_PROT', 389)
        self.ldap_config['LDAP_GROUP_OBJECT_FILTER'] = ge(
            'LOST_LDAP_GROUP_OBJECT_FILTER', '(objectclass=posixGroup)'
        )
        self.ldap_config['LDAP_GROUP_DN'] = ge('LOST_LDAP_GROUP_DN', '')
        self.ldap_config['LDAP_USER_RDN_ATTR'] = ge('LOST_LDAP_USER_RDN_ATTR', 'cn')
        self.ldap_config['LDAP_USER_LOGIN_ATTR'] = ge('LOST_LDAP_USER_LOGIN_ATTR', 'uid')
        self.ldap_config['LDAP_USE_SSL'] = ge('LOST_LDAP_USE_SSL', False)
        self.ldap_config['LDAP_ADD_SERVER'] = ge('LOST_LDAP_ADD_SERVER', True)

        # Mail configuration
        self.send_mail = ge('LOST_SEND_MAIL', False)
        self.mail_server = ge('LOST_MAIL_SEVER', "")
        self.mail_port = ge('LOST_MAIL_PORT', "")
        self.mail_use_ssl = ge('LOST_MAIL_USE_SSL', False)
        self.mail_use_tls = ge('LOST_MAIL_USE_TLS', False)
        self.mail_username = ge('LOST_MAIL_USERNAME', "")
        self.mail_password = ge('LOST_MAIL_PASSWORD', "")
        self.mail_default_sender = ge('LOST_MAIL_DEFAULT_SENDER', "")
        self.mail_lost_url = ge('LOST_MAIL_LOST_URL', "")