#!/bin/bash

# init env vars 
export LOST_HOME="/home/lost"

if [ -z "${LOST_DB_IP}" ]; then
  export LOST_DB_IP="db"
fi

if [ -z "${LOST_DB_PORT}" ]; then
  export LOST_DB_PORT=3306
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

python3 /code/lost/logic/init/initlost.py
python3 /code/lost/logic/init/initworker.py

# start scheduler.
daskscheduler="dask-scheduler"
eval $daskscheduler &

#start a worker.
worker="dask-worker localhost:8786 --name $LOST_WORKER_NAME"
eval $worker &

# start cronjobs
cron_jobs="python3 /code/lost/logic/jobs/cron_jobs.py"
eval $cron_jobs &

# start jupyter-lab instance if configured
if [ -n "${LOST_JUPYTER_LAB_ACTIVE}" ] && [ ${LOST_JUPYTER_LAB_ACTIVE} = "True" ]; then
  jupyter="jupyter-lab --allow-root --ip='0.0.0.0' --ServerApp.token=${LOST_JUPYTER_LAB_TOKEN:-'lostdevelopment'} --ServerApp.notebook_dir=${LOST_JUPYTER_LAB_ROOT_PATH:-'/code/src'}"
  eval $jupyter &
fi

# @TODO remove?
if [[ -z "${LOST_GIT_USER}" ]]; then
  echo ""
else
  git config --global user.name "$LOST_GIT_USER"
  git config --global user.email "$LOST_GIT_EMAIL"
  git config --global credential.helper store
  printf $LOST_GIT_ACCESS_TOKEN >> /root/.git-credentials
  chmod 600 /root/.git-credentials
fi

# start webserver
if [ ${LOST_DEBUG_MODE} = "True" ]; then
  # start flask dev server
  python3 /code/lost/app.py
else
  # start uswgi production server
  cd /code/lost
  uwsgi --ini wsgi.ini
fi
