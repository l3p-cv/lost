import os

class LOSTConfig(object):

    def __init__(self):
        self.debug = False
        if "DEBUG" in os.environ:
            if os.environ['DEBUG'] == 'True':
                self.debug = True
        self.project_name = os.environ['PROJECT_NAME']
        self.project_path = os.environ['LOST_HOME']
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
        self.worker_beat = os.environ['WORKER_BEAT']
        self.pipe_schedule = os.environ['PIPE_SCHEDULE']
        

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