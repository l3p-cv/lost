import os
from flask import request, send_file, jsonify
from flask_restx import Resource
from lost.api.api import api
from lost.settings import LOST_CONFIG
import urllib.parse
from lost.db import access, roles
from flask_jwt_extended import jwt_required, get_jwt_identity

namespace = api.namespace('media', description='Serve static instruction images')

@namespace.route('/media-file')
@api.doc(security='apikey')
class ServeInstructionImage(Resource):
    def get(self):
        relative_path = request.args.get('path', '').lstrip('/')
        if not relative_path:
            return jsonify({'message': 'Missing "path" parameter'}), 400

        data_root = os.path.abspath(LOST_CONFIG.data_path)
        full_path = os.path.abspath(os.path.join(data_root, relative_path))

        if not full_path.startswith(data_root):
            return jsonify({'message': 'Forbidden: Invalid path'}), 403

        if not os.path.isfile(full_path):
            return jsonify({'message': 'File not found'}), 404

        return send_file(full_path)
    
@namespace.route('/get-image-markdown')
@api.doc(security='apikey')
class GetImageMarkdown(Resource):
    @jwt_required
    def post(self):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)

        if not user.has_role(roles.DESIGNER):
            dbm.close_session()
            return "You need to be {} in order to perform this request.".format(roles.DESIGNER), 401

        data = request.get_json()
        encoded_path = urllib.parse.unquote(data.get('encodedPath', '').lstrip('/'))

        if not encoded_path:
            dbm.close_session()
            return {'message': 'Missing "encodedPath"'}, 400

        data_root = os.path.abspath(LOST_CONFIG.data_path)
        full_path = os.path.abspath(os.path.join(data_root, encoded_path))

        if not full_path.startswith(data_root):
            dbm.close_session()
            return {'message': 'Forbidden'}, 403

        if not os.path.isfile(full_path):
            dbm.close_session()
            return {'message': 'File not found'}, 404

        base_url = request.host_url.rstrip('/')
        markdown = f"![Image]({base_url}/api/media/media-file?path={data.get('encodedPath')})"

        dbm.close_session()
        return {'markdown': markdown}, 200
