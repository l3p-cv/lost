#!/bin/bash
source lost-env.sh

# start cronjob listener
cron_jobs="python3 $LOST_BASE_DIR/src/backend/lost/logic/jobs/cron_jobs.py"
eval $cron_jobs &

# start python webservice
cd $LOST_BASE_DIR/src/backend/lost
uwsgi --ini wsgi.ini