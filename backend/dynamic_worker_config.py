import subprocess
import logging
from threading import Thread
from os import environ
from socket import getfqdn
from time import sleep
from dask.distributed import Client, LocalCluster
# from dask_yarn import YarnCluster

def keytab_renewer_loop(logger_name):
    def kinit(logger, local_keytab_path, principal):
        try:
            logger.debug(f"performing kinit -kt {local_keytab_path} {principal}")
            p = subprocess.run([ 'kinit', '-kt', local_keytab_path, principal], capture_output=True)
            logger.debug(f"stdout of subprocess: {str(p.stdout)}")
        except:
            logger.error(f"stderr of subprocess: {str(p.stderr)}")
    logger = logging.getLogger('{}.{}'.format(logger_name,'keytab_renewer_loop'))
    keytab = 'my keytab name'
    principal = 'my principal'
    sleep_time = 60*60*6 # Sleep for 6 hours
    local_keytab_path = f"{environ['HOME']}/.{keytab.split('/')[-1]}"
    while True:
        kinit(logger, local_keytab_path, principal)
        logger.info('Sleep for {} seconds'.format(sleep_time))
        sleep(sleep_time)

# class KeytabRenewer(Thread):
    
#     def __init__(self, instance, keytab, principal, interval, logger_name="KeytabRenewer_logger", auditer_name="KeytabRenewer_audit"):
#         super().__init__()
#         self.logger = logging.getLogger(logger_name)
#         self.auditer = logging.getLogger(auditer_name)
#         self.instance = instance
#         self.interval = interval
#         self.logging_prefix = f"{self.__class__.__name__}:{self.instance}:"
#         self.keytab = keytab
#         self.principal = principal
#         self.local_keytab_path = f"{environ['HOME']}/.{keytab.split('/')[-1]}"
        
#         with fsspec.open(keytab) as remote_file:
#             with open(self.local_keytab_path, 'wb') as local_file:
#                 local_file.write(remote_file.read())
                
#         self.auditer.info(f"{self.logging_prefix} startet at {getfqdn()} with keytab {self.local_keytab_path} and principal {self.principal}")
#         self.kinit()
        
#     def kinit(self):
#         try:
#             self.logger.debug(f"{self.logging_prefix} performing kinit -kt {self.local_keytab_path} {self.principal}")
#             p = subprocess.run([ 'kinit', '-kt', self.local_keytab_path, self.principal], capture_output=True)
#             self.logger.debug(f"{self.logging_prefix} stdout of subprocess: {str(p.stdout)}")
#         except:
#             self.logger.error(f"{self.logging_prefix} stderr of subprocess: {str(p.stderr)}")

#     def run(self):
#         while True:
#             self.kinit()
#             self.logger.debug(f"{self.logging_prefix} sleep for {self.interval} seconds")
#             sleep(self.interval)       

class LOSTConfig(object):

    def __init__(self):

        self.debug = True

        # Storage for application related data
        self.app_path = '/home/lost/app'

        # Storage for user/pipeline related data
        self.data_fs_type = 'file'
        self.data_path = '/home/lost/data'
        self.data_fs_args = {}

        self.py3_init = ''

        # Database access
        self.lost_db_user = 'lost'
        self.lost_db_name = 'lost'
        self.lost_db_pwd = 'LostDevLost'
        self.lost_db_port = '3306'
        self.lost_db_ip = "db-lost"
        self.db_connector = "mysql+mysqldb"

        # Worker management
        # Name of the environment that is installed in this container and used to execute scripts
        self.env_name = 'lost'
        # Unique name for this container worker
        self.worker_name = 'lost-0'
        # Can be static or dynamic
        self.worker_management = 'dynamic'

        if self.worker_management == 'dynamic':
            # Yarn jobs
            # self.extra_cron_jobs = [keytab_renewer_loop]
            self.extra_cron_jobs = []
            self.DaskCluster = LocalCluster
            self.cluster_arguments = {'n_workers':1, 'processes':False}
            self.DaskClient = Client
        else:
            self.extra_cron_jobs = []


        # Cron job stuff
        # Timeout when a worker is considered to be dead
        self.worker_timeout = 30
        # Intervall in seconds in which a worker should give a lifesign
        self.worker_beat = 10
        self.pipe_schedule = 5
        self.session_timeout = 30

        # DASK scheduler properties
        self.scheduler_ip = 'localhost'
        self.scheduler_port = 8786

        # Timout when a user get automatically logged out
        self.session_timeout = 10

        # LDAP Configuation
        self.ldap_config = dict()
        self.ldap_config['LDAP_ACTIVE'] = False
        self.ldap_config['LDAP_PORT'] = 389
        self.ldap_config['LDAP_GROUP_OBJECT_FILTER'] = '(objectclass=posixGroup)'
        self.ldap_config['LDAP_GROUP_DN'] = ''
        self.ldap_config['LDAP_USER_RDN_ATTR'] = 'cn'
        self.ldap_config['LDAP_USER_LOGIN_ATTR'] = 'uid'
        self.ldap_config['LDAP_USE_SSL'] = False
        self.ldap_config['LDAP_ADD_SERVER'] = True

        # Mail configuration
        self.send_mail = False
        self.mail_server = ""
        self.mail_port = ""
        self.mail_use_ssl = False
        self.mail_use_tls = False
        self.mail_username = ""
        self.mail_password = ""
        self.mail_default_sender = ""
        self.mail_lost_url = ""