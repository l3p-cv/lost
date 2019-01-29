ARG base_image=l3pcv/lost-base:latest
FROM $base_image
# Add Code 
ADD /docker/executors/lost-cv/entrypoint.sh /
ADD /backend/ /code/backend

ADD /docker/executors/lost-cv/environment.yml .
ADD /docker/executors/lost-cv/requirements.txt .

RUN /bin/bash -c "source /opt/conda/bin/activate && conda env create -f environment.yml"

RUN /bin/bash -c "source /opt/conda/bin/activate lost-cv && pip install https://github.com/OlafenwaMoses/ImageAI/releases/download/2.0.2/imageai-2.0.2-py3-none-any.whl"

RUN /bin/bash -c "source /opt/conda/bin/activate lost-cv && pip install -r requirements.txt"
