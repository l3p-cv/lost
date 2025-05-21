import json
from flask import request
from flask_restx import Resource
from lost.api.api import api
from lost.settings import LOST_CONFIG
from flask_jwt_extended import jwt_required, get_jwt_identity
from lost.db import roles, access
import random

namespace = api.namespace('annoExample', description='API to get annotation examples')


@namespace.route('/getAnnoExample')
@api.doc(security='apikey')
class GetAnnoExample(Resource):

    @jwt_required()
    def post(self):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.ANNOTATOR):
            dbm.close_session()
            return api.abort(403, "You need to be {} in order to perform this request.".format(roles.ANNOTATOR))

        else:
            #TODO: Check if user is permitted to load this image
            data = json.loads(request.data)
            
            # raise Exception(f'{data["prevExamples"]}')
            try:
                db_annos = dbm.get_example_annotation_by_ll_id(data['llId'])
                anno_ids = {a.idx: a for a in db_annos}
                prev_ids = data['prevExamples']
                res = set(anno_ids.keys()) - set(prev_ids)
                if len(res) > 0:
                    db_anno = anno_ids[res.pop()]
                else:
                    db_anno = random.sample(db_annos, 1)[0]

                # db_anno = random.sample(dbm.get_example_annotation_by_ll_id(data['llId']), 1)[0]
            except:
                return None
            return {'id': db_anno.idx, 'comment': db_anno.description}
