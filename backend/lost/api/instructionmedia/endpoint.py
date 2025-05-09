import os
from flask import request, send_file, jsonify
from flask_restx import Resource
from lost.api.api import api
from lost.settings import LOST_CONFIG
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