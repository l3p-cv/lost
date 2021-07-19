import subprocess
import logging
from threading import Thread
from os import environ
from socket import getfqdn
from time import sleep
from dask.distributed import Client, LocalCluster

class LOSTConfig(object):

    def __init__(self):

        self.debug = True

        # Storage for application related data
        self.app_path = '/home/user/lostapp'

        # Storage for user/pipeline related data
        self.data_fs_type = 'file'
        self.data_path = '/home/user/lostdata'
        self.data_fs_args = {}

        self.py3_init = 'conda activate lost'

        # Database access
        self.lost_db_user = 'lost'
        self.lost_db_name = 'lost'
        self.lost_db_pwd = 'pleaseChangeIt'
        self.lost_db_port = '3306'
        self.lost_db_ip = "192.168.1.42"
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
            #self.dask_spawn_as_proxy_user = True
            self.dask_spawn_as_proxy_user = False

            #Can be any attribute from model.User that identifies a unique user
            self.dask_user_key = 'idx'
        else:
            self.extra_cron_jobs = []


        # Cron job stuff
        # Timeout when a worker is considered to be dead
        self.worker_timeout = 30
        # Intervall in seconds in which a worker should give a lifesign
        self.worker_beat = 10
        self.pipe_schedule = 5
        self.session_timeout = 30*60

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