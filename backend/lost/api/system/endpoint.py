import json
import logging

import flask
from flask import request
from flask_jwt_extended import get_jwt_identity, jwt_required
from flask_restx import Resource
from pygelf import GelfUdpHandler

import lost
from lost.api.api import api
from lost.api.system.api_definiton import config
from lost.db import access, roles
from lost.settings import LOST_CONFIG

namespace = api.namespace("system", description="System information and control.")


@namespace.route("/version")
@api.doc(security="apikey")
class Version(Resource):
    @api.doc(description="Version of LOST")
    def get(self):
        try:
            return lost.__version__
        except:
            return "development"


@namespace.route("/settings")
@api.doc(security="apikey")
class Version(Resource):
    @api.doc(description="LOST settings")
    @api.marshal_with(config)
    def get(self):
        return {
            "autoLogoutTime": LOST_CONFIG.session_timeout * 60,
            "autoLogoutWarnTime": 1 * 60,
            "isDevMode": LOST_CONFIG.debug,
        }


@namespace.route("/jupyter")
@api.doc(security="apikey")
class JupyterLabUrl(Resource):
    @api.doc(security="apikey", description="Get jupyter lab url if jupyter lab is activated")
    @jwt_required()
    def get(self):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.ADMINISTRATOR):
            dbm.close_session()
            return api.abort(403, f"You need to be {roles.ADMINISTRATOR} in order to perform this request.")

        else:
            if LOST_CONFIG.jupyter_lab_active:
                return f"{LOST_CONFIG.jupyter_lab_port}/lab?token={LOST_CONFIG.jupyter_lab_token}"
            return ""


if LOST_CONFIG.use_graylog:
    logger = logging.getLogger("frontend")
    handler = GelfUdpHandler(host="graylog", port=12201, include_extra_fields=True)
    logger.addHandler(handler)


@namespace.route("/logs/frontend")
@api.doc(security="apikey", description="Get add frontend errors to logging")
class FrontendLogs(Resource):
    def post(self):
        data = json.loads(request.data)
        if LOST_CONFIG.use_graylog:
            logger.error(
                data["error"],
                extra={
                    "type": "daisy-frontend",
                    "used_browser": data["usedBrowser"],
                    "user_id": data["userId"],
                    "location": data["location"],
                },
            )
        else:
            flask.current_app.logger.error(data["error"])
