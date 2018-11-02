import lost
import json
from lost.db import model
from datetime import datetime
__author__ = "Gereon Reus"

def __serialize_label_tree(label_tree):
    label_tree_json = dict()
    label_tree_json['id'] = label_tree.idx
    label_tree_json['name'] = label_tree.name
    label_tree_json['description'] = label_tree.description
    label_tree_json['timestamp'] = label_tree.timestamp
    label_tree_json['userName'] = label_tree.user.first_name + " " + label_tree.user.last_name
    label_tree_json['labelLeafAmount'] = len(label_tree.label_leaves)
    #TODO: Count Label Leaf amount 
    return label_tree_json

def get_label_trees(db_man):
    label_trees_json = list()
    for label_tree in db_man.get_label_trees():# type: lost.db.model.LabelTree
        label_trees_json.append(__serialize_label_tree(label_tree))
    return label_trees_json

def get_label_tree(db_man, label_tree_id):
    label_tree = db_man.get_label_tree(label_tree_id) # type: lost.db.model.LabelTree
    label_tree_json = __serialize_label_tree(label_tree)
    label_tree_json['labelLeaves'] = list()
    for label_leaf in label_tree.label_leaves: # type: lost.db.model.LabelLeaf
        label_leaf_json = dict()
        label_leaf_json['id'] = label_leaf.idx
        label_leaf_json['name'] = label_leaf.name
        label_leaf_json['abbreviation'] = label_leaf.abbreviation
        label_leaf_json['description'] = label_leaf.description
        label_leaf_json['timestamp'] = label_leaf.timestamp
        label_leaf_json['userName'] = label_leaf.user.first_name + " " + label_leaf.user.last_name
        label_leaf_json['cssClass'] = label_leaf.css_class
        label_leaf_json['leafId'] = label_leaf.leaf_id
        label_leaf_json['parentLeafId'] = label_leaf.parent_leaf_id
        label_tree_json['labelLeaves'].append(label_leaf_json)
    return label_tree_json
def get_recursive_label_tree(db_man, label_tree_id):
    label_tree = db_man.get_label_tree(label_tree_id) # type: lost.db.model.LabelTree
    label_tree_json = __serialize_label_tree(label_tree)
    label_tree_json = dict()
    first_leaves = list(filter(lambda x: x.parent_leaf_id == None, label_tree.label_leaves))
    label_tree_json['name'] = label_tree.name
    label_tree_json['description'] = label_tree.description
    label_tree_json['treeId'] = label_tree.idx
    label_tree_json['deletable'] = True
    label_tree_json['children'] = list()
    for first_leaf in first_leaves:
        label_tree_json['children'].append(__build_tree(db_man, first_leaf, label_tree, label_tree_json))
    return label_tree_json
def __build_tree(db_man, child, label_tree, label_tree_json):
    child_json = dict()
    child_json['name'] = child.name
    child_json['dbId'] = child.idx
    child_json['parentId'] = child.parent_leaf_id
    child_json['abbreviation'] = child.abbreviation
    child_json['description'] = child.description
    child_json['timestamp'] = child.timestamp
    child_json['userName'] = child.user.first_name + " " + child.user.last_name
    child_json['cssClass'] = child.css_class
    child_json['leafId'] = child.leaf_id
    child_json['deletable'] = __is_deletable(db_man, child.idx)
    if not child_json['deletable']:
        label_tree_json['deletable'] = False
    child_json['children'] = list()
    # recursion ftw :)
    for child in list(filter(lambda x: x.parent_leaf_id == child.idx, label_tree.label_leaves)):
        curr_child = __build_tree(db_man, child, label_tree, label_tree_json)
        child_json['children'].append(curr_child)
    return child_json

def post_label_tree(db_man, data, user_id):
    #TODO: check if name is already existing
    label_tree = model.LabelTree(name=data['name'],
                              description=data['description'],
                              user_id=user_id,
                              timestamp=datetime.now())
    db_man.save_obj(label_tree)
    return "success"
def patch_label_tree(db_man, data, user_id):
    label_tree = db_man.get_label_tree(data['id'])
    if label_tree:
        label_tree.name = data['name']
        label_tree.description = data['description']
        label_tree.user_id = user_id
        label_tree.timestamp = datetime.now()
        db_man.save_obj(label_tree)
        return "success"
    else: 
        return "label tree not found"
def delete_label_tree(db_man, label_tree_id):
    label_tree = db_man.get_label_tree(label_tree_id)
    for label_leaf in label_tree.label_leaves:
        if not __is_deletable(db_man, label_leaf.idx):
            return "not deletable"
    for label_leaf in label_tree.label_leaves:
        db_man.delete(label_leaf)
    db_man.delete(label_tree)
    db_man.commit()
    return "success"

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