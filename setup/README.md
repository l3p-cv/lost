# LOST installation script

## Installation

To install the lost application without docker, do the following steps:  

1. Install requirements
Mamba, Nginx and NodeJS are required in order to install LOST. Nginx and NodeJS are automatically installed during installation.  
**Please check if the [mamba package manager](https://github.com/mamba-org/mamba) is installed**

2. Clone the repository  
`git clone https://github.com/l3p-cv/lost.git`

3. Step into the cloned repository  
`cd lost`

4. configure settings for your environment  
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

**Important:** This config file can only be used **before** installation since it will be copied to `/usr/local/src/lost/backend/lostconfig.py`. But you can make your changes there once the application is installed.

5. Make istallation script executable  
`chmod +x setup/install.sh`

6. Check if conda is initialized  
`conda init bash`  
If a message like *For changes to take effect, close and re-open your current shell.* appears, this is the first time you initialized conda. Please close and reopen your terminal or ssh session.

7. Start the installation  
The script must run **without** sudo privileges, but the script will ask for it's password since some steps require sudo.  
`./setup/install.sh`

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
