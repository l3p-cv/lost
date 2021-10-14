from datetime import time, datetime
import json
from flask import request
from flask_restx import Resource
from lost.api.api import api
from lost.settings import LOST_CONFIG, DATA_URL
from flask_jwt_extended import jwt_required, get_jwt_identity
from lost.db import model, roles, access
namespace = api.namespace('statistics', description='LOST Statistics API')

@namespace.route('/personal')
class Personal(Resource):
    @jwt_required 
    def get(self):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.ANNOTATOR):
            dbm.close_session()
            return "You need to be {} in order to perform this request.".format(roles.DESIGNER), 401
        else:
            
            response = {
                'test1': {
                    'x': [1,2,3],
                    'y': [4,5,6]
                },
                'test2': {
                    'x': [1,2,3],
                    'y': [4,5,6]
                },
            }
            dbm.close_session()
            return response
         