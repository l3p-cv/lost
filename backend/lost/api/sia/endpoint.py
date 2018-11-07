from flask import request
from flask_restplus import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from lost.api.api import api
from lost.api.sia.api_definition import sia_anno, sia_config, sia_update
from lost.api.label.api_definition import label_trees
from lost.db import roles, access
from lost.settings import LOST_CONFIG, DATA_URL
from lost.logic import sia

namespace = api.namespace('sia', description='SIA Annotation API.')

@namespace.route('/first')
class First(Resource):
    @api.marshal_with(sia_anno)
    @jwt_required 
    def get(self):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.ANNOTATER):
            dbm.close_session()
            return "You need to be {} in order to perform this request.".format(roles.ANNOTATER), 401
        else:
            re = sia.get_first(dbm, identity, DATA_URL)
            dbm.close_session()
            return re

@namespace.route('/next/<int:last_img_id>')
@namespace.param('last_img_id', 'The id of the last annotated image.')
class Next(Resource):
    @api.marshal_with(sia_anno)
    @jwt_required 
    def get(self, last_img_id):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.ANNOTATER):
            dbm.close_session()
            return "You need to be {} in order to perform this request.".format(roles.ANNOTATER), 401

        else:
            re = sia.get_next(dbm, identity,last_img_id, DATA_URL)
            dbm.close_session()
            return re

@namespace.route('/prev/<int:last_img_id>')
@namespace.param('last_img_id', 'The id of the last annotated image.')
class Prev(Resource):
    @api.marshal_with(sia_anno)
    @jwt_required 
    def get(self,last_img_id):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.ANNOTATER):
            dbm.close_session()
            return "You need to be {} in order to perform this request.".format(roles.ANNOTATER), 401

        else:
            re = sia.get_prev(dbm, identity,last_img_id, DATA_URL)
            dbm.close_session()
            return re

@namespace.route('/update')
class Update(Resource):
    @api.expect(sia_update)
    @jwt_required 
    def post(self):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.ANNOTATER):
            dbm.close_session()
            return "You need to be {} in order to perform this request.".format(roles.ANNOTATER), 401

        else:
            data = request.data
            re = sia.update(dbm, data, identity)
            dbm.close_session()
            return re

@namespace.route('/finish')
class Finish(Resource):
    @jwt_required 
    def get(self):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.ANNOTATER):
            dbm.close_session()
            return "You need to be {} in order to perform this request.".format(roles.ANNOTATER), 401

        else:
            re = sia.finish(dbm, identity)
            dbm.close_session()
            return re

@namespace.route('/junk/<int:img_id>')
@namespace.param('img_id', 'The id of the image which should be junked.')
class Junk(Resource):
    @jwt_required 
    def post(self,img_id):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.ANNOTATER):
            dbm.close_session()
            return "You need to be {} in order to perform this request.".format(roles.ANNOTATER), 401

        else:
            re = sia.get_prev(dbm, identity,img_id)
            dbm.close_session()
            return re

@namespace.route('/label')
class Label(Resource):
    @api.marshal_with(label_trees)
    @jwt_required 
    def get(self):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.ANNOTATER):
            dbm.close_session()
            return "You need to be {} in order to perform this request.".format(roles.ANNOTATER), 401
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
        if not user.has_role(roles.ANNOTATER):
            dbm.close_session()
            return "You need to be {} in order to perform this request.".format(roles.ANNOTATER), 401
        else:
            re = sia.get_configuration(dbm, identity)
            dbm.close_session()
            return re