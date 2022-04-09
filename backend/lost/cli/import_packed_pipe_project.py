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
    parser = argparse.ArgumentParser(description='Import a packed pipeline into lost')
    parser.add_argument('packed_pipe',
                        help='Pack pipeline file')
    parser.add_argument('--overwrite', default=False, action='store_true',
                        help='Overwrite pipe if already existing')
    args = parser.parse_args()


    lostconfig = config.LOSTConfig()
    fm = AppFileMan(lostconfig)
    pp_path = fm.get_pipe_project_path()
    dst_dir = os.path.basename(args.packed_pipe)
    dst_dir = os.path.splitext(dst_dir)[0]
    dst_path = os.path.join(pp_path, dst_dir)
    if not os.path.exists(dst_path) or args.overwrite:
        logging.info(f'Unpack pipe: {args.packed_pipe} to {pp_path}')
        template_import.unpack_pipe_project(args.packed_pipe, dst_path)
        dbm = access.DBMan(lostconfig)
        importer = template_import.PipeImporter(dst_path, dbm)
        importer.start_import()
        dbm.close_session()
    else:
        raise Exception('Pipe project already exists!')

