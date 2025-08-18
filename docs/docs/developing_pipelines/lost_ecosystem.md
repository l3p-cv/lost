# LOST Ecosystem

LOST was designed as a web-based framework that is able to run and
visualize user defined annotation pipelines. The frontend of LOST is
designed as **Single Page Application** and implemented in
[React](https://reactjs.org/) using **JavaScript**. The communication
between frontend and backend is build on web services. As primary
programming language in the backend we use **Python** and utilize
[FLASK](http://flask.pocoo.org/) to provide the web services. As
solution for easy deployment we use [Docker](https://www.docker.com/).

## The LOST Container Landscape {#container_landscape}

![lost-eco-system](/img/lost-eco-system.svg)  
Figure 1: The LOST default container landscape.

LOST is a composition of different docker containers. The main
ingredients for LOST are a **MySQL** database, a **RabbitMQ** message
broker, the **FLASK** framework, a **NGINX** web server, the **LOST**
framework itself and the **LOST data folder** where all LOST related
data is stored.

Figure 1 shows a schematic illustration of the LOST container landscape.
Starting on the left side of the illustration we see the *LOST data
folder* that is used to store all data of LOST on the host machine. This
folder is mounted inside the most containers of LOST. On the right side
of Figure 1 you can see all containers that are started together with
the help of [Docker Compose](https://docs.docker.com/compose/overview/).
We see the containers called **rabbitmqlost**, **db-lost**, **lost**,
**lost-cv** and **phpmyadmin**, while the numbers indicate the ports
where the applications can be accessed.

The most important container to understand here is the container called
**lost**. This container will serve the LOST web application with NGINX
on port *80* and is used as default `Worker <workers>` to execute scripts. It is connected to the **rabbitmqlost**
container to use Celery for script execution scheduling and to the
**db-lost** container in order to access the MySQL database that
contains the current application state. The container called **lost-cv**
is connected analog to **lost**. The **pypmyadmin** container is used
for easy database monitoring during development and serves a graphical
user interface to the MySQL database on port *8081*.

## Pipeline Engine and Workers {#lost-ecosystem-pipe-engine}

The **PipeEngine** will bring your annotation process to live by
executing **PipelineElements** in the specified order. Therefore it will
start **AnnotationTasks** and assigns **Scripts** to **Workers** that
will execute these **Scripts**.

## Workers

A **Worker** is a specific docker container that is able to execute LOST
**Script** elements inside an annotation pipeline. In each **Worker** a
set of python libraries is installed inside an
[Anaconda](https://www.anaconda.com/) environment.

A LOST application may have multiple **Workers** with different
**Environments** installed, since some scripts can have dependencies on
specific libraries. For example, as you can see in Figure 1 LOST is
shipped with two workers by default. One is called **lost** and the
other one **lost-cv**. The **lost** worker can execute scripts that just
rely on the **lost python api**. The **lost-cv** worker has also
installed libraries like *Keras, Tensorflow and OpenCV* that are used
for computer vision and machine learning.

### Celery as Scheduler

In oder to assign **Scripts** for execution to available **Workers** we
use [Celery](http://www.celeryproject.org/) in combination with
[RabbitMQ](https://www.rabbitmq.com/) as message broker.

Since each worker may have a specific software environment installed the
**PipeEngine** will take care that scripts are only executed by
**Workers** that have the correct **Environment**. This is achieved by
creating one message queue per **Environment**. **Workers** that have
this **Environment** installed will listen to this message queue. Once
the **PipeEngine** finds a **Script** for execution in a specific
**Environment** it will send it to the related message queue. Now the
**Script** will be assigned by the *round robin approach* to one of the
**Workers** that listen to the message queue related to the
**Environment**.
