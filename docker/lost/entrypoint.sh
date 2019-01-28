#!/bin/bash
 /bin/bash -c "source /opt/conda/bin/activate lost"
source /opt/conda/bin/activate lost

# clean celery lock
rm -rf /tmp/celerybeat.pid

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
nc -z $LOST_DB_IP $LOST_DB_PORT
n=$?
while [ $n -ne 0 ]; do
    sleep 1
    nc -z $LOST_DB_IP $LOST_DB_PORT
    n=$?
    echo "$(date): Waiting for MySQL@$LOST_DB_IP:$LOST_DB_PORT"
done

#wait for rabbitmq
# nc -z $RABBITMQ_IP $RABBITMQ_PORT
# n=$?
# while [ $n -ne 0 ]; do
#     sleep 1
#     nc -z $RABBITMQ_IP $RABBITMQ_PORT
#     n=$?
#     echo "$(date): Waiting for RabbitMQ@$RABBITMQ_IP:$RABBITMQ_PORT"
# done

mkdir -p ${LOST_HOME}/logs

python3 /code/backend/lost/logic/init/initlost.py
cd /code/backend/lost/cli && bash import_examples.sh && cd -
cd /code/docs/sphinx &&  make html && cd -

if [ ${DEV} = "True" ]; then
  nginx="service nginx start"
  eval $nginx &

  # celery cronjob.
  celery="celery -A app.celery beat -l info --workdir /code/backend/lost/ -f ${LOST_HOME}/logs/celery_beat_web.log  --schedule=/tmp/celerybeat-schedule --pidfile=/tmp/celerybeat.pid"
  eval $celery &

  #start a celery worker.
  worker="celery -A app.celery worker -l info --workdir /code/backend/lost/ -f ${LOST_HOME}/logs/celery_default_worker.log"
  eval $worker &


  endpoint="python3 /code/backend/lost/app.py"
  eval $endpoint 


else
  echo "Production version not yet supported."
  #gunicorn lost.wsgi -b 0.0.0.0:8000
fi
