import json

from flask import request
from flask_jwt_extended import get_jwt_identity, jwt_required
from flask_restx import Resource

from lost.api.api import api
from lost.api.mia.api_definition import prev_model
from lost.db import access, roles
from lost.logic import mia
from lost.settings import LOST_CONFIG

namespace = api.namespace("mia", description="MIA Annotation API.")


@namespace.route("")
@api.doc(security="apikey")
class Update(Resource):
    @api.doc(security="apikey", description="Update MIA Task")
    @jwt_required()
    def patch(self):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.ANNOTATOR):
            dbm.close_session()
            return api.abort(403, f"You need to be {roles.ANNOTATOR} in order to perform this request.")

        else:
            data = json.loads(request.data)
            re = mia.update(dbm, identity, data)
            dbm.close_session()
            return re

@namespace.route("/next/<int:max_amount>")
@api.doc(security="apikey")
class Next(Resource):
    @api.doc(security="apikey", description="Get next MIA anno")
    # @api.marshal_with(mia_anno)
    @jwt_required()
    def get(self, max_amount):
        max_amount = int(max_amount)
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.ANNOTATOR):
            dbm.close_session()
            return api.abort(403, f"You need to be {roles.ANNOTATOR} in order to perform this request.")
        else:
            re = mia.get_next(dbm, identity, max_amount)
            dbm.close_session()
            return re


@namespace.route("/label")
@api.doc(security="apikey")
class Label(Resource):
    @api.doc(security="apikey", description="Get possible MIA Labels")
    # @api.marshal_with(label_trees)
    @jwt_required()
    def get(self):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.ANNOTATOR):
            dbm.close_session()
            return api.abort(403, f"You need to be {roles.ANNOTATOR} in order to perform this request.")
        else:
            re = mia.get_label_trees(dbm, identity)
            dbm.close_session()
            return re


@namespace.route("/finish")
@api.doc(security="apikey")
class Finish(Resource):
    @api.doc(security="apikey", description="Finish MIA Task")
    @jwt_required()
    def get(self):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.ANNOTATOR):
            dbm.close_session()
            return api.abort(403, f"You need to be {roles.ANNOTATOR} in order to perform this request.")

        else:
            re = mia.finish(dbm, identity)
            dbm.close_session()
            return re


@namespace.route("/special")
@api.doc(security="apikey")
class Special(Resource):
    @api.doc(security="apikey", description="Get special MIA Images")
    @jwt_required()
    def post(self):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.ANNOTATOR):
            dbm.close_session()
            return api.abort(403, f"You need to be {roles.ANNOTATOR} in order to perform this request.")
        else:
            data = json.loads(request.data)
            re = mia.get_special(dbm, identity, data["miaIds"])
            dbm.close_session()
            return re


@namespace.route("/prev")
@api.doc(security="apikey")
class Prev(Resource):
    @api.doc(security="apikey", description="Get previous MIA annos")
    @jwt_required()
    @namespace.expect()
    def get(self):
        chunk_id = int(request.args.get('currentChunkId'))
        update_ids = request.args.getlist('currentUpdateIds')
        update_ids = [int(x) for x in update_ids]
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.ANNOTATOR):
            dbm.close_session()
            return api.abort(403, f"You need to be {roles.ANNOTATOR} in order to perform this request.")
        else:        
            if chunk_id != -1:
                re = mia.get_prev(dbm, identity, chunk_id, update_ids)
            else:
                re = mia.get_latest(dbm, identity) # go to latest, when about to finish task
            dbm.close_session()
            return re


@namespace.route("/first")
@api.doc(security="apikey")
class First(Resource):
    @api.doc(security="apikey", description="Get first MIA anno")
    @jwt_required()
    @namespace.expect()
    def get(self):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.ANNOTATOR):
            dbm.close_session()
            return api.abort(403, f"You need to be {roles.ANNOTATOR} in order to perform this request.")
        else:        
            re = mia.get_first(dbm, identity)
            dbm.close_session()
            return re


@namespace.route("/latest")
@api.doc(security="apikey")
class Latest(Resource):
    @api.doc(security="apikey", description="Get latest MIA anno")
    @jwt_required()
    @namespace.expect()
    def get(self):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.ANNOTATOR):
            dbm.close_session()
            return api.abort(403, f"You need to be {roles.ANNOTATOR} in order to perform this request.")
        else:        
            re = mia.get_latest(dbm, identity)
            dbm.close_session()
            return re
