#!/bin/bash
 /bin/bash -c "source /opt/mambaforge/bin/activate lost"
source /opt/mambaforge/bin/activate lost
source /code/lost-env.sh

# clean celery lock
rm -rf /tmp/celerybeat.pid

# init env vars 
export LOST_HOME="/home/lost"

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

python3 /code/src/backend/lost/logic/init/initlost.py
cd /code/src/backend/lost/cli && bash import_examples.sh && cd -
# cd /code/docs/sphinx &&  make html && cd -
python3 /code/src/backend/lost/logic/init/initworker.py
python3 /code/src/backend/lost/logic/init/init_patchsystem.py


# start scheduler.
daskscheduler="dask-scheduler"
eval $daskscheduler &

#start a worker.
worker="dask-worker localhost:8786 --name $ENV_NAME"
eval $worker &

cron_jobs="python3 /code/src/backend/lost/logic/jobs/cron_jobs.py"
eval $cron_jobs &

# remove config in case debug mode changed
if [ -f "/etc/nginx/conf.d/lost.conf" ]; then
  rm /etc/nginx/conf.d/lost.conf
fi

if [ ${LOST_DEBUG_MODE} = "True" ]; then
  if [ "$CUSTOM_NGINX_CONF" != "True" ]; then
    ln -s /etc/nginx/sites-available/dev.conf /etc/nginx/conf.d/lost.conf
  fi
  # start nginx web server
  nginx="service nginx start"
  eval $nginx &
  # start flask dev server
  endpoint="python3 /code/src/backend/lost/app.py"
  eval $endpoint 
else
  if [ "$CUSTOM_NGINX_CONF" != "True" ]; then
	  ln -s /etc/nginx/sites-available/prod.conf /etc/nginx/conf.d/lost.conf
  fi
  # start nginx web server
  nginx="service nginx start"
  eval $nginx &
  # start uswgi server
  #endpoint="cd /code/src/backend/lost/ && uwsgi --ini wsgi.ini --logto ${LOST_HOME}/logs/uswgi.log"
  endpoint="cd /code/ && bash start.sh"
  eval $endpoint 
fi