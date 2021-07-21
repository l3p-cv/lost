#!/bin/bash

# lost will store filed needed to run the application in this directory
export LOST_BASE_DIR=/usr/local/src/lost

# lost will log files into this directory
export LOST_LOG_DIR=/var/log/lost/

# set python path to find custom python modules
export PYTHONPATH=$LOST_BASE_DIR/src/backend