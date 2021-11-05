#!/usr/bin/env python3
import argparse
from lost.db import model, access
import lostconfig as config
from lost.logic.pipeline import template_import
import logging
from lost.logic.file_man import AppFileMan
import os
import shutil

logging.basicConfig(level=logging.INFO, format='(%(levelname)s): %(message)s')

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Import a pipeline into the portal')
    parser.add_argument('pipe_dir',
                        help='Path directory with pipeline definition files.')
    parser.add_argument('--copy', default=False, action='store_true',
                        help='Copy to default pipe location before import')
    args = parser.parse_args()


    lostconfig = config.LOSTConfig()
    if args.copy:
        fm = AppFileMan(lostconfig)
        pp_path = fm.get_pipe_project_path()
        pipe_dir = args.pipe_dir
        if pipe_dir.endswith('/'):
            pipe_dir = pipe_dir[:-1]
        dst_path = os.path.join(pp_path, os.path.basename(pipe_dir))
        shutil.copytree(args.pipe_dir, dst_path, dirs_exist_ok=True)
    else:
        dst_path = args.pipe_dir
    dbm = access.DBMan(lostconfig)
    importer = template_import.PipeImporter(dst_path, dbm)
    importer.start_import()
    dbm.close_session()

