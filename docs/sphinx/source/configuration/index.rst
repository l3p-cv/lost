Configuration
*************

E-Mail Notifications
=============================
In order to activate E-Mail Notifications you have to provide an outgoing E-Mail Account.
In your ``.env`` file you have to add the following environment variables.
If you have set up lost with the quick setup script, these variables only need to be commented out and adjusted:

    .. code-block:: bash

        LOST_MAIL_ACTIVE=True
        LOST_MAIL_SERVER=mailserver.com
        LOST_MAIL_PORT=465
        LOST_MAIL_USE_SSL=True
        LOST_MAIL_USE_TLS=True
        LOST_MAIL_USERNAME=email@email.com
        LOST_MAIL_PASSWORD=password
        LOST_MAIL_DEFAULT_SENDER=LOST Notification System <email@email.com>
        LOST_MAIL_LOST_URL=http://mylostinstance.url/


LDAP
====
LDAP can be configured using the following environment variables in your ``.env`` file:

    .. code-block:: bash

        LOST_LDAP_ACTIVE=True
        LOST_LDAP_HOST=192.168.0.100
        LOST_LDAP_PORT=389
        LOST_LDAP_BASE_DN=dc=example,dc=com
        LOST_LDAP_USER_DN=ou=myOrganizationUnit
        LOST_LDAP_BIND_USER_DN=cn=binduser,dc=example,dc=com
        LOST_LDAP_BIND_USER_PASSWORD=ldap_bind_password

For more LDAP configurations just check the Flask LDAP documentation:
`Flask LDAP Documentation
<https://flask-ldap3-login.readthedocs.io/en/latest/quick_start.html>`_.

It is important that all LDAP environment variables are prefixed with LOST so that the settings are applied:
    .. code-block:: bash

        LOST_LDAP_GROUP_OBJECT_FILTER=(objectclass=posixGroup)
        LOST_LDAP_GROUP_DN=
        LOST_LDAP_USER_RDN_ATTR=cn
        LOST_LDAP_USER_LOGIN_ATTR=uid
        LOST_LDAP_USE_SSL=False
        LOST_LDAP_ADD_SERVER= True

.. note::
    
    Users logging into LOST for the first time using LDAP are automatically assigned the **Annotator** role.
    If you want to assign another role to the user, you have to do so in the user management in the Admin Area.

.. note::

    The resolution of groups via LDAP is not yet supported. If a LOST group should be assigned to an LDAP user, 
    this must be done via the user management in the Admin Area.

.. warning::

    If a local user with the same user name of a new LDAP user already exists, 
    the local user settings will be overwritten by those of the LDAP user.

JupyterLab
==========
The JupyterLab integration is primarily intended for pipeline developers and quick experiments in LOST.
Through this integration it is very easy to access all pipelines and their elements at any time and manipulate them through a web interface.
By accessing the LOST pyAPI, various operations can be investigated, as they are also executed in the scripts of the annotation pipelines.

In order to activate the JupyterLab Integration you have to add the following 
environment variables in your ``.env`` file:

    .. code-block:: bash

        LOST_JUPYTER_LAB_ACTIVE=True
        LOST_JUPYTER_LAB_ROOT_PATH=/code/src
        LOST_JUPYTER_LAB_TOKEN=mysecrettoken
        LOST_JUPYTER_LAB_PORT=8888


In addition, the port for the JupyterLab must be enabled in the **lost** service of your ``docker-compose.yml`` file:

    .. code-block:: bash

        ports:
            - "${LOST_FRONTEND_PORT}:8080"
            - "${LOST_JUPYTER_LAB_PORT:-8888}:8888"


Once the JupyterLab integration has been activated, the started JupyterLab can be accessed via the GUI in the Admin Area. 
Within the Admin Area, a tab (far right) now appears that contains the link to the JupyterLab.

    .. warning::

        The environment variable ``LOST_JUPYTER_ROOT_PATH`` defines from which path the Jupyter Lab is started in the docker container. 
        If this path is not in a location mounted in the docker container, 
        notebooks and other data will not be persistently stored.

    .. danger::

        Using JupyterLab gives **full access** to the database and connected file systems.
        The JupyterLab integration should therefore only be used in development environments and in no case in production systems. 


Git Access Token
================
With the help of the Git configuration, you can have your Git access data (Personal Access Token) stored in the container.
This means that, for example, private Git repositories can be used within the JupyterLab environment without having to enter a password. 
Furthermore, the configuration of the Git settings is necessary so that private Git repositories can be imported via the GUI.

In order to configure your Git authentication you have to add the following 
environment variables in your ``.env`` file:

    .. code-block:: bash

        LOST_GIT_USER=Git User                                                                            │
        LOST_GIT_EMAIL=myemail                                                                      │
        LOST_GIT_ACCESS_TOKEN=https://mygitusername:mygitaccesstoken@github.com

Nginx Configuration
===================

Configuration File
------------------
When starting the lost container the corresponding nginx configuration file (depending on debug mode) for nginx is 
copied from the repository into the folder 

    .. code-block:: bash

        /etc/nginx/conf.d/default.conf

by the **entrypoint.sh** script.

Both nginx configuration files (debug mode and production) can be found at:
`lost/docker/lost/nginx <https://github.com/l3p-cv/lost/blob/master/docker/lost/nginx>`_
in our GitHub repository.


Custom Configuration File
-------------------------
If a custom configuration file is desired, this file must be mounted from the 
host machine into the lost container.

    .. code-block:: yaml

        volumes:
            - /host/path/to/nginx/conf:/etc/nginx/conf.d/default.conf

.. note::
  By default, files with a **maximum size of 1GB** can be uploaded in LOST. 
  To change the maximum size you have to change the value ``client_max_body_size 1024M;`` inside the nginx configuration file. 
  In addition, the environment variable ``LOST_MAX_FILE_UPLOAD_SIZE`` must also be adjusted in the LOST configuration.