from datetime import time, datetime
import json
from flask import request
from flask_restx import Resource
from lost.api.api import api
from lost.settings import LOST_CONFIG, DATA_URL
from lost.db.vis_level import VisLevel
from flask_jwt_extended import jwt_required, get_jwt_identity
from lost.db import model, roles, access
from lost.logic.file_man import FileMan, chonkyfy, DummyFileMan
from lost.logic.crypt import Crypt
from fsspec.registry import known_implementations
import os

namespace = api.namespace('fb', description='Lost Filebrowser API')

@namespace.route('/ls')
class LS(Resource):
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
            fs_db = dbm.get_fs(name=data['fs']['name'])
            fm = FileMan(fs_db=fs_db)
            commonprefix = os.path.commonprefix([data['path'], fs_db.root_path])
            if commonprefix != fs_db.root_path:
                path = fs_db.root_path
            else:
                path = data['path']
            res = fm.ls(path, detail=True)
            # raise Exception(res)
            dbm.close_session()
            return chonkyfy(res, path, fm)

@namespace.route('/lsTest')
class LS(Resource):
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
            if data['fs']['fsType'] == 'file':
                if not user.has_role(roles.ADMINISTRATOR):
                    dbm.close_session()
                    return "You need to be {} in order to perform this request.".format(roles.ADMINISTRATOR), 401
            db_fs = model.FileSystem(
                connection=data['fs']['connection'],
                root_path=data['fs']['rootPath'],
                fs_type=data['fs']['fsType']
            )
            fm = FileMan(fs_db=db_fs)

            # fs_db = dbm.get_fs(name=data['fs']['name'])
            # fm = FileMan(fs_db=fs_db)
            # commonprefix = os.path.commonprefix([data['path'], fs_db.root_path])
            # if commonprefix != fs_db.root_path:
            #     path = fs_db.root_path
            # else:
            #     path = data['path']
            path = data['path']
            res = fm.ls(path, detail=True)
            # raise Exception(res)
            dbm.close_session()
            return chonkyfy(res, path, fm)

@namespace.route('/delete')
class Delete(Resource):
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
            fs_db = dbm.get_fs(name=data['fs']['name'])
            raise NotImplementedError()
            return {'deleted': 'mu ha ha!'}

@namespace.route('/fslist/<string:visibility>')
class FsList(Resource):
    @jwt_required 
    def get(self, visibility):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.DESIGNER):
            dbm.close_session()
            return "You need to be {} in order to perform this request.".format(roles.DESIGNER), 401
        else:
            for user_group in dbm.get_user_groups_by_user_id(identity):
                if user_group.group.is_user_default:
                    group_id = user_group.group.idx
            if visibility == VisLevel().USER:
                fs_list = list(dbm.get_fs(group_id=group_id))
            elif visibility == VisLevel().GLOBAL:
                fs_list = list(dbm.get_public_fs())
            elif visibility == VisLevel().ALL:
                fs_list = list(dbm.get_public_fs())
                fs_list += list(dbm.get_fs(group_id=group_id))
            ret = []
            for fs in fs_list:
                ret.append({
                    'id': fs.idx,
                    'groupId': fs.group_id,
                    # 'connection': fs.connection,
                    'rootPath': fs.root_path,
                    'fsType': fs.fs_type,
                    'name' : fs.name,
                    'timestamp': fs.timestamp.isoformat()
                })
            dbm.close_session()
            return ret

@namespace.route('/fstypes')
class FsTypes(Resource):
    @jwt_required 
    def get(self):
        # dbm = access.DBMan(LOST_CONFIG)
        # identity = get_jwt_identity()
        # user = dbm.get_user_by_id(identity)
        return list(known_implementations.keys())

@namespace.route('/savefs')
class SaveFs(Resource):
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
            if 'id' in data:
                # raise Exception('Received data: {}'.format(data))
                fs_db = dbm.get_fs(fs_id=data['id'])
            else:
                fs_db = None
            #TODO: Check Authorization
            if fs_db is None:
                for user_group in dbm.get_user_groups_by_user_id(identity):
                    if user_group.group.is_user_default:
                        group_id = user_group.group.idx
                # raise Exception('group_id: {}'.format(group_id))
                if data['visLevel'] == VisLevel().GLOBAL:
                    group_id = None
                new_fs_db = model.FileSystem(
                    group_id=group_id,
                    connection=Crypt().encrypt(data['connection']),
                    root_path=data['rootPath'],
                    fs_type=data['fsType'],
                    name=data['name'],
                    timestamp=datetime.utcnow()
                )
                dbm.save_obj(new_fs_db)
            else:
                # fs_db.group_id = 'change?'
                fs_db.connection=Crypt().encrypt(data['connection'])#data['connection']
                fs_db.root_path=data['rootPath']
                fs_db.fs_type=data['fsType']
                fs_db.name=data['name']
                fs_db.timestamp=datetime.utcnow()
                dbm.save_obj(fs_db)
            dbm.close_session()
            return 200, 'success'

@namespace.route('/fullfs')
class FullFs(Resource):
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
            for user_group in dbm.get_user_groups_by_user_id(identity):
                if user_group.group.is_user_default:
                    group_id = user_group.group.idx
            fs = dbm.get_fs(fs_id=data['id'])
            dbm.close_session()
            if fs.group_id == group_id or (user.has_role(roles.ADMINISTRATOR) and fs.group_id is None):
                return {
                        'id': fs.idx,
                        'groupId': fs.group_id,
                        'connection': Crypt().decrypt(fs.connection) if fs.fs_type != 'file' else fs.connection,
                        'rootPath': fs.root_path,
                        'fsType': fs.fs_type,
                        'name' : fs.name,
                        'timestamp': fs.timestamp.isoformat()
                    }
            else:
                return "You need to be the owner of this datasource in order to decrypt the connection string", 401