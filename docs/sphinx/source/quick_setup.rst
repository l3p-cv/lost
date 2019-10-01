.. _quick-setup:

LOST Quick Setup
****************
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

Standard Setup 
==============

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
5. Run LOST:
    Follow instructions of the quick_setup script, 
    printed in the command line.

.. _quick-setup-minimum:

Minimum Setup (LOST only)
=========================

.. note::
    No semi-automatic pipelines will be available for you.
    So almost no magic will happen here ;-)

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
        # python3 quick_setup.py path/to/install/lost -noai
        # If you want to install a specific release,
        # you can use the --release argument to do so.
        python3 quick_setup.py ~/lost -noai
5. Run LOST:
    Follow instructions of the quick_setup script, 
    printed in the command line.

.. _quick-setup-gpu:

LOST + GPU Worker
=================

.. note:: 
    You will need a nvidia GPU to use this setup. 
    This setup will also assume, 
    that LOST and the GPU worker are running on the same host machine.
    
1. Install docker on your machine or server:
    https://docs.docker.com/install/
2. Install docker-compose:
    https://docs.docker.com/compose/install/
3. Install nvidia docker:
    https://github.com/NVIDIA/nvidia-docker#quickstart
4. Clone LOST:
    .. code-block:: bash

        git clone https://github.com/l3p-cv/lost.git
5. Run quick_setup script:
    .. code-block:: bash

        cd lost/docker/quick_setup/
        # python3 quick_setup.py path/to/install/lost -gpu
        # If you want to install a specific release,
        # you can use the --release argument to do so.
        python3 quick_setup.py ~/lost -gpu

6. Run LOST:
    Follow instructions of the quick_setup script, 
    printed in the command line.
    
LOST form backup
=================

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
