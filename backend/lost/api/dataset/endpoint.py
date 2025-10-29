from flask import jsonify, request, Response
from flask_restx import Resource, fields
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.datastructures import ImmutableMultiDict
from lost.api.api import api
from lost.api.sia.api_definition import annotations, image
from lost.db import access, roles
from lost.logic.jobs.jobs import (
    delete_whole_ds_export,
    export_dataset_parquet,
    get_all_annotask_ids_for_ds,
)
from lost.logic import dask_session
from lost.settings import LOST_CONFIG, DATA_URL
from lost.api.dataset.form_validation import (
    create_validation_error_message,
    CreateDatasetForm,
    UpdateDatasetForm,
)
from lost.db.model import Dataset
from lost.logic.sia import (
    SiaSerialize,
    get_image_progress,
    get_total_image_amount,
)
from lost.logic.file_access import UserFileAccess
import os
from datetime import datetime
import re

namespace = api.namespace("datasets", description="Dataset API")

datasetModelCreate = api.model(
    "DatasetCreate",
    {
        "name": fields.String(description="Name of the dataset", example="My dataset"),
        "description": fields.String(
            description="Short description what the dataset is about",
            example="Dataset containing all the fancy stuff",
        ),
        "datastoreId": fields.Integer(
            description="ID of the datastore the dataset saves its content to",
            example="1",
        ),
    },
)

datasetModelUpdate = api.inherit(
    "DatasetUpdate",
    datasetModelCreate,
    {
        "id": fields.Integer(description="ID of the dataset", example="1"),
    },
)

datasetModel = api.inherit(
    "Dataset",
    datasetModelUpdate,
    {
        "createdAt": fields.DateTime(
            description="timestamp the dataset was created",
            example="2023-11-04 23:55",
        )
    },
)

datasetReviewRequestModel = api.model(
    "DatasetReviewCreate",
    {
        # "image_anno_id": fields.Integer(description="image annotation index", example="1"),
        # "iteration": fields.Integer(description="maximum amount of iterations", example="1"),
        "direction": fields.String(
            description="direction where the user is navigating to (forward/previous)",
            example="first",
        )
    },
)

datasetReviewOptionsModel = api.model(
    "DatasetReviewOptions",
    {
        "max_iterations": fields.Integer(description="maximum amount of iterations", example="1"),
        # "possible_labels": fields.List(description="List of all labels allowed for the annotation process"),
    },
)

datasetImageSearchRequestModel = api.model(
    "DatasetImageSearchRequestModel",
    {
        "query": fields.String(
            description="Query to search for images (e.g. image name)",
            example="ExampleImgName",
        )
    },
)

errorMessage = api.model(
    "ErrorMessage",
    {
        "message": fields.String(
            description="Error message describing what went wrong",
            example="Invalid value in example field",
        )
    },
)

imageWithAnnotation = api.inherit("ImageWithAnnotation", image, {"annotations": annotations})

reviewUpdateAnnotation = api.model(
    "ReviewUpdateAnnotation",
    {
        "annotaskId": fields.Integer(description="ID of the annotation task", example="1"),
        "annotationChanges": imageWithAnnotation,
    },
)


@namespace.route("/")
@namespace.route("")
@api.doc(security="apikey")
class Datasets(Resource):
    @api.doc(description="Lists all available datasets with children and annotation tasks.")
    @api.response(200, "success", [datasetModel])
    @jwt_required()
    def get(self):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.DESIGNER):
            dbm.close_session()
            return (
                "You need to be {} in order to perform this request.".format(roles.DESIGNER),
                401,
            )

        datasets = dbm.get_datasets_with_no_parent()

        # find all children of every dataset (recursively)
        datasets_json = []
        for dataset in datasets:
            newDS = self.__build_dataset_children_tree(dataset)
            datasets_json.append(newDS.to_dict())

        # add all annotasks without a dataset to a meta-dataset
        annotasks_without_dataset = dbm.get_annotasks_without_dataset()
        annotasks_without_dataset_json = []
        for annotask in annotasks_without_dataset:
            annotasks_without_dataset_json.append(annotask.to_dict())

        meta_ds = {
            "isMetaDataset": True,
            "idx": "-1",
            "name": "Annotasks without a Dataset",
            "description": "Meta dataset that contains all annotation tasks that are not assigned to a dataset",
            "datastoreId": None,
            "parentId": None,
            "createdAt": "(meta dataset)",
            "children": annotasks_without_dataset_json,
        }
        datasets_json.append(meta_ds)

        return jsonify(datasets_json)

    def __build_dataset_children_tree(self, dataset):
        """recursive helper method to find all children of a dataset"""

        dataset.is_reviewable = False

        children = dataset.dataset_children

        if len(children) == 0:
            dataset.children = []

        subchildren = []
        for child in children:
            # redo request for children of children
            subchildren.append(self.__build_dataset_children_tree(child))
            if child.is_reviewable:
                dataset.is_reviewable = True

        # add annotask children (annotasks can't have a child)
        annotasks = dataset.annotask_children
        if annotasks is not None:
            for annotask in annotasks:
                dataset.is_reviewable = True
                subchildren.append(annotask)

        dataset.children = subchildren

        return dataset

    @jwt_required()
    @api.doc(description="Creates a new dataset.")
    @api.expect(datasetModelCreate)
    @api.response(201, "success")
    @api.response(400, "error", errorMessage)
    def post(self):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.DESIGNER):
            dbm.close_session()
            return (
                "You need to be {} in order to perform this request.".format(roles.DESIGNER),
                401,
            )

        # convert json input into a format readable by wtforms
        form_input = ImmutableMultiDict(request.json)
        form = CreateDatasetForm(form_input)

        # abort if form validation fails
        if not form.validate():
            errors_str = create_validation_error_message(form)
            return (errors_str, 400)

        # use the safe validated data to create a new DB entry
        data = form.data

        # parent_id = -1 => no parent
        parent_id = data["parentDatasetId"]
        if parent_id == -1:
            parent_id = None

        db_dataset = Dataset(
            name=data["name"],
            description=data["description"],
            parent_dataset_id=parent_id,
            # datastore_id=data['datastoreId']
        )

        dataset_idx = dbm.save_obj_get_idx(db_dataset)

        print(dataset_idx)

        return ({"datasetId": dataset_idx}, 201)

    @api.doc(description="Updates a single dataset.")
    @api.expect(datasetModelUpdate)
    @api.response(204, "success")
    @api.response(400, "error", errorMessage)
    @jwt_required()
    def patch(self):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.DESIGNER):
            dbm.close_session()
            return (
                "You need to be {} in order to perform this request.".format(roles.DESIGNER),
                401,
            )

        # convert json input into a format readable by wtforms
        form_input = ImmutableMultiDict(request.json)
        form = UpdateDatasetForm(form_input)

        # abort if form validation fails
        if not form.validate():
            errors_str = create_validation_error_message(form)
            return (errors_str, 400)

        # use the safe validated data to update the DB entry
        data = form.data
        dataset_id = data["id"]

        db_dataset = dbm.get_dataset(dataset_id)
        db_dataset.name = data["name"]
        db_dataset.description = data["description"]
        # db_dataset.datastore_id = data['datastoreId']

        # parent_id = -1 => no parent
        parent_id = data["parentDatasetId"]
        if parent_id == -1:
            parent_id = None
        else:
            if dataset_id == parent_id:
                return ("Dataset can't have itself as its parent", 400)

            has_valid_parent = self.__check_selected_parent_is_not_in_children(db_dataset, parent_id)

            if not has_valid_parent:
                return (
                    "Chosen parent can't be a child of the current dataset",
                    400,
                )

        db_dataset.parent_id = parent_id

        dbm.save_obj(db_dataset)

        return ("", 204)

    def __check_selected_parent_is_not_in_children(self, dataset, parentId):
        """recursive method to check if the dataset's parent is not one of its children (or grandchildren, ...)"""

        for child in dataset.dataset_children:
            # check if one of the children has the parentId
            if child.idx == parentId:
                return False

            # check if one of the child's children has the parentId
            if self.__check_selected_parent_is_not_in_children(child, parentId) == False:
                return False

        # no children left to check - parent is not a child
        return True


@namespace.route("/<int:dataset_id>")
@api.doc(security="apikey")
class DatasetReview(Resource):
    @api.doc(description="Get data for the next dataset review annotation")
    @api.response(200, "success")
    @jwt_required()
    def delete(self, dataset_id):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.DESIGNER):
            dbm.close_session()
            return (
                "You need to be {} in order to perform this request.".format(roles.DESIGNER),
                401,
            )

        dataset_to_delete = dbm.get_dataset(dataset_id)

        # orphan all child datasets and annotasks
        for child_dataset in dataset_to_delete.dataset_children:
            child_dataset.parent_id = None

        for child_annotask in dataset_to_delete.annotask_children:
            child_annotask.dataset_id = None

        dbm.session.delete(dataset_to_delete)

        # save all changes
        dbm.session.commit()


@namespace.route("/paged/<int:page_index>/<int:page_size>")
@namespace.param("page_index", "Zero-based index of the page.")
@namespace.param("page_size", "Number of elements per page.")
@api.doc(security="apikey")
class DatasetListPaged(Resource):
    @api.doc(security="apikey", description="Get all datasets paged")
    @jwt_required()
    def get(self, page_index, page_size):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.DESIGNER):
            dbm.close_session()
            return "You need to be {} in order to perform this request.".format(roles.DESIGNER), 401
        else:
            ds_no_parent_page, pages = dbm.get_datasets_paged(page_index, page_size)
            datasets_json = []
            for dataset in ds_no_parent_page:
                datasets_json.append(self.__build_dataset_children_tree_dict(dataset))

            # Only add Annotasks without DS for final page
            if page_index + 1 == pages:
                annotasks_without_dataset = dbm.get_annotasks_without_dataset()
                annotasks_without_dataset_json = []
                for annotask in annotasks_without_dataset:
                    annotasks_without_dataset_json.append(annotask.to_dict())
                meta_ds = {
                    "isMetaDataset": True,
                    "idx": "-1",
                    "name": "Annotasks without a Dataset",
                    "description": "Meta dataset that contains all annotation tasks that are not assigned to a dataset",
                    "datastoreId": None,
                    "parentId": None,
                    "createdAt": "(meta dataset)",
                    "children": annotasks_without_dataset_json,
                }
                datasets_json.append(meta_ds)

            return jsonify({"datasets": datasets_json, "pages": pages})

    def __build_dataset_children_tree_dict(self, dataset):
        dataset.is_reviewable = False
        children_dicts = []

        for child in dataset.dataset_children:
            # also check for children of children
            child_dict = self.__build_dataset_children_tree_dict(child)
            if child.is_reviewable:
                dataset.is_reviewable = True
            children_dicts.append(child_dict)

        # add annotask children (annotasks can't have a child)
        for annotask in dataset.annotask_children or []:
            dataset.is_reviewable = True
            children_dicts.append(annotask.to_dict())

        dataset_dict = dataset.to_dict()
        dataset_dict["children"] = children_dicts

        return dataset_dict


@namespace.route("/flat/")
@namespace.route("/flat")
@api.doc(security="apikey")
class DatasetsFlat(Resource):
    @api.doc(description="Lists all available datasets in a flat list.")
    @api.response(200, "success", [datasetModel])
    @jwt_required()
    def get(self):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.DESIGNER):
            dbm.close_session()
            return (
                "You need to be {} in order to perform this request.".format(roles.DESIGNER),
                401,
            )

        datasets = dbm.get_datasets()

        # find all children of every dataset (recursively)
        datasets_json = {}
        for dataset in datasets:
            datasets_json[dataset.idx] = dataset.name

        return jsonify(datasets_json)


@namespace.route("/<int:dataset_id>/review")
@api.doc(security="apikey")
class DatasetReview(Resource):
    @api.doc(description="Get data for the next dataset review annotation")
    @api.expect(datasetReviewRequestModel)
    @api.response(200, "success", [datasetModel])
    @jwt_required()
    def post(self, dataset_id):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.DESIGNER):
            dbm.close_session()
            return (
                "You need to be {} in order to perform this request.".format(roles.DESIGNER),
                401,
            )

        # convert json input into a format readable by wtforms
        # form_input = ImmutableMultiDict(request.json)
        # form = DatasetReviewForm(form_input)

        # # abort if form validation fails
        # if not form.validate():
        #     errors_str = create_validation_error_message(form)
        #     return (errors_str, 400)

        # use the safe validated data to update the DB entry
        # data = form.data

        data = request.json

        serialized_review_data = self.__review(dbm, dataset_id, user.idx, data)

        return serialized_review_data

    def __next_annotask_index(self, annotask_keys, current_index):
        position = annotask_keys.index(current_index)
        position = position + 1
        if position >= len(annotask_keys):
            return None
        next_annotask_idx = annotask_keys[position]
        return next_annotask_idx

    def __prev_annotask_index(self, annotask_keys, current_index):
        position = annotask_keys.index(current_index)
        position = position - 1
        if position < 0:
            return None
        prev_annotask_idx = annotask_keys[position]
        return prev_annotask_idx

    def __get_dataset_children(self, dataset):
        """recursive method to get all children datasets (and their children...) to a dataset"""
        all_dataset_children = []
        direct_children = dataset.dataset_children

        all_dataset_children.extend(direct_children)

        for child in direct_children:
            dataset_children = self.__get_dataset_children(child)
            all_dataset_children.extend(dataset_children)
        return all_dataset_children

    def __generate_annotask_list(self, dbm, dataset_id):
        """create a list with all annotation tasks needed for a given dataset"""

        # create a list with all datasets we need the annotasks of
        dataset = dbm.get_dataset(dataset_id)
        datasets = [dataset]
        dataset_children = self.__get_dataset_children(dataset)
        datasets.extend(dataset_children)

        # combine annotasks from all datasets into one list
        annotasks_list = []
        for dataset in datasets:
            annotasks_list.extend(dataset.annotask_children)

        return annotasks_list

    def __review(self, dbm, dataset_id, user_id, data):
        annotasks_list = self.__generate_annotask_list(dbm, dataset_id)
        annotask_lengths = {}
        annotask_keys = []

        # use annotask idx as key
        annotasks = {}
        # get length of review by summarizing all images
        total_image_amount = 0
        for annotask in annotasks_list:
            annotasks[annotask.idx] = annotask
            annotask_keys.append(annotask.idx)

            annotask_length = get_total_image_amount(dbm, annotask)
            annotask_lengths[annotask.idx] = annotask_length
            total_image_amount = total_image_amount + annotask_length

        direction = data["direction"]
        current_idx = data["imageAnnoId"]
        iteration = data["iteration"]
        is_first_image = False

        first_annotask_key = annotask_keys[0]
        first_annotask = dbm.get_sia_review_first(first_annotask_key, iteration)

        # get annotask selected by user or the first one if he didn't select one
        current_annotask_idx = data["annotaskIdx"] if "annotaskIdx" in data else first_annotask_key
        current_annotask = annotasks[current_annotask_idx]

        if direction == "first":
            image_anno = first_annotask
        elif direction == "next":
            # get progress of current annotation task
            anno_current_image_number, anno_total_image_amount = get_image_progress(
                dbm, annotasks[current_annotask_idx], current_idx, iteration
            )

            # check if current image is the last image of current annotask
            # then we should move to the next annotask
            if anno_current_image_number == anno_total_image_amount:
                # get the next annotation task
                current_annotask_idx = self.__next_annotask_index(annotask_keys, current_annotask_idx)
                current_annotask = annotasks[current_annotask_idx]

                # switch to the first image of the annotask
                image_anno = dbm.get_sia_review_first(current_annotask.idx, iteration)
            else:
                # get the next image of the same annotation task
                image_anno = dbm.get_sia_review_next(current_annotask.idx, current_idx, iteration)
        elif direction == "previous":
            # get progress of current annotation task
            anno_current_image_number, anno_total_image_amount = get_image_progress(
                dbm, annotasks[current_annotask_idx], current_idx, iteration
            )

            # check if current image is the first image of current annotask
            # then we should move to the previous annotask
            if anno_current_image_number == 1:
                # get the previous annotation task
                current_annotask_idx = self.__prev_annotask_index(annotask_keys, current_annotask_idx)
                current_annotask = annotasks[current_annotask_idx]

                # switch to the last image of the annotask
                image_anno = dbm.get_sia_review_last(current_annotask.idx, iteration)

            else:
                # get the previous image of the same annotation task
                image_anno = dbm.get_sia_review_prev(current_annotask.idx, current_idx, iteration)
        elif direction == "specificImage":
            image_anno = dbm.get_sia_review_id(current_annotask_idx, current_idx, iteration)

        if not image_anno:
            return "no annotation found"

        anno_current_image_number, anno_total_image_amount = get_image_progress(
            dbm, annotasks[current_annotask_idx], image_anno.idx, iteration
        )
        current_image_number = anno_current_image_number

        # convert progress of annotask to progress of dataset / all annotasks
        # add the image count of previous annotasks to image number
        prev_annotask_idx = self.__prev_annotask_index(annotask_keys, current_annotask_idx)
        while prev_annotask_idx:
            current_image_number = current_image_number + annotask_lengths[prev_annotask_idx]
            prev_annotask_idx = self.__prev_annotask_index(annotask_keys, prev_annotask_idx)

        # check if user moved to the first of all images
        is_first_image = False
        if first_annotask.idx == image_anno.idx:
            is_first_image = True

        # check if user moved to the last of all images
        is_last_image = False
        if current_image_number == total_image_amount:
            is_last_image = True

        # return image_anno, is_first_image, is_last_image, current_image_number
        sia_serialize = SiaSerialize(
            image_anno,
            user_id,
            DATA_URL,
            is_first_image,
            is_last_image,
            current_image_number,
            total_image_amount,
        )
        json_response = sia_serialize.serialize()

        # add current annotation task index to response
        json_response["current_annotask_idx"] = current_annotask_idx

        return json_response


@namespace.route("/<int:dataset_id>/review/images")
@api.doc(security="apikey")
class DatasetReviewImageSearch(Resource):
    @api.doc(description="Get data for the next dataset review annotation")
    @api.param("filter", "String to search for")
    @api.param("labels", "String to search for")
    # @api.expect(datasetImageSearchRequestModel)
    @api.response(200, "success", [datasetModel])
    @jwt_required()
    def get(self, dataset_id):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.DESIGNER):
            dbm.close_session()
            return api.abort(403, "You need to be {} in order to perform this request.".format(roles.DESIGNER))

        # data = request.json
        # search_str = data['filter']
        search_str = request.args.get("filter")
        labels = request.args.get("labels")

        anno_task_ids = get_all_annotask_ids_for_ds(dbm, dataset_id)
        db_result = dbm.get_search_images_in_annotask_list(anno_task_ids, search_str)

        found_image_ids: list[int] = []
        found_images: list[dict[str, any]] = []

        for entry in db_result:
            # prepare list of image ids for label filter (we can't iterate multiple times through db_result)
            found_image_ids.append(entry.idx)

            # prepare list for response
            found_images.append({
                "imageId": entry.idx,
                "imageName": entry.img_path,
                "annotationId": entry.anno_task_id,
                "annotationName": entry.name,
            })

        # filter for images annotated with specific labels if labels are in the request
        if labels is not None:
            if labels == "":
                search_labels = []
            else:
                search_labels = list(map(int, labels.split(",")))  # TODO: error here if empty

            # no labels -> all images in task
            if len(search_labels) == 0:
                pass
            else:
                # found_image_ids = [entry.idx for entry in db_result]
                img_with_label_db_result = dbm.get_all_images_with_labels(found_image_ids, search_labels)
                img_ids_with_label = [entry.img_anno_id for entry in img_with_label_db_result]

                # filter original response list: only select images that have one of the searched labels
                found_img_with_label = [img for img in found_images if img["imageId"] in img_ids_with_label]

                # replace list with label filtered list
                found_images = found_img_with_label

        return {"images": found_images}


@namespace.route("/<int:dataset_id>/review/possibleLabels")
@api.doc(security="apikey")
class DatasetReviewImageSearch(Resource):
    @api.doc(description="Get all possible labels for a dataset")
    @api.response(200, "success", [])
    @jwt_required()
    def get(self, dataset_id):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.DESIGNER):
            dbm.close_session()
            return (
                "You need to be {} in order to perform this request.".format(roles.DESIGNER),
                401,
            )

        anno_task_ids = get_all_annotask_ids_for_ds(dbm, dataset_id)
        db_result = dbm.get_all_annotask_labels(anno_task_ids)

        labels = []
        for entry in db_result:
            labels.append({
                "id": entry.idx,
                "name": entry.name,
                "color": entry.color,
            })

        return labels


@namespace.route("/export_ds_parquet/<int:dataset_id>")
@api.doc(security="apikey")
class DatasetParquetExport(Resource):
    @api.doc(description="Export dataset as parquet to a given file system")
    @jwt_required()
    def post(self, dataset_id):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.DESIGNER):
            dbm.close_session()
            return (
                "You need to be {} in order to perform this request.".format(roles.DESIGNER),
                401,
            )
        data = request.json

        dataset = dbm.get_dataset(dataset_id)
        if dataset is None:
            dbm.close_session()
            return f"Dataset with id {dataset_id} not found", 404

        if "store_path" in data:
            path = data["store_path"]
        else:
            fs_db = dbm.get_user_default_fs(user.idx)
            ufa = UserFileAccess(dbm, user, fs_db)
            path = ufa.get_whole_export_ds_path()
            file_name = re.sub(r"\W+", "_", dataset.name).lower()
            path = os.path.join(path, f"{file_name}_{dataset_id}_{datetime.now().strftime('%Y%m%d%H%M%S')}.parquet")

        if "fs_id" in data:
            fs_id = int(data["fs_id"])
        else:
            fs_id = dbm.get_fs(name=user.user_name).idx

        annotated_only = True
        if "annotated_only" in data:
            annotated_only = data["annotated_only"]
        client = dask_session.get_client(user)
        client.submit(
            export_dataset_parquet,
            identity,
            path,
            fs_id,
            dataset_id,
            annotated_only,
            workers=LOST_CONFIG.worker_name,
        )
        dask_session.close_client(user, client)
        dbm.close_session()
        return "success", 200


@namespace.route("/<int:dataset_id>/ds_exports")
class DatasetExports(Resource):
    @api.doc(description="Get all exports of a dataset")
    @jwt_required()
    def get(self, dataset_id):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.DESIGNER):
            dbm.close_session()
            return (
                "You need to be {} in order to perform this request.".format(roles.DESIGNER),
                401,
            )
        exports = dbm.get_all_dataset_exports_by_dataset_id(dataset_id)
        exports_json = []
        for export in exports:
            exports_json.append({
                "id": export.idx,
                "datasetId": export.dataset_id,
                "filePath": export.file_path,
                "progress": export.progress,
            })
        return jsonify({"exports": exports_json})


@namespace.route("/ds_exports/<int:export_id>")
class DatasetExport(Resource):
    @api.doc(description="Delete a single export of a dataset")
    @jwt_required()
    def delete(self, export_id):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.DESIGNER):
            dbm.close_session()
            return (
                "You need to be {} in order to perform this request.".format(roles.DESIGNER),
                401,
            )
        export = dbm.get_dataset_export_by_id(export_id)
        if export is not None:
            delete_whole_ds_export(export.file_path, user.idx)
            dbm.delete_dataset_export(export.idx)
        dbm.close_session()
        return "success", 200

    @api.doc(description="Download a single export of a dataset")
    @jwt_required()
    def get(self, export_id):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.DESIGNER):
            dbm.close_session()
            return (
                "You need to be {} in order to perform this request.".format(roles.DESIGNER),
                401,
            )
        export = dbm.get_dataset_export_by_id(export_id)
        fs_db = dbm.get_user_default_fs(user.idx)
        ufa = UserFileAccess(dbm, user, fs_db)

        my_file = ufa.load_file(export.file_path)
        export_name = os.path.basename(export.file_path)

        response = Response(my_file, content_type="application/octet-stream")
        response.headers["Content-Disposition"] = f"attachment; filename={export_name}"
        dbm.close_session()
        return response
