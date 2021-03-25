#!/usr/bin/env python3

import argparse
from lost.logic import config
from lost.logic.file_man import FileMan
import logging

logging.basicConfig(level=logging.INFO, format='(%(levelname)s): %(message)s')

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Copy example data')
    parser.add_argument('src', nargs='?', action='store',
                        help='Source dir with example data to copy')
    args = parser.parse_args()

    lostconfig = config.LOSTConfig()
    fm = FileMan(lostconfig)
    fm.fs.copy(args.src, fm.media_root_path, recursive=True)
    logging.info('Copyed images from {} to {}'.format(args.src, fm.media_root_path))