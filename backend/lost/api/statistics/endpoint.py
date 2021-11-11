from datetime import time, datetime
import json
from flask import request
from flask_restx import Resource
from lost.api.api import api
from lost.settings import LOST_CONFIG, DATA_URL
from flask_jwt_extended import jwt_required, get_jwt_identity
from lost.db import model, roles, access
from lost.logic.statistics import personal

namespace = api.namespace('statistics', description='LOST Statistics API')

@namespace.route('/personal')
class Personal(Resource):
    @jwt_required 
    def get(self):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.ANNOTATOR):
            dbm.close_session()
            return "You need to be {} in order to perform this request.".format(roles.DESIGNER), 401
        else:
            from lost.api.statistics.example_data import example_stats
            example_stats['annos'] = personal.get_annotation_stats(dbm, user.idx)
            example_stats['labels'] = personal.get_annos_per_label(dbm, user.idx)
            
            dbm.close_session()
            return example_stats
         