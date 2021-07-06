FROM nginx:latest

# Install Backend Dependencies
RUN apt-get update && apt-get install -y --no-install-recommends wget curl bzip2 python3.5 \
    python3-pip python3-setuptools python3-dev build-essential libigraph0-dev netcat nano \
    htop libsm6 libxext6 libssl-dev libtool autoconf automake bison flex libglib2.0-0 libxrender1 ffmpeg && rm -rf /var/lib/apt/lists/*
RUN apt-get update && apt-get install -y --no-install-recommends gnupg gnupg2 gnupg1 && rm -rf /var/lib/apt/lists/*

RUN wget --quiet https://github.com/conda-forge/miniforge/releases/latest/download/Mambaforge-Linux-x86_64.sh -O ~/mambaforge.sh && \
    /bin/bash ~/mambaforge.sh -b -p /opt/mambaforge && \
    rm ~/mambaforge.sh && \
    /opt/mambaforge/bin/conda clean -tipsy && \
    ln -s /opt/mambaforge/etc/profile.d/conda.sh /etc/profile.d/conda.sh && \
    echo ". /opt/mambaforge/etc/profile.d/conda.sh" >> ~/.bashrc && \
    echo "conda activate lost" >> ~/.bashrc
RUN curl -sL https://deb.nodesource.com/setup_14.x | bash -
RUN apt-get update && apt-get install -y --no-install-recommends nodejs && rm -rf /var/lib/apt/lists/*
# ADD /docker/lost-base/environment.yml .
ADD /docker/lost-base/mamba_env.sh .
# ADD mamba_env.sh .
RUN /bin/bash -c "source /opt/mambaforge/bin/activate && source mamba_env.sh && conda clean -ay"
# RUN /bin/bash -c "source /opt/conda/bin/activate lost && pip install --no-cache-dir python-igraph"
# Change to CLI
WORKDIR /code/backend/lost/cli
