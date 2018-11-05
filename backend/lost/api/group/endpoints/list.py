from flask_restplus import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from lost.api.api import api
from lost.api.group.api_definition import group_list
from lost.settings import LOST_CONFIG
from lost.db import access, roles

namespace = api.namespace('group/list', description='All Groups in System.')

@namespace.route('/')
class List(Resource):
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
