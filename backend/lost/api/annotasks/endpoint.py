import os
from datetime import datetime
from flask_restx import Resource
from flask import request, make_response
from flask_jwt_extended import jwt_required, get_jwt_identity
from lost.api.api import api
from lost.settings import LOST_CONFIG, DATA_URL
from lost.logic.file_access import UserFileAccess
from lost.logic.db_access import UserDbAccess
from lost.db import access, roles, model, dtype
from lost.api.annotasks.parsers import annotask_parser, update_group_parser, annotask_config_parser,storage_parser,generate_export_parser,get_annotasks_parser,patch_annotation_parser
from lost.logic import anno_task as annotask_service
from lost.logic.jobs.jobs import force_anno_release, export_ds
from lost.logic import dask_session
from lost.api.annotasks.api_definition import anno_task_list, anno_task, storage_settings, anno_task_export_list, anno_task_export_download, anno_task_filter_lables,review_images,review_options
import json
from lost.logic.sia import SiaSerialize,get_image_progress,SiaUpdateOneThing
import logging
from lost.logic import sia


namespace = api.namespace('annotasks', description='AnnoTask API.')

@namespace.route('')
@api.response(401, 'Unauthorized. User does not have the required role.')

@api.doc(security='apikey')
class Available(Resource):
    @api.doc(description="Retrieve a list of available annotation tasks for the authenticated user.")
    @api.marshal_with(anno_task_list)
    @api.param('pageSize', 'Size of the Pages for pagination')
    @api.param('page', 'Which page to return when using pagination')
    @api.param('filteredName', 'Name Filter')
    @api.param('filteredStates', 'State Filter passed as comma seperated ids')
    @jwt_required()
    def get(self):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.ANNOTATOR):
            dbm.close_session()
            return api.abort(403, "You are not authorized.")
        else:
            args = get_annotasks_parser.parse_args(request)
            page_size =  args.page_size
            page =  args.page
            filtered_name =  args.filtered_name
            filtered_states =  args.filtered_states

            if filtered_states:
                filtered_states = filtered_states.replace('[','')
                filtered_states = filtered_states.replace(']','')


                filtered_states = filtered_states.split(',')
            group_ids = [g.group.idx for g in user.groups]
            total_pages = None
            annotask_list = []

            if page_size!= None and page!= None:
                anno_tasks = dbm.get_annotasks_filtered(group_ids=group_ids, page_size=page_size, page=page,  filtered_name=filtered_name,filtered_states=filtered_states)
                total_pages = dbm.get_annotasks_total_pages(group_ids=group_ids, page_size=page_size, filtered_name=filtered_name,filtered_states=filtered_states)


                for at in anno_tasks:
                    annotask_list.append(annotask_service.get_at_info(dbm, at, user_id=user.idx))
            else:
                annotask_list = annotask_service.get_available_annotasks(dbm, group_ids, identity)
            dbm.close_session()
            return {'anno_tasks':annotask_list,
                    'pages':total_pages}

    @api.expect(annotask_parser)
    @api.doc(description='Select an annotation task for the authenticated user.')
    @api.response(200, 'Task selected successfully.')
    @jwt_required()
    def post(self):
        args = annotask_parser.parse_args(request)
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.ANNOTATOR):
            dbm.close_session()
            return api.abort(403, "You are not authorized.")
        else:
            annotask_service.choose_annotask(dbm, args.id ,user.idx)
            dbm.close_session()
            return "success"
@namespace.route('/working')
@api.response(401, 'Unauthorized. User does not have the required role.')
@api.doc(security='apikey',description='Get currently active Annotask')
class Working(Resource):
    # @api.marshal_with(anno_task)
    @jwt_required()
    def get(self):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.ANNOTATOR):
            dbm.close_session()
            return api.abort(403, "You are not authorized.")
        else:
            working_task = annotask_service.get_current_annotask(dbm, user)
            logging.info(f"Working Task {working_task} ")
            if working_task is None:
                return "Current working annotation task not found", 412
            dbm.close_session()

            return working_task


@namespace.route('/<int:annotask_id>')
@namespace.param('annotask_id', 'The id of the annotation task.')
@api.param('statistics', 'are statistics supposed to be returned too')
@api.param('config', 'is the config supposed to be returned too')
@api.doc(security='apikey')
class AnnotaskById(Resource):
    @jwt_required()
    @api.marshal_with(anno_task)
    @api.doc(security='apikey',description='Get details for Annotask with the given id')
    def get(self, annotask_id):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.ANNOTATOR):
            dbm.close_session()
            return api.abort(403, "You are not authorized.")
        else:
            statistics = request.args.get('statistics')
            config = request.args.get('config')
            logging.info(type(statistics))
            annotask = dbm.get_anno_task(anno_task_id=annotask_id)
            annotask_dict = annotask_service.get_at_info(dbm,annotask,identity,statistics=='true')
            # add image count
            for r in dbm.count_all_image_annos(anno_task_id=annotask.idx)[0]:
                img_count = r
            for r in dbm.count_image_remaining_annos(anno_task_id=annotask.idx):
                annotated_img_count = img_count - r

            # find annotask user
            annotask_user_name = "All Users"
            if annotask.group_id:
                annotask_user_name = annotask.group.name

            # add annotask type
            annotask_type = ""
            if annotask.dtype == dtype.AnnoTask.MIA:
                annotask_type = "mia"
            elif annotask.dtype == dtype.AnnoTask.SIA:
                annotask_type = "sia"

            # add label leaves
            label_leaves = []
            db_leaves = dbm.get_all_required_label_leaves(annotask_id)
            for db_leaf in db_leaves:
                leaf = db_leaf.label_leaf
                leaf_json = dict()
                leaf_json['id'] = leaf.idx
                leaf_json['name'] = leaf.name
                leaf_json['color'] = leaf.color
                label_leaves.append(leaf_json)

            # collect annotask info

                annotask_dict['type']= annotask_type
                annotask_dict['user_name']= annotask_user_name
                annotask_dict['img_count']= img_count
                annotask_dict['annotated_img_count']= annotated_img_count
                annotask_dict['label_leaves']= label_leaves

            # add annotask configuration only if available
            if annotask.configuration and config == 'true':
                annotask_dict['configuration'] = json.loads(annotask.configuration)

            return annotask_dict



@namespace.route('/<int:annotask_id>/force_release')
@namespace.param('annotask_id', 'The id of the annotation task.')
@api.doc(security='apikey',description='Forces the release of the Annotations that are currently lock by users')
class ForceRelease(Resource):
    @jwt_required()
    def post(self, annotask_id):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.ANNOTATOR):
            dbm.close_session()
            return api.abort(403, "You are not authorized.")
        else:
            force_anno_release(dbm, annotask_id)
            dbm.close_session()
            return "Success", 200


@namespace.route('/<int:annotask_id>/group')
@namespace.param('annotask_id', 'The id of the annotation task.')
@api.doc(security='apikey')
class ChangeUser(Resource):
    @jwt_required()
    @api.expect(update_group_parser)
    @api.doc(security='apikey',description='Update the group or user the annotation is assigned to')

    def patch(self, annotask_id):

        args = update_group_parser.parse_args(request)

        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.DESIGNER):
            dbm.close_session()
            return api.abort(403, "You are not authorized.")
        else:
            anno_task = dbm.get_anno_task(annotask_id)
            pipe_manager_id = anno_task.pipe_element.pipe.manager_id
            if pipe_manager_id == user.idx:
                anno_task.group_id = args.group_id
                dbm.save_obj(anno_task)
                dbm.close_session()
                return "Success", 200

            dbm.close_session()
            return api.abort(403, "You are not authorized.")

@namespace.route('/<int:annotask_id>/config')
@namespace.param('annotask_id', 'The id of the annotation task.')
@api.expect(annotask_config_parser)

@api.doc(security='apikey')

class UpdateAnnoTaskConfig(Resource):
    @api.doc(security='apikey',description='Update the config of the annotask')
    @jwt_required()
    def put(self, annotask_id):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity() 
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.DESIGNER):
            dbm.close_session()
            return api.abort(403, "You are not authorized.")
        else:
            args = annotask_config_parser.parse_args(request)
            anno_task = dbm.get_anno_task(annotask_id)
            pipe_manager_id = anno_task.pipe_element.pipe.manager_id
            if pipe_manager_id == user.idx:
                anno_task.configuration = json.dumps(args.configuration)
                dbm.save_obj(anno_task)
                dbm.close_session()
                return "Success", 200

            dbm.close_session()
            return api.abort(403, "You are not authorized.")

@namespace.route('/<int:annotask_id>/storage_settings')
@namespace.param('annotask_id', 'The id of the annotation task.')
@api.doc(security='apikey')
class GetAnnoTaskStorageSettings(Resource):
    @api.marshal_with(storage_settings)
    @api.doc(security='apikey',description='Get the storage settings of the annotask')
    @jwt_required()
    def get(self, annotask_id):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity() 
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.DESIGNER):
            dbm.close_session()
            return api.abort(403, "You are not authorized.")

        anno_task = dbm.get_anno_task(annotask_id)

        return {
            'dataset_id': anno_task.dataset_id
        }

    @jwt_required()
    @api.doc(security='apikey',description='Update the storage settings of the annotask')
    @api.expect(storage_parser)
    def patch(self, annotask_id):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity() 
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.DESIGNER):
            dbm.close_session()
            return api.abort(403, "You are not authorized.")

        anno_task = dbm.get_anno_task(annotask_id)
        data = json.loads(request.data)
        args = storage_parser.parse_args(request)

        # save dataset if given
        if 'datasetId' in data:
            dataset_id = args.dataset_id
            anno_task.dataset_id = dataset_id

            # -1 = no dataset given (remove ds id in case there was one before)
            if str(dataset_id) == '-1':
                anno_task.dataset_id = None

            dbm.save_obj(anno_task)


@namespace.route('/<int:annotask_id>/exports')
@namespace.param('annotask_id', 'The id of the annotation task.')
@api.doc(security='apikey')
class Exports(Resource):
    @api.expect(generate_export_parser)
    @api.doc(security='apikey',description='Generates an export for the annotask')
    @jwt_required()
    def post(self, annotask_id):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity() 
        user = dbm.get_user_by_id(identity)
        udb = UserDbAccess(dbm, user)
        anno_task = dbm.get_anno_task(annotask_id)
        # raise Exception(f'may_access_pe: {udb.may_access_pe(anno_task.pipe_element)}')
        if not udb.may_access_pe(anno_task.pipe_element):
            dbm.close_session()
            return api.abort(403, "You are not authorized.")
        else:

            args = generate_export_parser.parse_args(request)

            include_images = args.include_images
            random_splits_active = args.random_splits['active']
            splits=None
            if random_splits_active:
                splits = args.random_splits
            for r in dbm.count_all_image_annos(anno_task_id=anno_task.idx)[0]:
                img_count = r
            for r in dbm.count_image_remaining_annos(anno_task_id=anno_task.idx):
                annotated_img_count = img_count - r

            # check if amount of images to export is bigger than given limit in config
            if include_images:
                if args.annotated_only:
                    if annotated_img_count > LOST_CONFIG.img_export_limit:
                        include_images = False
                if img_count > LOST_CONFIG.img_export_limit:
                    include_images = False

            dExport = model.AnnoTaskExport(timestamp=datetime.now(), anno_task_id=anno_task.idx, 
                                            name=args.export_name, 
                                            progress=1, 
                                            anno_task_progress=anno_task.progress,
                                            img_count=annotated_img_count,
                                            )
            dbm.save_obj(dExport)
            client = dask_session.get_client(user)

            client.submit(export_ds, anno_task.pipe_element_id, identity, 
                                dExport.idx, dExport.name, splits, 
                                args.export_type, include_images, 
                                args.annotated_only,
                                workers=LOST_CONFIG.worker_name)
            dask_session.close_client(user, client)
            dbm.close_session()
            return "Success", 200

    @api.marshal_with(anno_task_export_list)
    @jwt_required()
    @api.doc(security='apikey',description='Get all exports for the annotask')

    def get(self, annotask_id):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        udb = UserDbAccess(dbm, user)
        anno_task = dbm.get_anno_task(annotask_id)
        if not udb.may_access_pe(anno_task.pipe_element):
            dbm.close_session()
            return api.abort(403, "You are not authorized.")
        else:
            d_exports = dbm.get_anno_task_export(anno_task_id=anno_task.idx)
            ret_json = []
            for export in d_exports:
                export_json = export.to_dict()  
                if export.file_path:
                    file_type = export.file_path.split('.')[-1]
                    export_json['file_type'] = file_type
                ret_json.append(export_json)
            dbm.close_session()
            return {'anno_task_exports':ret_json}, 200


@namespace.route('/exports/<int:anno_task_export_id>')
@namespace.param('anno_task_export_id', 'The id of the anno_task_export to download.')
@api.doc(security='apikey')

class DataExportDownload(Resource):
    # @api.marshal_with(anno_task_export_download)
    @api.doc(security='apikey',description='Get the export with the given id in binary format')
    @jwt_required()
    def get(self, anno_task_export_id):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()

        user = dbm.get_user_by_id(identity)
        udb = UserDbAccess(dbm, user)
        anno_task_export = dbm.get_anno_task_export(anno_task_export_id=anno_task_export_id)
        anno_task = dbm.get_anno_task(anno_task_export.anno_task_id)
        if not udb.may_access_pe(anno_task.pipe_element):
            dbm.close_session()
            return api.abort(403, "You are not authorized.")
        else:
            fs_db = dbm.get_user_default_fs(user.idx)
            ufa = UserFileAccess(dbm, user, fs_db)

            my_file = ufa.load_file(anno_task_export.file_path)
            export_name = os.path.basename(anno_task_export.file_path)
            resp = make_response(my_file)
            resp.headers["Content-Disposition"] = f"attachment; filename={export_name}"
            resp.headers["Content-Type"] = "blob"
            dbm.close_session()
            return resp
            # dbm.close_session()
            # return {'export':my_file}, 200
            # return 500

    @api.doc(security='apikey',description='Delete the export with the given id')
    @jwt_required()
    def delete(self, anno_task_export_id):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity() 
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.DESIGNER):
            dbm.close_session()
            return api.abort(403, "You are not authorized.")
        else:
            anno_task_data_export = dbm.get_anno_task_export(anno_task_export_id)
            anno_task = dbm.get_anno_task(anno_task_data_export.anno_task_id)
            pipe_manager_id = anno_task.pipe_element.pipe.manager_id
            if pipe_manager_id == user.idx:

                delete_ds_export( anno_task_data_export.idx, user.idx)
                dbm.delete(anno_task_data_export)
                dbm.commit()
                dbm.close_session()
                return "Success", 200

            dbm.close_session()
            return api.abort(403, "You are not authorized.")



@namespace.route('/filterLabels')
@api.doc(description='Get possible filter labels for annotation lists')
class GetLabels(Resource):
    @jwt_required()
    @api.marshal_with(anno_task_filter_lables)
    def get(self):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.ANNOTATOR):
            dbm.close_session()
            return make_response("You are not authorized.", 401)
        else:
            res = dict()
            res['states'] = [0, 1]
            dbm.close_session()
            return res





@namespace.route('/<int:annotask_id>/review/images')
@api.doc(security='apikey')
class DatasetReviewImageSearch(Resource):
    @api.doc(description="Get data for the next dataset review annotation")
    @api.param('filter', 'String to search for')
    @api.marshal_with(review_images)

    @jwt_required()
    def get(self, annotask_id):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.DESIGNER):
            dbm.close_session()
            return api.abort(403, "You need to be {} in order to perform this request.".format(roles.DESIGNER))

        search_str = request.args.get('filter')
        labels = request.args.get('labels')
        if search_str == None:
            search_str=""

        db_result = dbm.get_search_images_in_annotask(annotask_id, search_str)

        found_image_ids: list[int] = []
        found_images: list[dict[str, any]] = []

        for entry in db_result:
            # prepare list of image ids for label filter (we can't iterate multiple times through db_result)
            found_image_ids.append(entry.idx)

            found_images.append({
                'image_id': entry.idx,
                'image_path': entry.img_path,
                'annotation_id': entry.anno_task_id,
                'annotation_name': entry.name
            })

        # filter for images annotated with specific labels if labels are in the request
        if labels is not None:
            search_labels = list(map(int, labels.split(',')))

            # no labels -> no images
            if len(search_labels) == 0:
                return []

            # found_image_ids = [entry.idx for entry in db_result]
            img_with_label_db_result = dbm.get_all_images_with_labels(
                found_image_ids, search_labels
            )
            img_ids_with_label = [
                entry.img_anno_id for entry in img_with_label_db_result
            ]

            # filter original response list: only select images that have one of the searched labels
            print(found_images)
            found_img_with_label = [
                img
                for img in found_images
                if img["image_id"] in img_ids_with_label
            ]

            # replace list with label filtered list
            found_images = found_img_with_label

        return {'images':found_images}




@namespace.route('/<int:annotask_id>/annotation')
@api.expect(patch_annotation_parser)
@api.doc(security='apikey')
class UpdateOneThing(Resource):
    @api.doc(security='apikey',description='Update Image Annotime Junk status or Image Label for the Annotask')

    @jwt_required()
    def patch(self, annotask_id):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.ANNOTATOR):
            dbm.close_session()
            return api.abort(403, "You need to be {} in order to perform this request.".format(roles.ANNOTATOR))
        else:
            args = patch_annotation_parser.parse_args(request)
            logging.info(args)
            try:
                if args.anno == None:
                    if args.action not in ['imgAnnoTimeUpdate', 'imgJunkUpdate', 'imgLabelUpdate']:
                        raise Exception('Expect either anno or img information!')
                anno_task = dbm.get_anno_task(anno_task_id=annotask_id)
                sia_update = SiaUpdateOneThing(dbm, args, user.idx, anno_task)
                re = sia_update.update()
                dbm.close_session()
            except:
                dbm.close_session()
                raise
            return re


@namespace.route('/<int:annotask_id>/review/options')
@namespace.param('annotask_id', 'The id of the annotask.')
@api.doc(security='apikey')

class ReviewOptions(Resource):
    @api.doc(security='apikey',description='Get the Review Options for the Annotask')

    @api.marshal_with(review_options)
    @jwt_required()
    def get(self, annotask_id):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.DESIGNER):
            dbm.close_session()
            return api.abort(403, "You need to be {} in order to perform this request.".format(roles.DESIGNER))

        else:
            re = sia.reviewoptions_annotask(dbm, annotask_id, user.idx)
            dbm.close_session()
            return re


#TODO: Check if endpoint can be used by the new Review process and integrate it to it

@namespace.route('/<int:annotask_id>/review')
@api.doc(security='apikey')
class AnnotaskReview(Resource):
    @api.doc(description="Get data for the next annotask review image")
    @jwt_required()
    def post(self, annotask_id):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.DESIGNER):
            dbm.close_session()
            return api.abort(403, "You need to be {} in order to perform this request.".format(roles.DESIGNER))

        data = request.json
        serialized_review_data = self.__review(dbm, annotask_id, user.idx, data)

        return serialized_review_data


    def __review(self, dbm, annotask_id, user_id, data):

        annotask = dbm.get_anno_task(anno_task_id=annotask_id)
        direction = data['direction']
        current_idx = data['imageAnnoId']
        iteration = data['iteration']

        first_annotation = dbm.get_sia_review_first(annotask.idx, iteration)

        # get annotask selected by user or the first one if he didn't select one
        current_annotask_idx = data['annotaskIdx'] if 'annotaskIdx' in data else annotask.idx
        current_annotask = annotask

        if direction == 'first':
            image_anno = first_annotation
        elif direction == 'next':
            # get the next image of the same annotation task
            image_anno = dbm.get_sia_review_next(annotask.idx, current_idx, iteration)
        elif direction == 'previous':
            # get the previous image of the same annotation task
            image_anno = dbm.get_sia_review_prev(current_annotask.idx, current_idx, iteration)
        elif direction == "specificImage":
            image_anno = dbm.get_sia_review_id(annotask_id, current_idx, iteration)

        if not image_anno:
            return 'no annotation found'

        anno_current_image_number, anno_total_image_amount = get_image_progress(dbm, annotask, image_anno.idx, iteration)

        # check if user moved to the first of all images
        is_first_image = False
        if first_annotation.idx == image_anno.idx:
            is_first_image = True

        # check if user moved to the last of all images
        is_last_image = False
        if anno_current_image_number == anno_total_image_amount:
            is_last_image = True

        sia_serialize = SiaSerialize(image_anno, user_id, DATA_URL, is_first_image, is_last_image, anno_current_image_number, anno_total_image_amount)
        json_response = sia_serialize.serialize()

        # add current annotation task index to response
        json_response['current_annotask_idx'] = current_annotask_idx

        return json_response




