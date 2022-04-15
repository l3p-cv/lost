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
            personal_stats = personal.PersonalStats(dbm, user.idx)
            example_stats['annos'] = personal_stats.get_annotation_stats()
            example_stats['labels'] = personal_stats.get_annos_per_label()
            example_stats['types'] = personal_stats.get_annos_per_type()
            example_stats['annotime'] = personal_stats.get_anno_times()
            example_stats['annotasks'] = personal_stats.get_annotasks()
            example_stats['processedImages'] = personal_stats.get_processed_images()


            dbm.close_session()
            return example_stats
         