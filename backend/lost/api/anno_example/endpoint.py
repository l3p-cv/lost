from datetime import time, datetime
import json
from flask import request
from flask_restx import Resource
from lost.api.api import api
from lost.settings import LOST_CONFIG, DATA_URL
from lost.db.vis_level import VisLevel
from lost.logic import dask_session
from lost.pyapi.utils import anno_helper
from lost.logic.file_man import FileMan
from flask_jwt_extended import jwt_required, get_jwt_identity
from lost.db import model, roles, access
import lost_ds as lds
import numpy as np
import cv2
import base64
import random

namespace = api.namespace('annoExample', description='API to get annotation examples')


def load_img(db_img, fm, user):
    if LOST_CONFIG.worker_management != 'dynamic':
        img = fm.load_img(db_img.img_path)
    else:
        img = dask_session.ds_man.read_fs_img(user, db_img.fs, db_img.img_path)
    return img

@namespace.route('/getImage')
class GetImage(Resource):
    # @jwt_required 
    # def post(self):
    #     dbm = access.DBMan(LOST_CONFIG)
    #     identity = get_jwt_identity()
    #     user = dbm.get_user_by_id(identity)
    #     if not user.has_role(roles.ANNOTATOR):
    #         dbm.close_session()
    #         return "You need to be {} in order to perform this request.".format(roles.ANNOTATOR), 401
    #     else:
    #         data = json.loads(request.data)
    #         raise NotImplementedError()
    #         return 'success', 200 

    @jwt_required 
    def post(self):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.ANNOTATOR):
            dbm.close_session()
            return "You need to be {} in order to perform this request.".format(roles.ANNOTATOR), 401

        else:
            #TODO: Check if user is permitted to load this image
            data = json.loads(request.data)
            #flask.current_app.logger.info('mia -> getimage. Received data: {}'.format(data))
            if data['type'] == 'imageBased':
                db_img = dbm.get_image_anno(data['id'])
                fm = FileMan(fs_db=db_img.fs)
                img = load_img(db_img, fm, user)
            elif data['type'] == 'annoBased':
                # db_anno = dbm.get_two_d_anno(two_d_anno_id=data['id'])
                try:
                    db_anno = random.sample(dbm.get_example_annotation_by_ll_id(data['llId']), 1)[0]
                except:
                    return None
                db_img = dbm.get_image_anno(db_anno.img_anno_id)
                fm = FileMan(fs_db=db_img.fs)
                # image = fm.load_img(db_img.img_path)
                image = load_img(db_img, fm, user)
                
                # get annotation_task config
                draw_anno = False
                context = 0.0
                try:
                    draw_anno = data['drawAnno']
                except:
                    pass
                try:
                    context = float(data['addContext'])
                except:
                    pass
                
                # df = db_img.to_df()
                # df = df[df['anno_uid'] == db_anno.idx]
                # df.loc[:,'anno_data'] = df['anno_data'].apply(lambda x: np.asarray(x))
                

                # raise Exception(df.anno_data)
                    
                
                # df = lds.crop_anno(db_img.img_path, crop_pos, df)
                # crops = lds.vis_sample(image, df)
                crops, _ = anno_helper.crop_boxes(
                    [db_anno.to_vec('anno_data')],
                # anno_helper.calc_box_for_anno(
                #     [db_anno.to_vec('anno_data')],
                #     [db_anno.to_vec('anno_dtype')])
                    [db_anno.to_vec('anno_dtype')], 
                    image, context=context, 
                    draw_annotations=draw_anno
                )
                img = crops[0]
            else:
                raise Exception('Unknown mia image type')
            _, data = cv2.imencode('.jpg', img)
            data64 = base64.b64encode(data.tobytes())
            dbm.close_session()
            return u'data:img/jpg;base64,'+data64.decode('utf-8')