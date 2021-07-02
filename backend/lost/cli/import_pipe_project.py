#!/usr/bin/env python3
import argparse
from lost.db import model, access
import lostconfig as config
from lost.logic.pipeline import template_import
import logging
import os

logging.basicConfig(level=logging.INFO, format='(%(levelname)s): %(message)s')

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Import a pipeline into the portal')
    parser.add_argument('pipe_dir',
                        help='Path directory with pipeline definition files.')
    args = parser.parse_args()

    lostconfig = config.LOSTConfig()
    dbm = access.DBMan(lostconfig)
    importer = template_import.PipeImporter(args.pipe_dir, dbm)
    importer.start_import()
    dbm.close_session()

