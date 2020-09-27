[![pipeline status](https://gitlab.com/l3p-cv/lost/badges/master/pipeline.svg)](https://gitlab.com/l3p-cv/lost/pipelines)
[![Documentation Status](https://readthedocs.org/projects/lost/badge/?version=latest)](https://lost.readthedocs.io/en/latest/?badge=latest)
[![Gitter](https://badges.gitter.im/l3p-cv/lost.svg)](https://gitter.im/l3p-cv/lost?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)
# LOST - Label Objects and Save Time
![LOST Features](docs/sphinx/source/images/LOSTFeaturesIn40seconds.gif)
## Demo Videos
* LOST Trailer: https://youtu.be/alocNFQmVQw
* LOST Single Image Annotation - Pipeline Demo: https://www.youtube.com/watch?v=DfDla2hAfWw
* LOST Multi Image Annotation - Pipeline Demo: https://www.youtube.com/watch?v=Q-IpGtH6Xz0

## Description
LOST (Label Object and Save Time) is a **flexible** **web-based** framework
for **semi-automatic** image annotation.
It provides multiple annotation interfaces for fast image annotation.

LOST is **flexible** since it allows to run user defined annotation
pipelines where different
annotation interfaces/ tools and algorithms can be combined in one process.

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

# Getting Started

## Documentation
If you feel LOST, 
please find our full documentation here: https://lost.readthedocs.io.

## LOST QuickSetup
LOST releases are hosted on DockerHub and shipped in Containers.
For a quick setup perform the following steps (these steps have been 
tested for Ubuntu):

1. Install docker on your machine or server:
    https://docs.docker.com/install/
2. Install docker-compose:
    https://docs.docker.com/compose/install/
3. Clone LOST:
    ```
    git clone https://github.com/l3p-cv/lost.git
    ```
4. Run quick_setup script:
    ```
    cd lost/docker/quick_setup/
    # python3 quick_setup.py path/to/install/lost
    python3 quick_setup.py ~/lost
    ```
5. Run LOST:

    Follow instructions of the quick_setup script, 
    printed in the command line.


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
* PlantVillage @ Pennsylvania State University is using LOST to build [a tool that is positively impacting millions of lives in Kenya with the Desert Locust Crisis](https://news.psu.edu/story/609265/2020/02/21/research/penn-state-responds-app-aids-un-efforts-control-africas-locust). See this [bolg article](https://plantvillage.psu.edu/blogposts/97-getting-lost-can-be-good) by Annalyse Kehs to get more information how LOST is utilized in the project.

If you are using LOST and like to share your project, please contact [@jaeger-j](https://github.com/jaeger-j).

## Contact
We've created a chat room for you. Feel free to contact us directly:
https://gitter.im/l3p-cv/lost

# Creators
## People
|   | Github | 
|---|--------|
|**Jonas Jäger**| [@jaeger-j](https://github.com/jaeger-j) | 
|**Gereon Reus**| [@gereonreus](https://github.com/gereonreus) | 
|**Dennis Weiershäuser** | [@cartok](https://github.com/cartok) | 
|**Tobias Kwant** | [@tkwant](https://github.com/tkwant) | 


## Institutions
| L3P UG | CVG University Jena | Hochschule Fulda |
|--|--|--|
|[![L3P UG](docs/l3pug.png)](https://lost.training/) | [![CVG Uni Jena](docs/cvgjena.png)](https://www.inf-cv.uni-jena.de/) | [![Hochschule Fulda](docs/hsfd.png)](https://www.hs-fulda.de/elektrotechnik-und-informationstechnik/)
