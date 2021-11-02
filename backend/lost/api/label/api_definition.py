from flask_restx import fields

from lost.api.api import api
from lost.api.group.api_definition import group

label_leaf = api.model('Label Leaf',{
    'id': fields.Integer(readOnly=True, description='The identifier of the label leaf.'),
    'name': fields.String(description='The name of the label leaf.'),
    'description': fields.String(description='The description of the label leaf.'),
    'abbreviation': fields.String(description='The abbreviation of the label leaf.'),
    'leaf_id': fields.String(description='An external leaf id for this label.'),
    'group': fields.Nested(group, description='The group  this label belongs to.'),
    'is_root': fields.Boolean(description='Weather this label is the first label in a tree.'),
    'color': fields.String(description='Color in Hex-Format of that label leaf.')
})

label_tree = api.model('Label Tree', {
    'id': fields.Integer(readOnly=True, description='The identifier of the label tree.'),
    'name': fields.String(description='The name of the label tree.'),
    'description': fields.String(description='The description of the label tree.'),
    'labelLeaves': fields.List(fields.Nested(label_leaf))
})

label_trees = api.model('Label Trees', {
    'labelTrees': fields.List(fields.Nested(label_tree)) 
})