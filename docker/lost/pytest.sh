 #!/bin/bash
export PYTHONPATH=$PYTHONPATH:/code/src/backend
source /opt/mambaforge/bin/activate lost

mkdir -p ${LOST_HOME}/logs
python3 /code/src/backend/lost/logic/init/initlost.py

pytest /code/src/backend/lost