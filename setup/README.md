# LOST installation script

## Installation

To install the lost application without docker, do the following steps:  

1. Install apt requirements  
```bash
apt-get update
apt-get install -y --no-install-recommends wget curl bzip2 nginx build-essential libsm6 libxext6 libssl-dev libtool autoconf automake bison flex libglib2.0-0 libxrender1 ffmpeg gnupg gnupg1 gnupg2
```

2. Install mamba  
Please check if the [mamba package manager](https://github.com/mamba-org/mamba) is installed

3. Add the conda-forge channel to mamba  
`/path/to/mamba/bin/conda config --add channels conda-forge`

4. Clone the repository  
`git clone https://github.com/l3p-cv/lost.git`

5. Step into the cloned repository  
`cd lost`

6. configure installation settings for your environment  
`vim setup/lost-setup-env.sh`  

7. configure runtime settings for your environment  
In most cases you need to change the following config entries:  
- LOST_APP_PATH
- LOST_DATA_PATH
- LOST_DB_CONNECTOR
- LOST_DB_IP
- LOST_DB_PORT
- LOST_DB_NAME
- LOST_DB_USER
- LOST_DB_PASSWORD  
`vim lost-env.sh`

**Important:**   This config file can only be used **before** installation since it will be copied to `/usr/local/src/lost/backend/lostconfig.py`. But you can make your changes there once the application is installed.

8. Start the installation  
`bash setup/install.sh`

## Configure environment

To change environment settings (for example the database host) edit the lost-env.sh file:  
`vim /your/installation/path/lost-env.sh`  

## Startup
If you want to start lost enter following commands in your terminal:  
```bash
conda activate lost
/your/installation/path/start.sh
```

## Troubleshooting
### npm installation errors
- Maximum call stack size exceeded  
This error can happen when your connection to the npm servers is blocked. Check out the [npm config](https://docs.npmjs.com/cli/v7/using-npm/config#https-proxy) to configure a connection behind a https proxy.