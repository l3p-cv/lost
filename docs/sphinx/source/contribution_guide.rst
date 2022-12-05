Contribution Guide
******************
#TODO JJ Review

How to contribute new features or bug fixes?
============================================
1. Select a feature you want to implement / a bug you want to fix from the `lost issue list <https://github.com/l3p-cv/lost/issues>`_ 
    - If you have a new feature, create a new feature request
2. State in the issue comments that you are willing to implement the feature/ fix the bug
3. We will respond to your comment 
4. Implement the feature
5. Create a pull request 

How to do backend development?
==============================
The backend is written in python. We use flask as webserver and celery to execute 
time consuming tasks.

If you want to adjust backend code and test your changes please perform the following steps:

1. Install LOST as described in :ref:`LOST QuickSetup <quick-setup>`.
2. Adjust the *DEBUG* variable in the *.env* config file. This file should be located at *lost_install_dir/docker/.env*.

  .. code-block:: bash
    :caption: Changes that need to be performed in the *.env* file. This will cause the LOST flask server to start in debug mode.

        DEBUG=True

3. In oder to run your code, you need to mount your code into the docker container. You can do this by adding docker volumes in the *docker-compose.yml* file. The file should be located at *lost_install_dir/docker/docker-compose.yml*. Do this for all containers in the compose file that contain lost source code (lost, lost-cv, lost-cv-gpu)

  .. code-block:: yaml
    :emphasize-lines: 11
    :caption: Adjustments to *docker-compose.yml*. Mount your backend code into the docker container.

      version: '2'
        services:
            lost:
              image: l3pcv/lost:${LOST_VERSION}
              container_name: lost
              command: bash /entrypoint.sh
              env_file:
                - .env
              volumes:
                - ${LOST_DATA}:/home/lost
                - </path/to/lost_clone>/backend/lost:/code/src/backend/lost

.. note::
  Because flask is in debug mode, code changes are applied immediately. 
  An exception to this behaviour are changes to code that is related to celery tasks. 
  After such changes lost needs to be restarted manually to get the code changes working.  

How to do frontend development?
===============================
The Frontend is developed with React, Redux, CoreUI and reactstrap

1. To start developing frontend follow the :ref:`LOST QuickSetup <quick-setup>` instruction.
2. Change directory to the frontend folder and install npm packages

 .. code-block:: bash

        cd lost/frontend/lost/
        npm i

3. [Optional] Set backend port in package.json start script with REACT_APP_PORT variable.
4. Start development server with 

 .. code-block:: bash

        npm start

.. list-table:: Frontend Applications
   :widths: 100 100
   :header-rows: 1

   * - Application
     - Directory
   * - Dashboard
     - src/components/Dashboard
   * - SIA (Single Image Annotation)
     - src/components/SIA
   * - MIA (Multi Image Annotation)
     - src/components/MIA
   * - Running Pipeline
     - src/components/pipeline/src/running
   * - Start Pipeline
     - src/components/pipeline/src/start
   * - Labels
     - src/components/Labels
   * - Workers
     - src/components/Workers
   * - Users
     - src/components/Users

Building lost containers locally
================================
* The whole build process is described in `.gitlab-ci.yml <https://github.com/l3p-cv/lost/blob/master/.gitlab-ci.yml>`_.
* All required docker files are provided in `lost/docker <https://github.com/l3p-cv/lost/tree/master/docker>`_ within the lost repo.
* There are 3 lost container that will be executing scripts and the webserver
    - *lost*: Will run the webserver and provide the basic environment where scripts can be executed.
    - *lost-cv*: Will provide an computer vision environment in oder to execute scripts that require special libraries like opencv.
    - *lost-cv-gpu*: Will provide gpu support for scripts that use libraries that need gpu support like tensorflow.
* Building the *lost* container
    - The *lost* container will inherit from the *lost-base*.
    - As first step build *lost-base*. The Dockerfile is located at `lost/docker/lost-base <https://github.com/l3p-cv/lost/blob/master/docker/lost-base/>`_.
    - After that you can build the *lost* container, using your local version of *lost-base*. The dockerfile can be found here: `lost/docker/lost <https://github.com/l3p-cv/lost/blob/master/docker/lost/>`_

