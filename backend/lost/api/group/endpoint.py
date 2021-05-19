from flask import request
from flask_restx import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from lost.api.api import api
from lost.api.group.api_definition import group, group_list
from lost.api.group.parsers import group_parser
from lost.db import model, roles, access
from lost.settings import LOST_CONFIG

namespace = api.namespace('group', description='Groups in System.')

@namespace.route('')
class GroupList(Resource):
    @api.marshal_with(group_list)
    @jwt_required 
    def get(self):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.DESIGNER):
            dbm.close_session()
            return "You are not authorized.", 401
        else:
            glist = {'groups':dbm.get_user_groups(user_defaults=False)}
            dbm.close_session()
            return glist

    @api.expect(group_parser)
    @jwt_required 
    def post(self):
        args = group_parser.parse_args(request)
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        group_name = args.get('group_name')
        if not group_name:
            return "A group name is required.", 400
        if dbm.get_group_by_name(group_name):
            return "Group with name '{}' already exists.".format(group_name), 409
        group = model.Group(name=group_name, manager_id=identity)
        dbm.save_obj(group)
        dbm.commit()
        dbm.close_session()
        return "success"

@namespace.route('/<int:id>')
@namespace.param('id', 'The group identifier')
class Group(Resource):
    @api.marshal_with(group)
    @jwt_required 
    def get(self, id):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        group = dbm.get_group_by_id(id)
        dbm.close_session()
        if group:
            return group
        else:
            return "Group with ID '{}' not found.".format(id)

    @jwt_required 
    def delete(self, id):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.DESIGNER):
            dbm.close_session()
            return "You are not authorized.", 401

        group = dbm.get_group_by_id(id)
        
        if group:
            dbm.delete(group) 
            dbm.commit()
            dbm.close_session()
            return 'success', 200 
        else:
            dbm.close_session()
            return "Group with ID '{}' not found.".format(id), 400

    