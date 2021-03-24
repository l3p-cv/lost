import flask
from flask import request
from flask_restplus import Resource
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

@namespace.route('/getimage')
class GetImage(Resource):
    # @api.expect(sia_update)
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
            fm = FileMan(LOST_CONFIG)
            data = json.loads(request.data)
            flask.current_app.logger.info('mia -> getimage. Received data: {}'.format(data))
            db_img = dbm.get_image_anno(data['imgId'])
            img = fm.load_img(db_img.img_path)
            # img_path = fm.get_abs_path(db_img.img_path)
            # #raise Exception('sia -> getimage: {}'.format(img_path))
            # img = cv2.imread(img_path)
            _, data = cv2.imencode('.jpg', img)
            data64 = base64.b64encode(data.tobytes())
            dbm.close_session()
            return u'data:img/jpg;base64,'+data64.decode('utf-8')