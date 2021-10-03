import flask
from flask import request
from flask_restx import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from lost.api.api import api
from lost.api.mia.api_definition import mia_anno
from lost.api.label.api_definition import label_trees
from lost.db import roles, access
from lost.settings import LOST_CONFIG
from lost.logic import mia
import json
import cv2
import base64
from lost.logic.file_man import FileMan
from lost.pyapi.utils import anno_helper
from lost.logic import mia
from lost.logic import dask_session

namespace = api.namespace('mia', description='MIA Annotation API.')

@namespace.route('/next/<int:max_amount>')
class Next(Resource):
    #@api.marshal_with(mia_anno)
    @jwt_required 
    def get(self, max_amount):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)     
        if not user.has_role(roles.ANNOTATOR):
            dbm.close_session()
            return "You need to be {} in order to perform this request.".format(roles.ANNOTATOR), 401
        else:
            re = mia.get_next(dbm, identity, max_amount)
            dbm.close_session()
            return re

@namespace.route('/label')
class Label(Resource):
    #@api.marshal_with(label_trees)
    @jwt_required 
    def get(self):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.ANNOTATOR):
            dbm.close_session()
            return "You need to be {} in order to perform this request.".format(roles.ANNOTATOR), 401
        else:
            re = mia.get_label_trees(dbm, identity)
            dbm.close_session()
            return re

@namespace.route('/update')
class Update(Resource):
    @jwt_required 
    def post(self):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.ANNOTATOR):
            dbm.close_session()
            return "You need to be {} in order to perform this request.".format(roles.ANNOTATOR), 401

        else:
            data = json.loads(request.data)
            re = mia.update(dbm, identity, data)
            dbm.close_session()
            return re

@namespace.route('/finish')
class Finish(Resource):
    @jwt_required 
    def get(self):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.ANNOTATOR):
            dbm.close_session()
            return "You need to be {} in order to perform this request.".format(roles.ANNOTATOR), 401

        else:
            re = mia.finish(dbm, identity)
            dbm.close_session()
            return re


@namespace.route('/special')
class Special(Resource):
    @jwt_required 
    def post(self):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)     
        if not user.has_role(roles.ANNOTATOR):
            dbm.close_session()
            return "You need to be {} in order to perform this request.".format(roles.ANNOTATOR), 401
        else:
            data = json.loads(request.data)
            re = mia.get_special(dbm, identity, data['miaIds'])
            dbm.close_session()
            return re

def load_img(db_img, fm, user):
    if LOST_CONFIG.worker_management != 'dynamic':
        img = fm.load_img(db_img.img_path)
    else:
        img = dask_session.ds_man.read_fs_img(user, db_img.fs, db_img.img_path)
    return img
@namespace.route('/getimage')
class GetImage(Resource):

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
                db_anno = dbm.get_two_d_anno(two_d_anno_id=data['id'])
                db_img = dbm.get_image_anno(db_anno.img_anno_id)
                fm = FileMan(fs_db=db_img.fs)
                # image = fm.load_img(db_img.img_path)
                image = load_img(db_img, fm, user)
                
                # get annotation_task config
                config = mia.get_config(dbm, user.idx)
                draw_anno = False
                context = None
                try:
                    draw_anno = config['drawAnno']
                except:
                    pass
                try:
                    context = float(config['addContext'])
                except:
                    pass
                crops, _ = anno_helper.crop_boxes(
                    [db_anno.to_vec('anno.data')],
                    [db_anno.to_vec('anno.dtype')], 
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