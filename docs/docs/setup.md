---
sidebar_position: 7
---

# Setup

## Default Setup with Docker {#quick-setup-standard}

LOST provides a [quick_setup](https://github.com/l3p-cv/lost/tree/master/docker/quick_setup) script, that will configure LOST and instruct you how to start LOST. We designed this script for Linux environments, but it will also work on Windows host machines.

LOST releases are hosted on DockerHub and shipped in Containers. For a quick setup perform the following steps (these steps have been tested for Ubuntu):

1. Install docker on your machine or server: [https://docs.docker.com/install/](https://docs.docker.com/install/)
2. Install docker-compose: [https://docs.docker.com/compose/install/](https://docs.docker.com/compose/install/)
3. Clone LOST:  

    ``` bash
        git clone https://github.com/l3p-cv/lost.git
    ```

4. Install the *cryptography* package in your python environment:  

    ``` bash
        pip install cryptography
    ```

5. Run quick_setup script:

    ``` bash
        cd lost/docker/quick_setup/
        python3 quick_setup.py /path/to/install/lost --release 2.0.0
    ```

    If you want to use phpmyadmin, you can set it via argument

    ``` bash
        python3 quick_setup.py /path/to/install/lost --release 2.0.0 --phpmyadmin
    ```

6. Run LOST:
    > Follow instructions of the quick_setup script, printed in the
    > command line.

::: note
::: title
Note
:::

The quick setup script has now created the docker configuration files
`docker-compose.yml` and `.env` . In the following sections, additional
desired configurations usually refer to these two files.
:::
