#!/bin/bash
 /bin/bash -c "source /opt/mambaforge/bin/activate lost"
source /opt/mambaforge/bin/activate lost

# init env vars 
export LOST_HOME="/home/lost"

if [ -z "${LOST_DB_IP}" ]; then
  export LOST_DB_IP="db-lost"
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

python3 /code/src/backend/lost/logic/init/initlost.py
# cd /code/docs/sphinx &&  make html && cd -
python3 /code/src/backend/lost/logic/init/initworker.py
python3 /code/src/backend/lost/logic/init/init_patchsystem.py


# start scheduler.
daskscheduler="dask-scheduler"
eval $daskscheduler &

#start a worker.
worker="dask-worker localhost:8786 --name $LOST_WORKER_NAME"
eval $worker &

cron_jobs="python3 /code/src/backend/lost/logic/jobs/cron_jobs.py"
eval $cron_jobs &

# start jupyter-lab instance if configured
if [ ${LOST_JUPYTER_LAB_ACTIVE} = "True" ]; then
  if [ -z "${LOST_JUPYTER_LAB_ROOT_PATH}" ]; then
    export LOST_JUPYTER_LAB_ROOT_PATH='/code/src'
  fi
  if [ -z "${LOST_JUPYTER_LAB_TOKEN}" ]; then
    export LOST_JUPYTER_LAB_TOKEN='lostdevelopment'
  fi
  if [ -z "${LOST_JUPYTER_LAB_PORT}" ]; then
    export LOST_JUPYTER_LAB_PORT=8888
  fi
  jupyter="jupyter-lab --allow-root --ip='0.0.0.0' --ServerApp.token=$LOST_JUPYTER_LAB_TOKEN --ServerApp.notebook_dir=$LOST_JUPYTER_LAB_ROOT_PATH"
  eval $jupyter &
fi

if [[ -z "${LOST_GIT_USER}" ]]; then
  echo ""
else
  git config --global user.name "$LOST_GIT_USER"
  git config --global user.email "$LOST_GIT_EMAIL"
  git config --global credential.helper store
  printf $LOST_GIT_ACCESS_TOKEN >> /root/.git-credentials
  chmod 600 /root/.git-credentials
fi


# remove config in case debug mode changed
if [ -f "/etc/nginx/conf.d/lost.conf" ]; then
  rm /etc/nginx/conf.d/lost.conf
fi

if [ ${LOST_DEBUG_MODE} = "True" ]; then
  if [ "$CUSTOM_NGINX_CONF" != "True" ]; then
    cp /etc/nginx/sites-available/dev.conf /etc/nginx/conf.d/default.conf
  fi
  # start nginx web server
  nginx="service nginx start"
  eval $nginx &
  # start flask dev server
  endpoint="python3 /code/src/backend/lost/app.py"
  eval $endpoint 
else
  if [ "$CUSTOM_NGINX_CONF" != "True" ]; then
	  cp /etc/nginx/sites-available/prod.conf /etc/nginx/conf.d/default.conf
  fi
  # start nginx web server
  nginx="service nginx start"
  eval $nginx &

  # start uswgi server
  cd /code/src/backend/lost
  uwsgi --ini wsgi.ini
fi