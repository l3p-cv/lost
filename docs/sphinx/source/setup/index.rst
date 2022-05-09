.. _setup:

LOST Setup
**********

.. _quick-setup-standard:

Default Setup with Docker
==========================
LOST provides a `quick_setup <https://github.com/l3p-cv/lost/tree/master/docker/quick_setup>`_
script, that will configure LOST and instruct you how to start LOST. 
We designed this script for Linux environments,
but it will also work on Windows host machines.

LOST releases are hosted on DockerHub and shipped in Containers. For a quick setup perform the following steps (these steps have been tested for Ubuntu):

1. Install docker on your machine or server:
    https://docs.docker.com/install/
2. Install docker-compose:
    https://docs.docker.com/compose/install/
3. Clone LOST:
    .. code-block:: bash

        git clone https://github.com/l3p-cv/lost.git
4. Install the *cryptography* package in your python environment:
    .. code-block:: bash

        pip install cryptography
    
5. Run quick_setup script:
    .. code-block:: bash

        cd lost/docker/quick_setup/
        python3 quick_setup.py /path/to/install/lost --release 2.0.0
    
    If you want to use phpmyadmin, you can set it via argument
    
    .. code-block:: bash
        
        python3 quick_setup.py /path/to/install/lost --release 2.0.0 --phpmyadmin

6. Run LOST:

    Follow instructions of the quick_setup script, 
    printed in the command line.

.. note::
    
    The quick setup script has now created the docker configuration files 
    ``docker-compose.yml`` and ``.env`` . In the following sections, 
    additional desired configurations usually refer to these two files.
    



Setup On Linux (without docker)
=====================================
#TODO: JG
