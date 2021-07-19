# LOST installation script

## installation
To install the lost application without docker, enter following command in your terminal:  
`bash setup/install.sh`

## configure environment

To change environment settings (for example the database host) edit the lostconfig.py file:  
`vim /usr/local/src/lost/backend/lostconfig.py`  
An example lostconfig for a docker-free installation is located in `setup/lostconfig_example.py`.


## startup
The installation script will automatically crate a service entry called `lost`.  
If you want to start lost without the service, enter following command in your terminal:  
`bash setup/start.sh`
