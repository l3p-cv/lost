import datetime
from flask import request
from flask_restplus import Resource
from flask_jwt_extended import jwt_required, get_jwt_claims, get_jwt_identity
from lost.api.api import api
from lost.api.user.api_definition import page_with_users, user
from lost.api.user.parsers import pagination_parser as pagination
from lost.db.model import User, UserRoles, Role
from lost.settings import LOST_CONFIG
from lost.db import access
from lost.logic.role_man import DESIGNER

namespace = api.namespace('user/users', description='All Users in System.')

@namespace.route('/')
class Users(Resource):
    #@api.expect(pagination)
    #@api.marshal_with(page_with_users)
    @jwt_required
    def get(self):
        dbm = access.DBMan(LOST_CONFIG)

        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        check = user.has_role(DESIGNER)
        args = pagination.parse_args(request)
        page = args.get('page', 1)
        items_per_page = args.get('items_per_page', 10)
        #users = User.query.paginate(page, items_per_page, error_out=False)
        dbm.close_session()
        return check
        #return users
