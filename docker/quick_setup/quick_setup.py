import argparse
import os
import logging
import shutil
import random
import string 
import sys
sys.path.append('../../backend')
import lost
logging.basicConfig(level=logging.INFO, format='(%(levelname)s): %(message)s')

def gen_rand_string(n):
    return ''.join(
        random.SystemRandom().choice(
            string.ascii_uppercase + string.digits
        ) for _ in range(n))

class DockerComposeBuilder(object):

    def get_header(self):
        return (
            "version: '2'\n"
            "services:\n"
        )


    def get_lost(self):
        return (
            '    lost:\n'
            '      image: l3pcv/lost:${LOST_VERSION}\n'
            '      container_name: lost\n'
            '      command: bash /entrypoint.sh\n'
            '      env_file:\n'
            '        - .env\n'
            '      volumes:\n'
            '        - ${LOST_DATA}:/home/lost\n'
            '      restart: always\n'
            '      ports:\n'
            '        - "${LOST_FRONTEND_PORT}:8080"\n'
            '      environment:\n'
            '        PYTHONPATH: "/code/backend"\n'
            '        ENV_NAME: "lost"\n'
            '        WORKER_NAME: "lost-0"\n'
            '        PY3_INIT: "source /opt/conda/bin/activate lost"\n'
            '      links:\n'
            '        - db-lost\n'
            '        - rabbitmqlost\n\n'
        )

    def get_lostdb(self):
        return (
            '    db-lost:\n'
            '      image: mysql:5.7\n'
            '      container_name: db-lost\n'
            '      volumes:\n'
            '          - ${LOST_DATA}/mysql:/var/lib/mysql\n'
            '      restart: always\n'
            '      environment:\n'
            '          MYSQL_DATABASE: ${LOST_DB_NAME}\n'
            '          MYSQL_USER: ${LOST_DB_USER}\n'
            '          MYSQL_PASSWORD: ${LOST_DB_PASSWORD}\n'
            '          MYSQL_ROOT_PASSWORD: ${LOST_DB_ROOT_PASSWORD}\n\n'
        )

    def get_lostcv(self):
        return (
            '    lost-cv:\n'
            '      image: l3pcv/lost-cv:${LOST_VERSION}\n'
            '      container_name: lost-cv\n'
            '      command: bash /entrypoint.sh\n'
            '      env_file:\n'
            '          - .env\n'
            '      volumes:\n'
            '          - ${LOST_DATA}:/home/lost\n'
            '      restart: always\n'
            '      environment:\n'
            '          PYTHONPATH: "/code/backend"\n'
            '          ENV_NAME: "lost-cv"\n'
            '          WORKER_NAME: "lost-cv-0"\n'
            '          PY3_INIT: "source /opt/conda/bin/activate lost-cv"\n'
            '      links:\n'
            '          - db-lost\n'
            '          - rabbitmqlost\n\n'
        )
    
    def get_rabbitmq(self):
        return (
            '    rabbitmqlost:\n'
            '      image: rabbitmq:3-management\n'
            '      container_name: rabbitmqlost\n'
            '      restart: always\n'
            '      volumes:\n'
            '          - ${LOST_DATA}/rabbitmq:/var/lib/rabbitmq\n\n'
        )
    def _write_file(self, sotre_path, content):
        with open(sotre_path, 'w') as f:
            f.write(content)

    def write_production_file(self, store_path, add_lostcv=True):
        content = self.get_header()
        content += self.get_lost()
        content += self.get_lostdb()
        content += self.get_rabbitmq()
        if add_lostcv:
            content += self.get_lostcv()
        self._write_file(store_path, content)

class QuickSetup(object):
    
    def __init__(self, args):
        self.args = args
        self.secret_key = gen_rand_string(16)
        self.dst_data_dir = os.path.join(args.install_path, 'data')
        self.dst_docker_dir = os.path.join(args.install_path, 'docker')
        if args.release is None:
            self.release = lost.__version__
        else:
            self.release = args.release
    
    def write_docker_compose(self, store_path):
        builder = DockerComposeBuilder()
        if self.args.no_ai or self.args.add_gpu_worker:
            builder.write_production_file(store_path, add_lostcv=False)
        else:
            builder.write_production_file(store_path, add_lostcv=True)
        logging.info('Wrote docker-compose config to: {}'.format(store_path))
        

    def write_env_config(self, env_path):
        '''Write env file to filesystem

        Args:
            env_path (str): Path to store env file
        '''
        if self.args.no_ai:
            ai_examples = 'False'
        else:
            ai_examples = 'True'

        config = [
            ['#======================','#'],
            ['#=   LOST Basic conig  ','#'],
            ['#======================','#'],
            ['DEBUG','False'],
            ['# Add example pipelines and example images ','#'],
            ['ADD_EXAMPLES','True'],
            ['#= Add also ai pipelines if true. You will need the lost-cv worker to execute these pipelines.',' #'],
            ['ADD_AI_EXAMPLES', ai_examples],
            ['LOST_VERSION', self.release],
            ['#= LOST port binding to host machine',' #'],
            ['LOST_FRONTEND_PORT', 80],
            ['SECRET_KEY', self.secret_key],
            ['#= Path to LOST data in host filesystem',' #'],
            ['LOST_DATA', self.dst_data_dir],
            ['#======================','#'],
            ['#= LOST Database conig ','#'],
            ['#======================','#'],
            ['LOST_DB_NAME', 'lost'],
            ['LOST_DB_USER', 'lost'],
            ['LOST_DB_PASSWORD', 'LostDbLost'],
            ['LOST_DB_ROOT_PASSWORD', 'LostRootLost'],
            ['#======================','#'],
            ['#=   PipeEngine conig  ','#'],
            ['#======================','#'],
            ['# Interval in seconds for the cronjob to update the pipeline',' #'],
            ['PIPE_SCHEDULE', '5'],
            ['# Intervall in seconds in which a worker should give a lifesign',' #'],
            ['WORKER_BEAT', 10],
            ['# Timeout in seconds when a worker is considered to be dead',' #'],
            ['WORKER_TIMEOUT',30],
            ['#========================','#'],
            ['#= Your Mail config here ','#'],
            ['#========================','#'],
            ['#MAIL_SERVER','mailserver.com'],
            ['#MAIL_PORT','465'],
            ['#MAIL_USE_SSL','True'],
            ['#MAIL_USE_TLS','True'],
            ['#MAIL_USERNAME','email@email.com'],
            ['#MAIL_PASSWORD','password'],
            ['#MAIL_DEFAULT_SENDER','LOST Notification System <email@email.com>'],
            ['#MAIL_LOST_URL','http://mylostinstance.url/']
        ]
        if args.add_gpu_worker:
            config.append(['#===============================',' #'])
            config.append(['#= Additional GPU worker config ',' #'])
            config.append(['#===============================',' #'])
            config.append(['PYTHONPATH','/code/backend'])
            config.append(['ENV_NAME','lost-cv-gpu'])
            config.append(['WORKER_NAME','lost-cv-gpu-0'])
            config.append(['PY3_INIT','source /opt/conda/bin/activate/ lost'])
            config.append(['#LOST_DB_IP','db-lost'])
            config.append(['#LOST_DB_PORT','3306'])
            config.append(['#RABBITMQ_IP','rabbitmqlost'])
            config.append(['#RABBITMQ_PORT','5672'])

        with open(env_path, 'w') as f:
            for key, val in config:
                f.write('{}={}\n'.format(key, val))
        return

    def create_gpu_worker_config(self, gpu_env_file_name, run_script_name):
        gpu_env_path = os.path.join(self.dst_docker_dir, gpu_env_file_name)
        self.write_env_config(gpu_env_path)
        logging.info('Created {}'.format(gpu_env_path))    
        docker_run_script = os.path.join(self.dst_docker_dir, run_script_name)
        with open(docker_run_script, 'w') as f:
            f.write(('docker run --runtime=nvidia '
                '--name lost-cv-gpu --network "docker_default" '
                '--env-file {} --restart=always '
                '-v {}:/home/lost '
                'l3pcv/lost-cv-gpu:{} bash /entrypoint.sh'
                ).format(gpu_env_file_name, self.dst_data_dir, self.release))
        logging.info('Created {}'.format(docker_run_script))
        
    def main(self):
        try:
            os.makedirs(args.install_path)
            logging.info('Created: {}'.format(args.install_path))
        except OSError:
            logging.warning('Path already exists: {}'.format(args.install_path))
            return
        os.makedirs(self.dst_data_dir)
        logging.info('Created: {}'.format(self.dst_data_dir))
        os.makedirs(self.dst_docker_dir)
        logging.info('Created: {}'.format(self.dst_docker_dir))
        # example_config_path = '../compose/prod-docker-compose.yml'
        dst_config = os.path.join(self.dst_docker_dir, 'docker-compose.yml')
        # shutil.copy(example_config_path, dst_config)
        self.write_docker_compose(dst_config)
        env_path = os.path.join(self.dst_docker_dir,'.env')
        self.write_env_config(env_path)
        logging.info('Created {}'.format(env_path))
        if args.add_gpu_worker:
            self.create_gpu_worker_config('.gpu_env', 'run_gpu_worker.sh')
        logging.info('')
        logging.info('Finished setup! To test LOST run:')
        logging.info('======================================================')
        logging.info('1) Type the command below into your command line:')
        logging.info('   cd {}; docker-compose up'.format(self.dst_docker_dir))
        n = 2
        if args.add_gpu_worker:
            logging.info('{}) Start gpu-worker with command below:'.format(n))
            logging.info('   cd {}; bash run_gpu_worker.sh'.format(self.dst_docker_dir))
            n += 1
        logging.info('{}) Open your browser and navigate to: http://localhost'.format(n))
        logging.info('    Login user:     admin')
        logging.info('    Login password: admin')
        logging.info('======================================================')



if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Quick setup for lost on linux')
    parser.add_argument('install_path', help='Specify path to install lost.')
    parser.add_argument('--release', help='LOST release you want to install.', default=None)
    parser.add_argument('-gpu', '--add_gpu_worker', help='Create also config files for a local gpu worker', action='store_true')
    parser.add_argument('-noai', '--no_ai', help='Do not add ai examples and no lost-cv worker', action='store_true')
    args = parser.parse_args()
    qs = QuickSetup(args)
    qs.main()
