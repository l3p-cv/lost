from flask_restplus import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from lost.api.api import api
from lost.api.user.api_definition import user_list
from lost.settings import LOST_CONFIG
from lost.db import access, roles

namespace = api.namespace('user/list', description='All Users in System.')

@namespace.route('/')
class List(Resource):
    @api.marshal_with(user_list)
    @jwt_required 
    def get(self):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.DESIGNER):
            dbm.close_session()
            return "You are not authorized.", 401
        else:
            ulist = {'users':dbm.get_users()}
            dbm.close_session()
            return ulist
