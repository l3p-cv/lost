from flask_restplus import Resource
from flask import request, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity
from lost.api.api import api
from lost.settings import LOST_CONFIG, FLASK_DEBUG
from lost.db import access, roles
from lost.api.annotask.parsers import annotask_parser
from lost.logic import anno_task as annotask_service

import os

namespace = api.namespace('data', description='Data API.')

@namespace.route('/<path:path>')
class Available(Resource): 
    #@api.marshal_with(anno_task_list)
    @jwt_required 
    def get(self, path):
        print(path)
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.ANNOTATOR):
            dbm.close_session()
            return "You are not authorized.", 401
        else:
            return send_from_directory(os.path.join(LOST_CONFIG.project_path, 'data'), path)
