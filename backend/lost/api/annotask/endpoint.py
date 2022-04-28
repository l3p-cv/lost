from datetime import datetime
from random import triangular
from flask_restx import Resource
from flask import request, make_response
from flask_jwt_extended import jwt_required, get_jwt_identity
from lost.api.api import api
from lost.settings import LOST_CONFIG, FLASK_DEBUG
from lost.logic.file_man import AppFileMan
from lost.db import access, roles, model
from lost.api.annotask.parsers import annotask_parser
from lost.logic import anno_task as annotask_service
from lost.logic.jobs.jobs import force_anno_release
from lost.logic.report import Report
import json
import os
from io import BytesIO

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
@namespace.route('/update_config/<int:annotask_id>')
@namespace.param('annotask_id', 'The id of the annotation task.')
class UpdateAnnoTaskConfig(Resource):
    @jwt_required 
    def post(self, annotask_id):
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
                data = json.loads(request.data)
                anno_task.configuration = json.dumps(data['configuration'])
                dbm.save_obj(anno_task)
                dbm.close_session()
                return "Success", 200
    
            dbm.close_session()
            return "You are not authorized.", 401

@namespace.route('/generate_export/<int:annotask_id>')
@namespace.param('annotask_id', 'The id of the annotation task.')
class GenerateExport(Resource):
    @jwt_required 
    def post(self, annotask_id):
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
                data = json.loads(request.data)
                
                export_config = data['export_config']
                export_name = export_config['exportName']
                export_type = export_config['exportType'] # LOST_Dataset, PascalVOC, YOLO, MS_Coco, CSV
                include_images = export_config['includeImages']
                random_splits_active = export_config['randomSplits']['active']
                if random_splits_active:
                    split_train = export_config['randomSplits']['train']
                    split_test = export_config['randomSplits']['test']
                    split_val = export_config['randomSplits']['val']
                #TODO Export here
                dExport = model.DataExport(timestamp=datetime.now(), anno_task_id=anno_task.idx, name=export_name, progress=0)
                dbm.save_obj(dExport)

                dbm.close_session()
                return "Success", 200
    
            dbm.close_session()
            return "You are not authorized.", 401

@namespace.route('/data_exports/<int:annotask_id>')
@namespace.param('annotask_id', 'The id of the annotation task.')
class DataExports(Resource):
    @jwt_required 
    def get(self, annotask_id):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.ANNOTATOR):
            dbm.close_session()
            return "You are not authorized.", 401
        else:
            anno_task = dbm.get_anno_task(annotask_id)
            pipe_manager_id = anno_task.pipe_element.pipe.manager_id
            if pipe_manager_id == user.idx:
                d_exports = dbm.get_data_exports_by_anno_task_id(anno_task.idx)
                ret_json = []
                for export in d_exports:
                    export_json = dict()
                    export_json['id'] = export.idx
                    export_json['name'] = export.name
                    export_json['timestamp'] = export.timestamp.strftime("%Y-%m-%d %H:%M:%S")
                    export_json['fileSize'] = 164000 # TODO get filesize
                    export_json['progress'] = export.progress
                    export_json['filePath'] = export.file_path
                    export_json['fileType'] = 'zip' #TODO get filetype
                    ret_json.append(export_json)
            dbm.close_session()
            return ret_json, 200
@namespace.route('/data_export/download/<int:data_export_id>')
@namespace.param('data_export_id', 'The id of the data_export to download.')
class DataExportDownload(Resource):
    @jwt_required 
    def get(self, data_export_id):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.DESIGNER):
            dbm.close_session()
            return "You need to be {} in order to perform this request.".format(roles.DESIGNER), 401
        else:
            # TODO Export here !
            fm = AppFileMan(LOST_CONFIG)
            data_export = dbm.get_data_export(data_export_id)
            anno_task = dbm.get_anno_task(data_export.anno_task_id)
            pipe_manager_id = anno_task.pipe_element.pipe.manager_id
            if pipe_manager_id == user.idx:
            # src = fm.get_pipe_project_path(content['namespace'])
                f = BytesIO()
                # f = open('/home/lost/app/test.zip', 'wb')
                
                f.seek(0)
                resp = make_response(f.read())
                resp.headers["Content-Disposition"] = f"attachment; filename={pipe_project}.zip"
                resp.headers["Content-Type"] = "blob"
                dbm.close_session()
                return resp
            return 500