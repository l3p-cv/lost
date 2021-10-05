from posix import POSIX_FADV_NOREUSE
from flask_restx import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from lost.api.api import api

from lost.settings import LOST_CONFIG
from lost.db import access, roles

import lost
import os

namespace = api.namespace('system', description='System information and control.')

@namespace.route('/version')
class Version(Resource):
    def get(self):
        try:
            return lost.__version__
        except:
            return 'development'
@namespace.route('/jupyter')
class JupyterLabUrl(Resource):
    @jwt_required 
    def get(self):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.ADMINISTRATOR):
            dbm.close_session()
            return "You need to be {} in order to perform this request.".format(roles.ADMINISTRATOR), 401

        else:
            if LOST_CONFIG.jupyter_lab_active:
                return f'{LOST_CONFIG.jupyter_lab_port}/lab?token={LOST_CONFIG.jupyter_lab_token}' 
            return ''
