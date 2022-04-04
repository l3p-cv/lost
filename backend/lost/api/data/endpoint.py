from typing import BinaryIO
from sqlalchemy import engine
from sqlalchemy.sql.schema import DEFAULT_NAMING_CONVENTION
from flask_restx import Resource
from flask import request, send_from_directory, make_response
from flask_jwt_extended import jwt_required, get_jwt_identity
from lost.api.api import api
from lost.settings import LOST_CONFIG, FLASK_DEBUG
from lost.db import access, roles
from lost.api.annotask.parsers import annotask_parser
from lost.logic import anno_task as annotask_service
from lost.logic.file_man import FileMan
from lost.logic import dask_session
from lost.pyapi.utils import anno_helper
import json
import os
from lost.pyapi import pe_base
from io import BytesIO
import lost_ds as lds
import numpy as np
import cv2
import base64
import random
namespace = api.namespace('data', description='Data API.')

@namespace.route('/<string:path>')
class Data(Resource): 
    @jwt_required 
    def get(self, path):
        print(path)
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.ANNOTATOR):
            dbm.close_session()
            return "You are not authorized.", 401
        else:
            raise Exception('data/ -> Not Implemented!')
            # return send_from_directory(os.path.join(LOST_CONFIG.project_path, 'data'), path)

# @namespace.route('/logs/<path:path>')
# class Logs(Resource): 
#     @jwt_required 
#     def get(self, path):
#         print(path)
#         dbm = access.DBMan(LOST_CONFIG)
#         identity = get_jwt_identity()
#         user = dbm.get_user_by_id(identity)
#         if not user.has_role(roles.ANNOTATOR):
#             dbm.close_session()
#             return "You are not authorized.", 401
#         else:
#             # raise Exception('data/logs/ -> Not Implemented!')
#             fm = FileMan(LOST_CONFIG)
#             with fm.fs.open(fm.get_abs_path(path), 'rb') as f:
#                 resp = make_response(f.read())
#                 resp.headers["Content-Disposition"] = "attachment; filename=log.csv"
#                 resp.headers["Content-Type"] = "text/csv"
#             return resp

#             # return send_from_directory(os.path.join(LOST_CONFIG.project_path, 'data/logs'), path)

@namespace.route('/logs/<path:path>')
#@namespace.param('path', 'Path to logfile')
class Logs(Resource):
    @jwt_required 
    def get(self, path):
        print(path)
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.ANNOTATOR):
            dbm.close_session()
            return "You are not authorized.", 401
        else:
            # raise Exception('data/logs/ -> Not Implemented!')
            fm = FileMan(LOST_CONFIG)
            with fm.fs.open(fm.get_abs_path(path), 'rb') as f:
                resp = make_response(f.read())
                resp.headers["Content-Disposition"] = "attachment; filename=log.csv"
                resp.headers["Content-Type"] = "text/csv"
            return resp

@namespace.route('/dataexport/<deid>')
#@namespace.param('path', 'Path to logfile')
class DataExport(Resource):
    @jwt_required 
    def get(self, deid):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.DESIGNER):
            dbm.close_session()
            return "You are not authorized.", 401
        else:
            # data = json.loads(request.data)
            de = dbm.get_data_export(deid)
            fs_db = de.fs
            fm = FileMan(fs_db=fs_db)
            with fm.fs.open(de.file_path, 'rb') as f:
                resp = make_response(f.read())
                resp.headers["Content-Disposition"] = "attachment; filename=annos.parquet"
                resp.headers["Content-Type"] = "blob"
            return resp

@namespace.route('/annoexport/<peid>')
class AnnoExport(Resource):
    @jwt_required 
    def get(self, peid):
         dbm = access.DBMan(LOST_CONFIG)
         identity = get_jwt_identity()
         user = dbm.get_user_by_id(identity)
         if not user.has_role(roles.DESIGNER):
             dbm.close_session()
             return "You are not authorized.", 401
         else:
             pe_db = dbm.get_pipe_element(pipe_e_id=peid)
             pe = pe_base.Element(pe_db, dbm)
             df = pe.inp.to_df()
             # raise Exception('GO ON HERE !!!')
             f = BytesIO()
             df.to_parquet(f)
             f.seek(0)
             resp = make_response(f.read())
             resp.headers["Content-Disposition"] = "attachment; filename=annos.parquet"
             resp.headers["Content-Type"] = "blob"
             return resp


@namespace.route('/workerlogs/<path:path>')
class Logs(Resource): 
    @jwt_required 
    def get(self, path):
        print(path)
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.ANNOTATOR):
            dbm.close_session()
            return "You are not authorized.", 401
        else:
            raise Exception('data/workerlogs/ -> Not Implemented!')
            # return send_from_directory(os.path.join(LOST_CONFIG.project_path, 'logs'), path)


def load_img(db_img, fm, user):
    if LOST_CONFIG.worker_management != 'dynamic':
        img = fm.load_img(db_img.img_path)
    else:
        img = dask_session.ds_man.read_fs_img(user, db_img.fs, db_img.img_path)
    return img

@namespace.route('/getImage')
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
                
                df = db_img.to_df()
                df = df[df['anno_uid'] == db_anno.idx]
                ds = lds.LOSTDataset(df, filesystem=fm.fs)
                ds.df.img_path = ds.df.abs_path
                ds.transform_bbox_style('x1y1x2y2', inplace=True)
                ds.to_abs(inplace=True)
                anno = ds.df.anno_data.iloc[0].reshape((-1, 2))
                anno_min = np.min(ds.df.anno_data.iloc[0], axis=0)
                anno_max = np.max(ds.df.anno_data.iloc[0], axis=0)
                # raise Exception(f'{anno}, {anno_min}, {anno_max}')
                
                # df.loc[:,'anno_data'] = df['anno_data'].apply(lambda x: np.asarray(x))
                

                # raise Exception(f'{data["prevExamples"]}')
                    
                
                # df = lds.crop_anno(db_img.img_path, crop_pos, df)

                
                ds.df.anno_lbl = ""
                image = lds.vis_sample(image, ds.df, radius=3)
                # lds.crop_components()
                # crops, _ = anno_helper.crop_boxes(
                #     [db_anno.to_vec('anno_data')],
                # # anno_helper.calc_box_for_anno(
                # #     [db_anno.to_vec('anno_data')],
                # #     [db_anno.to_vec('anno_dtype')])
                #     [db_anno.to_vec('anno_dtype')], 
                #     image, context=context 
                # )
                img = image
            else:
                raise Exception('Unknown mia image type')
            _, data = cv2.imencode('.jpg', img)
            data64 = base64.b64encode(data.tobytes())
            dbm.close_session()
            return u'data:img/jpg;base64,'+data64.decode('utf-8')