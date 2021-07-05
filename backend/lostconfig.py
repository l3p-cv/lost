import os
import ast
class LOSTConfig(object):

    def __init__(self):

        self.debug = False
        if "DEBUG" in os.environ:
            if os.environ['DEBUG'].lower() == 'true':
                self.debug = True
        self.app_path = '/home/lost/app'
        self.data_fs_type = os.environ['LOST_DATA_FS_TYPE']
        if self.data_fs_type.lower() == 'file':
            self.data_path = '/home/lost/data'
        else:
            self.data_path = os.environ['LOST_DATA']
        # print(os.environ['LOST_FS_ARGS'])
        self.data_fs_args = ast.literal_eval(os.environ['LOST_DATA_FS_ARGS'])
        self.py3_init = os.environ['PY3_INIT']
        self.lost_db_user = os.environ['LOST_DB_USER']
        self.lost_db_name = os.environ['LOST_DB_NAME']
        self.lost_db_pwd = os.environ['LOST_DB_PASSWORD']
        # Name of the environment that is installed in this container and used to execute scripts
        self.env_name = os.environ['ENV_NAME']
        # Unique name for this container worker
        self.worker_name = os.environ['WORKER_NAME']
        # Timeout when a worker is considered to be dead
        self.worker_timeout = os.environ['WORKER_TIMEOUT']
        # Intervall in seconds in which a worker should give a lifesign
        self.worker_beat = int(os.environ['WORKER_BEAT'])
        self.pipe_schedule = int(os.environ['PIPE_SCHEDULE'])
        self.session_timeout = int(30)
        self.scheduler_ip = 'localhost'
        self.scheduler_port = 8786

        self.worker_management = 'static'
        self.extra_cron_jobs = []
        self.DaskCluster = None
        self.cluster_arguments = {}
        self.DaskClient = None

        # DASK scheduler properties
        self.scheduler_ip = 'localhost'
        self.scheduler_port = 8786
        
        # self.session_timeout = 1
        if "SESSION_TIMEOUT" in os.environ:
            self.session_timeout = int(os.environ['SESSION_TIMEOUT'])
            if self.session_timeout < 10:
                self.session_timeout = 10

        self.lost_db_port = '3306'
        if "LOST_DB_PORT" in os.environ:
            self.lost_db_port = os.environ['LOST_DB_PORT']
        self.lost_db_ip = "db-lost"
        if "LOST_DB_IP" in os.environ:
            self.lost_db_ip = os.environ['LOST_DB_IP']

        self.rabbitmq_port = '5672'
        if "RABBITMQ_PORT" in os.environ:
            self.rabbitmq_port = os.environ['RABBITMQ_PORT']
        self.rabbitmq_ip = "rabbitmqlost"
        if "RABBITMQ_IP" in os.environ:
            self.rabbitmq_ip = os.environ['RABBITMQ_IP']

        self.send_mail = False
        self.mail_server = ""
        self.mail_port = ""
        self.mail_use_ssl = False
        self.mail_use_tls = False
        self.mail_username = ""
        self.mail_password = ""
        self.mail_default_sender = ""
        self.mail_lost_url = ""
            
        if 'MAIL_SERVER' in os.environ:
            self.mail_server = os.environ['MAIL_SERVER']
            self.send_mail = True
        if 'MAIL_PORT' in os.environ:
            self.mail_port = os.environ['MAIL_PORT']
        if 'MAIL_USE_SSL' in os.environ:
            if os.environ['MAIL_USE_SSL'] == 'True':
                self.mail_use_ssl = True
        if 'MAIL_USE_TLS' in os.environ:
            if os.environ['MAIL_USE_TLS'] == 'True':
                self.mail_use_tls = True
        if 'MAIL_USERNAME' in os.environ:
            self.mail_username = os.environ['MAIL_USERNAME']
        if 'MAIL_PASSWORD' in os.environ:
            self.mail_password = os.environ['MAIL_PASSWORD']
        if 'MAIL_DEFAULT_SENDER' in os.environ:
            self.mail_default_sender = os.environ['MAIL_DEFAULT_SENDER']
        if 'MAIL_LOST_URL' in os.environ:
            self.mail_lost_url = os.environ['MAIL_LOST_URL']