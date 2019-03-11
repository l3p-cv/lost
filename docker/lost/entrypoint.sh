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

mkdir -p ${LOST_HOME}/logs

python3 /code/backend/lost/logic/init/initlost.py
cd /code/backend/lost/cli && bash import_examples.sh && cd -
cd /code/docs/sphinx &&  make html && cd -
python3 /code/backend/lost/logic/init/initworker.py


# celery cronjob.
celery="celery -A flaskapp.celery beat -l info --workdir /code/backend/lost/ -f ${LOST_HOME}/logs/beat.log  --schedule=/tmp/celerybeat-schedule --pidfile=/tmp/celerybeat.pid"
eval $celery &

#start a celery worker.
worker="celery -A flaskapp.celery worker -Q celery,worker_status,$ENV_NAME -n $WORKER_NAME@%h -l info --workdir /code/backend/lost/ -f ${LOST_HOME}/logs/$WORKER_NAME.log"
eval $worker &

if [ ${DEBUG} = "True" ]; then
  cp /code/docker/lost/nginx/dev.conf /etc/nginx/conf.d/default.conf
  # start nginx web server
  nginx="service nginx start"
  eval $nginx &
  # start flask dev server
  endpoint="python3 /code/backend/lost/app.py"
  eval $endpoint 
else
  cp /code/docker/lost/nginx/prod.conf /etc/nginx/conf.d/default.conf
  # start nginx web server
  nginx="service nginx start"
  eval $nginx &
  # start uswgi server
  endpoint="cd /code/backend/lost/ && uwsgi --ini wsgi.ini --logto ${LOST_HOME}/logs/uswgi.log"
  eval $endpoint 
fi
