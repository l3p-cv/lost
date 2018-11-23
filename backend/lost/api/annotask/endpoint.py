from flask_restplus import Resource
from flask import request
from flask_jwt_extended import jwt_required, get_jwt_identity
from lost.api.api import api
#from lost.api.user.api_definition import anno_task, anno_task_list
from lost.settings import LOST_CONFIG, FLASK_DEBUG
from lost.db import access, roles
from lost.logic import anno_task as annotask_service

namespace = api.namespace('annotask', description='AnnoTask API.')

@namespace.route('')
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
            annotask_list = annotask_service.get_available_annotask(dbm, group_ids)
            dbm.close_session()
            return annotask_list

    @jwt_required 
    def post(self):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.ANNOTATER):
            dbm.close_session()
            return "You are not authorized.", 401
        else:
            data = request.data['id']
            annotask_service.choose_annotask(dbm, data ,user.idx)
            dbm.close_session()
            return "success"

@namespace.route('/working')
class Working(Resource):
    #@api.marshal_with(anno_task)
    @jwt_required 
    def get(self):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.ANNOTATER):
            dbm.close_session()
            return "You are not authorized.", 401
        else:
            working_task = annotask_service.get_current_annotask(dbm, user)
            dbm.close_session()
            return user.choosen_anno_task

