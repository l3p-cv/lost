import json
from flask import request
from flask_restx import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from lost.api.api import api
from lost.db import access, roles
from lost.settings import LOST_CONFIG
from lost.logic.project_config import ProjectConfigMan
from lost.api.config.api_definition import config

namespace = api.namespace("config", description="Config Interface")

dbm = access.DBMan(LOST_CONFIG)
project_config = ProjectConfigMan(dbm)


@namespace.route("")
class ConfigList(Resource):
    @api.doc(security="apikey", description="Get all config entries ")
    @api.marshal_with(config)
    @jwt_required()
    def get(self):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.ADMINISTRATOR):
            dbm.close_session()
            return api.abort(403, "You are not authorized.")
        else:
            project_config = ProjectConfigMan(dbm)
            return project_config.get_all()

    @api.doc(security="apikey", description="Update all passed config entries ")
    @jwt_required()
    def patch(self):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.ADMINISTRATOR):
            dbm.close_session()
            return api.abort(403, "You are not authorized.")
        else:
            data = json.loads(request.data)
            project_config = ProjectConfigMan(dbm)
            for element in data:
                project_config.update_entry(element["key"], value=element["value"])
            return "success"
