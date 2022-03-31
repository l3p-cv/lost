from datetime import time, datetime
import json
from flask import request
from flask_restx import Resource
from lost.api.api import api
from lost.settings import LOST_CONFIG, DATA_URL
from lost.db.vis_level import VisLevel
from flask_jwt_extended import jwt_required, get_jwt_identity
from lost.db import model, roles, access
import os

namespace = api.namespace('annoExample', description='API to get annotation examples')



@namespace.route('/getImage')
class GetImage(Resource):
    @jwt_required 
    def post(self):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.ANNOTATOR):
            dbm.close_session()
            return "You need to be {} in order to perform this request.".format(roles.ANNOTATOR), 401
        else:
            data = json.loads(request.data)
            raise NotImplementedError()
            return 'success', 200 
