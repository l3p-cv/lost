import argparse
import os
import logging
import shutil
# import time
from cryptography.fernet import Fernet
# import pathlib
# import platform

logging.basicConfig(level=logging.INFO, format='(%(levelname)s): %(message)s')

DEFAULT_RELEASE = '2.6.0'

def gen_rand_string(n):
    return Fernet.generate_key().decode()

class QuickSetup(object):
    
    def __init__(self, args):
        self.args = args
        self.base_dir = args.install_path
        self.secret_key = gen_rand_string(16)
        self.dst_app_data_dir = os.path.join(args.install_path, 'data', 'app_data')
        self.dst_project_data_dir = os.path.join(args.install_path, 'data', 'project_data')
        if args.release is None:
            self.release = DEFAULT_RELEASE
        else:
            self.release = args.release
        # if args.testing == "True":
        #     self.dockerImageSlug = '-test'
        # else:
        #     self.dockerImageSlug = ''
    
    # def write_docker_compose(self, store_path):
        # builder = DockerComposeBuilder()
        # builder.dockerImageSlug = self.dockerImageSlug
        # builder.write_production_file(store_path, self.args.phpmyadmin, self.args.graylog)
        # logging.info('Wrote docker-compose config to: {}'.format(store_path))
        

    def write_env_config(self, env_path):
        '''Write env file to filesystem
        Args:
            env_path (str): Path to store env file
        '''
        config = [
            ['#======================','#'],
            ['#=   LOST Basic config  ','#'],
            ['#======================','#'],
            ['LOST_DEBUG_MODE','False'],
            ['# Add example pipelines and example images ','#'],
            ['LOST_ADD_EXAMPLES','True'],
            ['LOST_VERSION', self.release],
            ['#= LOST port binding to host machine',' #'],
            ['LOST_FRONTEND_PORT', 80],
            ['LOST_SECRET_KEY', self.secret_key],
            ['#= Path to LOST data in host filesystem',' #'],
            ['LOST_DATA', self.dst_project_data_dir],
            ['LOST_APP', self.dst_app_data_dir],
            ['LOST_DATA_FS_TYPE', 'file'],
            ['LOST_DATA_FS_ARGS', '{}'],
            ['#======================','#'],
            ['#= LOST Database config ','#'],
            ['#======================','#'],
            ['LOST_DB_NAME', 'lost'],
            ['LOST_DB_USER', 'lost'],
            ['LOST_DB_PASSWORD', 'LostDbLost'],
            ['LOST_DB_ROOT_PASSWORD', 'LostRootLost'],
            ['LOST_PHP_MYADMIN_PORT', 8081], 
            ['#======================','#'],
            ['#=   PipeEngine config  ','#'],
            ['#======================','#'],
            ['# Interval in seconds for the cronjob to update the pipeline',' #'],
            ['LOST_PIPE_SCHEDULE', 5],
            ['# Intervall in seconds in which a worker should give a lifesign',' #'],
            ['LOST_WORKER_BEAT', 10],
            ['# Timeout in seconds when a worker is considered to be dead',' #'],
            ['LOST_WORKER_TIMEOUT',30],
            ['# Session timout in minutes - timespan when an inactive user is logged out',' #'],
            ['# Also used to schedule a background job that releases locked annotations ',' #'],
            ['LOST_SESSION_TIMEOUT',30],
            ['#========================','#'],
            ['#= Your Mail config here ','#'],
            ['#========================','#'],
            ['#LOST_MAIL_ACTIVE','True'],
            ['#LOST_MAIL_SERVER','mailserver.com'],
            ['#LOST_MAIL_PORT','465'],
            ['#LOST_MAIL_USE_SSL','True'],
            ['#LOST_MAIL_USE_TLS','True'],
            ['#LOST_MAIL_USERNAME','email@email.com'],
            ['#LOST_MAIL_PASSWORD','password'],
            ['#LOST_MAIL_DEFAULT_SENDER','LOST Notification System <email@email.com>'],
            ['#LOST_MAIL_LOST_URL','http://mylostinstance.url/'],
            ['#========================','#'],
            ['#= Jupyter Lab Config    ','#'],
            ['#========================','#'],
            ['# In order to enable Jupyter-Lab integration you have to uncomment the following lines','#'],
            ['# Please watch out: You have to uncomment the port export of JUPYTER_LAB_PORT in your .docker-compose.yml as well','#'],
            ['#LOST_JUPYTER_LAB_ACTIVE','True'],
            ['#LOST_JUPYTER_LAB_ROOT_PATH','/code/src'],
            ['#LOST_JUPYTER_LAB_TOKEN','mysecrettoken'],
            ['#LOST_JUPYTER_LAB_PORT','8888'],
            ['#========================','#'],
            ['#=    Git Credentials    ','#'],
            ['#========================','#'],
            ['# In order to enable git support inside your container please uncomment the following lines','#'],
            ['# See here how to create a personal access token https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token ','#'],
            ['#LOST_GIT_USER','your_git_user_name'],
            ['#LOST_GIT_EMAIL','your@email.com'],
            ['#LOST_GIT_ACCESS_TOKEN','mysecrettoken'],
            ['#========================','#'],
            ['#=     Logging Config    ','#'],
            ['#========================','#'],
            ['LOST_USE_GRAYLOG','True']
        ]
        # if self.args.graylog and platform.system() == "Linux":
            # config.append(['#========================','#'])
            # config.append(['#=     Logging Config    ','#'])
            # config.append(['#========================','#'])
            # config.append(['LOST_USE_GRAYLOG','True'])

        with open(env_path, 'w') as f:
            for key, val in config:
                f.write('{}={}\n'.format(key, val))
        return
    
    # def create_graylog_dirs(self):
    #         base_log_dir = os.path.join(self.dst_app_data_dir, 'graylog')
    #         gray_log_dir = os.path.join(base_log_dir, 'graylog')
    #         gray_log_config_dir = os.path.join(gray_log_dir, 'config')
    #         elastic_search_dir = os.path.join(base_log_dir, 'elasticsearch')
    #         mongodb_dir = os.path.join(base_log_dir, 'mongodb')
    #         os.makedirs(gray_log_dir)
    #         logging.info('Created: {}'.format(gray_log_dir))
    #         os.makedirs(elastic_search_dir)
    #         logging.info('Created: {}'.format(elastic_search_dir))
    #         os.makedirs(mongodb_dir)
    #         logging.info('Created: {}'.format(mongodb_dir))
    #         # copy config files
    #         my_dir = pathlib.Path(__file__).parent.resolve()
    #         graylog_init_config = os.path.join(my_dir, 'templates', 'graylog_config')
    #         shutil.copytree(graylog_init_config, gray_log_config_dir)
    #         os.system(f"sudo chown -R 1100:1100 {gray_log_dir}")
    #         os.system(f"sudo chown -R 1000:1000 {elastic_search_dir}")
    #         # os.chown(gray_log_dir, 1100, 1100)
    #         # os.chown(elastic_search_dir, 1000, 1000)
    
    # def import_graylog_init_db(self):
    #     # restore mongodb from init data dump
    #     my_dir = pathlib.Path(__file__).parent.resolve()
    #     graylog_init_data_db = os.path.join(my_dir, 'templates', 'graylog_initdb')
    #     docker_run_cmd = f'docker run --name mongodb_temp -d -v {self.dst_app_data_dir}/graylog/mongodb:/data/db  -v {graylog_init_data_db}:/graylog_init mongo:4.2'
    #     docker_exec_cmd = 'docker exec -i mongodb_temp mongorestore /graylog_init'
    #     docker_remove_cmd = 'docker rm -f mongodb_temp'
        
    #     print('Starting graylog mongodb container.')
    #     os.system(docker_run_cmd)
    #     print('Waiting some seconds for initialization.')
    #     time.sleep(10)
    #     os.system(docker_exec_cmd)
    #     print('Execute DB Graylog Init.')
    #     time.sleep(5)
    #     os.system(docker_remove_cmd)


    def main(self):
        try:
            os.makedirs(self.base_dir)
            logging.info('Created: {}'.format(self.base_dir))
        except OSError:
            logging.warning('Path already exists: {}'.format(self.base_dir))
            return
        os.makedirs(self.dst_app_data_dir)
        logging.info('Created: {}'.format(self.dst_app_data_dir))
        os.makedirs(self.dst_project_data_dir)
        logging.info('Created: {}'.format(self.dst_project_data_dir))

        # if self.args.graylog:
        #     if platform.system() == 'Linux':
        #         self.create_graylog_dirs()
        #         self.import_graylog_init_db()
        #     else:
        #         logging.warning('Graylog configuration is only available for Linux.')

        # example_config_path = '../compose/prod-docker-compose.yml'
        
        # copy compose files
        dst_compose_path = os.path.join(self.base_dir, 'compose.yaml')
        dst_logging_path = os.path.join(self.base_dir, 'logging.compose.yaml')
        shutil.copy('docker/compose/compose.yaml', dst_compose_path)
        shutil.copy('docker/compose/logging.compose.yaml', dst_logging_path)
        
        # create .env file
        env_path = os.path.join(self.base_dir, '.env')
        self.write_env_config(env_path)
        logging.info(f'Created {env_path}')
        
        # information for user
        logging.info('')
        logging.info('Finished setup! To start LOST run:')
        logging.info('======================================================')
        logging.info('1) Type the command below into your command line:')
        logging.info(f'   cd {self.base_dir}; docker compose up')
        logging.info('2) Open your browser and navigate to: http://localhost')
        logging.info('    Login user:     admin')
        logging.info('    Login password: admin')
        logging.info('======================================================')


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Quick setup for lost on linux')
    parser.add_argument('install_path', help='Specify path to install lost.')
    parser.add_argument('--release', help='LOST release you want to install.', default=None)
    # parser.add_argument('--testing', help='use the LOST images from testing stage.', default=None)
    # parser.add_argument('--phpmyadmin', help='Add phpmyadmin to docker compose file', action='store_true')
    # parser.add_argument('--graylog', help='Add graylog logging tool to docker compose file', action='store_true')
    args = parser.parse_args()
    qs = QuickSetup(args)
    qs.main()
