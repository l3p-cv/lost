from flask import jsonify, request
from flask_restx import Resource, fields
from flask_jwt_extended import jwt_required
from werkzeug.datastructures import ImmutableMultiDict

from lost.api.api import api
from lost.db import access
from lost.settings import LOST_CONFIG
from lost.api.dataset.form_validation import CreateDatasetForm, UpdateDatasetForm
from lost.db.model import Dataset

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

errorMessage = api.model("ErrorMessage", {
    "message": fields.String(description="Error message describing what went wrong", example="Invalid value in example field")
})


@namespace.route('/')
@namespace.route('')
@api.doc(security='apikey')
class Datasets(Resource):
    @api.doc(description="Lists all available datasets.")
    @api.response(200, 'success', [datasetModel])
    @jwt_required
    def get(self):
        
        dbm = access.DBMan(LOST_CONFIG)
        datasets = dbm.get_datasets_with_no_parent()
        
        
        # find all children of every dataset (recursively)
        datasets_json = []
        for dataset in datasets:
            newDS = self.__build_dataset_children_tree(dataset)
            datasets_json.append(newDS.to_dict())
        
        return jsonify(datasets_json)

    
    def __build_dataset_children_tree(self, dataset):
        ''' recursive helper method to find all children of a dataset
        '''
        
        children = dataset.dataset_children
        
        if(len(children) == 0):
            dataset.children = []
            return dataset
        
        subchildren = []
        for child in children:
            # redo request for children of children
            subchildren.append(self.__build_dataset_children_tree(child))
            
        # add annotask children (annotasks can't have a child)
        annotasks = dataset.annotask_children
        if annotasks is not None:
            for annotask in annotasks:
                subchildren.append(annotask)
        
        dataset.children = subchildren
        
        return dataset
    
    def __create_validation_error_message(self, form):
        """Creates a error message string out of a failed wtform
        """
        error_fields = form.errors.items()
        error_msgs = ""
        
        # go through all errors from all fields
        for field in error_fields:
            errors = field[1]
            for error in errors:
                # combine all errors into a single string
                error_msg = f'Error in field {field[0]}: {error}'
                error_msgs = error_msgs + error_msg

        return error_msgs


    @jwt_required
    @api.doc(description="Creates a new dataset.")
    @api.expect(datasetModelCreate)
    @api.response(201, 'success')
    @api.response(400, 'error', errorMessage)
    def post(self):
        dbm = access.DBMan(LOST_CONFIG)

        # convert json input into a format readable by wtforms
        form_input = ImmutableMultiDict(request.json)
        form = CreateDatasetForm(form_input)
        
        # abort if form validation fails
        if not form.validate():
            errors_str = self.__create_validation_error_message(form)
            return (errors_str, 400)

        # use the safe validated data to create a new DB entry        
        data = form.data
        db_dataset = Dataset(
            name=data['name'],
            description=data['description'],
            datastore_id=data['datastoreId']
        )
        dbm.save_obj(db_dataset)

        return ('', 201)

  
    @api.doc(description="Updates a single dataset.")
    @api.expect(datasetModelUpdate)
    @api.response(204, 'success')
    @api.response(400, 'error', errorMessage)
    @jwt_required
    def patch(self):
        dbm = access.DBMan(LOST_CONFIG)

        # convert json input into a format readable by wtforms
        form_input = ImmutableMultiDict(request.json)
        form = UpdateDatasetForm(form_input)
        
        # abort if form validation fails
        if not form.validate():
            errors_str = self.__create_validation_error_message(form)
            return (errors_str, 400)

        # use the safe validated data to update the DB entry        
        data = form.data
        dataset_id = data['id']
        
        db_dataset = dbm.get_dataset(dataset_id)
        db_dataset.name = data['name']
        db_dataset.description = data['description']
        db_dataset.datastore_id = data['datastoreId']
        dbm.save_obj(db_dataset)

        return ('', 204)
