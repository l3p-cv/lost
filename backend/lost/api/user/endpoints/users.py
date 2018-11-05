import datetime
from flask import request
from flask_restplus import Resource
from flask_jwt_extended import jwt_required, get_jwt_claims, get_jwt_identity
from lost.api.api import api
from lost.api.user.api_definition import  user, users
from lost.api.user.parsers import pagination_parser as pagination
from lost.db.model import User, UserRoles, Role
from lost.settings import LOST_CONFIG
from lost.db import access, roles

namespace = api.namespace('user/users', description='All Users in System.')

@namespace.route('/')
class Users(Resource):
    #@api.expect(pagination)
    @api.marshal_with(users)
    @jwt_required
    def get(self):
        dbm = access.DBMan(LOST_CONFIG)

        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        check = user.has_role(roles.DESIGNER)
        args = pagination.parse_args(request)
        page = args.get('page', 1)
        items_per_page = args.get('items_per_page', 10)
        ulist = dbm.get_users()
        dbm.close_session()
        return ulist
        #return users
