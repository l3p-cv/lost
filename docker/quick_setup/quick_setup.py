import argparse
import os
import logging
import shutil
import time
import sys
from cryptography.fernet import Fernet
import pathlib
import platform

sys.path.append('../../backend')
import lost
logging.basicConfig(level=logging.INFO, format='(%(levelname)s): %(message)s')

DEFAULT_RELEASE = '1.4.2'

def gen_rand_string(n):
    return Fernet.generate_key().decode()
class DockerComposeBuilder(object):

    def get_header(self):
        return (
            "version: '2.3'\n"
            "services:\n"
        )


    def get_lost(self):
        return (
            '    lost:\n'
            '      image: l3pcv/lost' + self.dockerImageSlug + ':${LOST_VERSION}\n'
            '      container_name: lost\n'
            '      command: bash /entrypoint.sh\n'
            '      env_file:\n'
            '        - .env\n'
            '      volumes:\n'
            '        - ${LOST_DATA}:/home/lost/data\n'
            '        - ${LOST_APP}:/home/lost/app\n'
            '      restart: always\n'
            '      ports:\n'
            '        - "${LOST_FRONTEND_PORT}:8080"\n'
            '        #- "${LOST_JUPYTER_LAB_PORT:-8888}:8888"\n'
            '      environment:\n'
            '        PYTHONPATH: "/code/src/backend"\n'
            '        LOST_WORKER_NAME: "lost"\n'
            '        LOST_PY3_INIT: "source /opt/conda/bin/activate lost"\n'
            '      links:\n'
            '        - db-lost\n'
        )

    def get_lostdb(self):
        return (
            '    db-lost:\n'
            '      image: mysql:5.7\n'
            '      container_name: db-lost\n'
            '      volumes:\n'
            '          - ${LOST_APP}/mysql:/var/lib/mysql\n'
            '      restart: always\n'
            '      environment:\n'
            '          MYSQL_DATABASE: ${LOST_DB_NAME}\n'
            '          MYSQL_USER: ${LOST_DB_USER}\n'
            '          MYSQL_PASSWORD: ${LOST_DB_PASSWORD}\n'
            '          MYSQL_ROOT_PASSWORD: ${LOST_DB_ROOT_PASSWORD}\n'
        )

    def get_phpmyadmin(self):
        return (
            '    phpmyadmin:\n'
            '      image: phpmyadmin/phpmyadmin\n'
            '      container_name: phpmyadmin\n'
            '      restart: always\n'
            '      environment:\n'
            '          PMA_ARBITRARY: 1\n'
            '          MYSQL_USER: ${LOST_DB_USER}\n'
            '          MYSQL_PASSWORD: ${LOST_DB_PASSWORD}\n'
            '          MYSQL_ROOT_PASSWORD: ${LOST_DB_ROOT_PASSWORD}\n'
            '      links:\n'
            '          - "db-lost:db"\n'
            '      ports:\n'
            '          - "${LOST_PHP_MYADMIN_PORT}:80"\n'
        )

    def get_graylog_mogodb(self):
        return (
            '    mongodb:\n'
            '      image: mongo:4.2\n'
            '      container_name: mongodbgraylog\n'
            '      volumes:\n'
            '        - ${LOST_APP}/graylog/mongodb:/data/db\n'

        )
    
    def get_graylog_elasticsearch(self):
        return (
            '    elasticsearch:\n'
            '        image: docker.elastic.co/elasticsearch/elasticsearch-oss:7.10.2\n'
            '        container_name: elasticsearchgraylog\n'
            '        volumes:\n'
            '          - ${LOST_APP}/graylog/elasticsearch:/usr/share/elasticsearch/data\n'
            '        environment:\n'
            '          - http.host=0.0.0.0\n'
            '          - transport.host=localhost\n'
            '          - network.host=0.0.0.0\n'
            '          - "ES_JAVA_OPTS=-Xms512m -Xmx512m"\n'
            '        ulimits:\n'
            '          memlock:\n'
            '            soft: -1\n'
            '            hard: -1\n'
            '        mem_limit: 1g\n'
        )
    def get_graylog(self):
        return (
            '    graylog:\n'
            '        image: graylog/graylog:4.3.3\n'
            '        container_name: graylog\n'
            '        volumes:\n'
            '          - ${LOST_APP}/graylog/graylog:/usr/share/graylog/data\n'
            '        environment:\n'
            '          - GRAYLOG_PASSWORD_SECRET=somepasswordpepper\n'
            '          - GRAYLOG_ROOT_PASSWORD_SHA2=8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918\n'
            '          - GRAYLOG_HTTP_EXTERNAL_URI=http://127.0.0.1:9000/\n'
            '        entrypoint: /usr/bin/tini -- wait-for-it elasticsearch:9200 --  /docker-entrypoint.sh\n'
            '        links:\n'
            '            - mongodb:mongo\n'
            '            - elasticsearch\n'
            '        restart: always\n'
            '        depends_on:\n'
            '        - mongodb\n'
            '        - elasticsearch\n'
            '        ports:\n'
            '        - 9000:9000\n'
            '        - 1514:1514\n'
            '        - 1514:1514/udp\n'
            '        - 12201:12201\n'
            '        - 12201:12201/udp\n'
        )
    def _write_file(self, sotre_path, content):
        with open(sotre_path, 'w') as f:
            f.write(content)

    def write_production_file(self, store_path, phpmyadmin, graylog):
        content = self.get_header()
        content += self.get_lost()
        content += self.get_lostdb()
        if phpmyadmin:
            content += self.get_phpmyadmin()
        if graylog and platform.system() == 'Linux':
            content += self.get_graylog_mogodb()
            content += self.get_graylog_elasticsearch()
            content += self.get_graylog()
        self._write_file(store_path, content)

class QuickSetup(object):
    
    def __init__(self, args):
        self.args = args
        self.secret_key = gen_rand_string(16)
        self.dst_app_data_dir = os.path.join(args.install_path, 'data', 'app_data')
        self.dst_project_data_dir = os.path.join(args.install_path, 'data', 'project_data')
        self.dst_docker_dir = os.path.join(args.install_path, 'docker')
        if args.release is None:
            self.release = DEFAULT_RELEASE
            # self.release = lost.__version__
        else:
            self.release = args.release
        if args.testing == "True":
            self.dockerImageSlug = '-test'
        else:
            self.dockerImageSlug = ''
    
    def write_docker_compose(self, store_path):
        builder = DockerComposeBuilder()
        builder.dockerImageSlug = self.dockerImageSlug
        builder.write_production_file(store_path, self.args.phpmyadmin, self.args.graylog)
        logging.info('Wrote docker-compose config to: {}'.format(store_path))
        

    def write_env_config(self, env_path):
        '''Write env file to filesystem
        Args:
            env_path (str): Path to store env file
        '''
        # if self.args.no_ai:
        #     ai_examples = 'False'
        # else:
        #     ai_examples = 'True'

        config = [
            ['#======================','#'],
            ['#=   LOST Basic config  ','#'],
            ['#======================','#'],
            ['LOST_DEBUG_MODE','False'],
            ['# Add example pipelines and example images ','#'],
            ['LOST_ADD_EXAMPLES','True'],
            # ['#= Add also ai pipelines if true. You will need the lost-cv worker to execute these pipelines.',' #'],
            # ['LOST_ADD_AI_EXAMPLES', ai_examples],
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
            ['#LOST_GIT_ACCESS_TOKEN','mysecrettoken']
        ]
        if self.args.graylog and platform.system() == "Linux":
            config.append(['#========================','#'])
            config.append(['#=     Logging Config    ','#'])
            config.append(['#========================','#'])
            config.append(['LOST_USE_GRAYLOG','True'])

        with open(env_path, 'w') as f:
            for key, val in config:
                f.write('{}={}\n'.format(key, val))
        return
    
    def create_graylog_dirs(self):
            base_log_dir = os.path.join(self.dst_app_data_dir, 'graylog')
            gray_log_dir = os.path.join(base_log_dir, 'graylog')
            gray_log_config_dir = os.path.join(gray_log_dir, 'config')
            elastic_search_dir = os.path.join(base_log_dir, 'elasticsearch')
            mongodb_dir = os.path.join(base_log_dir, 'mongodb')
            os.makedirs(gray_log_dir)
            logging.info('Created: {}'.format(gray_log_dir))
            os.makedirs(elastic_search_dir)
            logging.info('Created: {}'.format(elastic_search_dir))
            os.makedirs(mongodb_dir)
            logging.info('Created: {}'.format(mongodb_dir))
            # copy config files
            my_dir = pathlib.Path(__file__).parent.resolve()
            graylog_init_config = os.path.join(my_dir, 'templates', 'graylog_config')
            shutil.copytree(graylog_init_config, gray_log_config_dir)
            os.system(f"sudo chown -R 1100:1100 {gray_log_dir}")
            os.system(f"sudo chown -R 1000:1000 {elastic_search_dir}")
            # os.chown(gray_log_dir, 1100, 1100)
            # os.chown(elastic_search_dir, 1000, 1000)
    
    def import_graylog_init_db(self):
        # restore mongodb from init data dump
        my_dir = pathlib.Path(__file__).parent.resolve()
        graylog_init_data_db = os.path.join(my_dir, 'templates', 'graylog_initdb')
        docker_run_cmd = f'docker run --name mongodb_temp -d -v {self.dst_app_data_dir}/graylog/mongodb:/data/db  -v {graylog_init_data_db}:/graylog_init mongo:4.2'
        docker_exec_cmd = f'docker exec -i mongodb_temp mongorestore /graylog_init'
        docker_remove_cmd = f'docker rm -f mongodb_temp'
        
        print('Starting graylog mongodb container.')
        os.system(docker_run_cmd)
        print('Waiting some seconds for initialization.')
        time.sleep(10)
        os.system(docker_exec_cmd)
        print('Execute DB Graylog Init.')
        time.sleep(5)
        os.system(docker_remove_cmd)


    def main(self):
        try:
            os.makedirs(args.install_path)
            logging.info('Created: {}'.format(args.install_path))
        except OSError:
            logging.warning('Path already exists: {}'.format(args.install_path))
            return
        os.makedirs(self.dst_app_data_dir)
        logging.info('Created: {}'.format(self.dst_app_data_dir))
        os.makedirs(self.dst_project_data_dir)
        logging.info('Created: {}'.format(self.dst_project_data_dir))
        os.makedirs(self.dst_docker_dir)
        logging.info('Created: {}'.format(self.dst_docker_dir))

        if self.args.graylog:
            if platform.system() == 'Linux':
                self.create_graylog_dirs()
                self.import_graylog_init_db()
            else:
                logging.warning('Graylog configuration is only available for Linux.')
        # example_config_path = '../compose/prod-docker-compose.yml'
        dst_config = os.path.join(self.dst_docker_dir, 'docker-compose.yml')
        # shutil.copy(example_config_path, dst_config)
        self.write_docker_compose(dst_config)
        env_path = os.path.join(self.dst_docker_dir,'.env')
        self.write_env_config(env_path)
        logging.info('Created {}'.format(env_path))
        logging.info('')
        logging.info('Finished setup! To test LOST run:')
        logging.info('======================================================')
        logging.info('1) Type the command below into your command line:')
        logging.info('   cd {}; docker-compose up'.format(self.dst_docker_dir))
        n = 2
        logging.info('{}) Open your browser and navigate to: http://localhost'.format(n))
        logging.info('    Login user:     admin')
        logging.info('    Login password: admin')
        logging.info('======================================================')



if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Quick setup for lost on linux')
    parser.add_argument('install_path', help='Specify path to install lost.')
    parser.add_argument('--release', help='LOST release you want to install.', default=None)
    parser.add_argument('--testing', help='use the LOST images from testing stage.', default=None)
    # parser.add_argument('-noai', '--no_ai', help='Do not add ai examples and no lost-cv worker', action='store_true')
    parser.add_argument('--phpmyadmin', help='Add phpmyadmin to docker compose file', action='store_true')
    parser.add_argument('--graylog', help='Add graylog logging tool to docker compose file', action='store_true')
    args = parser.parse_args()
    qs = QuickSetup(args)
    qs.main()