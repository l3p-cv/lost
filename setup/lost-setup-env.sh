#!/bin/bash

# directory where the documentation will be saved to
export LOST_DOCUMENTATION_DIR=/usr/share/doc/lost

# add AI annotation examples to installation
export LOST_ADD_EXAMPLES=True
export LOST_ADD_AI_EXAMPLES=True

# directory where nginx site config can be stored
export LOST_NGINX_SITES_DIR=/etc/nginx/sites-enabled

# directory to mamba (programs access the bin folder)
#export LOST_MAMBA_BASE_DIR=/home/$USER/miniconda3
export LOST_MAMBA_BASE_DIR=/home/jgoebel/miniconda3

# allow mamba to skip installation confirmations
export CONDA_ALWAYS_YES="true"
