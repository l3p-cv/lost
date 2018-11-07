
import argparse
from lost.db import model, access
from lost.logic import config
from lost.logic.pipeline import template_import
import logging
import os

logging.basicConfig(level=logging.INFO, format='(%(levelname)s): %(message)s')

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Import a pipeline into the portal')
    parser.add_argument('pipe_dir', nargs='?', action='store',
                        help='Path directory with pipeline definition files.')
    parser.add_argument('group_name', nargs='?', action='store',
                        help='Name of group that pipeline should be visible for.')
    args = parser.parse_args()

    lostconfig = config.LOSTConfig()
    dbm = access.DBMan(lostconfig)
    importer = template_import.PipeImporter(args.pipe_dir, args.group_name, dbm)
    importer.start_import()