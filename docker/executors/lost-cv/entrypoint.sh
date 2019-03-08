#!/bin/bash
 /bin/bash -c "source /opt/conda/bin/activate lost"
source /opt/conda/bin/activate lost


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

#wait for rabbitmq
nc -z $RABBITMQ_IP $RABBITMQ_PORT
n=$?
while [ $n -ne 0 ]; do
    sleep 1
    nc -z $RABBITMQ_IP $RABBITMQ_PORT
    n=$?
    echo "$(date): Waiting for RabbitMQ@$RABBITMQ_IP:$RABBITMQ_PORT"
done

echo "All Services ready. Starting celery worker now."

#mkdir -p ${LOST_HOME}/logs
python3 /code/backend/lost/logic/init/initworker.py

#start celery worker.
worker="celery -A flaskapp.celery worker -Q worker_status,$ENV_NAME -n $WORKER_NAME@%h -l info --workdir /code/backend/lost/ -f ${LOST_HOME}/logs/$WORKER_NAME.log"
eval $worker

