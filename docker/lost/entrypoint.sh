#!/bin/bash

 # init env vars 
if [ -z "${LOST_DB_IP}" ]; then
  export LOST_DB_IP="db-lost"
fi

if [ -z "${LOST_DB_PORT}" ]; then
  export LOST_DB_PORT=3306
fi

if [ -z "${RABBITMQ_IP}" ]; then
  export RABBITMQ_IP="rabbitmqlost"
fi

if [ -z "${RABBITMQ_PORT}" ]; then
  export RABBITMQ_PORT=5672
fi

# Wait for database to get available
#wait for l3p mysql
nc -z $LOST_DB_IP $LOST_DB_PORT
n=$?
while [ $n -ne 0 ]; do
    sleep 1
    nc -z $LOST_DB_IP $LOST_DB_PORT
    n=$?
    echo "$(date): Waiting for MySQL@$LOST_DB_IP:$LOST_DB_PORT"
done

#wait for rabbitmq
nc -z $RABBITMQ_IP $RABBITMQ_PORT
n=$?
while [ $n -ne 0 ]; do
    sleep 1
    nc -z $RABBITMQ_IP $RABBITMQ_PORT
    n=$?
    echo "$(date): Waiting for RabbitMQ@$RABBITMQ_IP:$RABBITMQ_PORT"
done

mkdir -p ${LOST_HOME}/logs
touch ${LOST_HOME}/logs/celery_beat_web.log
touch ${LOST_HOME}/logs/celery_default_worker.log

#init flask (create user, migrate)
python3 /code/l3pweb/manage.py migrate
python3 /code/l3pweb/manage.py makemigrations
exists=$(echo "from django.contrib.auth.models import User; \
print(User.objects.filter(username=os.environ['L3P_SU_USERNAME']).exists())" | python3 /code/l3pweb/manage.py shell)
if [[ "$exists" == *"False"* ]]; then
  echo "from django.contrib.auth.models import User; \
  User.objects.create_superuser(os.environ['L3P_SU_USERNAME'], os.environ['L3P_SU_EMAIL'], os.environ['L3P_SU_PWD'], first_name='Admin', last_name='L3P')" | python3 /code/l3pweb/manage.py shell
  echo "$(date): Created new L3P Superuser '${L3P_SU_USERNAME}'"
else
  echo "$(date): WARNING: L3P Superuser '${L3P_SU_USERNAME}' is already existing. Made no changes."
fi

# celery cronjob.
celery="celery -A lost beat -l info --workdir /code/backend/lost/ -f ${LOST_HOME}/logs/celery_beat_lost.log"
eval $celery &

#start a celery worker.
worker="celery -A lost worker -l info --workdir /code/backend/lost/ -f ${LOST_HOME}/logs/celery_default_worker.log"
eval $worker &

python3 /code/backend/logic/init/cli/lost.py

if [ ${DEV} = "True" ]; then
  python3 /code/l3pweb/manage.py runserver 0.0.0.0:8000
else
  cd /code/l3pweb/
  python3 /code/l3pweb/manage.py collectstatic --noinput
  gunicorn l3pweb.wsgi -b 0.0.0.0:8000
fi
