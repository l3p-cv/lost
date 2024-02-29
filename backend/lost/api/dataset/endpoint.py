from flask import jsonify, request
from flask_restx import Resource, fields
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.datastructures import ImmutableMultiDict
import json

from lost.api.api import api
from lost.api.sia.api_definition import annotations, image
from lost.db import access, roles
from lost.logic import sia
from lost.settings import LOST_CONFIG, DATA_URL
from lost.api.dataset.form_validation import create_validation_error_message, CreateDatasetForm, DatasetReviewForm, UpdateDatasetForm
from lost.db.model import Dataset
from lost.logic.sia import SiaSerialize, get_image_progress, get_total_image_amount

namespace = api.namespace('datasets', description='Dataset API')

datasetModelCreate = api.model("DatasetCreate", {
    "name": fields.String(description="Name of the dataset", example="My dataset"),
    "description": fields.String(description="Short description what the dataset is about", example="Dataset containing all the fancy stuff"),
    "datastoreId": fields.Integer(description="ID of the datastore the dataset saves its content to", example="1"),
})

datasetModelUpdate = api.inherit('DatasetUpdate', datasetModelCreate, {
    "id": fields.Integer(description="ID of the dataset", example="1"),
})

datasetModel = api.inherit('Dataset', datasetModelUpdate, {
    "createdAt": fields.DateTime(description="timestamp the dataset was created", example="2023-11-04 23:55")
})

datasetReviewRequestModel = api.model("DatasetReviewCreate", {
    # "image_anno_id": fields.Integer(description="image annotation index", example="1"),
    # "iteration": fields.Integer(description="maximum amount of iterations", example="1"),
    "direction": fields.String(description="direction where the user is navigating to (forward/previous)", example="first")
})

datasetReviewOptionsModel = api.model("DatasetReviewOptions", {
    "max_iterations": fields.Integer(description="maximum amount of iterations", example="1"),
    # "possible_labels": fields.List(description="List of all labels allowed for the annotation process"),
})

datasetImageSearchRequestModel = api.model("DatasetImageSearchRequestModel", {
    "query": fields.String(description="Query to search for images (e.g. image name)", example="ExampleImgName")
})

errorMessage = api.model("ErrorMessage", {
    "message": fields.String(description="Error message describing what went wrong", example="Invalid value in example field")
})

imageWithAnnotation = api.inherit("ImageWithAnnotation", image, {
    "annotations": annotations
})

reviewUpdateAnnotation = api.model("ReviewUpdateAnnotation", {
    "annotaskId": fields.Integer(description="ID of the annotation task", example="1"),
    "annotationChanges": imageWithAnnotation
})

@namespace.route('/')
@namespace.route('')
@api.doc(security='apikey')
class Datasets(Resource):
    @api.doc(description="Lists all available datasets with children and annotation tasks.")
    @api.response(200, 'success', [datasetModel])
    @jwt_required
    def get(self):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.DESIGNER):
            dbm.close_session()
            return "You need to be {} in order to perform this request.".format(roles.DESIGNER), 401
        
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
            'isMetaDataset': True,
            'idx': "-1",
            'name': "Annotasks without a Dataset",
            'description': "Meta dataset that contains all annotation tasks that are not assigned to a dataset",
            'datastoreId': None,
            'parentId': None,
            'createdAt': '(meta dataset)',
            'children': annotasks_without_dataset_json
        }
        datasets_json.append(meta_ds)
        
        return jsonify(datasets_json)

    
    def __build_dataset_children_tree(self, dataset):
        ''' recursive helper method to find all children of a dataset
        '''
        
        dataset.is_reviewable = False
        
        children = dataset.dataset_children
        
        if(len(children) == 0):
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

    @jwt_required
    @api.doc(description="Creates a new dataset.")
    @api.expect(datasetModelCreate)
    @api.response(201, 'success')
    @api.response(400, 'error', errorMessage)
    def post(self):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.DESIGNER):
            dbm.close_session()
            return "You need to be {} in order to perform this request.".format(roles.DESIGNER), 401

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
        parent_id = data['parentDatasetId']
        if parent_id == -1:
            parent_id = None
        
        db_dataset = Dataset(
            name=data['name'],
            description=data['description'],
            parent_dataset_id = parent_id
            # datastore_id=data['datastoreId']
        )
        
        dataset_idx = dbm.save_obj_get_idx(db_dataset)
        
        print(dataset_idx)

        return ({"datasetId": dataset_idx}, 201)

  
    @api.doc(description="Updates a single dataset.")
    @api.expect(datasetModelUpdate)
    @api.response(204, 'success')
    @api.response(400, 'error', errorMessage)
    @jwt_required
    def patch(self):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.DESIGNER):
            dbm.close_session()
            return "You need to be {} in order to perform this request.".format(roles.DESIGNER), 401

        # convert json input into a format readable by wtforms
        form_input = ImmutableMultiDict(request.json)
        form = UpdateDatasetForm(form_input)
        
        # abort if form validation fails
        if not form.validate():
            errors_str = create_validation_error_message(form)
            return (errors_str, 400)

        # use the safe validated data to update the DB entry        
        data = form.data
        dataset_id = data['id']
        
        db_dataset = dbm.get_dataset(dataset_id)
        db_dataset.name = data['name']
        db_dataset.description = data['description']
        # db_dataset.datastore_id = data['datastoreId']
        
        # parent_id = -1 => no parent
        parent_id = data['parentDatasetId']
        if parent_id == -1:
            parent_id = None
        else:
            if dataset_id == parent_id:
                return ("Dataset can't have itself as its parent", 400)
            
            has_valid_parent = self.__check_selected_parent_is_not_in_children(db_dataset, parent_id)
            
            if not has_valid_parent:
                return ("Chosen parent can't be a child of the current dataset", 400)
            
            
        db_dataset.parent_id = parent_id

        dbm.save_obj(db_dataset)

        return ('', 204)
    
    def __check_selected_parent_is_not_in_children(self, dataset, parentId):
        """ recursive method to check if the dataset's parent is not one of its children (or grandchildren, ...)
        """

        for child in dataset.dataset_children:
            # check if one of the children has the parentId
            if child.idx == parentId:
                return False
            
            # check if one of the child's children has the parentId
            if self.__check_selected_parent_is_not_in_children(child, parentId) == False:
                return False
        
        # no children left to check - parent is not a child
        return True
    
@namespace.route('/<int:dataset_id>')
@api.doc(security='apikey')
class DatasetReview(Resource):
    @api.doc(description="Get data for the next dataset review annotation")
    @api.response(200, 'success')
    @jwt_required
    def delete(self, dataset_id):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.DESIGNER):
            dbm.close_session()
            return "You need to be {} in order to perform this request.".format(roles.DESIGNER), 401

        dataset_to_delete = dbm.get_dataset(dataset_id)
        
        # orphan all child datasets and annotasks
        for child_dataset in dataset_to_delete.dataset_children:
            child_dataset.parent_id = None

        for child_annotask in dataset_to_delete.annotask_children:
            child_annotask.dataset_id = None
        
        dbm.session.delete(dataset_to_delete)  
        
        # save all changes
        dbm.session.commit()

@namespace.route('/flat/')
@namespace.route('/flat')
@api.doc(security='apikey')
class DatasetsFlat(Resource):
    @api.doc(description="Lists all available datasets in a flat list.")
    @api.response(200, 'success', [datasetModel])
    @jwt_required
    def get(self):        
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.DESIGNER):
            dbm.close_session()
            return "You need to be {} in order to perform this request.".format(roles.DESIGNER), 401

        datasets = dbm.get_datasets()
        
        # find all children of every dataset (recursively)
        datasets_json = {}
        for dataset in datasets:
            datasets_json[dataset.idx] = dataset.name
        
        return jsonify(datasets_json)


@namespace.route('/<int:dataset_id>/review')
@api.doc(security='apikey')
class DatasetReview(Resource):
    @api.doc(description="Get data for the next dataset review annotation")
    @api.expect(datasetReviewRequestModel)
    @api.response(200, 'success', [datasetModel])
    @jwt_required
    def post(self, dataset_id):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.DESIGNER):
            dbm.close_session()
            return "You need to be {} in order to perform this request.".format(roles.DESIGNER), 401
        
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
        if position >= len(annotask_keys): return None
        next_annotask_idx = annotask_keys[position]
        return next_annotask_idx
    

    def __prev_annotask_index(self, annotask_keys, current_index):
        position = annotask_keys.index(current_index)
        position = position - 1
        if position < 0: return None
        prev_annotask_idx = annotask_keys[position]
        return prev_annotask_idx


    def __get_dataset_children(self,  dataset):
        """recursive method to get all children datasets (and their children...) to a dataset
        """
        all_dataset_children = []
        direct_children = dataset.dataset_children
        
        all_dataset_children.extend(direct_children)

        for child in direct_children:
            dataset_children = self.__get_dataset_children(child)
            all_dataset_children.extend(dataset_children)
        return all_dataset_children
    
    
    def __generate_annotask_list(self, dbm, dataset_id):
        """create a list with all annotation tasks needed for a given dataset
        """

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
        
        direction = data['direction']
        current_idx = data['imageAnnoId']
        iteration = data['iteration']
        is_first_image = False
        
        first_annotask_key = annotask_keys[0]
        first_annotask = dbm.get_sia_review_first(first_annotask_key, iteration)
        
        # get annotask selected by user or the first one if he didn't select one
        current_annotask_idx = data['annotaskIdx'] if 'annotaskIdx' in data else first_annotask_key
        current_annotask = annotasks[current_annotask_idx]

        if direction == 'first':
            image_anno = first_annotask
        elif direction == 'next':
            # get progress of current annotation task
            anno_current_image_number, anno_total_image_amount = get_image_progress(dbm, annotasks[current_annotask_idx], current_idx, iteration)
        
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
        elif direction == 'previous':
            # get progress of current annotation task
            anno_current_image_number, anno_total_image_amount = get_image_progress(dbm, annotasks[current_annotask_idx], current_idx, iteration)
            
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
            return 'no annotation found'
        
        anno_current_image_number, anno_total_image_amount = get_image_progress(dbm, annotasks[current_annotask_idx], image_anno.idx, iteration)
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

        #return image_anno, is_first_image, is_last_image, current_image_number
        sia_serialize = SiaSerialize(image_anno, user_id, DATA_URL, is_first_image, is_last_image, current_image_number, total_image_amount)
        json_response = sia_serialize.serialize()
        
        # add current annotation task index to response
        json_response['current_annotask_idx'] = current_annotask_idx

        return json_response


@namespace.route('/<int:dataset_id>/review/searchImage')
@api.doc(security='apikey')
class DatasetReviewImageSearch(Resource):
    @api.doc(description="Get data for the next dataset review annotation")
    @api.expect(datasetImageSearchRequestModel)
    @api.response(200, 'success', [datasetModel])
    @jwt_required
    def post(self, dataset_id):
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)
        if not user.has_role(roles.DESIGNER):
            dbm.close_session()
            return "You need to be {} in order to perform this request.".format(roles.DESIGNER), 401
        
        data = request.json
        search_str = data['filter']

        db_result = dbm.get_search_images_in_dataset(dataset_id, search_str)
        
        found_images = []
        
        for entry in db_result:
            found_images.append({
                'imageId': entry.idx,
                'imageName': entry.img_path,
                'annotationId': entry.anno_task_id,
                'annotationName': entry.name
            })
        
        return found_images
