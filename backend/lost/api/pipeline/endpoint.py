import subprocess
import shutil
from flask import request, make_response
from flask_restx import Resource, Mask
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from lost.api.api import api
from lost.logic.file_man import AppFileMan
from lost.api.pipeline.api_definition import templates, template, pipelines, pipeline
from lost.api.pipeline import tasks
from lost.api.label.api_definition import label_trees
from lost.db import roles, access
from lost.settings import LOST_CONFIG, DATA_URL
from lost.logic.pipeline import service as pipeline_service
from lost.logic.pipeline import template_import
from lost.logic import template as template_service
from lost.db.vis_level import VisLevel
from lost.utils.dump import dump
import json 
import os
from io import BytesIO
import traceback

namespace = api.namespace('pipeline', description='Pipeline API.')
import flask


@namespace.route('/template/<string:visibility>')
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