
import argparse
from lost.db import model, access
from lost.logic import config
from lost.logic.label import LabelTree
import logging
import os
import pandas as pd

logging.basicConfig(level=logging.INFO, format='(%(levelname)s): %(message)s')

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Remove a label tree from this lost instance')
    parser.add_argument('csv_file', nargs='?', action='store',
                        help='Path to the label tree in csv style.')
    # parser.add_argument('group_name', nargs='?', action='store',
    #                     help='Name of group that pipeline should be visible for.')
    args = parser.parse_args()

    lostconfig = config.LOSTConfig()
    dbm = access.DBMan(lostconfig)
    df = pd.read_csv(args.csv_file)
    name = df[df['parent_leaf_id'].isnull()]['name'].values[0]
    root_leaf = next(filter(lambda x: x.name==name, dbm.get_all_label_trees()),None)
    if root_leaf is None:
        logging.info('LabelTree not present in database! {}'.format(args.csv_file))
    else:
        LabelTree(dbm, root_leaf=root_leaf).delete_tree()
        logging.info('Deleted tree with name: {}'.format(name))