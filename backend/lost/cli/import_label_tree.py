#!/usr/bin/env python3

import argparse
import logging

import pandas as pd

import lostconfig as config
from lost.db import access
from lost.logic.label import LabelTree

logging.basicConfig(level=logging.INFO, format="(%(levelname)s): %(message)s")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Import a label tree into this lost instance")
    parser.add_argument("csv_file", nargs="?", action="store", help="Path to the label tree in csv style.")
    # parser.add_argument('group_name', nargs='?', action='store',
    #                     help='Name of group that pipeline should be visible for.')
    args = parser.parse_args()

    lostconfig = config.LOSTConfig()
    dbm = access.DBMan(lostconfig)
    tree = LabelTree(dbm, logger=logging)
    df = pd.read_csv(args.csv_file)
    if tree.import_df(df) is None:
        logging.warning(f"LabelTree already present in database! {args.csv_file}")
    dbm.close_session()
