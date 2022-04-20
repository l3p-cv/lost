from flask_restx import Resource
from flask import request
from flask_jwt_extended import jwt_required, get_jwt_identity
from lost.api.api import api
from lost.settings import LOST_CONFIG, FLASK_DEBUG
from lost.db import access, roles
from lost.api.annotask.parsers import annotask_parser
from lost.logic import anno_task as annotask_service
from lost.logic.jobs.jobs import force_anno_release
from lost.logic.report import Report
import json

namespace = api.namespace('annotask', description='AnnoTask API.')


@namespace.route('')
class Available(Resource):
    #@api.marshal_with(anno_task_list)
    @jwt_required 
    def get(self):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.ANNOTATOR):
            dbm.close_session()
            return "You are not authorized.", 401
        else:
            group_ids = [g.group.idx for g in user.groups]
            annotask_list = annotask_service.get_available_annotasks(dbm, group_ids, identity)
            dbm.close_session()
            import json
            #with open('/code/backend/lost/api/annotask/test/annoTasks.json') as f:
            #    data = json.load(f)
            #return data
            return annotask_list

    @api.expect(annotask_parser)
    @jwt_required 
    def post(self):
        args = annotask_parser.parse_args(request)
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.ANNOTATOR):
            dbm.close_session()
            return "You are not authorized.", 401
        else:
            annotask_service.choose_annotask(dbm, args.get('id') ,user.idx)
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
        if not user.has_role(roles.ANNOTATOR):
            dbm.close_session()
            return "You are not authorized.", 401
        else:
            working_task = annotask_service.get_current_annotask(dbm, user)
            dbm.close_session()
            import json
            #with open('/code/backend/lost/api/annotask/test/workingOnAnnoTask.json') as f:
            #    data = json.load(f)
            #return data
            return working_task


@namespace.route('/statistic/<int:annotask_id>')
@namespace.param('annotask_id', 'The id of the annotation task.')
class Statistic(Resource):
    @jwt_required 
    def get(self, annotask_id):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.ANNOTATOR):
            dbm.close_session()
            return "You are not authorized.", 401
        else:
            annotask_statistics = annotask_service.get_annotask_statistics(dbm, annotask_id)
            dbm.close_session()
            return annotask_statistics

@namespace.route('/report')
class ReportService(Resource):
    @jwt_required 
    def post(self):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.DESIGNER):
            dbm.close_session()
            return "You are not authorized.", 401
        else:
            data = json.loads(request.data)
            report = Report(dbm, data)
            report_data = report.get_report()
            dbm.close_session()
            return report_data

@namespace.route('/force_release/<int:annotask_id>')
@namespace.param('annotask_id', 'The id of the annotation task.')
class ForceRelease(Resource):
    @jwt_required 
    def get(self, annotask_id):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.ANNOTATOR):
            dbm.close_session()
            return "You are not authorized.", 401
        else:
            force_anno_release(dbm, annotask_id)
            dbm.close_session()
            return "Success", 200

@namespace.route('/change_user/<int:annotask_id>/<int:group_id>')
@namespace.param('annotask_id', 'The id of the annotation task.')
@namespace.param('group_id', 'The id of the annotation task should belong to.')
class ChangeUser(Resource):
    @jwt_required 
    def get(self, annotask_id, group_id):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.DESIGNER):
            dbm.close_session()
            return "You are not authorized.", 401
        else:
            anno_task = dbm.get_anno_task(annotask_id)
            pipe_manager_id = anno_task.pipe_element.pipe.manager_id
            if pipe_manager_id == user.idx:
                anno_task.group_id = group_id
                dbm.save_obj(anno_task)
                dbm.close_session()
                return "Success", 200
    
            dbm.close_session()
            return "You are not authorized.", 401