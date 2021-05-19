from flask import request
from flask_restx import Resource, Mask
from flask_jwt_extended import jwt_required, get_jwt_identity
from lost.api.api import api
from lost.api.pipeline.api_definition import templates, template, pipelines, pipeline
from lost.api.pipeline import tasks
from lost.api.label.api_definition import label_trees
from lost.db import roles, access
from lost.settings import LOST_CONFIG, DATA_URL
from lost.logic.pipeline import service as pipeline_service
from lost.logic import template as template_service
from lost.utils.dump import dump
namespace = api.namespace('pipeline', description='Pipeline API.')
import flask


@namespace.route('/template')
class TemplateList(Resource):
    @api.marshal_with(templates)
    @jwt_required
    def get(self):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.DESIGNER):
            dbm.close_session()
            return "You need to be {} in order to perform this request.".format(roles.DESIGNER), 401
        else:
            re = template_service.get_templates(dbm)
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
            group_ids = [g.idx for g in user.groups]
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
            tasks.delete_pipe.delay(pipeline_id)
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
