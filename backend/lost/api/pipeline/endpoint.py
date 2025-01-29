import subprocess
import shutil
from flask import request, make_response
from flask_restx import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from lost.api.api import api
from lost.logic.file_man import AppFileMan
from lost.api.pipeline.api_definition import templates, template
from lost.api.pipeline import tasks
from lost.db import roles, access
from lost.settings import LOST_CONFIG, DATA_URL
from lost.logic.pipeline import service as pipeline_service
from lost.logic.pipeline import template_import
from lost.logic import template as template_service
from lost.db.vis_level import VisLevel
import json 
import os
from io import BytesIO
import traceback
from lost.logic.file_access import UserFileAccess

namespace = api.namespace('pipeline', description='Pipeline API.')



@namespace.route('/template/<string:visibility>')
@api.doc(security='apikey')
class TemplateList(Resource):
    @api.marshal_with(templates)
    @jwt_required
    def get(self, visibility):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        default_group = dbm.get_group_by_name(user.user_name)
        if visibility == VisLevel().USER:
            if not user.has_role(roles.DESIGNER):
                dbm.close_session()
                return "You need to be {} in order to perform this request.".format(roles.DESIGNER), 401
            else:
                re = template_service.get_templates(dbm, group_id=default_group.idx)
                dbm.close_session()
                return re
        if visibility == VisLevel().GLOBAL:
            if not user.has_role(roles.ADMINISTRATOR):
                dbm.close_session()
                return "You need to be {} in order to perform this request.".format(roles.DESIGNER), 401
            else:
                re = template_service.get_templates(dbm)
                dbm.close_session()
                return re
        if visibility == VisLevel().ALL:
            if not user.has_role(roles.DESIGNER):
                dbm.close_session()
                return "You need to be {} in order to perform this request.".format(roles.DESIGNER), 401
            else:
                re = template_service.get_templates(dbm, group_id=default_group.idx, add_global=True)
                dbm.close_session()
                return re

@namespace.route('/template/<int:template_id>')
@namespace.param('template_id', 'The id of the template.')
@api.doc(security='apikey')
class Template(Resource):
    @api.marshal_with(template, skip_none=True)
    @jwt_required
    def get(self, template_id):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.DESIGNER):
            dbm.close_session()
            return "You need to be {} in order to perform this request.".format(roles.DESIGNER), 401

        else:
            re = template_service.get_template(dbm, template_id, user)
            dbm.close_session()
            return re


@namespace.route('')
@api.doc(security='apikey')
class PipelineList(Resource):
    # marshal caused problems json string was fine, api returned { pipelines: null }.
    # @api.marshal_with(pipelines) 
    @jwt_required
    def get(self):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.DESIGNER):
            dbm.close_session()
            return "You need to be {} in order to perform this request.".format(roles.DESIGNER), 401
        else: 
            # for group in user.groups:
            #     print("--- printing group of user.groups ---")
            #     print(group) 
            group_ids = [g.group_id for g in user.groups]
            re = pipeline_service.get_pipelines(dbm, group_ids)
            dbm.close_session()
            # print("--- PipelineList result ---")
            # print(re) 
            return re
 

@namespace.route('/<int:pipeline_id>')
@namespace.param('pipeline_id', 'The id of the pipeline.')
@api.doc(security='apikey')
class Pipeline(Resource):
    # @api.marshal_with(pipeline)
    @jwt_required
    def get(self, pipeline_id):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.DESIGNER):
            dbm.close_session()
            return "You need to be {} in order to perform this request.".format(roles.DESIGNER), 401
        else:
            re = pipeline_service.get_running_pipe(dbm, identity, pipeline_id, DATA_URL)
            dbm.close_session()
            return re
    @jwt_required
    def delete(self, pipeline_id):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.DESIGNER):
            dbm.close_session()
            return "You need to be {} in order to perform this request.".format(roles.DESIGNER), 401
        else:
            tasks.delete_pipe(pipeline_id)
            dbm.close_session()
            return 'success'



@namespace.route('/start')
@api.doc(security='apikey')
class PipelineStart(Resource):
    # @api.marshal_with(pipeline_start)
    @jwt_required
    def post(self):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.DESIGNER):
            dbm.close_session()
            return "You need to be {} in order to perform this request.".format(roles.DESIGNER), 401
        else:
            data = request.data
            # quick and dirty here, data was binary but should be dictonary without using json.loads locally.
            import json
            data = json.loads(data)
            group_id = None
            for user_group in dbm.get_user_groups_by_user_id(identity):
                if user_group.group.is_user_default:
                    group_id = user_group.group.idx
            if group_id:
                pipeline_service.start(dbm, data, identity, group_id)
                dbm.close_session()
                return "success"
            else:
                dbm.close_session()
                return "default group for user {} not found.".format(identity), 400


@namespace.route('/updateArguments')
@api.doc(security='apikey')
class PipelineUpdateArguments(Resource):
    @jwt_required
    def post(self):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.DESIGNER):
            dbm.close_session()
            return "You need to be {} in order to perform this request.".format(roles.DESIGNER), 401
        else:
            status = pipeline_service.updateArguments(dbm, request.data)
            dbm.close_session()
            return status

@namespace.route('/pause/<int:pipeline_id>')
@namespace.param('pipeline_id', 'The id of the pipeline.')
@api.doc(security='apikey')
class PipelinePause(Resource):
    @jwt_required
    def post(self, pipeline_id):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.DESIGNER):
            dbm.close_session()
            return "You need to be {} in order to perform this request.".format(roles.DESIGNER), 401
        else:
            pipeline_service.pause(dbm, pipeline_id)
            dbm.close_session()
            return "success"

@namespace.route('/play/<int:pipeline_id>')
@namespace.param('pipeline_id', 'The id of the pipeline.')
@api.doc(security='apikey')
class PipelinePlay(Resource):
    @jwt_required
    def post(self, pipeline_id):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.DESIGNER):
            dbm.close_session()
            return "You need to be {} in order to perform this request.".format(roles.DESIGNER), 401
        else:
            pipeline_service.play(dbm, pipeline_id)
            dbm.close_session()
            return "success"

@namespace.route('/project/import_zip')
@api.doc(security='apikey')
class TemplateImportZip(Resource):
    @jwt_required
    def post(self):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.ADMINISTRATOR):
            dbm.close_session()
            return "You need to be {} in order to perform this request.".format(roles.ADMINISTRATOR), 401
        else:
            try:
                fm = AppFileMan(LOST_CONFIG)
                uploaded_file = request.files['zip_file']
                upload_path = fm.get_upload_path(identity, uploaded_file.filename)
                USER_NAMESPACE = False
                if USER_NAMESPACE:
                    head, tail = os.path.split(upload_path)
                    upload_path = os.path.join(head, f'{identity}_{tail}')
                uploaded_file.save(upload_path)

                pp_path = fm.get_pipe_project_path()
                dst_dir = os.path.basename(upload_path)
                dst_dir = os.path.splitext(dst_dir)[0]
                e_path = os.path.join(os.path.split(upload_path)[0], 'extract')
                extract_path = os.path.join(e_path, dst_dir)
                dst_path = os.path.join(pp_path, dst_dir)
                if os.path.exists(dst_path):
                    shutil.rmtree(dst_path)
                try:
                    template_import.unpack_pipe_project(upload_path, extract_path)
                except:
                    dbm.close_session()
                    return 'No valid pipeline found.', 200
                shutil.copytree(extract_path, dst_path,dirs_exist_ok=True)
                dbm = access.DBMan(LOST_CONFIG)
                if not USER_NAMESPACE:
                    importer = template_import.PipeImporter(dst_path, dbm)
                else:
                    importer = template_import.PipeImporter(dst_path, dbm, user_id=identity)
                error_message = importer.start_import()
                fm.fs.rm(upload_path, recursive=True)
                fm.fs.rm(e_path, recursive=True)
                dbm.close_session()
                if error_message != '':
                    return error_message, 200
                return "success", 200
            except template_import.JSONDecodeError:
                dbm.close_session()
                shutil.rmtree(upload_path)
                return traceback.format_exc(), 500
            except:
                dbm.close_session()
                shutil.rmtree(upload_path)
                raise

@namespace.route('/project/import_git')
@api.doc(security='apikey')
class TemplateImportGit(Resource):
    @jwt_required
    def post(self):

        def git(*args):
            return subprocess.check_call(['git'] + list(args))
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.ADMINISTRATOR):
            dbm.close_session()
            return "You need to be {} in order to perform this request.".format(roles.ADMINISTRATOR), 401
        else:
            try:
                fm = AppFileMan(LOST_CONFIG)
                data = json.loads(request.data)
                git_url = data['gitUrl']
                git_branch = data['gitBranch']
                git_project = os.path.splitext(os.path.basename(git_url))[0]
                # raise Exception(git_project)

                upload_path = fm.get_upload_path(identity, git_project)
                if git_branch == 'main':
                    git('clone', git_url, upload_path)
                else:
                    git('clone', git_url, upload_path, '-b', git_branch)
                pp_path = fm.get_pipe_project_path()
                dst_dir = os.path.basename(upload_path)
                dst_path = os.path.join(pp_path, dst_dir)
                if os.path.exists(dst_path):
                    shutil.rmtree(dst_path)
                shutil.copytree(upload_path, dst_path, dirs_exist_ok=True)
                USER_NAMESPACE = False
                if not USER_NAMESPACE:
                    importer = template_import.PipeImporter(dst_path, dbm)
                else:
                    importer = template_import.PipeImporter(dst_path, dbm, user_id=identity)
                error_message = importer.start_import()
                shutil.rmtree(upload_path)
                dbm.close_session()
                if error_message != '':
                    return error_message, 200
                else: 
                    return "success", 200
            except template_import.JSONDecodeError:
                dbm.close_session()
                shutil.rmtree(upload_path)
                return traceback.format_exc(), 500
            except:
                dbm.close_session()
                shutil.rmtree(upload_path)
                raise


@namespace.route('/project/export/<string:pipe_project>')
@namespace.param('pipeline_id', 'The id of the pipeline.')
@api.doc(security='apikey')
class PipelineTemplateExport(Resource):
    # @api.marshal_with(pipeline)
    @jwt_required
    def get(self, pipe_project):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.ADMINISTRATOR):
            dbm.close_session()
            return "You need to be {} in order to perform this request.".format(roles.ADMINISTRATOR), 401
        else:
            # TODO Export here !
            # src = fm.get_pipe_project_path(content['namespace'])
            pipe_template = dbm.get_pipe_template_by_pipe_project(pipe_project)[0]


            f = BytesIO()
            # f = open('/home/lost/app/test.zip', 'wb')
            template_import.pack_pipe_project_to_stream(f, pipe_template.install_path)
            
            f.seek(0)
            resp = make_response(f.read())
            resp.headers["Content-Disposition"] = f"attachment; filename={pipe_project}.zip"
            resp.headers["Content-Type"] = "blob"
            dbm.close_session()
            return resp

@namespace.route('/project/delete')
@api.doc(security='apikey')
class TemplateDelete(Resource):
    @jwt_required
    def post(self):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.ADMINISTRATOR):
            dbm.close_session()
            return "You need to be {} in order to perform this request.".format(roles.ADMINISTRATOR), 401

        else:
            data = json.loads(request.data)
            fm = AppFileMan(LOST_CONFIG)
            pipe_project = data['pipeProject']
            pipe_template = dbm.get_pipe_template_by_pipe_project(pipe_project)[0]
            importer = template_import.PipeImporter(pipe_template.install_path, dbm)
            importer.remove_pipe_project()
            dbm.close_session()
            return "success", 200
@namespace.route('/project/<string:visibility>')
@api.doc(security='apikey')
class ProjectList(Resource):
    @api.marshal_with(templates)
    @jwt_required
    def get(self, visibility):
        def filter_by_pipe_project(re):
            pipeProjects = list()
            unique = list()
            pipeProjectCounter = dict()
            for x in re['templates']:
                if x['pipeProject'] in pipeProjectCounter:
                    pipeProjectCounter[x['pipeProject']] += x['pipelineCount']
                else:
                    pipeProjectCounter[x['pipeProject']] = x['pipelineCount']
                if x['pipeProject'] not in pipeProjects:
                    unique.append(x)
                    pipeProjects.append(x['pipeProject'])
            
            for projectName in pipeProjects:
                for un in unique:
                    if un['pipeProject'] == projectName:
                        un['pipelineCount'] = pipeProjectCounter[projectName]
            return {"templates": unique}
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        default_group = dbm.get_group_by_name(user.user_name)
        if visibility == VisLevel().USER:
            if not user.has_role(roles.DESIGNER):
                dbm.close_session()
                return "You need to be {} in order to perform this request.".format(roles.DESIGNER), 401
            else:
                re = template_service.get_templates(dbm, group_id=default_group.idx)
        if visibility == VisLevel().GLOBAL:
            if not user.has_role(roles.ADMINISTRATOR):
                dbm.close_session()
                return "You need to be {} in order to perform this request.".format(roles.DESIGNER), 401
            else:
                re = template_service.get_templates(dbm)
        if visibility == VisLevel().ALL:
            if not user.has_role(roles.DESIGNER):
                dbm.close_session()
                return "You need to be {} in order to perform this request.".format(roles.DESIGNER), 401
            else:
                re = template_service.get_templates(dbm, group_id=default_group.idx, add_global=True)
    
        re = filter_by_pipe_project(re)
        dbm.close_session()
        return re


@namespace.route('/element/<int:pipeline_element_id>/logs')
@namespace.param('pipeline_element_id', 'Pipeline Element ID to get Logs for')
@api.doc(security='apikey')
class Logs(Resource):
    @jwt_required 
    def get(self, pipeline_element_id):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.ANNOTATOR):
            dbm.close_session()
            return "You are not authorized.", 401
        else:
            user_fs = dbm.get_user_default_fs(user.idx)
            ufa = UserFileAccess(dbm, user, user_fs)           
            resp = make_response(ufa.get_pipe_log_file(pipeline_element_id))
            resp.headers["Content-Disposition"] = "attachment; filename=log.csv"
            resp.headers["Content-Type"] = "text/csv"
            return resp
        
# TODO: UNUSED ENDPOINTS CHECK IF THEY ARE NEEDED IF NOT COMPLETELY REMOVE THEM
# 
# @namespace.route('/annoexport_parquet/<peid>')
# @api.doc(security='apikey')
# class AnnoExportParquet(Resource):
#     @jwt_required 
#     def get(self, peid):
#          dbm = access.DBMan(LOST_CONFIG)
#          identity = get_jwt_identity()
#          user = dbm.get_user_by_id(identity)
#          if not user.has_role(roles.DESIGNER):
#              dbm.close_session()
#              return "You are not authorized.", 401
#          else:
#              pe_db = dbm.get_pipe_element(pipe_e_id=peid)
#              pe = pe_base.Element(pe_db, dbm)
#              df = pe.inp.to_df()
#              # raise Exception('GO ON HERE !!!')
#              f = BytesIO()
#              df.to_parquet(f)
#              f.seek(0)
#              resp = make_response(f.read())
#              resp.headers["Content-Disposition"] = "attachment; filename=annos.parquet"
#              resp.headers["Content-Type"] = "blob"
#              return resp

# @namespace.route('/annoexport_csv/<peid>')
# @api.doc(security='apikey')
# class AnnoExportCSV(Resource):
#     @jwt_required 
#     def get(self, peid):
#          dbm = access.DBMan(LOST_CONFIG)
#          identity = get_jwt_identity()
#          user = dbm.get_user_by_id(identity)
#          if not user.has_role(roles.DESIGNER):
#              dbm.close_session()
#              return "You are not authorized.", 401
#          else:
#              pe_db = dbm.get_pipe_element(pipe_e_id=peid)
#              pe = pe_base.Element(pe_db, dbm)
#              df = pe.inp.to_df()
#              # raise Exception('GO ON HERE !!!')
#              f = BytesIO()
#              df.to_csv(f)
#              f.seek(0)
#              resp = make_response(f.read())
#              resp.headers["Content-Disposition"] = "attachment; filename=annos.csv"
#              resp.headers["Content-Type"] = "blob"
#              return resp


# @namespace.route('/report')
# @api.doc(security='apikey',description='STILL NEEDS TO BE REFACTORED WILL BE MOVED TO PIPELINE')
# class ReportService(Resource):
#     @jwt_required 
#     def post(self):
#         dbm = access.DBMan(LOST_CONFIG)
#         identity = get_jwt_identity()
#         user = dbm.get_user_by_id(identity)
#         if not user.has_role(roles.DESIGNER):
#             dbm.close_session()
#             return "You are not authorized.", 401
#         else:
#             data = json.loads(request.data)
#             report = Report(dbm, data)
#             report_data = report.get_report()
#             dbm.close_session()
#             return report_data
