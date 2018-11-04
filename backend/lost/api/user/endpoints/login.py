import datetime
from flask import request
from flask_restplus import Resource
from flask_jwt_extended import create_access_token, create_refresh_token
from lost.api.api import api
from lost.api.user.api_definition import user_login
from lost.api.user.parsers import login_parser
from lost.db.model import User, UserRoles, Role
from lost.settings import LOST_CONFIG
from lost.db import access

namespace = api.namespace('user/login', description='Authenticate User')

@namespace.route('/')
class UserLogin(Resource):
    @api.expect(user_login)
    def post(self):
        # get data from parser
        data = login_parser.parse_args()
        dbm = access.DBMan(LOST_CONFIG)
        # find user in database
        user = dbm.find_user_by_email(data['email'])
        if not user:
            user = dbm.find_user_by_user_name(data['user_name'])
        # check password
        if user and user.check_password(data['password']):
            expires = datetime.timedelta(hours=2)
            access_token = create_access_token(identity=user.idx, fresh=True, expires_delta=expires)
            refresh_token = create_refresh_token(user.idx)
            return {
                'token': access_token,
                'refresh_token': refresh_token
            }, 200
        return {'message': 'Invalid credentials'}, 401
    
