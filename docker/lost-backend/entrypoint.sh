#!/bin/bash

 # init env vars 
if [ -z "${MAN_DB_IP}" ]; then
  export MAN_DB_IP="db-django"
fi

if [ -z "${MAN_DB_PORT}" ]; then
  export MAN_DB_PORT=3306
fi

if [ -z "${L3P_DB_IP}" ]; then
  export L3P_DB_IP="db-l3p"
fi

if [ -z "${L3P_DB_PORT}" ]; then
  export L3P_DB_PORT=3306
fi

if [ -z "${RABBITMQ_IP}" ]; then
  export RABBITMQ_IP="rabbitmql3p"
fi

if [ -z "${RABBITMQ_PORT}" ]; then
  export RABBITMQ_PORT=5672
fi

# Wait for database to get available
#wait for man mysql
nc -z $MAN_DB_IP $MAN_DB_PORT
n=$?
while [ $n -ne 0 ]; do
    sleep 1
    nc -z $MAN_DB_IP $MAN_DB_PORT
    n=$?
    echo "$(date): Waiting for MySQL@$MAN_DB_IP:$MAN_DB_PORT"
done

#wait for l3p mysql
nc -z $L3P_DB_IP $L3P_DB_PORT
n=$?
while [ $n -ne 0 ]; do
    sleep 1
    nc -z $L3P_DB_IP $L3P_DB_PORT
    n=$?
    echo "$(date): Waiting for MySQL@$L3P_DB_IP:$L3P_DB_PORT"
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

mkdir -p ${L3P_HOME}/logs
touch ${L3P_HOME}/logs/celery_beat_web.log
touch ${L3P_HOME}/logs/celery_default_worker.log

#init django (create user, migrate)
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
celery="celery -A l3pweb beat -l info --workdir /code/l3pweb/ -f ${L3P_HOME}/logs/celery_beat_web.log"
eval $celery &

#start a celery worker.
worker="celery -A l3pweb worker -l info --workdir /code/l3pweb/ -f ${L3P_HOME}/logs/celery_default_worker.log"
eval $worker &

python3 /code/l3py/init/cli/l3p.py

if [ ${DEV} = "True" ]; then
  python3 /code/l3pweb/manage.py runserver 0.0.0.0:8000
else
  cd /code/l3pweb/
  python3 /code/l3pweb/manage.py collectstatic --noinput
  gunicorn l3pweb.wsgi -b 0.0.0.0:8000
fi
