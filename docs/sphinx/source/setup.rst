.. _quick-setup:

LOST Quick Setup
****************
#TODO: Review
LOST provides a `quick_setup <https://github.com/l3p-cv/lost/tree/master/docker/quick_setup>`_
script, 
that will configure LOST and instruct you how to start LOST. 
We designed this script for Linux environments,
but it will also work on Windows host machines.

The quick_setup will import some out-of-the-box annotation pipelines and
example label trees.
When you start LOST,
all required docker containers will be downloaded from DockerHub and
started on your machine.
The following containers are used in different combinations by the LOST
quick_setup:

* **mysql** ~124 MB download (extracted 372 MB)
* **rabbitmq** ~90 MB download (extracted 149 MB)
* **lost** ~1 GB download (extracted 2.95 GB)
* **lost-cv** ~3 GB download (extracted 6.94 GB)
* **lost-cv-gpu** ~4 GB download (extracted 8.33 GB), an **nvidia docker** container

There are three configurations that can be created with the
**quick_setup** script:

1. A :ref:`standard config <quick-setup-standard>`
   that starts the following containers: **mysql**,
   **rabbitmq**, **lost**, **lost-cv**.
   In this config you are able to run all annotation pipelines that are
   available.
   Semi-automatic pipelines that make use of AI will be executed on your CPU.

2. A :ref:`minimum configuration <quick-setup-standard>` that starts the 
   **mysql**, **rabbitmq** and **lost** container.
   This conifg may only run simple annotation pipelines that have no AI
   included,
   since there is no container that has an :ref:`environment <lost-ecosystem-pipe-engine>`
   installed to perform deep learning algorithms.
   This setup will required the smallest amount of disc space on your machine.

3. A :ref:`gpu config <quick-setup-gpu>` that will allow you to execute
   our semi-automatic AI annotation piplines on your nvidia gpu.
   The following containers will be downloaded:
   **mysql**, **rabbitmq**, **lost** and **lost-cv-gpu**.

.. _quick-setup-standard:

Standard Setup with Docker
==============
#TODO: GR Review

1. Install docker on your machine or server:
    https://docs.docker.com/install/
2. Install docker-compose:
    https://docs.docker.com/compose/install/
3. Clone LOST:
    .. code-block:: bash

        git clone -b 1.x https://github.com/l3p-cv/lost.git
4. Run quick_setup script:
    .. code-block:: bash

        cd lost/docker/quick_setup/
        # python3 quick_setup.py path/to/install/lost
        # If you want to install a specific release,
        # you can use the --release argument to do so.
        python3 quick_setup.py ~/lost
5. Run LOST:
    Follow instructions of the quick_setup script, 
    printed in the command line.

Use PhpMyAdmin
------------------------
#TODO: GR

Activate JupyterLab
------------------------
#TODO: GR

Nginx Configuration
------------------------
#TODO: GR

LOST is shipped in docker containers. 
The base image inherits from an official nginx container. 
LOST is installed in this container. 
The communication to the host system is done via the nginx webserver, which can be configured via a configuration file. 
A differentiation is made between the debug mode and a productive environment.

Configuration File
^^^^^^^^^^^^^^^^^^^^^^
When starting the lost container the corresponding configuration file (depending on debug mode) for nginx is 
copied from the repository into the folder 

    .. code-block:: bash

        /etc/nginx/conf.d/default.conf

by the **entrypoint.sh** script.

Both nginx configuration files can be found at:
`lost/docker/lost/nginx <https://github.com/l3p-cv/lost/blob/master/docker/lost/nginx>`_
in our GitHub repository.


Custom Configuration File
^^^^^^^^^^^^^^^^^^^^^^^^^^
If a custom configuration file is desired, this file must be mounted from the 
host machine into the lost container.

    .. code-block:: yaml

        volumes:
            - /host/path/to/nginx/conf:/etc/nginx/conf.d/default.conf

Standard Setup Linux (without docker)
==============
#TODO: JG

Activate E-Mail Notifications
========================
#TODO: GR 

Activate LDAP
========================
#TODO: GR 

Install LOST from backup
========================
#TODO: GR  Review !

0. Perform full backup with sudo
   .. code-block:: bash

        sudo zip -r backup.zip ~/lost
1. Install docker on your machine or server:
    https://docs.docker.com/install/
2. Install docker-compose:
    https://docs.docker.com/compose/install/
3. Clone LOST:
    .. code-block:: bash

        git clone https://github.com/l3p-cv/lost.git
4. Run quick_setup script:
    .. code-block:: bash

        cd lost/docker/quick_setup/
        # python3 quick_setup.py path/to/install/lost
        # If you want to install a specific release,
        # you can use the --release argument to do so.
        python3 quick_setup.py ~/lost
        sudo rm -rf ~/lost
        unzip backup.zip ~/lost
        
5. Make sure that ~/lost/docker/.env file contains proper absolute path to ~/lost in LOST_DATA
and proper LOST_DB_PASSWORD

6. Run LOST:
    Follow instructions of the quick_setup script, 
    printed in the command line.
 