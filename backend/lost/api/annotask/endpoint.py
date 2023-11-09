from datetime import datetime
import flask
from random import random, triangular
from flask_restx import Resource
from flask import request, make_response
from flask_jwt_extended import jwt_required, get_jwt_identity
from lost import settings
from lost.api.api import api
from lost.settings import LOST_CONFIG, FLASK_DEBUG
from lost.logic.file_man import AppFileMan
from lost.logic.file_access import UserFileAccess
from lost.db import access, roles, model, dtype
from lost.api.annotask.parsers import annotask_parser
from lost.logic import anno_task as annotask_service
from lost.logic.jobs.jobs import force_anno_release, export_ds, delete_ds_export
from lost.logic.report import Report
from lost.logic import dask_session
import json
import os
from io import BytesIO

namespace = api.namespace('annotask', description='AnnoTask API.')


@namespace.route('')
@api.doc(security='apikey')
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
@api.doc(security='apikey')
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
        
@namespace.route('/id/<int:annotask_id>')
@namespace.param('annotask_id', 'The id of the annotation task.')
@api.doc(security='apikey')
class AnnotaskById(Resource):
    @jwt_required 
    def get(self, annotask_id):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.ANNOTATOR):
            dbm.close_session()
            return "You are not authorized.", 401
        else:
            annotask = dbm.get_anno_task(anno_task_id=annotask_id)
            
            # add image count
            for r in dbm.count_all_image_annos(anno_task_id=annotask.idx)[0]:
                img_count = r
            for r in dbm.count_image_remaining_annos(anno_task_id=annotask.idx):
                annotated_img_count = img_count - r

            # find annotask user
            annotask_user_name = "All Users"
            if annotask.group_id:
                annotask_user_name = annotask.group.name
            
            # add annotask type
            annotask_type = ""
            if annotask.dtype == dtype.AnnoTask.MIA:
                annotask_type = "mia"
            elif annotask.dtype == dtype.AnnoTask.SIA:
                annotask_type = "sia"
                
            # add label leaves
            label_leaves = []
            db_leaves = dbm.get_all_required_label_leaves(annotask_id)
            for db_leaf in db_leaves:
                leaf = db_leaf.label_leaf
                leaf_json = dict()
                leaf_json['id'] = leaf.idx
                leaf_json['name'] = leaf.name
                leaf_json['color'] = leaf.color
                label_leaves.append(leaf_json)
            
            # collect annotask info
            anno_task_json = {
                'id': annotask.idx,
                'name': annotask.name,
                'type': annotask_type,
                'userName': annotask_user_name,
                'progress': annotask.progress,
                'progress': annotask.progress,
                'imgCount': img_count,
                'annotatedImgCount': annotated_img_count,
                'instructions': annotask.instructions,
                'labelLeaves': label_leaves
            }
            
            # add annotask configuration only if available
            if annotask.configuration:
                anno_task_json['configuration'] = json.loads(annotask.configuration)
            
            return anno_task_json


@namespace.route('/statistic/<int:annotask_id>')
@namespace.param('annotask_id', 'The id of the annotation task.')
@api.doc(security='apikey')
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
@api.doc(security='apikey')
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
@api.doc(security='apikey')
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
@api.doc(security='apikey')
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
@api.doc(security='apikey')
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
@api.doc(security='apikey')
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
                annotated_images_only = export_config['annotatedOnly']
                random_splits_active = export_config['randomSplits']['active']
                splits=None
                if random_splits_active:
                    splits = export_config['randomSplits']
                for r in dbm.count_all_image_annos(anno_task_id=anno_task.idx)[0]:
                    img_count = r
                for r in dbm.count_image_remaining_annos(anno_task_id=anno_task.idx):
                    annotated_img_count = img_count - r
                
                # check if amount of images to export is bigger than given limit in config
                if include_images:
                    if annotated_images_only:
                        if annotated_img_count > LOST_CONFIG.img_export_limit:
                            include_images = False
                    if img_count > LOST_CONFIG.img_export_limit:
                        include_images = False

                dExport = model.AnnoTaskExport(timestamp=datetime.now(), anno_task_id=anno_task.idx, 
                                                name=export_name, 
                                                progress=1, 
                                                anno_task_progress=anno_task.progress,
                                                img_count=annotated_img_count,
                                                )
                dbm.save_obj(dExport)
                client = dask_session.get_client(user)
                # flask.current_app.logger.info(f'pe_id: {anno_task.pipe_element_id}, identity: {identity}, export_id: {dExport.idx}, export_name: {dExport.name}, splits: {splits}, export_type: {export_type}, include_images: {include_images}, annotated_images_only: {annotated_images_only}')
                # export_ds(anno_task.pipe_element_id, identity, 
                #     dExport.idx, dExport.name, splits, 
                #     export_type, include_images, 
                #     annotated_images_only)
                client.submit(export_ds, anno_task.pipe_element_id, identity, 
                                    dExport.idx, dExport.name, splits, 
                                    export_type, include_images, 
                                    annotated_images_only)
                dbm.close_session()
                return "Success", 200
    
            dbm.close_session()
            return "You are not authorized.", 401

@namespace.route('/anno_task_exports/<int:annotask_id>')
@namespace.param('annotask_id', 'The id of the annotation task.')
@api.doc(security='apikey')
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
                d_exports = dbm.get_anno_task_export(anno_task_id=anno_task.idx)
                ret_json = []
                for export in d_exports:
                    export_json = dict()
                    export_json['id'] = export.idx
                    export_json['name'] = export.name
                    export_json['timestamp'] = export.timestamp.strftime(settings.STRF_TIME)
                    file_size = 0
                    file_type = None
                    if export.file_size:
                        file_size = int(export.file_size)
                    if export.file_path:
                        file_type = export.file_path.split('.')[-1] 
                    export_json['fileSize'] = file_size
                    export_json['progress'] = export.progress
                    export_json['annotaskProgress'] = export.anno_task_progress
                    export_json['imgCount'] = export.img_count
                    export_json['filePath'] = export.file_path
                    export_json['fileType'] = file_type
                    ret_json.append(export_json)
            dbm.close_session()
            return ret_json, 200
@namespace.route('/download_export/<int:anno_task_export_id>')
@namespace.param('anno_task_export_id', 'The id of the anno_task_export to download.')
@api.doc(security='apikey')
class DataExportDownload(Resource):
    @jwt_required 
    def get(self, anno_task_export_id):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.DESIGNER):
            dbm.close_session()
            return "You need to be {} in order to perform this request.".format(roles.DESIGNER), 401
        else:
            fs_db = dbm.get_user_default_fs(user.idx)
            ufa = UserFileAccess(dbm, user, fs_db)
            anno_task_export = dbm.get_anno_task_export(anno_task_export_id=anno_task_export_id)
            anno_task = dbm.get_anno_task(anno_task_export.anno_task_id)
            pipe_manager_id = anno_task.pipe_element.pipe.manager_id
            if pipe_manager_id == user.idx:
                export_name = os.path.basename(anno_task_export.file_path)
            # src = fm.get_pipe_project_path(content['namespace'])
                my_file = ufa.load_file(anno_task_export.file_path)
                # f = BytesIO()
                # # f = open('/home/lost/app/test.zip', 'wb')
                
                # f.seek(0)
                # resp = make_response(f.read())
                resp = make_response(my_file)
                resp.headers["Content-Disposition"] = f"attachment; filename={export_name}"
                resp.headers["Content-Type"] = "blob"
                dbm.close_session()
                return resp
            return 500

@namespace.route('/delete_export/<int:anno_task_export_id>')
@namespace.param('anno_task_export_id', 'The id of the annotation task.')
@api.doc(security='apikey')
class DeleteExport(Resource):
    @jwt_required 
    def post(self, anno_task_export_id):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity() 
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.DESIGNER):
            dbm.close_session()
            return "You are not authorized.", 401
        else:
            anno_task_data_export = dbm.get_anno_task_export(anno_task_export_id)
            anno_task = dbm.get_anno_task(anno_task_data_export.anno_task_id)
            pipe_manager_id = anno_task.pipe_element.pipe.manager_id
            if pipe_manager_id == user.idx:
                # client =dask_session.get_client(user)
                # client.submit(delete_ds_export, anno_task_data_export.idx, user.idx)
                delete_ds_export( anno_task_data_export.idx, user.idx)
                dbm.delete(anno_task_data_export)
                dbm.commit()
                dbm.close_session()
                return "Success", 200
    
            dbm.close_session()
            return "You are not authorized.", 401