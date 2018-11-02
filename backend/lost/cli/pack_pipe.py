import argparse
from lost.db import model, access
from lost.logic import config
from lost.logic.pipeline import template_import
import logging
import os

logging.basicConfig(level=logging.INFO, format='(%(levelname)s): %(message)s')

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Pack a pipeline and all related files to a zip')
    parser.add_argument('--src', nargs='?', action='store',
                        help='Path to pipeline definition file.')
    parser.add_argument('--dst', nargs='?', action='store',
                        help='Path to store zip file.')
    args = parser.parse_args()

    packer = template_import.PipePacker(args.src)
    packer.pack(args.dst)
    logging.info("Packed pipe!")
