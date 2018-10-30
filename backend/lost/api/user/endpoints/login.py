import datetime
from flask import request
from flask_restplus import Resource
from flask_jwt_extended import create_access_token, create_refresh_token
from lost.api.api import api
from lost.api.user.api_definition import user_login
from lost.api.user.parsers import login_parser
from lost.database.models import User, UserRoles, Role
from lost.database.db import db

namespace = api.namespace('user/login', description='Authenticate User')

@namespace.route('/')
class UserLogin(Resource):
    def get(self):
        db.create_all()
        create_first_user()
        return None, 200
    @api.expect(user_login)
    def post(self):
        # get data from parser
        data = login_parser.parse_args()
        # find user in database
        user = User.find_by_email(data['email'])
        # check password
        if user and user.check_password(data['password']):
            access_token = create_access_token(identity=user.id, fresh=True)
            refresh_token = create_refresh_token(user.id)
            return {
                'access_token': access_token,
                'refresh_token': refresh_token
            }, 200
        return {'message': 'Invalid credentials'}, 401
    

def create_first_user():
    # Create 'admin@example.com' user with 'Designer' and 'Annotater' roles
    if not User.query.filter(User.email == 'admin@example.com').first():
        user = User(
            email='admin@example.com',
            email_confirmed_at=datetime.datetime.utcnow(),
            password='admin',
        )
        user.roles.append(Role(name='Designer'))
        user.roles.append(Role(name='Annotater'))
        db.session.add(user)
        db.session.commit()