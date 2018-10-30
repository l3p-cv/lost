import datetime
from flask import request
from flask_restplus import Resource
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_claims
from lost.api.api import api
from lost.api.user.api_definition import page_with_users, user
from lost.api.user.parsers import pagination_parser as pagination
from lost.database.models import User, UserRoles, Role
from lost.database.db import db

namespace = api.namespace('user/users', description='All Users in System.')

@namespace.route('/')
class Users(Resource):
    @api.expect(pagination)
    @api.marshal_with(page_with_users)
    @jwt_required
    def get(self):
        roles = get_jwt_claims()['roles']
        if 'Designer' not in roles:
            return {'message': 'You need to be a Designer in order to list Users.'}, 401
        args = pagination.parse_args(request)
        page = args.get('page', 1)
        items_per_page = args.get('items_per_page', 10)
        users = User.query.paginate(page, items_per_page, error_out=False)
        return users
