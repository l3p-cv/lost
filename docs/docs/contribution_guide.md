---
sidebar_position: 8
---

# Contribution Guide

## How to contribute new features or bug fixes?

1. Select a feature you want to implement or a bug you want to fix from the [lost issue list](https://github.com/l3p-cv/lost/issues)
    - If you have a new feature, create a new feature request
2. State in the issue comments that you are willing to implement the
    feature / fix the bug
3. We will respond to your comment
4. Implement the feature
5. Create a pull request

## How to do backend development?

The backend is written in python. We use flask for the webserver and celery
to execute time consuming tasks.

If you want to adjust backend code and test your changes please perform
the following steps:

1. Install LOST as described in `LOST QuickSetup <quick-setup>`.
2. Adjust the *LOST_DEBUG_MODE* variable in the *.env* config file. This file
    should be located at ```<lost_install_dir>/docker/compose/.env```.
    >
    > ``` {.bash caption="Changes that need to be performed in the *.env* file. This will cause the LOST flask server to start in debug mode."}
    > LOST_DEBUG_MODE=True
    > ```
    >
3. In oder to run your code, you need to mount your code into the
    docker container. You can do this by adding docker volumes in the
    *compose.yml* file. The file should be located at
    *lost_install_dir/docker/compose/compose.yml*. Do this for all
    containers in the compose file that contain lost source code (lost-backend)
    >
    > ``` {.yaml emphasize-lines="11" caption="Adjustments to *docker-compose.yml*. Mount your backend code into the docker container."}
    >services
    >    backend:
    >        image: l3pcv/lost-backend:${LOST_VERSION}
    >        env_file:
    >          - .env
    >        volumes:
    >          - app:/home/lost/app
    >          - data:/home/lost/data
    >          - </path/to/lost_clone>/backend:/code/
    >        restart: always
    >        labels:
    >          - traefik.enable=true
    >          - traefik.http.routers.backend.rule=PathPrefix(`/api`)||PathPrefix(`/swaggerui`)
    >          - traefik.http.routers.backend.entrypoints=web
    >          - traefik.http.routers.backend.service=backend
    >          - traefik.http.services.backend.loadbalancer.server.port=5000
    >        depends_on:
    >          db:
    >            condition: service_started
    > ```

:::note[Note]
Because flask is in debug mode, code changes are applied immediately. An
exception to this behaviour are changes to code that are related to
celery tasks. After such changes, lost needs to be restarted manually for
the code changes to take effect.
:::

## How to do frontend development?

The Frontend is developed with React and CoreUI (and Redux, but this will be removed in the future)

1. To start developing frontend follow the
    `LOST QuickSetup <quick-setup>` instruction.
2. Change directory to the frontend folder and install npm packages

> ``` bash
> cd lost/frontend/lost/
> npm i
> ```

3. \[Optional\] Set the ports as you need them in the compose.yaml

4. Start development server with

> ``` bash
> npm start
> ```

  <!-- -------------------------------------------------------------------------
  Application                         Directory

  -------------------------------------------------------------------------
  Dashboard                           src/components/Dashboard

  SIA (Single Image Annotation)       src/components/SIA

  MIA (Multi Image Annotation)        src/components/MIA

  Running Pipeline                    src/components/pipeline/src/running

  Start Pipeline                      src/components/pipeline/src/start

  Labels                              src/components/Labels

  Workers                             src/components/Workers

Users                               src/components/Users

  -------------------------------------------------------------------------

  : Frontend Applications -->

To access the most common parts to develop for the frontend, search the
[**containers**](https://github.com/l3p-cv/lost/tree/master/frontend/lost/src/containers)
and [**components**](https://github.com/l3p-cv/lost/tree/master/frontend/lost/src/components)
directories.

## Building lost containers locally

- The whole build process is described in
    [.gitlab-ci.yml](https://github.com/l3p-cv/lost/blob/master/.gitlab-ci.yml).

- All required docker files are provided in
    [lost/docker](https://github.com/l3p-cv/lost/tree/master/docker)
    within the lost repo.

There are 2 containers unique to LOST, that will be executing scripts and the webserver:

- *lost-backend-1*: Handles the execution of scripts and the API

- *lost-frontend-1*: Handles the GUI

You can find the LOST containers and their official names in the
[compose.yaml](https://github.com/l3p-cv/lost/blob/master/docker/compose/compose.yaml)
