from flask_restplus import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from lost.api.api import api
from lost.api.user.api_definition import user
from lost.settings import LOST_CONFIG
from lost.db import access

namespace = api.namespace('user', description='A single User in System.')

@namespace.route('/')
class User(Resource):
    @api.marshal_with(user)
    @jwt_required 
    def get(self):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        dbm.close_session()
        return u
