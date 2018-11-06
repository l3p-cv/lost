from flask import request
from flask_restplus import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from lost.api.api import api
#from lost.api.pipeline.api_definition import
from lost.api.label.api_definition import label_trees
from lost.db import roles, access
from lost.settings import LOST_CONFIG, DATA_URL
from lost.logic.pipeline import service as pipeline
from lost.logic import template

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
            re = template.get_templates(dbm, group_ids)
            dbm.close_session()
            return re

@namespace.route('/template/<int:template_id>')
@namespace.param('template_id', 'The id of the template.')
class Template(Resource):
    @api.marshal_with(template)
    @jwt_required 
    def get(self, template_id):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.DESIGNER):
            dbm.close_session()
            return "You need to be {} in order to perform this request.".format(roles.DESIGNER), 401

        else:
            re = template.get_template(dbm, template_id)
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
            re = pipeline.get_pipelines(dbm, group_ids)
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
            re = pipeline.get_pipeline(dbm, identity)
            dbm.close_session()
            return re