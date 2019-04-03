ARG base_image=l3pcv/lost-gpu-base:latest
FROM $base_image
RUN /bin/bash -c "source /opt/conda/bin/activate lost && pip install tensorflow-gpu"
RUN /bin/bash -c "source /opt/conda/bin/activate lost && pip install keras"
RUN /bin/bash -c "source /opt/conda/bin/activate lost && conda install -c conda-forge opencv"
RUN /bin/bash -c "source /opt/conda/bin/activate lost && pip install https://github.com/OlafenwaMoses/ImageAI/releases/download/2.0.2/imageai-2.0.2-py3-none-any.whl"
# Add Code  
#ADD /docker/lost/pytest.sh /
#ADD /docker/lost/nginx/ /code/docker/lost/nginx
ADD /backend/ /code/backend
#ADD /frontend/ /code/frontend
#ADD /docs/ /code/docs
ADD /docker/executors/lost-cv-gpu/entrypoint.sh /entrypoint.sh
RUN echo "export PATH=$PATH:/code/backend/lost/cli" >> ~/.bashrc
RUN echo "conda activate lost" >> ~/.bashrc
