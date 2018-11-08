from flask import request
from flask_restplus import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from lost.api.api import api
from lost.api.label.api_definition import label_leaf
from lost.db import model, roles, access
from lost.settings import LOST_CONFIG
from lost.logic import label

namespace = api.namespace('label', description='Label API.')

@namespace.route('/tree')
class LabelTrees(Resource):
    #@api.marshal_with()
    @jwt_required 
    def get(self):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.DESIGNER):
            dbm.close_session()
            return "You are not authorized.", 401
        else:
            group_ids = [g.idx for g in user.groups]
            re = label.get_recursive_label_trees(dbm, group_ids)
            dbm.close_session()
            return re

@namespace.route('/<int:label_leaf_id>')
@namespace.param('label_leaf_id', 'The label leaf identifier')
class Label(Resource):
    @api.marshal_with(label_leaf)
    @jwt_required 
    def get(self, label_leaf_id):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.DESIGNER):
            dbm.close_session()
            return "You are not authorized.", 401
        else:
            group_ids = [g.idx for g in user.groups]
            re = dbm.get_label_leaf(label_leaf_id)
            dbm.close_session()
            return re

