#!/bin/bash

# lost will store filed needed to run the application in this directory
export LOST_BASE_DIR=/code

# lost will log files into this directory
export LOST_LOG_DIR=/var/log/lost/

# set python path to find custom python modules
export PYTHONPATH=$LOST_BASE_DIR/src/backend

export LOST_USE_DOCKER=False
export LOST_DEBUG_MODE=False
export LOST_WORKER_MANAGEMENT=dynamic

export LOST_APP_PATH=
export LOST_DATA_PATH=

# database is already configured in docker env file when using docker
if [ -z ${IS_USING_DOCKER+x} ] || [ "$IS_USING_DOCKER" != "true" ]; then
    export LOST_DB_CONNECTOR=mysql
    export LOST_DB_IP=127.0.0.1
    export LOST_DB_PORT=3306
    export LOST_DB_NAME=lost
    export LOST_DB_USER=lost
    export LOST_DB_PASSWORD=pleaseChangeIt
fi