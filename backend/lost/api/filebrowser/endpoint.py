
from flask_restplus import Resource
from lost.api.api import api
from lost.settings import LOST_CONFIG, DATA_URL
from flask_jwt_extended import jwt_required, get_jwt_identity
from lost.db import roles, access

namespace = api.namespace('fb', description='Lost Filebrowser API')

@namespace.route('/first')
class First(Resource):
    @jwt_required 
    def get(self):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        return {'files':'hallo'}
        if not user.has_role(roles.DESIGNER):
            dbm.close_session()
            return "You need to be {} in order to perform this request.".format(roles.DESIGNER), 401
        else:
            dbm.close_session()
            return {'files':'hallo'}
