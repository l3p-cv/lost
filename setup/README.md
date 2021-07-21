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

4. Activate mamba  
`/path/to/mamba init bash`  
If a message like *For changes to take effect, close and re-open your current shell.* appears, this is the first time you initialized conda. Please close and reopen your terminal or ssh session.

5. Clone the repository  
`git clone https://github.com/l3p-cv/lost.git`

6. Step into the cloned repository  
`cd lost`

7. configure settings for your environment  
Feel free to copy out docker-free-installation example config:  
`cp setup/lostconfig_example.py backend/lostconfig.py`  
In most cases you need to change the following config entries:  
- self.app_path
- self.data_path
- self.lost_db_user
- self.lost_db_name
- self.lost_db_pwd
- self.lost_db_port
- self.lost_db_ip  
`vim backend/lostconfig.py`

**Important:**   This config file can only be used **before** installation since it will be copied to `/usr/local/src/lost/backend/lostconfig.py`. But you can make your changes there once the application is installed.

8. Start the installation  
`bash setup/install.sh`

## Configure environment

To change environment settings (for example the database host) edit the lostconfig.py file:  
`vim /usr/local/src/lost/backend/lostconfig.py`  
An example lostconfig file for a docker-free installation is located in `setup/lostconfig_example.py`.


## Startup
The installation script will automatically crate a service entry called `lost`.  
If you want to start lost without the service, enter following commands in your terminal:  
```bash
conda activate lost
/usr/local/src/lost/start.sh
```
