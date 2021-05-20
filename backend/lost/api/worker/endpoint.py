from flask_restx import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from lost.api.api import api
from lost.api.worker.api_definition import worker_list
from lost.settings import LOST_CONFIG
from lost.db import access, roles

namespace = api.namespace('worker', description='Workers in System.')

@namespace.route('')
@api.doc(description='Worker Api get method.')
class WorkerList(Resource):
    @api.marshal_with(worker_list)
    @jwt_required 
    def get(self):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.DESIGNER):
            dbm.close_session()
            return "You are not authorized.", 401
        else:
            workers = dbm.get_worker()
            dbm.close_session()
            wlist = {'workers': workers}
            return wlist 
