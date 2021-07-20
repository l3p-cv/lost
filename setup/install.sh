#!/bin/bash

# configuration section
# (feel free to change variables in here)

# allow mamba to skip installation confirmations
export CONDA_ALWAYS_YES="true"

# add AI annotation examples to installation
export ADD_EXAMPLES=True
export ADD_AI_EXAMPLES=True

#
# end of configuration section
#

# make conda available inside bash shell scripts
eval "$(conda shell.bash hook)"

# save current working directory in case we need to go back to it
INSTALLER_LOCATION_DIR=`pwd`
TARGET_LOCATION_DIR=/usr/local/src/lost

# show welcome message :)
echo -e ' \t ' 🚈🚃🚃🚃🚃🚃🚃🚃🚃🚃🚃🚃
echo -e ' \t ' LOST installation script
echo -e ' \t ' 🚈🚃🚃🚃🚃🚃🚃🚃🚃🚃🚃🚃

echo
echo 🛠️  installing system requirements
sudo apt-get update && sudo apt-get install -y --no-install-recommends wget curl bzip2 python3.5 nginx \
    python3-pip python3-setuptools python3-dev build-essential libigraph0-dev \
    libsm6 libxext6 libssl-dev libtool autoconf automake bison flex libglib2.0-0 libxrender1 ffmpeg
sudo apt-get update && sudo apt-get install -y --no-install-recommends gnupg gnupg2 gnupg1

# activate mamba
conda activate
conda config --add channels conda-forge

echo
echo 🛠️  installing backend dependencies
# create mamba env named lost with all needed dependencies
mamba create -n lost adlfs bokeh dask distributed \
    flask==1.1.2 flask-jwt-extended==3.13.1 flask-cors flask-ldap3-login flask-mail flask-restx flask-sqlalchemy flask-user flask-wtf \
    fsspec imagesize mysqlclient numpy opencv pandas pyjwt=1.7.1 pytest python-igraph sphinx sk-video sqlalchemy scikit-image \
    uwsgi nodejs==14.17.1

conda clean -ay

# activate python environment
conda activate lost

echo
echo 🛠️  creating lost log directory
sudo mkdir -p /var/log/lost/
sudo echo "" > /var/log/lost/uswgi.log

echo
echo 🛠️  installing frontend dependencies
cd frontend/lost
npm install

echo
echo 🛠️  building frontend
npm run build
sudo mkdir -p $TARGET_LOCATION_DIR/frontend/lost
sudo cp -r build $TARGET_LOCATION_DIR/frontend/lost
cd $INSTALLER_LOCATION_DIR

echo
echo 🛠️  copying backend
# copy backend  source code
sudo cp -r backend $TARGET_LOCATION_DIR/

# copy undockerized wsgi.ini
sudo cp setup/wsgi.ini $TARGET_LOCATION_DIR/backend/lost

# copy documentation
sudo mkdir /usr/share/doc/lost
sudo cp -r docs /usr/share/doc/lost

echo
echo 🛠️  setting up nginx
# copy & activate nginx config
sudo cp setup/nginx.conf /etc/nginx/sites-available/lost.conf
sudo ln -s /etc/nginx/sites-available/lost.conf /etc/nginx/sites-enabled/lost.conf
sudo service nginx restart

echo
echo 🛠️  initializing application
# tell lost where it's base directory is
export PYTHONPATH=$TARGET_LOCATION_DIR/backend

# finally initialize python environment (install database tables etc..)
python3 $TARGET_LOCATION_DIR/backend/lost/logic/init/initlost.py
cd $TARGET_LOCATION_DIR/backend/lost/cli && bash import_examples.sh && cd -

# prepare startup script
sudo cp setup/start.sh $TARGET_LOCATION_DIR/start.sh
sudo cp setup/lost.service /etc/systemd/system/lost.service

sudo systemctl enable lost.service
sudo systemctl start lost.service

echo
echo ℹ️  LOST will start at boot.
echo To change this, type:
echo "systemctl disable lost.service"
echo
echo 🏁  installation finished
