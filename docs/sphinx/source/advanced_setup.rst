Advanced Setup
****************

Nginx Configuration
====================
LOST is shipped in docker containers. 
The base image inherits from an official nginx container. 
LOST is installed in this container. 
The communication to the host system is done via the nginx webserver, which can be configured via a configuration file. 
A differentiation is made between the debug mode and a productive environment.

Configuration File
----------------------
When starting the lost container the corresponding configuration file (depending on debug mode) for nginx is 
copied from the repository into the folder 

    .. code-block:: bash

        /etc/nginx/conf.d/default.conf

by the **entrypoint.sh** script.

Both nginx configuration files can be found at:
`lost/docker/lost/nginx <https://github.com/l3p-cv/lost/blob/master/docker/lost/nginx>`_
in our GitHub repository.


Custom Configuration File
--------------------------
If a custom configuration file is desired, this file must be mounted from the 
host machine into the lost container.

    .. code-block:: yaml

        volumes:
            - /host/path/to/nginx/conf:/etc/nginx/conf.d/default.conf


Custom Settings
======================

Email
----------------------
Lorem Ipsum

Pipeline Schedule
----------------------
Lorem Ipusm 

Database
----------------------
Lorem Ipusm 

Session Timeout
----------------------
Lorem Ipusm 

Worker 
----------------------
1. Worker Timeout
2. Worker Beat

Secret Key 
----------------------
Lorem Ipusm 

Lost Frontend Port 
----------------------
Lorem Ipusm 

Lost Data
----------------------
Lorem Ipusm 

LOST Worker
======================
GPU Worker
----------------------
Lorem Ipusm 

Distributed Computing
----------------------
Lorem Ipusm 


.. Developer Settings
.. ======================

.. Mount source code 
.. ----------------------
.. Lorem Ipusm 

.. Debug Mode
.. ----------------------
.. Lorem Ipusm 