from datetime import time, datetime
import ast
import json
from math import perm
from lost.logic import file_access
from lost.logic.file_access import UserFileAccess
from flask import request
from flask_restx import Resource
from lost.api.api import api
from lost.logic.file_access import UserFileAccess
from lost.settings import LOST_CONFIG, DATA_URL
from lost.db.vis_level import VisLevel
from lost.logic.user import get_user_default_group
from flask_jwt_extended import jwt_required, get_jwt_identity
from lost.db import model, roles, access
from lost.logic.file_man import FileMan, chonkyfy, DummyFileMan
from lost.logic.crypt import encrypt_fs_connection, decrypt_fs_connection
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
            fs_db = dbm.get_fs(fs_id=data['fs']['id'])
            ufa = UserFileAccess(dbm, user, fs_db)
            fm = FileMan(fs_db=fs_db)
            commonprefix = os.path.commonprefix([data['path'], fs_db.root_path])
            if commonprefix != fs_db.root_path:
                path = fs_db.root_path
            else:
                path = data['path']
            res = ufa.ls(path, detail=True)
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
            connection_dict = ast.literal_eval(data['fs']['connection'])
            db_fs = model.FileSystem(
                connection=json.dumps(connection_dict),
                root_path=data['fs']['rootPath'],
                fs_type=data['fs']['fsType']
            )
            fm = FileMan(fs_db=db_fs, decrypt=False)
            path = data['path']
            res = fm.ls(path, detail=True)
            dbm.close_session()
            return chonkyfy(res, path, fm)

@namespace.route('/rm')
class RM(Resource):
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
            fs_db = dbm.get_fs(fs_id=data['fsId'])
            ufa = UserFileAccess(dbm, user, fs_db)
            for file in data['files']:
                if 'isDir' in file:
                    res = ufa.rm(file['id'] , True)
                else:
                    res = ufa.rm(file['id'] , False) 
            dbm.close_session()
            return 'success', 200 

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
            fs_db = dbm.get_fs(fs_id=data['fs']['id'])
            try:
                dbm.delete(fs_db)
                dbm.commit()
            except:
                dbm.close_session()
                dbm = access.DBMan(LOST_CONFIG)
                fs_db = dbm.get_fs(fs_id=data['fs']['id'])
                fs_db.deleted = True
                dbm.add(fs_db)
                dbm.commit()
            dbm.close_session()
            # raise NotImplementedError()
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
            group_id = get_user_default_group(dbm, identity)
            # for user_group in dbm.get_user_groups_by_user_id(identity):
            #     if user_group.group.is_user_default:
            #         group_id = user_group.group.idx
            if visibility == VisLevel().USER:
                fs_list = list(dbm.get_fs(group_id=group_id))
            elif visibility == VisLevel().GLOBAL:
                fs_list = list(dbm.get_public_fs())
            elif visibility == VisLevel().ALL:
                fs_list = list(dbm.get_public_fs())
                fs_list += list(dbm.get_fs(group_id=group_id))
            ret = []
            for fs in fs_list:
                try:
                    ufa = UserFileAccess(dbm, user, fs)
                    ret.append({
                        'id': fs.idx,
                        'groupId': fs.group_id,
                        # 'connection': fs.connection,
                        'rootPath': fs.root_path,
                        'fsType': fs.fs_type,
                        'name' : fs.name,
                        'permission': ufa.get_permission(),
                        'timestamp': fs.timestamp.isoformat()
                    })
                except:
                    pass
            dbm.close_session()
            return ret

@namespace.route('/fstypes')
class FsTypes(Resource):
    @jwt_required 
    def get(self):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        possible_fs_types = ['ssh', 'ftp', 'sftp', 's3', 's3a', 'adl', 'abfs', 'abfss']
        if user.has_role(roles.ADMINISTRATOR):
            possible_fs_types.append('file')

        return possible_fs_types
        #return list(known_implementations.keys())

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
                # raise Exception(f'data connection:\n{data["connection"]}')
                if data['fsType'] == 'file':
                    if not user.has_role(roles.ADMINISTRATOR):
                        dbm.close_session()
                        return "Access to the local file system can only be performed by administrators.", 401
                connection_str = json.dumps(ast.literal_eval(data['connection']))
                new_fs_db = model.FileSystem(
                    group_id=group_id,
                    connection=encrypt_fs_connection(connection_str) if data['fsType'] != 'file' else connection_str,
                    root_path=data['rootPath'],
                    fs_type=data['fsType'],
                    name=data['name'],
                    timestamp=datetime.utcnow()
                )
                dbm.save_obj(new_fs_db)
            else:
                # fs_db.group_id = 'change?'
                connection_str = json.dumps(ast.literal_eval(data['connection']))
                fs_db.connection=encrypt_fs_connection(connection_str) if data['fsType'] != 'file' else connection_str
                fs_db.root_path=data['rootPath']
                fs_db.fs_type=data['fsType']
                fs_db.name=data['name']
                fs_db.timestamp=datetime.utcnow()
                dbm.save_obj(fs_db)
            dbm.close_session()
            return 'success', 200 

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
            ufa = UserFileAccess(dbm, user, fs)
            permission = ufa.get_permission()
            connection = None
            if permission == 'rw':
                if user.idx != fs.user_default_id:
                    connection = decrypt_fs_connection(fs)
            dbm.close_session()
            return {
                    'id': fs.idx,
                    'groupId': fs.group_id,
                    'connection': connection,
                    'rootPath': fs.root_path,
                    'permission': permission,
                    'fsType': fs.fs_type,
                    'name' : fs.name,
                    'timestamp': fs.timestamp.isoformat()
                }
@namespace.route('/upload')
class Upload(Resource):
    @jwt_required
    def post(self):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.DESIGNER):
            dbm.close_session()
            return "You need to be {} in order to perform this request.".format(roles.DESIGNER), 401
        else:
            data = request.form
            fsId = data['fsId'] 
            path = data['path']
            fs_db = dbm.get_fs(fs_id=fsId)
            ufa = UserFileAccess(dbm, user, fs_db)
            try:
                # fm = FileMan(fs_db=fs_db)
                uploaded_files = request.files.getlist("file[]")
                for file in uploaded_files:
                    dst_path = os.path.join(path, file.filename)
                    # with ufa.fs.open(dst_path, 'wb') as fs_stream:
                    #     fs_stream.write(file.read())
                    ufa.write_file(file.read(), dst_path)
                dbm.close_session() 
                return "success", 200 
            except file_access.WriteAccessNotPermitted:
                return 'Not allowed to upload to this filesystem', 403

@namespace.route('/mkdirs')
class MkDirs(Resource): 
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
            fs_id = data['fsId']
            fs_db = dbm.get_fs(fs_id=fs_id)
            fm = FileMan(fs_db=fs_db)
            ufa = UserFileAccess(dbm, user, fs_db)
            path = data['path']
            commonprefix = os.path.commonprefix([data['path'], fs_db.root_path])
            if commonprefix != fs_db.root_path:
                path = fs_db.root_path
            name = data['name']
            path = os.path.join(path, name)
            try:
                # For filesystems without folder concept s3 bucket, blob storage,..
                # we need to create an empty file to create a  "folder".
                # See also https://github.com/fsspec/s3fs/issues/245
                temp_file = os.path.join(path, 'empty.txt')
                ufa.touch(temp_file)
            except:
                res = ufa.mkdirs(path, exist_ok=False)
            dbm.close_session()
            return 'success', 200 