#!/bin/bash

# folder where the cloned repo is located (only needed while installing)
LOST_INSTALLER_LOCATION_FILE=$(readlink -f $0)
LOST_SETUP_LOCATION_DIR=`dirname $LOST_INSTALLER_LOCATION_FILE`
export LOST_REPO_LOCATION_DIR=`dirname $LOST_SETUP_LOCATION_DIR`

# fetch basic / runtime environment variables
source $LOST_REPO_LOCATION_DIR/lost-env.sh

# fetch setup environment variables
source $LOST_SETUP_LOCATION_DIR/lost-setup-env.sh

# escape file path for sed
ESCAPED_LOST_BASE_DIR=${LOST_BASE_DIR//\//\\/}

# show welcome message :)
echo -e ' \t ' 🔍🔍🔍🔍🔍🔍🔍🔍🔍🔍🔍🔍
echo -e ' \t ' LOST installation script
echo -e ' \t ' 🔍🔍🔍🔍🔍🔍🔍🔍🔍🔍🔍🔍

echo
echo 🛠️  installing backend dependencies

# mamba env is created in lost-base when using docker 
if [ -z ${IS_USING_DOCKER+x} ] || [ "$IS_USING_DOCKER" != "true" ]; then
    # create mamba env named lost with all needed dependencies
    $LOST_MAMBA_BASE_DIR/bin/mamba create -n lost adlfs bokeh dask distributed \
        flask==1.1.2 flask-jwt-extended==3.13.1 flask-cors flask-ldap3-login flask-mail flask-restx flask-sqlalchemy flask-user flask-wtf jupyterlab \
        fsspec imagesize mysqlclient numpy opencv pandas pyjwt=1.7.1 pytest python python-devtools python-igraph sphinx sk-video sqlalchemy scikit-image \
        uwsgi nodejs==14.17.1 $LOST_MAMBA_ADDITIONAL_PACKAGES
fi

# make conda available inside bash shell scripts
eval "$($LOST_MAMBA_BASE_DIR/bin/conda shell.bash hook)"

# use mamba dirs
source $LOST_MAMBA_BASE_DIR/bin/activate lost

echo
echo 🛠️  creating lost log directory
mkdir -p $LOST_LOG_DIR
echo "" > $LOST_LOG_DIR/uswgi.log

echo
echo 🛠️  creating lost base directory
mkdir -p $LOST_BASE_DIR

echo
echo 🛠️  installing frontend dependencies
mkdir -p $LOST_BASE_DIR/build
cp -r $LOST_REPO_LOCATION_DIR/frontend $LOST_BASE_DIR/build
cd $LOST_BASE_DIR/build/frontend/lost
npm install --unsafe-perm=true --allow-root

echo
echo 🛠️  building frontend
npm run build
mkdir -p $LOST_BASE_DIR/src/frontend/lost
cp -r $LOST_BASE_DIR/build/frontend/lost/build $LOST_BASE_DIR/src/frontend/lost/
cd $LOST_REPO_LOCATION_DIR

echo
echo 🛠️  copying backend
# copy backend  source code
cp -r $LOST_REPO_LOCATION_DIR/backend $LOST_BASE_DIR/src/

echo
echo 🛠️  adding config to wsgi.ini

# insert uwsgi port from variable
sed -i "s/--socket-port-inserted-by-installation-script--/$LOST_UWSGI_PORT/" $LOST_SETUP_LOCATION_DIR/wsgi.ini

# insert file path from variable
sed -i "s/chdir=--chdir-inserted-by-installation-script--/chdir=$ESCAPED_LOST_BASE_DIR\/src\/backend\/lost/" $LOST_SETUP_LOCATION_DIR/wsgi.ini
cp $LOST_SETUP_LOCATION_DIR/wsgi.ini $LOST_BASE_DIR/src/backend/lost

# copy documentation
mkdir -p $LOST_LOG_DIR
cp -r $LOST_REPO_LOCATION_DIR/docs $LOST_DOCUMENTATION_DIR

echo
echo 🛠️  setting up nginx

# escape file path for sed
ESCAPED_LOST_DOCUMENTATION_DIR=${LOST_DOCUMENTATION_DIR//\//\\/}

# insert uwsgi port from variable
sed -i "s/--socket-port-inserted-by-installation-script--/$LOST_UWSGI_PORT/" $LOST_SETUP_LOCATION_DIR/nginx.conf

# insert file paths from variable
sed -i "s/--nginx-base-alias-inserted-by-installation-script--/$ESCAPED_LOST_BASE_DIR\/src\/frontend\/lost\/build\//" $LOST_SETUP_LOCATION_DIR/nginx.conf
sed -i "s/--nginx-docs-alias-inserted-by-installation-script--/$ESCAPED_LOST_DOCUMENTATION_DIR\/build\/html\//" $LOST_SETUP_LOCATION_DIR/nginx.conf

# skip initialisation when installing with Dockerfile (will be done in entrypoint because of DB access)
if [ -z ${IS_USING_DOCKER+x} ] || [ "$IS_USING_DOCKER" != "true" ]; then

    # copy & activate nginx config
    cp $LOST_SETUP_LOCATION_DIR/nginx.conf $LOST_NGINX_SITES_DIR/lost.conf
    service nginx restart

    echo
    echo 🛠️  initializing application
    # finally initialize python environment (install database tables etc..)
    python3 $LOST_BASE_DIR/src/backend/lost/logic/init/initlost.py
    cd $LOST_REPO_LOCATION_DIR
else
    mkdir -p $LOST_BASE_DIR/src/backend/lost/media
fi

# prepare startup script
cp $LOST_SETUP_LOCATION_DIR/start.sh $LOST_BASE_DIR/start.sh
cp $LOST_REPO_LOCATION_DIR/lost-env.sh $LOST_BASE_DIR/lost-env.sh

echo
echo 🏁  installation finished
echo 
echo ➡️  Start LOST by typing:
echo "source $LOST_MAMBA_BASE_DIR/bin/activate lost"
echo "bash $LOST_BASE_DIR/start.sh"
echo
echo "ℹ️ Environment File (lost-env.sh) in now located at:"
echo "$LOST_BASE_DIR/lost-env.sh"
echo