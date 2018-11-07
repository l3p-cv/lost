from flask_restplus import Resource
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from lost.api.api import api
#from lost.api.user.api_definition import anno_task, anno_task_list
from lost.api.user.parsers import login_parser
from lost.settings import LOST_CONFIG, FLASK_DEBUG
from lost.db import access, roles

namespace = api.namespace('annotask', description='AnnoTask API.')

@namespace.route('/')
class Available(Resource):
    #@api.marshal_with(anno_task_list)
    @jwt_required 
    def get(self):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.ANNOTATER):
            dbm.close_session()
            return "You are not authorized.", 401
        else:
            group_ids = [g.idx for g in user.groups]
            annotask_list = dbm.get_available_annotask(identity, group_ids)
            dbm.close_session()
            return annotask_list

@namespace.route('/working')
class Working(Resource):
    #@api.marshal_with(anno_task)
    @jwt_required 
    def get(self):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        dbm.close_session()
        if not user.has_role(roles.ANNOTATER):
            return "You are not authorized.", 401
        else:
            return user.choosen_anno_task