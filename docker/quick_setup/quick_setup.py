import argparse
import os
import logging
import shutil
import random
import string 
import sys
sys.path.append('../../backend')
import lost
current_version = lost.__version__

logging.basicConfig(level=logging.INFO, format='(%(levelname)s): %(message)s')

def gen_rand_string(n):
    return ''.join(
        random.SystemRandom().choice(
            string.ascii_uppercase + string.digits
        ) for _ in range(n))

def get_env_config(data_path, release, secret_key, gpu_worker=False):
    config = [
        ['DEBUG','False'],
        ['ADD_EXAMPLES','True'],
        ['LOST_VERSION', release],
        ['LOST_FRONTEND_PORT', 80],
        ['LOST_DATA', data_path],
        ['LOST_DB_NAME', 'lost'],
        ['LOST_DB_USER', 'lost'],
        ['LOST_DB_PASSWORD', 'LostDbLost'],
        ['LOST_DB_ROOT_PASSWORD', 'LostRootLost'],
        ['SECRET_KEY', secret_key],
        ['PIPE_SCHEDULE', '5'],
        ['WORKER_BEAT', 10],
        ['WORKER_TIMEOUT',30],
        ['#= Your Mail config here',' #'],
        ['#MAIL_SERVER','mailserver.com'],
        ['#MAIL_PORT','465'],
        ['#MAIL_USE_SSL','True'],
        ['#MAIL_USE_TLS','True'],
        ['#MAIL_USERNAME','email@email.com'],
        ['#MAIL_PASSWORD','password'],
        ['#MAIL_DEFAULT_SENDER','LOST Notification System <email@email.com>'],
        ['#MAIL_LOST_URL','http://mylostinstance.url/']
    ]
    if gpu_worker:
        config.append(['#= Additional GPU worker config',' #'])
        config.append(['PYTHONPATH','/code/backend'])
        config.append(['ENV_NAME','lost-cv-gpu'])
        config.append(['WORKER_NAME','lost-cv-gpu-0'])
        config.append(['PY3_INIT','source /opt/conda/bin/activate/ lost'])
        config.append(['#LOST_DB_IP','db-lost'])
        config.append(['#LOST_DB_PORT','3306'])
        config.append(['#RABBITMQ_IP','rabbitmqlost'])
        config.append(['#RABBITMQ_PORT','5672'])

    return config

def create_gpu_worker_config(dst_docker_dir, dst_data_dir, args, secret_key):
    if args.release is not None:
        my_version = args.release
    else:
        my_version = current_version
    gpu_env_file_name = '.gpu_env'
    gpu_env_path = os.path.join(dst_docker_dir, gpu_env_file_name)
    with open(gpu_env_path, 'w') as f:
        env_config = get_env_config(dst_data_dir, my_version , secret_key, gpu_worker=True)

        for key, val in env_config:
            f.write('{}={}\n'.format(key, val))
    logging.info('Created {}'.format(gpu_env_path))    
    docker_run_script = os.path.join(dst_docker_dir, 'run_gpu_worker.sh')
    with open(docker_run_script, 'w') as f:
        f.write(('docker run --runtime=nvidia '
            '--name lost-cv-gpu --network "docker_default" '
            '--env-file {} --restart=always '
            '-v {}:/home/lost '
            'l3pcv/lost-cv-gpu:{} bash /entrypoint.sh'
            ).format(gpu_env_file_name, dst_data_dir, my_version))
    logging.info('Created {}'.format(docker_run_script))
    
def main(args):
    try:
        os.makedirs(args.install_path)
        logging.info('Created: {}'.format(args.install_path))
    except OSError:
        logging.warning('Path already exists: {}'.format(args.install_path))
        return
    dst_data_dir = os.path.join(args.install_path, 'data')
    os.makedirs(dst_data_dir)
    logging.info('Created: {}'.format(dst_data_dir))
    dst_docker_dir = os.path.join(args.install_path, 'docker')
    os.makedirs(dst_docker_dir)
    logging.info('Created: {}'.format(dst_docker_dir))
    example_config_path = '../compose/prod-docker-compose.yml'
    dst_config = os.path.join(dst_docker_dir, 'docker-compose.yml')
    shutil.copy(example_config_path, dst_config)
    logging.info('Copied docker-compose config to: {}'.format(dst_config))
    env_path = os.path.join(dst_docker_dir,'.env')
    secret_key = gen_rand_string(16)
    with open(env_path, 'a') as f:
        if args.release is not None:
            env_config = get_env_config(dst_data_dir, args.release, secret_key)
        else:
            env_config = get_env_config(dst_data_dir, current_version, secret_key)

        for key, val in env_config:
            f.write('{}={}\n'.format(key, val))
    logging.info('Created {}'.format(env_path))
    if args.add_gpu_setup:
        create_gpu_worker_config(dst_docker_dir, dst_data_dir, args, secret_key)
    logging.info('')
    logging.info('Finished setup! To test LOST run:')
    logging.info('cd {}; docker-compose up'.format(dst_docker_dir))
    logging.info('and type localhost into you browser')


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Quick setup for lost on linux')
    parser.add_argument('install_path', help='Specify path to install lost.')
    parser.add_argument('--release', help='LOST release you want to install.', default=None)
    parser.add_argument('-gpu', '--add-gpu-setup', help='Create also config files for a local gpu worker', action='store_true')
    args = parser.parse_args()
    main(args)
