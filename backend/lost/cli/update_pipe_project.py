#!/usr/bin/env python3

import argparse
from lost.db import model, access
import lostconfig as config
from lost.logic.pipeline import template_import 
import logging
import json

logging.basicConfig(level=logging.INFO, format='(%(levelname)s): %(message)s')

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Update a lost pipe project')
    parser.add_argument('project_dir',
                        help='Path to pipeline project folder.')
    args = parser.parse_args()

    lostconfig = config.LOSTConfig()
    dbm = access.DBMan(lostconfig)
    pi = template_import.PipeImporter(args.project_dir,dbm)
    pi.update_pipe_project()
    dbm.close_session()

