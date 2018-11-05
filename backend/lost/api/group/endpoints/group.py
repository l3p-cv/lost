from flask import request
from flask_restplus import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from lost.api.api import api
from lost.api.group.api_definition import group
from lost.api.group.parsers import group_parser
from lost.db import model
from lost.settings import LOST_CONFIG
from lost.db import access

namespace = api.namespace('group', description='A single Group in System.')

@namespace.route('/')
class Group(Resource):
    @api.marshal_with(group)
    @jwt_required 
    def get(self):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        group = dbm.get_user_groups(user_defaults=False)
        dbm.close_session()
        return group

    @api.expect(group_parser)
    @jwt_required 
    def post(self):
        args = group_parser.parse_args(request)
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        group_name = args.get('name')
        if dbm.get_group_by_name(group_name):
            return "Group with name '{}' already exists.".format(group_name), 409
        group = model.Group(name=group_name, manager_id=identity)
        dbm.save_obj(group)
        dbm.commit()
        dbm.close_session()
        return "success"