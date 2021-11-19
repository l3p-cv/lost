import lost
import json
from lost.db import model
from datetime import datetime
import pandas as pd
import numpy as np
__author__ = "Jonas Jaeger"


class LabelTree(object):
    '''A class that represants a LabelTree.

    Args:
        dbm (:class:`lost.db.access.DBMan`): Database manager object.
        root_id (int): label_leaf_id of the root Leaf.
        root_leaf (:class:`lost.db.model.LabelLeaf`): Root leaf of the tree.
        name (str): Name of a label tree.
        logger (logger): A logger.
        group_id (int): Id of the group where the LabelTree belongs to.
    '''

    def __init__(self, dbm, root_id=None, root_leaf=None, name=None, logger=None, group_id=None):
        self.dbm = dbm # type: lost.db.access.DBMan
        self.root = None # type: lost.db.model.LabelLeaf
        self.tree = {}
        if logger is None:
            import logging
            self.logger = logging
        else:
            self.logger = logger
        if root_leaf is not None:
            self.root = root_leaf
            self.__collect_tree(self.root, self.tree)
        elif root_id is not None:
            self.root = self.dbm.get_label_leaf(root_id)
            self.__collect_tree(self.root, self.tree)
        elif name is not None:
            if group_id is None:
                root_list = self.dbm.get_all_label_trees(global_only=True)
            else:
                root_list = self.dbm.get_all_label_trees(group_id=group_id, add_global=True)
            for leaf in root_list:
                print(leaf.name)
            root = next(filter(lambda x: x.name==name, root_list), None)
            if root is None:
                raise Exception('LabelTree with name "{}" not found in database!'.format(name))
            else:
                self.root = root
                self.__collect_tree(self.root, self.tree)


    def __collect_tree(self, label_leaf, leaf_map):
        '''Collect all LabelLeafs from Tree or Subtree
        
        Args:
            label_leaf (:class:`lost.db.model.LabelLeaf`): The leaf to start leaf collection.
            leaf_map (dict): Dictionary that maps leaf ids to LabelLeaf objects
                {leaf_id : LabelLeaf} 
        '''
        leaf_map[label_leaf.idx] = label_leaf
        for ll in label_leaf.label_leaves:
            self.__collect_tree(ll, leaf_map)

    def delete_subtree(self, leaf):
        '''Recursive delete all leafs in subtree starting with leaf
        
        Args:
            leaf (:class:`lost.db.model.LabelLeaf`): Delete all childs
                of this leaf. The leaf itself stays.
        '''
        for ll in leaf.label_leaves:
            self.delete_subtree(ll)
            self.logger.info('Deleting label leaf: {}'.format(ll.name))
            self.dbm.delete(ll)

    def delete_tree(self):
        '''Delete whole tree from system'''
        self.delete_subtree(self.root)
        self.dbm.delete(self.root)
        self.dbm.commit()

    def create_root(self, name, external_id=None):
        '''Create the root of a label tree.

        Args:
            name (str): Name of the root leaf.
            external_id (str): Some id of an external label system.
        
        Retruns:
            :class:`lost.db.model.LabelLeaf` or None: 
                The created root leaf or None if a root leaf with same
                name is already present in database.
        '''
        root_leafs = self.dbm.get_all_label_trees(global_only=True)
        if root_leafs is not None:
            for leaf in root_leafs:
                if name == leaf.name:
                    return None
        self.root = model.LabelLeaf(name=name, 
            external_id=external_id, is_root=True)
        self.dbm.add(self.root)
        self.dbm.commit()
        self.tree[self.root.idx] = self.root
        self.logger.info('Created root leaf: {}'.format(name))
        return self.root

    def create_child(self, parent_id, name, external_id=None):
        '''Create a new leaf in label tree.

        Args:
            parent_id (int): Id of the parend leaf.
            name (str): Name of the leaf e.g the class name.
            external_id (str): Some id of an external label system.
        
        Retruns:
            :class:`lost.db.model.LabelLeaf`: The the created child leaf.
        '''
        leaf = model.LabelLeaf(name=name, 
            external_id=external_id, parent_leaf_id=parent_id)
        self.dbm.add(leaf)
        self.dbm.commit()
        self.tree[leaf.idx] = leaf
        self.logger.info('Created child leaf: {}'.format(name))
        return leaf

    def get_child_vec(self, parent_id, columns='idx'):
        '''Get a vector of child labels.

        Args:
            parent_id (int): Id of the parent leaf.
            columns (str or list of str): Can be any attribute of :class:`lost.db.model.LabelLeaf`
                for example 'idx', 'external_idx', 'name' or a list of these e.g.
                ['name', 'idx']
        
        Example:
            >>> label_tree.get_child_vec(1, columns='idx')
            [2, 3, 4]

            >>> label_tree.get_child_vec(1, columns=['idx', 'name'])
            [
                [2, 'cow'], 
                [3, 'horse'], 
                [4, 'person']
            ]

        Returns:
            list in the requested columns: 
        '''
        parent = self.tree[parent_id] # type: lost.db.model.LabelLeaf
        df_list = []
        for ll in parent.label_leaves:
            df_list.append(ll.to_df()[columns])
        df = pd.concat(df_list)
        return df.values.tolist()
            
    def to_df(self):
        '''Transform this LabelTree to a pandas DataFrame.

        Returns:
            pandas.DataFrame
        '''
        df_list = []
        for leaf_id, leaf in self.tree.items():
            df_list.append(leaf.to_df())
        df = pd.concat(df_list)
        return df.reset_index().drop(columns=['index'])

    # def to_list(self):
    #     leaves = list()
    #     for leaf_id, leaf in self.tree.items():
    #         leaves.append(leaf.to_dict())
    #     return leaves

    def __collect_dict_tree(self, label_leaf, t_dict):
        t_dict['children'] = []
        for ll in label_leaf.label_leaves:
            ll_dict = ll.to_dict()
            t_dict['children'].append(ll_dict)
            self.__collect_dict_tree(ll, ll_dict)

    def to_hierarchical_dict(self):
        my_dict =  self.root.to_dict()
        self.__collect_dict_tree(self.root, my_dict)
        return my_dict
 
    def _df_row_to_leaf(self, row, leaf):
        '''Transfrom LabelLeaf in row style to a LabelLeaf object.

        Args:
            row (pandas.Series): A LabelLeaf in row style.
        
        Returns:
            :class:`lost.db.model.LabelLeaf`:
                The transformed row.
        '''
        try:
            leaf.abbreviation = row['abbreviation']
            self.logger.info('\tabbreviation: {}'.format(leaf.abbreviation))
        except KeyError:
            self.logger.info('\tNo abbreviation provided.')
        try:
            leaf.description = row['description']
            self.logger.info('\tdescription: {}'.format(leaf.description))
        except KeyError:
            self.logger.info('\tNo description provided.')
        try:
            leaf.timestamp = row['timestamp']
            self.logger.info('\ttimestamp: {}'.format(leaf.timestamp))
        except KeyError:
            self.logger.info('\tNo timestamp provided.')
        try:
            if not np.isnan(row['external_id']):
                leaf.external_id = row['external_id']
                self.logger.info('\texternal_id: {}'.format(leaf.external_id))
        except KeyError:
            self.logger.info('\tNo external_id provided.')
        try:
            leaf.is_deleted = row['is_deleted']
            self.logger.info('\tis_deleted: {}'.format(leaf.is_deleted))
        except KeyError:
            self.logger.info('\tNo is_deleted provided.')
        try:
            leaf.color = row['color']
            self.logger.info('\tcolor: {}'.format(leaf.color))
        except KeyError:
            self.logger.info('\tNo color provided.')

    def __create_childs_from_df(self, child_dict, parent, parent_row):
        '''Create child leafs from a df.

        Args:
            child_dict (dict): A dictionary that maps parent_ids from DataFrame 
                to child rows from DataFrame.
            parent (:class:`lost.db.model.LabelLeaf`): A parent LabelLeaf 
                that was already imported.
            parent_row (pandas.Series): A row from the DataFrame to import. 
        '''
        if parent_row['idx'] not in child_dict:
            return
        for child_row in child_dict[parent_row['idx']]:
            child = self.create_child(parent.idx, 
                        child_row['name'])
            self._df_row_to_leaf(child_row, child)
            self.__create_childs_from_df(child_dict, child, child_row)
        
    def import_df(self, df):
        '''Import LabelTree from DataFrame
        
        Args:
            df (pandas.DataFrame): LabelTree in DataFrame style.

        Retruns:
            :class:`lost.db.model.LabelLeaf` or None: 
                The created root leaf or None if a root leaf with same
                name is already present in database.
        '''
        df = df.where((pd.notnull(df)), None)
        root = df[df['parent_leaf_id'].isnull()]
        no_root = df[~df['parent_leaf_id'].isnull()]
        childs = {}

        if len(root) != 1:
            raise ValueError('''Can not import. There needs 
                to be exactly one root leaf for that tree! 
                Found: \n{}'''.format(root))
        else:
            try:
                root_leaf = self.create_root(root['name'].values[0])
                if root_leaf is None:
                    return None #A tree with the same name already exists.
                self._df_row_to_leaf(root.loc[0], root_leaf)

                #Create child dict
                for index, row in no_root.iterrows():
                    if not row['parent_leaf_id'] in childs:
                        childs[row['parent_leaf_id']] = []
                    childs[row['parent_leaf_id']].append(row)
                
                self.__create_childs_from_df(childs, root_leaf, root.loc[0])
                self.dbm.commit()
                return root_leaf
            except KeyError:
                self.logger.error('''At least the following columns 
                    need to be provided: *idx*, *name*, *parent_leaf_id*''')
                raise


            
