from flask_restplus import fields

from lost.api.api import api

label_leaf = api.model('Label Leaf',{
    'id': fields.Integer(readOnly=True, description='The identifier of the label leaf.'),
    'name': fields.String(description='The name of the label leaf.'),
    'description': fields.String(description='The description of the label leaf.'),
    'cssClass': fields.String(description='The css class of the label leaf.'),
})

label_tree = api.model('Label Tree', {
    'id': fields.Integer(readOnly=True, description='The identifier of the label tree.'),
    'name': fields.String(description='The name of the label tree.'),
    'description': fields.String(description='The description of the label tree.'),
    'cssClass': fields.String(description='The css class of the label tree.'),
    'labelLeaves': fields.List(fields.Nested(label_leaf))
})

label_trees = api.model('Label Trees', {
    'labelTrees': fields.List(fields.Nested(label_tree)) 
})