#!/usr/bin/env python3
import argparse
from lost.db import model, access
import lostconfig as config
from lost.logic.label import LabelTree
import logging
import os
import pandas as pd

logging.basicConfig(level=logging.INFO, format='(%(levelname)s): %(message)s')

def main(args):
    lostconfig = config.LOSTConfig()
    dbm = access.DBMan(lostconfig)
    if args.csv_file is not None:
        df = pd.read_csv(args.csv_file)
        name = df[df['parent_leaf_id'].isnull()]['name'].values[0]
    elif args.name is not None:
        name = args.name
    else:
        logging.error("Either a *csv_file* or a *name* for a label tree needs to be provided!")
        return
    root_leaf = next(filter(lambda x: x.name==name, dbm.get_all_label_trees()),None)
    if root_leaf is None:
        logging.warning('LabelTree not present in database! {}'.format(args.csv_file))
    else:
        try:
            LabelTree(dbm, root_leaf=root_leaf, logger=logging).delete_tree()
            logging.info('Deleted tree with name: {}'.format(name))
        except:
            logging.error('Can not delete label tree. One of the labels is used by a pipeline!')
    dbm.close_session()
    

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Remove a label tree from this lost instance')
    parser.add_argument('--csv_file', nargs='?', action='store', default=None,
                        help='Path to the label tree in csv style.')
    parser.add_argument('--name', nargs='?', action='store', default=None,
                        help='Name of the label tree to delete.')
    # parser.add_argument('group_name', nargs='?', action='store',
    #                     help='Name of group that pipeline should be visible for.')
    args = parser.parse_args()
    main(args)

    