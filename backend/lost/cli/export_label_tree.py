#!/usr/bin/env python3

import argparse
import logging

import lostconfig as config
from lost.db import access
from lost.logic.label import LabelTree

logging.basicConfig(level=logging.INFO, format="(%(levelname)s): %(message)s")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Export a label tree to a csv file")
    parser.add_argument("tree_name", nargs="?", action="store", help="Name of the label tree.")
    parser.add_argument("out_path", nargs="?", action="store", help="Path to store the label tree in csv style.")
    args = parser.parse_args()

    lostconfig = config.LOSTConfig()
    dbm = access.DBMan(lostconfig)
    root_leaf = next(filter(lambda x: x.name == args.tree_name, dbm.get_all_label_trees()), None)
    if root_leaf is None:
        logging.warning(f'LabelTree "{args.tree_name}" not present in database!')
    else:
        tree = LabelTree(dbm, root_leaf=root_leaf)
        df = tree.to_df()
        df.to_csv(args.out_path, index=False)
        logging.info(f"Exported label tree to: {args.out_path}")
    dbm.close_session()
