FROM nginx:latest

# Install Backend Dependencies
RUN apt-get update && apt-get install -y --no-install-recommends wget curl bzip2 python3.5 \
    python3-pip python3-setuptools python3-dev build-essential libigraph0-dev netcat nano \
    htop libsm6 libxext6 libssl-dev libtool autoconf automake bison flex libglib2.0-0 libxrender1&& rm -rf /var/lib/apt/lists/*
RUN apt-get update && apt-get install -y --no-install-recommends gnupg gnupg2 gnupg1 && rm -rf /var/lib/apt/lists/*

RUN wget --quiet https://repo.anaconda.com/miniconda/Miniconda3-4.5.4-Linux-x86_64.sh -O ~/miniconda.sh && \
    /bin/bash ~/miniconda.sh -b -p /opt/conda && \
    rm ~/miniconda.sh && \
    /opt/conda/bin/conda clean -tipsy && \
    ln -s /opt/conda/etc/profile.d/conda.sh /etc/profile.d/conda.sh && \
    echo ". /opt/conda/etc/profile.d/conda.sh" >> ~/.bashrc && \
    echo "conda activate lost" >> ~/.bashrc
RUN curl -sL https://deb.nodesource.com/setup_8.x | bash -
RUN apt-get update && apt-get install -y --no-install-recommends nodejs && rm -rf /var/lib/apt/lists/*
ADD /docker/lost-base/environment.yml .
RUN /bin/bash -c "source /opt/conda/bin/activate && conda env create -f environment.yml && conda clean -ay"
RUN /bin/bash -c "source /opt/conda/bin/activate lost && pip install --no-cache-dir python-igraph"
RUN /bin/bash -c "source /opt/conda/bin/activate lost && conda install sphinx && conda clean -ay"
RUN /bin/bash -c "source /opt/conda/bin/activate lost && pip install --no-cache-dir sphinx-rtd-theme"
RUN /bin/bash -c "source /opt/conda/bin/activate lost && conda install pandas && conda clean -ay"
RUN /bin/bash -c "source /opt/conda/bin/activate lost && conda install pytest && conda clean -ay"
RUN /bin/bash -c "source /opt/conda/bin/activate lost && pip install --no-cache-dir opencv-python==4.0.0.21"
RUN /bin/bash -c "source /opt/conda/bin/activate lost && pip install --no-cache-dir fsspec adlfs pyarrow"
# Change to CLI
WORKDIR /code/backend/lost/cli
