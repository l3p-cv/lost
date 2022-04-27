#!/usr/bin/env python3
import argparse
from lost.logic.pipeline import template_import
import logging
import os
logging.basicConfig(level=logging.INFO, format='(%(levelname)s): %(message)s')

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Pack a pipeline project to zip file')
    parser.add_argument('src',
                        help='Path to pipeline that should be packed')
    parser.add_argument('dst',
                        help='Destination to store packed pipe')
    args = parser.parse_args()

    if not os.path.exists(args.dst):
        logging.info(f'Pack pipe {args.src} to {args.dst}')
        template_import.pack_pipe_project(args.src, args.dst)
        logging.info(f'Success :-)')
    else:
        if input('Pipe already exists! Do you want to overwrite it [no]: ').lower() in ['y', 'yes']:
            logging.info(f'Pack pipe {args.src} to {args.dst}')
            template_import.pack_pipe_project(args.src, args.dst)
            logging.info(f'Success :-)')
        else:
            logging.warning('Did not pack pipe!')

