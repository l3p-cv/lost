from flask_restplus import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from lost.api.api import api
from lost.api.sia.api_definition import sia_config
from lost.db import roles, access
from lost.settings import LOST_CONFIG
from lost.logic import sia

namespace = api.namespace('sia/configuration', description='SIA Configuration API.')

@namespace.route('/')
class Configuration(Resource):
    @api.marshal_with(sia_config)
    @jwt_required 
    def get(self):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.ANNOTATER):
            dbm.close_session()
            return "You need to be {} in order to perform this request.".format(roles.ANNOTATER), 401
        else:
            re = sia.get_configuration(dbm, identity)
            dbm.close_session()
            return re