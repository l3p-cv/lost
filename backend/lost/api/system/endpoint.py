from flask_restx import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from lost.api.api import api

from lost.settings import LOST_CONFIG
from lost.db import access

import lost

namespace = api.namespace('system', description='System information and control.')

@namespace.route('/version')
class Version(Resource):
    def get(self):
        try:
            return lost.__version__
        except:
            return 'development'

