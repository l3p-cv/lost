#!/bin/bash

# activate lost mamba environment
source /opt/mambaforge/bin/activate lost

# set python path to find custom python modules
export PYTHONPATH=/usr/local/src/lost/backend

# start cronjob listener
cron_jobs="python3 /usr/local/src/lost/backend/lost/logic/jobs/cron_jobs.py"
eval $cron_jobs &

dask_worker="dask-worker localhost:8786 --name lost"
eval $dask_worker &

# start python webservice
cd /usr/local/src/lost/backend/lost
uwsgi --ini wsgi.ini