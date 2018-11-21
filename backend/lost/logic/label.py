import lost
import json
from lost.db import model
from datetime import datetime
import pandas as pd
__author__ = "Gereon Reus, Jonas Jaeger"


def get_recursive_label_trees(dbm, group_ids):
    label_trees_json = list()
    for parent_leaf in dbm.get_label_trees(group_ids):# type: lost.db.model.LabelTree
        parent_leaf_json = dict()
        parent_leaf_json['name'] = parent_leaf.name
        parent_leaf_json['description'] = parent_leaf.description
        parent_leaf_json['groupName'] = parent_leaf.group.name
        parent_leaf_json['treeId'] = parent_leaf.idx
        parent_leaf_json['deletable'] = True
        parent_leaf_json['children'] = list()
        for child_leaf in parent_leaf.label_leaves:
            parent_leaf_json['children'].append(__build_tree(dbm, child_leaf, parent_leaf, parent_leaf_json))
        label_trees_json.append(parent_leaf_json)
    return label_trees_json
    
def __build_tree(db_man, child_leaf, parent_leaf, parent_leaf_json):
    child_leaf_json = dict()
    child_leaf_json['name'] = child_leaf.name
    child_leaf_json['dbId'] = child_leaf.idx
    child_leaf_json['parentId'] = child_leaf.parent_leaf_id
    child_leaf_json['abbreviation'] = child_leaf.abbreviation
    child_leaf_json['description'] = child_leaf.description
    child_leaf_json['timestamp'] = child_leaf.timestamp
    child_leaf_json['cssClass'] = child_leaf.css_class
    child_leaf_json['leafId'] = child_leaf.leaf_id
    child_leaf_json['deletable'] = __is_deletable(db_man, child_leaf.idx)
    if not child_leaf_json['deletable']:
        parent_leaf_json['deletable'] = False
    child_leaf_json['children'] = list()
    # recursion ftw :)
    for child in child_leaf.label_leaves:
        curr_child = __build_tree(db_man, child, parent_leaf, parent_leaf_json)
        child_leaf_json['children'].append(curr_child)
    return child_leaf_json


def post_label_leaves(db_man, data, user_id):
    for leaf in data:
        label_leaf = model.LabelLeaf(name=leaf['name'],
                                abbreviation=leaf['abbreviation'],
                                description=leaf['description'],
                                css_class=leaf['cssClass'],
                                leaf_id=leaf['leafId'],
                                parent_leaf_id=leaf['parentLeafId'],
                                timestamp=datetime.now(),
                                user_id=user_id
                                )
        db_man.save_obj(label_leaf)
    return "success"
def patch_label_leaves(db_man, data, user_id):
    #TODO: Error Handling
    for leaf in data:
        label_leaf = db_man.get_label_leaf(leaf['id'])
        if label_leaf:
            label_leaf.name = leaf['name']
            label_leaf.abbreviation = leaf['abbreviation']
            label_leaf.description = leaf['description']
            label_leaf.css_class = leaf['cssClass']
            label_leaf.leaf_id = leaf['leafId']
            label_leaf.parent_leaf_id = leaf['parentLeafId']
            label_leaf.timestamp = datetime.now()
            label_leaf.user_id = user_id
            db_man.save_obj(label_leaf)
        else: return "Something weird happened."
    return "success"
        

def delete_label_leaves(db_man, data):
    for leaf in data:
        label_leaf = db_man.get_label_leaf(leaf['id'])
        if db_man.get_anno_amount(label_leaf.idx) > 0:
            return str(label_leaf.idx) + "is not deletable"
        else:
            db_man.delete(label_leaf)
    return "successs"

def update_label_leaves(db_man, data, user_id):
    leaf_map = dict()
    for leaf in data:
        if leaf['state'] == "ADDED":
            label_leaf = model.LabelLeaf(
                name=leaf['name'],
                description=leaf['description'],
                leaf_id=leaf['leafId'],
                parent_leaf_id=leaf['parentId'],
                label_tree_id=leaf['treeId'],
                timestamp=datetime.now(),
                user_id=user_id
            )
            db_man.add(label_leaf)
            db_man.commit()
            leaf_map[leaf['id']] = label_leaf.idx
        elif leaf['state'] == "ADDEDADDED":
            if leaf['parentId'] in leaf_map:
                parent_id = leaf_map[leaf['parentId']]
            else:
                return "error"
            label_leaf = model.LabelLeaf(
                name=leaf['name'],
                description=leaf['description'],
                leaf_id=leaf['leafId'],
                parent_leaf_id=parent_id,
                label_tree_id=leaf['treeId'],
                timestamp=datetime.now(),
                user_id=user_id
            )
            db_man.add(label_leaf)
            db_man.commit()
            leaf_map[leaf['id']] = label_leaf.idx
        elif leaf['state'] == "CHANGED":
            db_id = leaf['dbId']
            if leaf['id'] in leaf_map:
                db_id = leaf_map[leaf['id']]
            label_leaf = db_man.get_label_leaf(db_id)
            label_leaf.name = leaf['name']
            label_leaf.description = leaf['description']
            label_leaf.leaf_id = leaf['leafId']
            label_leaf.parent_leaf_id = leaf['parentId']
            label_leaf.user_id = user_id
            label_leaf.timestamp = datetime.now()
            db_man.add(label_leaf)
            db_man.commit()
        elif leaf['state'] == "DELETED":
            db_id = leaf['dbId']
            if leaf['id'] in leaf_map:
                db_id = leaf_map[leaf['id']]
            label_leaf = db_man.get_label_leaf(db_id)
            if db_man.get_anno_amount(label_leaf.idx) == 0:
                __delete_children(db_man, label_leaf)
                db_man.delete(label_leaf)
                db_man.commit()
    return "success"
def __delete_children(db_man, parent):
    for child in parent.children:
        __delete_children(db_man, child)
        if __is_deletable(db_man, child.idx):
            db_man.delete(child)
            db_man.commit()            
        else:
            break

def __is_deletable(db_man, label_leaf_id):
    anno_amount = db_man.get_anno_amount(label_leaf_id)
    req_amount = len(db_man.get_all_required_label_leaves(label_leaf_id=label_leaf_id))
    if anno_amount == 0 and req_amount == 0:
        return True
    else: return False

class LabelTree(object):
    '''A class that represants a LabelTree.

    Args:
        dbm (:class:`lost.db.access.DBMan`): Database manager object.
        root_id (int): label_leaf_id of the root Leaf.
        root_leaf (:class:`lost.db.model.LabelLeaf`): Root leaf of the tree.
    '''

    def __init__(self, dbm, root_id=None, root_leaf=None):
        self.dbm = dbm # type: lost.db.access.DBMan
        self.root = None # type: lost.db.model.LabelLeaf
        self.tree = {}
        if root_leaf is not None:
            self.root = root_leaf
            self.tree[root_leaf.idx] = root_leaf
        elif root_id is not None:
            self.root = self.dbm.get_label_leaf(root_id)
            self.__collect_tree(self.root, self.tree)

    def __collect_tree(self, label_leaf, leaf_map):
        '''Collect all LabelLeafs from Tree or Subtree
        
        Args:
            label_leaf (:class:`lost.db.model.LabelLeaf`): The leaf to start leaf collection.
            leaf_map (dict): Dictionary that maps leaf ids to LabelLeaf objects
                {leaf_id : LabelLeaf} 
        '''
        leaf_map[label_leaf.idx] == label_leaf
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


    def import_df(self, df):
        '''Import LabelTree from DataFrame'''
        raise NotImplementedError()

    

