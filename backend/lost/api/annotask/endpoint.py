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
from lost.logic.db_access import UserDbAccess
from lost.db import access, roles, model, dtype
from lost.api.annotask.parsers import annotask_parser, update_group_parser, annotask_config_parser,storage_parser,generate_export_parser
from lost.logic import anno_task as annotask_service
from lost.logic.jobs.jobs import force_anno_release, export_ds, delete_ds_export
from lost.logic.report import Report
from lost.logic import dask_session
from lost.api.annotask.api_definition import anno_task_list, anno_task, storage_settings
import json
import os

namespace = api.namespace('annotask', description='AnnoTask API.')

@namespace.route('')
@api.response(401, 'Unauthorized. User does not have the required role.')

@api.doc(security='apikey')
class Available(Resource):
    @api.doc(description="Retrieve a list of available annotation tasks for the authenticated user.")
    @api.marshal_with(anno_task_list)
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
            return {'anno_tasks':annotask_list}

    @api.expect(annotask_parser)
    @api.doc(description='Select an annotation task.')
    @api.response(200, 'Task selected successfully.')
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
            annotask_service.choose_annotask(dbm, args.id ,user.idx)
            dbm.close_session()
            return "success"
@namespace.route('/working')
@api.response(401, 'Unauthorized. User does not have the required role.')
@api.doc(security='apikey',description='Get currently active Annotask')
class Working(Resource):
    @api.marshal_with(anno_task)
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
            return working_task

import logging   

@namespace.route('/<int:annotask_id>')
@namespace.param('annotask_id', 'The id of the annotation task.')
@api.param('statistics', 'are statistics supposed to be returned too')
@api.param('config', 'is the config supposed to be returned too')
@api.doc(security='apikey')
class AnnotaskById(Resource):
    @jwt_required 
    @api.marshal_with(anno_task)
    @api.doc(security='apikey',description='Get details for Annotask with the given id')

    def get(self, annotask_id):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.ANNOTATOR):
            dbm.close_session()
            return "You are not authorized.", 401
        else:
            statistics = request.args.get('statistics')
            config = request.args.get('config')
            logging.info(type(statistics))
            annotask = dbm.get_anno_task(anno_task_id=annotask_id)
            annotask_dict = annotask_service.get_at_info(dbm,annotask,identity,statistics=='true')
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
                
                annotask_dict['type']= annotask_type
                annotask_dict['user_name']= annotask_user_name                
                annotask_dict['img_count']= img_count
                annotask_dict['annotated_img_count']= annotated_img_count            
                annotask_dict['label_leaves']= label_leaves
            
            # add annotask configuration only if available
            if annotask.configuration and config == 'true':
                annotask_dict['configuration'] = json.loads(annotask.configuration)
            
            return annotask_dict



@namespace.route('/<int:annotask_id>/force_release')
@namespace.param('annotask_id', 'The id of the annotation task.')
@api.doc(security='apikey',description='Forces the release of the Annotations that are currently lock by users')
class ForceRelease(Resource):
    @jwt_required 
    def post(self, annotask_id):
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


@namespace.route('/<int:annotask_id>/group')
@namespace.param('annotask_id', 'The id of the annotation task.')
@api.doc(security='apikey')
class ChangeUser(Resource):
    @jwt_required 
    @api.expect(update_group_parser)
    @api.doc(security='apikey',description='Update the group or user the annotation is assigned to')

    def patch(self, annotask_id):

        args = update_group_parser.parse_args(request)

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
                anno_task.group_id = args.group_id
                dbm.save_obj(anno_task)
                dbm.close_session()
                return "Success", 200
    
            dbm.close_session()
            return "You are not authorized.", 401

@namespace.route('/<int:annotask_id>/config')
@namespace.param('annotask_id', 'The id of the annotation task.')
@api.expect(annotask_config_parser)

@api.doc(security='apikey')

class UpdateAnnoTaskConfig(Resource):
    @api.doc(security='apikey',description='Update the config of the annotask')
    @jwt_required 
    def put(self, annotask_id):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity() 
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.DESIGNER):
            dbm.close_session()
            return "You are not authorized.", 401
        else:
            args = annotask_config_parser.parse_args(request)
            anno_task = dbm.get_anno_task(annotask_id)
            pipe_manager_id = anno_task.pipe_element.pipe.manager_id
            if pipe_manager_id == user.idx:
                anno_task.configuration = json.dumps(args.configuration)
                dbm.save_obj(anno_task)
                dbm.close_session()
                return "Success", 200
    
            dbm.close_session()
            return "You are not authorized.", 401

@namespace.route('/<int:annotask_id>/storage_settings')
@namespace.param('annotask_id', 'The id of the annotation task.')
@api.doc(security='apikey')
class GetAnnoTaskStorageSettings(Resource):
    @api.marshal_with(storage_settings)
    @api.doc(security='apikey',description='Get the storage settings of the annotask')
    @jwt_required
    def get(self, annotask_id):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity() 
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.DESIGNER):
            dbm.close_session()
            return "You are not authorized.", 401

        anno_task = dbm.get_anno_task(annotask_id)
        
        return {
            'dataset_id': anno_task.dataset_id
        }
    
    @jwt_required
    @api.doc(security='apikey',description='Update the storage settings of the annotask')
    @api.expect(storage_parser)
    def patch(self, annotask_id):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity() 
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.DESIGNER):
            dbm.close_session()
            return "You are not authorized.", 401
        
        anno_task = dbm.get_anno_task(annotask_id)
        data = json.loads(request.data)
        args = annotask_config_parser.parse_args(request)
        
        # save dataset if given
        if 'datasetId' in data:
            dataset_id = args.dataset_id
            anno_task.dataset_id = dataset_id
            
            # -1 = no dataset given (remove ds id in case there was one before)
            if str(dataset_id) == '-1':
                anno_task.dataset_id = None
            
            dbm.save_obj(anno_task)
        

@namespace.route('/<int:annotask_id>/export')
@namespace.param('annotask_id', 'The id of the annotation task.')
@api.doc(security='apikey')
class GenerateExport(Resource):
    @api.expect(generate_export_parser)
    @api.doc(security='apikey',description='Generates an export for the annotask')
    @jwt_required 
    def post(self, annotask_id):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity() 
        user = dbm.get_user_by_id(identity)
        udb = UserDbAccess(dbm, user)
        anno_task = dbm.get_anno_task(annotask_id)
        # raise Exception(f'may_access_pe: {udb.may_access_pe(anno_task.pipe_element)}')
        if not udb.may_access_pe(anno_task.pipe_element):
            dbm.close_session()
            return "You are not authorized.", 401
        else:

            args = generate_export_parser.parse_args(request)
            
            include_images = args.include_images
            random_splits_active = args.random_splits['active']
            splits=None
            if random_splits_active:
                splits = args.random_splits
            for r in dbm.count_all_image_annos(anno_task_id=anno_task.idx)[0]:
                img_count = r
            for r in dbm.count_image_remaining_annos(anno_task_id=anno_task.idx):
                annotated_img_count = img_count - r
            
            # check if amount of images to export is bigger than given limit in config
            if include_images:
                if args.annotated_only:
                    if annotated_img_count > LOST_CONFIG.img_export_limit:
                        include_images = False
                if img_count > LOST_CONFIG.img_export_limit:
                    include_images = False

            dExport = model.AnnoTaskExport(timestamp=datetime.now(), anno_task_id=anno_task.idx, 
                                            name=args.export_name, 
                                            progress=1, 
                                            anno_task_progress=anno_task.progress,
                                            img_count=annotated_img_count,
                                            )
            dbm.save_obj(dExport)
            client = dask_session.get_client(user)
          
            client.submit(export_ds, anno_task.pipe_element_id, identity, 
                                dExport.idx, dExport.name, splits, 
                                args.export_type, include_images, 
                                args.annotated_only,
                                workers=LOST_CONFIG.worker_name)
            dask_session.close_client(user, client)
            dbm.close_session()
            return "Success", 200


@namespace.route('/anno_task_exports/<int:annotask_id>')
@namespace.param('annotask_id', 'The id of the annotation task.')
@api.doc(security='apikey')
class DataExports(Resource):
    @jwt_required 
    def get(self, annotask_id):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        udb = UserDbAccess(dbm, user)
        anno_task = dbm.get_anno_task(annotask_id)
        if not udb.may_access_pe(anno_task.pipe_element):
            dbm.close_session()
            return "You are not authorized.", 401
        else:
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
        udb = UserDbAccess(dbm, user)
        # anno_task = dbm.get_anno_task(annotask_id)
        anno_task_export = dbm.get_anno_task_export(anno_task_export_id=anno_task_export_id)
        anno_task = dbm.get_anno_task(anno_task_export.anno_task_id)
        if not udb.may_access_pe(anno_task.pipe_element):
            dbm.close_session()
            return "You are not authorized.", 401
        else:
            fs_db = dbm.get_user_default_fs(user.idx)
            ufa = UserFileAccess(dbm, user, fs_db)
            # pipe_manager_id = anno_task.pipe_element.pipe.manager_id
            # if pipe_manager_id == user.idx:
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
            # return 500

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
        
    
@namespace.route('/annotask_list_filter')
@api.doc(description='Anno List get method.') 
class AnnoTaskList(Resource):
    @jwt_required
    def post(self):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.ANNOTATOR):
           dbm.close_session()
           return make_response("You are not authorized.", 401)
        else:
            data = request.data
            data = json.loads(data)
            
            group_ids = [g.group.idx for g in user.groups]
            anno_tasks = dbm.get_annotasks_filtered(group_ids=group_ids, page_size=data['pageSize'], page=data['page'], sorted=data['sorted'], filterOptions=data['filterOptions'])
            total_pages = dbm.get_annotasks_total_pages(group_ids=group_ids, page_size=data['pageSize'], filterOptions=data['filterOptions'])
            
            at_json = []
            
            for at in anno_tasks:
                at_json.append(annotask_service.get_at_info(dbm, at, user_id=user.idx))
            dbm.close_session()
            plist = {
                'pages': total_pages,
                'rows': at_json
                }
            return plist
        
@namespace.route('/getFilterLabels')
@api.doc(description='Get possible filter labels for annotation lists')
class GetLabels(Resource):
    @jwt_required
    def get(self):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.ANNOTATOR):
            dbm.close_session()
            return make_response("You are not authorized.", 401)
        else:
            res = dict()
            res['states'] = [0, 1]
            dbm.close_session()
            return res
        

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
