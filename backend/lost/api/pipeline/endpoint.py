from flask import request
from flask_restplus import Resource, Mask
from flask_jwt_extended import jwt_required, get_jwt_identity
from lost.api.api import api
from lost.api.pipeline.api_definition import templates, template, pipelines, pipeline
from lost.api.label.api_definition import label_trees
from lost.db import roles, access
from lost.settings import LOST_CONFIG, DATA_URL
from lost.logic.pipeline import service as pipeline_service
from lost.logic import template as template_service

namespace = api.namespace('pipeline', description='Pipeline API.')
@namespace.route('/template/')
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
            group_ids = [g.idx for g in user.groups]
            re = template_service.get_templates(dbm, group_ids)
            dbm.close_session()
            return re

@namespace.route('/template/<int:template_id>')
@namespace.param('template_id', 'The id of the template.')
class Template(Resource):
    @api.marshal_with(template,skip_none=True)
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

@namespace.route('/')
class PipelineList(Resource):
    @api.marshal_with(pipelines)
    @jwt_required 
    def get(self):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.DESIGNER):
            dbm.close_session()
            return "You need to be {} in order to perform this request.".format(roles.DESIGNER), 401
        else:
            group_ids = [g.idx for g in user.groups]
            re = pipeline_service.get_pipelines(dbm, group_ids)
            dbm.close_session()
            return re

@namespace.route('/<int:pipeline_id>')
@namespace.param('pipeline_id', 'The id of the pipeline.')
class Pipeline(Resource):
    @api.marshal_with(pipeline)
    @jwt_required 
    def get(self, pipeline_id):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.DESIGNER):
            dbm.close_session()
            return "You need to be {} in order to perform this request.".format(roles.DESIGNER), 401

        else:
            re = pipeline_service.get_pipeline(dbm, identity)
            dbm.close_session()
            return re

@namespace.route('/start')
class PipelineStart(Resource):
    #@api.marshal_with(pipeline_start)
    @jwt_required 
    def get(self, pipeline_id):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.DESIGNER):
            dbm.close_session()
            return "You need to be {} in order to perform this request.".format(roles.DESIGNER), 401

        else:
            data = request.data
            pipeline_service.start(dbm, data ,identity)
            dbm.close_session()
            return "success"

