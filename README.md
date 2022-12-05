[![pipeline status](https://gitlab.com/l3p-cv/lost/badges/master/pipeline.svg)](https://gitlab.com/l3p-cv/lost/pipelines)
[![Documentation Status](https://readthedocs.org/projects/lost/badge/?version=latest)](https://lost.readthedocs.io/en/latest/?badge=latest)
# LOST - Label Objects and Save Time

## Description
LOST (Label Object and Save Time) is a **flexible** **web-based** framework
for **simple collaborative** image annotation.
It provides multiple annotation interfaces for fast image annotation.

LOST offers a set of **out of the box annotation pipelines** to instantly annotate images without programming knowledge.

Nevertheless LOST is **flexible** since it allows to run user defined annotation
pipelines where different
annotation interfaces/ tools and algorithms can be combined in one process.

The application is highly scalable and offers, for example, easy-to-set-up connectivity to **external file systems**, such as S3 Bucket or Azure Blobstorage via the user interface.

It is **web-based** since the whole annotation process is visualized in
your browser.
You can quickly setup LOST with docker on your local machine or run it
on a web server to make an annotation process available to your
annotators around the world.
LOST allows to organize label trees, to monitor the state of an
annotation process and to do annotations inside the browser.

LOST was especially designed to model **semi-automatic** annotation
pipelines to speed up the annotation process.
Such a semi-automatic can be achieved by using AI generated annotation
proposals that are presented to an annotator inside the annotation tool.

## Key Features
- :earth_americas: Collaborative annotation - distribute your annotation tasks around  the world
- :rocket: Out of the box annotation pipelines
    - Annotate bboxes, polygons, points or lines with the Single Image Annotation Tool (SIA)
    - Annotate whole image clusters with the Multi Image Annotation Tool (MIA)
    - Export your datasets
- :open_file_folder: Connect external file systems, such as AWS S3 bucket, MS Azure blobstorage or FTP server
- :inbox_tray: Instant annotation export allows you to access all annotations at any time
- :chart_with_upwards_trend: Personal and project based annotation statistics
- :label: Organize your labels with colored label trees
- :repeat: Review your annotations

## Additional Features
- :pill: Customized annotation pipelines
    - Import and export your pipeline projects
    - Share your pipeline projects with colleagues
- :orange_book: Jupyter-Lab integration for easy pipeline development
- :dancers: LDAP integration
- :e-mail: E-Mail notifications
- :cloud: Scalable design - distribute intensive computing processes across multiple machines

# Getting Started

## Documentation
LOST 2 was just recently released. 
A lot of new features have been added and improvements have been made compared to version 1 (see [Changelog](./CHANGELOG.md)). 
The adaptation of the documentation is currently still in progress.

If you feel LOST, 
please find our full documentation here: https://lost.readthedocs.io.


## LOST 2.x QuickSetup
LOST releases are hosted on DockerHub and shipped in Containers. For a quick setup perform the following steps (these steps have been tested for Ubuntu):

1. Install docker on your machine or server:
    https://docs.docker.com/install/
2. Install docker-compose:
    https://docs.docker.com/compose/install/
3. Clone LOST:
    ```
    git clone https://github.com/l3p-cv/lost.git
    ```
4. Install the *cryptography* package in your python environment:
    ```
    pip install cryptography
    ```

5. Run quick_setup script:
    ```
    cd lost/docker/quick_setup/
    python3 quick_setup.py /path/to/install/lost --release 2.0.0-alpha.26
    ```
    If you want to use phpmyadmin, you can set it via argument
    ```
    python3 quick_setup.py /path/to/install/lost --release 2.0.0-alpha.26 --phpmyadmin
    ```

6. Run LOST:

    Follow instructions of the quick_setup script, 
    printed in the command line.


<!-- ## I want to annotate now !
A detailed step by step guide is provided here:  [Start your first Pipeline ](./docs/GettingStartedFirstPipeline.md) -->

# Roadmap
See our [Roadmap](https://github.com/l3p-cv/lost/milestone/1)

# Creators

## Citing LOST
```
@article{jaeger2019lost,
    title={{LOST}: A flexible framework for semi-automatic image annotation},
    author={Jonas J\"ager and Gereon Reus and Joachim Denzler and Viviane Wolff and Klaus Fricke-Neuderth},
    year={2019},
    Journal = {arXiv preprint arXiv:1910.07486},
    eprint={1910.07486},
    archivePrefix={arXiv},
    primaryClass={cs.CV}
}
```
Find our paper on [arXiv](https://arxiv.org/abs/1910.07486)

## Projects using LOST
* PlantVillage @ Pennsylvania State University is using LOST to build [a tool that is positively impacting millions of lives in Kenya with the Desert Locust Crisis](https://news.psu.edu/story/609265/2020/02/21/research/penn-state-responds-app-aids-un-efforts-control-africas-locust). See this [blog article](https://plantvillage.psu.edu/blogposts/97-getting-lost-can-be-good) by Annalyse Kehs to get more information how LOST is utilized in the project.

If you are using LOST and like to share your project, please contact [@jaeger-j](https://github.com/jaeger-j).

## Institutions
| L3bm GmbH | CVG University Jena | Hochschule Fulda |
|--|--|--|
|[![L3bm GmbH](docs/L_L3BM_RGB_kl.png)](https://l3bm.com/) | [![CVG Uni Jena](docs/cvgjena.png)](https://www.inf-cv.uni-jena.de/) | [![Hochschule Fulda](docs/hsfd.png)](https://www.hs-fulda.de/elektrotechnik-und-informationstechnik/)
