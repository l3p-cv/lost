import json
from flask import request, make_response
from flask_restx import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from lost.api.api import api
from lost.db import access, roles
from lost.settings import LOST_CONFIG
from lost.logic.project_config import ProjectConfigMan
from lost.api.config.api_definition import config

namespace = api.namespace('config', description='Config Interface')

dbm = access.DBMan(LOST_CONFIG)
project_config = ProjectConfigMan(dbm)
configs = project_config.get_all()
db_key_list = [el['key'] for el in configs]
key = "integer_test"
if not key in db_key_list:
    project_config.create_entry(
        key, None, 1, default=60, description="integer_test description", config=json.dumps({
            'type': 'number',
            'min': 50,
            'max': 100
        }))
key = "float_test"
if not key in db_key_list:
    project_config.create_entry(
        key, None, 1, default=0.3, description="float_test description", config=json.dumps({
            'type': 'number',
            'min': 0,
            'max': 1,
            'step': 0.1
        })
    )
key = "string_test"
if not key in db_key_list:
    project_config.create_entry(
        key, None, 1, default="my text", description="string_test description")

key = "integer_list_test"
if not key in db_key_list:
    project_config.create_entry(
        key, None, 1, default=[60, 70, 80], description="integer_list_test description", config=json.dumps({
            'type': 'number',
            'min': 50,
            'max': 100
        }))

key = "float_list_test"
if not key in db_key_list:
    project_config.create_entry(
        key, None, 1, default=[0.2, 0.3, 0.6, 0.3], description="float_list_test description", config=json.dumps({
            'type': 'number',
            'min': 0,
            'max': 1,
            'step': 0.1
        })
    )
key = "string_list_test"
if not key in db_key_list:
    project_config.create_entry(
        key, None, 1, default=["text1", "text2", "text3"], description="string_list_test description")


@namespace.route('')
@api.doc(description='Get all config entrys ')
class ConfigList(Resource):
    @api.marshal_with(config)
    @jwt_required
    def get(self):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.ADMINISTRATOR):
            dbm.close_session()
            return "You are not authorized.", 401
        else:
            project_config = ProjectConfigMan(dbm)
            return project_config.get_all()

    @jwt_required
    def post(self):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.ADMINISTRATOR):
            dbm.close_session()
            return "You are not authorized.", 401
        else:
            data = json.loads(request.data)
            project_config = ProjectConfigMan(dbm)
            for element in data:
                project_config.update_entry(
                    element['key'], value=element['value'])
            return "success"
