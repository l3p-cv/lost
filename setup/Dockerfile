# TEMP only
# create base environment for testing
FROM ubuntu:20.04

ENV LANG C.UTF-8
ENV LC_ALL C.UTF-8

# disable frontend terminal questions while installing apt packages (problem with tzdata)
ARG DEBIAN_FRONTEND=noninteractive

# set the correct timezone
ENV TZ=Europe/Berlin
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

RUN apt-get update && apt-get install -y --no-install-recommends wget curl bzip2 python3.5 \
    python3-pip python3-setuptools python3-dev build-essential libigraph0-dev netcat nano \
    htop libsm6 libxext6 libssl-dev libtool autoconf automake bison flex libglib2.0-0 libxrender1 ffmpeg && rm -rf /var/lib/apt/lists/*
RUN apt-get update && apt-get install -y --no-install-recommends gnupg gnupg2 gnupg1 && rm -rf /var/lib/apt/lists/*

RUN wget --quiet https://github.com/conda-forge/miniforge/releases/latest/download/Mambaforge-Linux-x86_64.sh -O ~/mambaforge.sh && \
    /bin/bash ~/mambaforge.sh -b -p /opt/mambaforge && \
    rm ~/mambaforge.sh && \
    /opt/mambaforge/bin/conda clean -tipsy && \
    ln -s /opt/mambaforge/etc/profile.d/conda.sh /etc/profile.d/conda.sh && \
    echo ". /opt/mambaforge/etc/profile.d/conda.sh" >> ~/.bashrc
RUN apt-get update && apt-get install -y --no-install-recommends nginx && rm -rf /var/lib/apt/lists/*
RUN mkdir /home/user
WORKDIR /home/user
COPY . .
EXPOSE 80
