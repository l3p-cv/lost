#!/bin/bash

# prepare environment
python3 /code/lost/logic/init/initlost.py

# run the tests
pytest /code/lost
