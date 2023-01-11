import traceback
import flask
from flask import request, send_file
from flask_restx import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from lost import db
from lost.api.api import api
from lost.api.sia.api_definition import sia_anno, sia_config, sia_update
from lost.api.label.api_definition import label_trees
from lost.db import roles, access
from lost.settings import LOST_CONFIG, DATA_URL
from lost.logic import sia
from lost.logic.permissions import UserPermissions
import json
import PIL
import base64
import cv2
from io import BytesIO
from lost.logic.file_man import FileMan
# from lost.lost_session import lost_session
from lost.logic import dask_session

namespace = api.namespace('sia', description='SIA Annotation API.')

@namespace.route('/first')
class First(Resource):
    @api.marshal_with(sia_anno)
    @jwt_required 
    def get(self):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.ANNOTATOR):
            dbm.close_session()
            return "You need to be {} in order to perform this request.".format(roles.ANNOTATOR), 401
        else:
            re = sia.get_first(dbm, identity, DATA_URL)
            dbm.close_session()
            return re

@namespace.route('/next/<string:last_img_id>')
@namespace.param('last_img_id', 'The id of the last annotated image.')
class Next(Resource):
    # @api.marshal_with(sia_anno)
    @jwt_required 
    def get(self, last_img_id):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.ANNOTATOR):
            dbm.close_session()
            return "You need to be {} in order to perform this request.".format(roles.ANNOTATOR), 401

        else:
            last_img_id = int(last_img_id)
            re = sia.get_next(dbm, identity,last_img_id, DATA_URL)
            dbm.close_session()
            return re

@namespace.route('/prev/<int:last_img_id>')
@namespace.param('last_img_id', 'The id of the last annotated image.')
class Prev(Resource):
    # @api.marshal_with(sia_anno)
    @jwt_required 
    def get(self,last_img_id):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.ANNOTATOR):
            dbm.close_session()
            return "You need to be {} in order to perform this request.".format(roles.ANNOTATOR), 401

        else:
            re = sia.get_previous(dbm, identity,last_img_id, DATA_URL)
            dbm.close_session()
            return re

@namespace.route('/lastedited')
class Last(Resource):
    @api.marshal_with(sia_anno)
    @jwt_required 
    def get(self):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.ANNOTATOR):
            dbm.close_session()
            return "You need to be {} in order to perform this request.".format(roles.ANNOTATOR), 401

        else:
            last_sia_image_id = sia.get_last_image_id(dbm, identity)
            if last_sia_image_id:
                re = sia.get_next(dbm, identity, last_sia_image_id, DATA_URL)
            else:
                re = sia.get_next(dbm, identity, -1, DATA_URL)
            dbm.close_session()
            return re

@namespace.route('/filter')
class Filter(Resource):
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
            data = json.loads(request.data)
            img = dbm.get_image_anno(data['imageId'])
            flask.current_app.logger.info('img.img_path: {}'.format(img.img_path))
            flask.current_app.logger.info('img.fs.name: {}'.format(img.fs.name))
            # fs_db = dbm.get_fs(img.fs_id)
            fs = FileMan(fs_db=img.fs)
            #img = PIL.Image.open('/home/lost/data/media/10_voc2012/2007_008547.jpg')
            # img = PIL.Image.open(img_path)
            if data['clahe']['active'] :
                img = fs.load_img(img.img_path, color_type='gray')
            else:
                img = fs.load_img(img.img_path, color_type='color')
                
            flask.current_app.logger.info('Triggered filter. Received data: {}'.format(data))

            # img_io = BytesIO()
            # img.save(img_io, 'PNG')
            # img_io.seek(0)
            # return send_file(img_io, mimetype='image/png')
            if data['rotate']['active']:
                if data['rotate']['angle'] == 90:
                    img = cv2.rotate(img, cv2.ROTATE_90_CLOCKWISE)
                elif data['rotate']['angle'] == -90:
                    img = cv2.rotate(img, cv2.ROTATE_90_COUNTERCLOCKWISE)
                elif data['rotate']['angle'] == 180:
                    img = cv2.rotate(img, cv2.ROTATE_180)
            if data['clahe']['active']:
                clahe = cv2.createCLAHE(data['clahe']['clipLimit'])
                img = clahe.apply(img)
                # img = img.rotate(data['rotate']['angle'], expand=True)
            # img = ImageOps.autocontrast(img)

            # data = BytesIO()
            # img.save(data, "PNG")
            _, data = cv2.imencode('.jpg', img)
            data64 = base64.b64encode(data.tobytes())
            dbm.close_session()
            return u'data:img/jpg;base64,'+data64.decode('utf-8')
            # re = sia.update(dbm, data, user.idx)
            # dbm.close_session()
            # return 'success'

@namespace.route('/update')
class Update(Resource):
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
            try:
                data = json.loads(request.data)
                # raise Exception('jj')
                re = sia.update(dbm, data, user.idx)
                dbm.close_session()
                return re
            except:
                msg = traceback.format_exc()
                msg += f'\nuser.idx: {user.idx}, user.name: {user.user_name}\n'
                msg += f'Received data:\n{json.dumps(data, indent=4)}\n'
                flask.current_app.logger.error('{}'.format(msg))
                dbm.close_session()
                return 'error updating sia anno', 500

@namespace.route('/updateOneThing')
class UpdateOneThing(Resource):
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
            data = json.loads(request.data)
            try:
                if not 'anno' in data:
                    # if not 'imgLabelIds' in data['img']:
                    #     if not 'isJunk' in data['img']:
                    if data['action'] not in ['imgAnnoTimeUpdate', 'imgJunkUpdate', 'imgLabelUpdate']:
                        raise Exception('Expect either anno or img information!')
                re = sia.update_one_thing(dbm, data, user.idx)
                dbm.close_session()
            except:
                dbm.close_session()
                raise
            return re

@namespace.route('/allowedExampler')
class AllowedExampler(Resource):
    @jwt_required 
    def get(self):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.ANNOTATOR):
            dbm.close_session()
            return "You need to be {} in order to perform this request.".format(roles.ANNOTATOR), 401

        else:
            up = UserPermissions(dbm, user)
            return up.allowed_to_mark_example()

@namespace.route('/nextAnnoId')
class NextAnnoId(Resource):
    # @api.expect(sia_update)
    @jwt_required 
    def get(self):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.ANNOTATOR):
            dbm.close_session()
            return "You need to be {} in order to perform this request.".format(roles.ANNOTATOR), 401

        else:
            # raise Exception('JJ')
            re = sia.get_next_anno_id(dbm)
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
            re = sia.finish(dbm, identity)
            dbm.close_session()
            return re

# @namespace.route('/junk/<int:img_id>')
# @namespace.param('img_id', 'The id of the image which should be junked.')
# class Junk(Resource):
#     @jwt_required 
#     def post(self,img_id):
#         dbm = access.DBMan(LOST_CONFIG)
#         identity = get_jwt_identity()
#         user = dbm.get_user_by_id(identity)
#         if not user.has_role(roles.ANNOTATOR):
#             dbm.close_session()
#             return "You need to be {} in order to perform this request.".format(roles.ANNOTATOR), 401

#         else:
#             re = sia.get_prev(dbm, identity,img_id)
#             dbm.close_session()
#             return re

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
            re = sia.get_label_trees(dbm, identity)
            dbm.close_session()
            return re

@namespace.route('/configuration')
class Configuration(Resource):
    @api.marshal_with(sia_config)
    @jwt_required 
    def get(self):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.ANNOTATOR):
            dbm.close_session()
            return "You need to be {} in order to perform this request.".format(roles.ANNOTATOR), 401
        else:
            re = sia.get_configuration(dbm, identity)
            dbm.close_session()
            return re

@namespace.route('/review')
class Review(Resource):
    @jwt_required 
    def post(self):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.DESIGNER):
            dbm.close_session()
            return "You need to be {} in order to perform this request.".format(roles.DESIGNER), 401

        else:
            data = json.loads(request.data)
            re = sia.review(dbm, data, user.idx, DATA_URL)
            dbm.close_session()
            return re


@namespace.route('/reviewoptions/<int:pe_id>')
@namespace.param('pe_id', 'The id of reviewed pipe element.')
class ReviewOptions(Resource):
    @jwt_required 
    def get(self, pe_id):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.DESIGNER):
            dbm.close_session()
            return "You need to be {} in order to perform this request.".format(roles.DESIGNER), 401

        else:
            re = sia.reviewoptions(dbm, pe_id, user.idx)
            dbm.close_session()
            return re

@namespace.route('/reviewupdate/<int:pe_id>')
@namespace.param('pe_id', 'The id of reviewed pipe element.')
class ReviewUpdate(Resource):
    @jwt_required 
    def post(self, pe_id):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.DESIGNER):
            dbm.close_session()
            return "You need to be {} in order to perform this request.".format(roles.DESIGNER), 401

        else:
            data = json.loads(request.data)
            re = sia.review_update(dbm, data, user.idx, pe_id)
            dbm.close_session()
            return re