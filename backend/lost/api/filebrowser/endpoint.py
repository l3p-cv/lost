import json
from flask import request
from flask_restplus import Resource
from lost.api.api import api
from lost.settings import LOST_CONFIG, DATA_URL
from flask_jwt_extended import jwt_required, get_jwt_identity
from lost.db import roles, access
from lost.logic.file_man import FileMan, chonkyfy

namespace = api.namespace('fb', description='Lost Filebrowser API')

@namespace.route('/ls')
class LS(Resource):
    @jwt_required 
    def post(self):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.DESIGNER):
            dbm.close_session()
            return "You need to be {} in order to perform this request.".format(roles.DESIGNER), 401
        else:
            data = json.loads(request.data)
            fs_db = dbm.get_fs(name=data['fs']['name'])
            fm = FileMan(fs_db=fs_db)
            res = fm.ls(data['path'], detail=True)
            dbm.close_session()
            return chonkyfy(res, data['path'], fm)
