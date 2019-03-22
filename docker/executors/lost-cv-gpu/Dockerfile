ARG base_image=l3pcv/lost-gpu-base:latest
FROM $base_image
RUN /bin/bash -c "source /opt/conda/bin/activate lost && pip install tensorflow-gpu"
RUN /bin/bash -c "source /opt/conda/bin/activate lost && pip install keras"
RUN /bin/bash -c "source /opt/conda/bin/activate lost && conda install -c conda-forge opencv"
RUN /bin/bash -c "source /opt/conda/bin/activate lost && pip install https://github.com/OlafenwaMoses/ImageAI/releases/download/2.0.2/imageai-2.0.2-py3-none-any.whl"
RUN apt-get update && apt-get install -y --no-install-recommends git
RUN git clone https://github.com/l3p-cv/lost.git
RUN cd lost && git fetch origin 0.0.0-alpha.2 && git checkout 0.0.0-alpha.2
RUN cp -r lost/backend /code && rm -r lost
# Add Code  
#ADD /docker/lost/pytest.sh /
#ADD /docker/lost/nginx/ /code/docker/lost/nginx
#ADD /backend/ /code/backend
#ADD /frontend/ /code/frontend
#ADD /docs/ /code/docs
ADD /docker/executors/lost-cv-gpu/entrypoint.sh /entrypoint.sh
RUN echo "export PATH=$PATH:/code/backend/lost/cli" >> ~/.bashrc
RUN echo "conda activate lost" >> ~/.bashrc
