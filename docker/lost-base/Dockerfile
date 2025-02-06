FROM nginx:latest

ENV LANG=C.UTF-8
ENV LC_ALL=C.UTF-8

# Install Backend Dependencies
RUN apt-get update && apt-get install -y --no-install-recommends wget curl bzip2 python3.5 \
    python3-pip python3-setuptools python3-dev build-essential mariadb-client netcat-traditional nano \
    htop libsm6 libxext6 libssl-dev libtool autoconf automake bison flex libglib2.0-0 libxrender1 ffmpeg && rm -rf /var/lib/apt/lists/*
RUN apt-get update && apt-get install -y --no-install-recommends gnupg gnupg2 gnupg1 && rm -rf /var/lib/apt/lists/*

RUN wget --quiet https://github.com/conda-forge/miniforge/releases/download/24.11.3-0/Miniforge3-24.11.3-0-Linux-x86_64.sh -O ~/miniforge.sh && \
    /bin/bash ~/miniforge.sh -b -p /opt/miniforge && \
    rm ~/miniforge.sh && \
    /opt/miniforge/bin/conda clean -tip && \
    ln -s /opt/miniforge/etc/profile.d/conda.sh /etc/profile.d/conda.sh && \
    echo ". /opt/miniforge/etc/profile.d/conda.sh" >> ~/.bashrc
RUN /opt/miniforge/bin/mamba init
RUN echo "mamba activate lost" >> ~/.bashrc
RUN curl -sL https://deb.nodesource.com/setup_18.x | bash -
RUN apt-get update && apt-get install -y --no-install-recommends nodejs && rm -rf /var/lib/apt/lists/*
RUN apt-get update && apt-get install -y --no-install-recommends git && rm -rf /var/lib/apt/lists/*

COPY --from=oven/bun:debian /usr/local/bin/bun /usr/local/bin/bun

ADD /docker/lost-base/environment.yml .

RUN /bin/bash -c "source /opt/miniforge/bin/activate && mamba env create -f environment.yml && mamba clean -ay"
# RUN /bin/bash -c "source /opt/miniforge/bin/activate lost && pip install --no-cache-dir lost_ds shapely scikit-learn tqdm" 
# Change to CLI
WORKDIR /code/src/backend/lost/cli
