ARG base_image=l3pcv/lost-base:latest
FROM $base_image
# Add Code 
ADD /docker/executors/lost-cv/entrypoint.sh /
ADD /backend/ /code/backend
    
# RUN /bin/bash -c "source /opt/conda/bin/activate && pip install -r requirements.txt"
RUN /bin/bash -c "source /opt/conda/bin/activate lost && conda install -c conda-forge opencv"
# RUN /bin/bash -c "source /opt/conda/bin/activate lost && conda install jupyter"
RUN /bin/bash -c "source /opt/conda/bin/activate lost && conda install -c conda-forge keras"

#ADD /docker/executors/opencv/store_jupyter_output.sh /
