import lost
import json
from lost.db import model
from datetime import datetime
import pandas as pd
__author__ = "Jonas Jaeger"


class LabelTree(object):
    '''A class that represants a LabelTree.

    Args:
        dbm (:class:`lost.db.access.DBMan`): Database manager object.
        root_id (int): label_leaf_id of the root Leaf.
    '''

    def __init__(self, dbm, root_id=None):
        self.dbm = dbm # type: lost.db.access.DBMan
        self.root = None # type: lost.db.model.LabelLeaf
        self.tree = {}
        if root_id is not None:
            self.root = self.dbm.get_label_leaf(root_id)
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
            :class:`lost.db.model.LabelLeaf`: The created root leaf.
        '''
        self.root = model.LabelLeaf(name=name, 
            external_id=external_id, is_root=True)
        self.dbm.add(self.root)
        self.dbm.commit()
        self.tree[self.root.idx] = self.root
        return self.root

    def create_child(self, parent_id, name, external_id=None):
        '''Create a new leaf in label tree.

        Args:
            parent_id (int): Id of the parend leaf.
            name (str): Name of the leaf e.g the class name.
            external_id (str): Some id of an external label system.
        
        Retruns:
            :class:`lost.db.model.LabelLeaf`: The leaf object.
        '''
        leaf = model.LabelLeaf(name=name, 
            external_id=external_id, parent_leaf_id=parent_id)
        self.dbm.add(leaf)
        self.dbm.commit()
        self.tree[leaf.idx] = leaf
        return leaf

    def get_child_vec(self, parent_id, style='id'):
        '''Get a vector of child labels.

        Args:
            parent_id (int): Id of the parent leaf.
            style (str or list of str): Can be any attribute of :class:`lost.db.model.LabelLeaf`
                for example 'id', 'external_id', 'name' or a list of these e.g.
                ['name', 'id']
        
        Example:
            >>> label_tree.get_child_vec(1, style='id')
            [2, 3, 4]

            >>> label_tree.get_child_vec(1, style=['id', 'name'])
            [
                [2, 'cow'], 
                [3, 'horse'], 
                [4, 'person']
            ]

        Returns:
            list in the requested style: 
        '''
        parent = self.tree[parent_id] # type: lost.db.model.LabelLeaf
        df_list = []
        for ll in parent.label_leaves:
            df_list.append(ll.to_df()[style])
        df = pd.concat(df_list)
        return df.values.tolist()
            

    def to_df(self):
        '''Transform this LabelTree to a pandas DataFrame.
        '''
        df_list = []
        for leaf_id, leaf in self.tree.items():
            df_list.append(leaf.to_df())
        df = pd.concat(df_list)
        return df

    def to_list(self):
        leaves = list()
        for leaf_id, leaf in self.tree.items():
            leaves.append(leaf.to_dict())
        return leaves

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
 
    def import_df(self, df):
        '''Import LabelTree from DataFrame'''
        raise NotImplementedError()

    

