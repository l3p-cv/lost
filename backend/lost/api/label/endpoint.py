from flask import request, make_response, jsonify
from flask_restx import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from lost.api.api import api
from lost.api.label.api_definition import label_leaf
from lost.api.label.parsers import update_label_parser, create_label_parser
from lost.db import model, roles, access
from lost.db.vis_level import VisLevel
from lost.settings import LOST_CONFIG
from lost.logic.label import LabelTree
from io import BytesIO
import logging
import pandas as pd

namespace = api.namespace('label', description='Label API.')

@namespace.route('/tree/<string:visibility>') 
@api.doc(security='apikey')
class LabelTrees(Resource):
    @api.doc(security='apikey',description='Get all Label trees falling into the given visibility level')
    #@api.marshal_with()
    @jwt_required()
    def get(self, visibility):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        default_group = dbm.get_group_by_name(user.user_name)
        if visibility == VisLevel().USER:
            if not user.has_role(roles.DESIGNER):
                dbm.close_session()
                return "You are not authorized.", 403
            else:
                root_leaves = dbm.get_all_label_trees(group_id=default_group.idx)
                trees = list()
                for root_leaf in root_leaves:
                    trees.append(LabelTree(dbm, root_leaf.idx).to_hierarchical_dict())
                dbm.close_session()
                return trees
        if visibility == VisLevel().GLOBAL:
            if not user.has_role(roles.ADMINISTRATOR):
                dbm.close_session()
                return "You are not authorized.", 403
            else:
                root_leaves = dbm.get_all_label_trees(global_only=True)
                trees = list()
                for root_leaf in root_leaves:
                    trees.append(LabelTree(dbm, root_leaf.idx).to_hierarchical_dict())
                dbm.close_session()
                return trees
        if visibility == VisLevel().ALL:
            if not user.has_role(roles.DESIGNER):
                dbm.close_session()
                return "You are not authorized.", 403
            else:
                root_leaves = dbm.get_all_label_trees(group_id=default_group.idx, add_global=True)
                trees = list()
                for root_leaf in root_leaves:
                    trees.append(LabelTree(dbm, root_leaf.idx).to_hierarchical_dict())
                dbm.close_session()
                return trees
        dbm.close_session()
        return "You are not authorized.", 403 


@namespace.route('/<string:visibility>')
@api.doc(security='apikey')
class LabelEditNew(Resource):
    @api.doc(security='apikey',description='Update Label')
    @api.expect(update_label_parser)
    @jwt_required()
    def patch(self, visibility):
        args = update_label_parser.parse_args()
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.DESIGNER):
            dbm.close_session()
            return "You are not authorized.", 403
        else:
            label = dbm.get_label_leaf(int(args.get('id')))
            label.name = args.get('name')
            label.description = args.get('description')
            label.abbreviation = args.get('abbreviation')
            label.external_id = args.get('external_id')
            label.color = args.get('color')
            dbm.save_obj(label)
            dbm.close_session()
            return 'success'

    @api.doc(security='apikey',description='Add new Label')
    @api.expect(create_label_parser)
    @jwt_required()
    def post(self, visibility):
        args = create_label_parser.parse_args()
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        default_group = dbm.get_group_by_name(user.user_name)
        if visibility == VisLevel().ALL:
            if not user.has_role(roles.DESIGNER):
                dbm.close_session()
                return "You are not authorized.", 403
            else:
                label = model.LabelLeaf(name=args.get('name'),abbreviation=args.get('abbreviation'), \
                description=args.get('description'),external_id=args.get('external_id'), 
                is_root=args.get('is_root'),color=args.get('color'), group_id=default_group.idx)
                if args.get('parent_leaf_id'):
                    label.parent_leaf_id = args.get('parent_leaf_id'),
                dbm.save_obj(label)
                label_id = label.idx
                dbm.close_session()
                return {"message": "Label added successfully", "labelId": label_id}
        if visibility == VisLevel().GLOBAL:
            if not user.has_role(roles.ADMINISTRATOR):
                dbm.close_session()
                return "You are not authorized.", 403
            else:
                label = model.LabelLeaf(name=args.get('name'),abbreviation=args.get('abbreviation'), \
                description=args.get('description'),external_id=args.get('external_id'), 
                is_root=args.get('is_root'),color=args.get('color'))
                if args.get('parent_leaf_id'):
                    label.parent_leaf_id = args.get('parent_leaf_id'),
                dbm.save_obj(label)
                label_id = label.idx
                dbm.close_session()
                return {"message": "Label added successfully", "labelId": label_id}
        dbm.close_session()
        return "You are not authorized.", 403 



@namespace.route('/<int:label_leaf_id>')
@namespace.param('label_leaf_id', 'The group identifier')
@api.doc(security='apikey')
class Label(Resource):
    @api.doc(security='apikey',description='Get Label Leaf with given ID')
    @api.marshal_with(label_leaf)
    @jwt_required()
    def get(self,label_leaf_id):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.DESIGNER):
            dbm.close_session()
            return "You are not authorized.", 403
        else:
            re = dbm.get_label_leaf(label_leaf_id)
            dbm.close_session()
            return re
        
    @api.doc(security='apikey',description='Delete Label with given ID')
    @jwt_required()
    def delete(self,label_leaf_id):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.DESIGNER):
            dbm.close_session()
            return "You are not authorized.", 403
        else:
            label = dbm.get_label_leaf(label_leaf_id)
            dbm.delete(label)
            dbm.commit()
            dbm.close_session()
            return "success"

@namespace.route('/<int:label_leaf_id>/export')
@api.doc(security='apikey')
class ExportLabelTree(Resource):
    @api.doc(security='apikey',description='Get Export of a label Tree with the given label leaf as root, exported as CSV transmitted as BLOB')
    @jwt_required()
    def get(self,label_leaf_id):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.DESIGNER):
            dbm.close_session()
            return "You are not authorized.", 403
        else:
            label_tree = LabelTree(dbm, root_id=label_leaf_id)
            ldf = label_tree.to_df()
            dbm.close_session()
            f = BytesIO()
            ldf.to_csv(f)
            f.seek(0)
            resp = make_response(f.read())
            resp.headers["Content-Disposition"] = f"attachment; filename={label_tree.root.name}.csv"
            resp.headers["Content-Type"] = "blob"
            return resp

@namespace.route('/tree/<string:visibility>')
@api.doc(security='apikey')
class ImportLabelTree(Resource):
    @api.doc(security='apikey',description='Import a label Tree with the given label leaf as root, imported from CSV')
    @jwt_required()
    def post(self, visibility):
        if 'file' not in request.files:
            return jsonify({"error": "No file part"}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400

        if not file or not file.filename.endswith('.csv'):
            return jsonify({"error": "Invalid file format. Please upload a CSV file."}), 400

        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        default_group = dbm.get_group_by_name(user.user_name)
        if visibility == VisLevel().ALL:
            if not user.has_role(roles.DESIGNER):
                dbm.close_session()
                return "You are not authorized.", 403
            else:
                tree = LabelTree(dbm, logger=logging, group_id=default_group.idx)
                df = pd.read_csv(file)
                logging.info(df)
                root = tree.import_df(df)
                if not root:
                    dbm.close_session()
                    return {"error": "LabelTree already present in database!"}, 400
                else:
                    dbm.close_session()
                    return {"message": "Tree imported successfully"}
        if visibility == VisLevel().GLOBAL:
            if not user.has_role(roles.ADMINISTRATOR):
                dbm.close_session()
                return "You are not authorized.", 403
            else:
                tree = LabelTree(dbm, logger=logging)
                df = pd.read_csv(file)
                root = tree.import_df(df)
                if not root:
                    dbm.close_session()
                    return {"error": "LabelTree already present in database!"}, 400
                else:
                    dbm.close_session()
                    return {"message": "Tree imported successfully"}
        dbm.close_session()
        return "You are not authorized.", 403
