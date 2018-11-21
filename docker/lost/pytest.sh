 #!/bin/bash
export PYTHONPATH=$PYTHONPATH:/code/backend
source /opt/conda/bin/activate lost

mkdir -p ${LOST_HOME}/logs
python3 /code/backend/lost/logic/init/initlost.py

pytest /code/backend/lost