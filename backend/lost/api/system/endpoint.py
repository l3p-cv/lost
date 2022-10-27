from flask import request
from posix import POSIX_FADV_NOREUSE
from flask_restx import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from lost.api.api import api

from lost.settings import LOST_CONFIG
from lost.db import access, roles

import lost
import logging
from pygelf import GelfUdpHandler
import json
import flask

namespace = api.namespace('system', description='System information and control.')

@namespace.route('/version')
class Version(Resource):
    def get(self):
        try:
            return lost.__version__
        except:
            return 'development'

@namespace.route('/settings')
class Version(Resource):
    def get(self):
        return {
            'autoLogoutTime': LOST_CONFIG.session_timeout*60,
            'autoLogoutWarnTime': 1*60,
            'isDevMode': LOST_CONFIG.debug
        }
@namespace.route('/jupyter')
class JupyterLabUrl(Resource):
    @jwt_required 
    def get(self):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.ADMINISTRATOR):
            dbm.close_session()
            return "You need to be {} in order to perform this request.".format(roles.ADMINISTRATOR), 401

        else:
            if LOST_CONFIG.jupyter_lab_active:
                return f'{LOST_CONFIG.jupyter_lab_port}/lab?token={LOST_CONFIG.jupyter_lab_token}' 
            return ''

if LOST_CONFIG.use_graylog:
    logger = logging.getLogger('frontend')
    handler = GelfUdpHandler(host='graylog', port=12201, include_extra_fields=True)
    logger.addHandler(handler)
@namespace.route('/logs/frontend')
class FrontendLogs(Resource):
    def post(self):
        data = json.loads(request.data)
        if LOST_CONFIG.use_graylog:
            logger.error(data['error'], extra={'type': 'daisy-frontend', 
                                            'used_browser': data['usedBrowser'], 
                                            'user_id': data['userId'], 
                                            'location': data['location']})
        else:
            flask.current_app.logger.error(data['error'])
