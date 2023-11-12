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

datasetReviewRequestModel = api.model("DatasetReviewCreate", {
    # "image_anno_id": fields.Integer(description="image annotation index", example="1"),
    # "iteration": fields.Integer(description="maximum amount of iterations", example="1"),
    "direction": fields.String(description="direction where the user is navigating to (forward/previous)", example="first")
})

datasetReviewOptionsModel = api.model("DatasetReviewOptions", {
    "max_iterations": fields.Integer(description="maximum amount of iterations", example="1"),
    # "possible_labels": fields.List(description="List of all labels allowed for the annotation process"),
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


@namespace.route('/<int:dataset_id>/review')
@api.doc(security='apikey')
class DatasetReview(Resource):
    @api.doc(description="Get data for the next dataset review annotation")
    @api.expect(datasetReviewRequestModel)
    @api.response(200, 'success', [datasetModel])
    @jwt_required
    def post(self, dataset_id):
        
        # dbm = access.DBMan(LOST_CONFIG)
        # datasets = dbm.get_datasets_with_no_parent()
        
        
        # find all children of every dataset (recursively)
        # datasets_json = []
        # for dataset in datasets:
        #     newDS = self.__build_dataset_children_tree(dataset)
        #     datasets_json.append(newDS.to_dict())
        
        # return jsonify(datasets_json)
    
        return {
            "image": {
                "id": 106,
                "url": "//home/lost/data/1/media/images/10_voc2012/2008_006623.jpg",
                "isFirst": True,
                "isLast": False,
                "number": 1,
                "amount": 10,
                "isJunk": None,
                "annoTime": None,
                "description": None,
                "imgActions": [],
                "labelIds": []
            },
            "annotations": {
                "bBoxes": [],
                "points": [],
                "lines": [],
                "polygons": []
            }
        }

    
    
@namespace.route('/<int:dataset_id>/reviewOptions')
@api.doc(security='apikey')
class DatasetReviewOptions(Resource):
    @api.doc(description="Create a new review process.")
    @api.response(200, 'success', [datasetReviewOptionsModel])
    @jwt_required
    def get(self, dataset_id):
        
        # dbm = access.DBMan(LOST_CONFIG)
        # datasets = dbm.get_datasets_with_no_parent()
        
        return {
            "max_iteration": 0,
            "possible_labels": [
                {
                "id": 2,
                "label": "Aeroplane",
                "nameAndClass": "Aeroplane (VOC2012)",
                "description": "Includes gliders but not hang gliders or helicopters",
                "color": "#46aed7"
                },
                {
                "id": 3,
                "label": "Bicycle",
                "nameAndClass": "Bicycle (VOC2012)",
                "description": "Includes tricycles, unicycles",
                "color": "#e28f81"
                },
                {
                "id": 4,
                "label": "Bird",
                "nameAndClass": "Bird (VOC2012)",
                "description": "All birds",
                "color": "#50b897"
                },
                {
                "id": 5,
                "label": "Boat",
                "nameAndClass": "Boat (VOC2012)",
                "description": "Ships, rowing boats, pedaloes but not jet skis",
                "color": "#88712f"
                },
                {
                "id": 6,
                "label": "Bottle",
                "nameAndClass": "Bottle (VOC2012)",
                "description": "Plastic, glass or feeding bottles",
                "color": "#9cb067"
                },
                {
                "id": 7,
                "label": "Bus",
                "nameAndClass": "Bus (VOC2012)",
                "description": "Includes minibus but not trams",
                "color": "#a4527d"
                },
                {
                "id": 8,
                "label": "Car",
                "nameAndClass": "Car (VOC2012)",
                "description": "Includes cars, vans, large family cars for 6-8 people etc.\nExcludes go-carts, tractors, emergency vehicles, lorries/trucks etc.\nDo not label where only the vehicle interior is shown.\nInclude toys that look just like real cars, but not 'cartoony' toys.",
                "color": "#a55046"
                },
                {
                "id": 9,
                "label": "Cat",
                "nameAndClass": "Cat (VOC2012)",
                "description": "Domestic cats (not lions etc.)",
                "color": "#6e90da"
                },
                {
                "id": 10,
                "label": "Chair",
                "nameAndClass": "Chair (VOC2012)",
                "description": "Includes armchairs, deckchairs but not stools or benches.\nExcludes seats in buses, cars etc.\nExcludes wheelchairs.",
                "color": "#487b3b"
                },
                {
                "id": 11,
                "label": "Cow",
                "nameAndClass": "Cow (VOC2012)",
                "description": "All cows",
                "color": "#6360a7"
                },
                {
                "id": 12,
                "label": "Dining table",
                "nameAndClass": "Dining table (VOC2012)",
                "description": "Only tables for eating at.\nNot coffee tables, desks, side tables or picnic benches",
                "color": "#cd8fd3"
                },
                {
                "id": 13,
                "label": "Dog",
                "nameAndClass": "Dog (VOC2012)",
                "description": "Domestic dogs (not wolves etc.)",
                "color": "#d5a442"
                },
                {
                "id": 14,
                "label": "Horse",
                "nameAndClass": "Horse (VOC2012)",
                "description": "Includes ponies, donkeys, mules etc.",
                "color": "#cf7635"
                },
                {
                "id": 15,
                "label": "Motorbike",
                "nameAndClass": "Motorbike (VOC2012)",
                "description": "Includes mopeds, scooters, sidecars",
                "color": "#da4971"
                },
                {
                "id": 16,
                "label": "Person",
                "nameAndClass": "Person (VOC2012)",
                "description": "Includes babies, faces (i.e. truncated people)",
                "color": "#a4b137"
                },
                {
                "id": 17,
                "label": "Potted plant",
                "nameAndClass": "Potted plant (VOC2012)",
                "description": "Indoor plants excluding flowers in vases, or outdoor plants clearly in a pot. ",
                "color": "#d44da4"
                },
                {
                "id": 18,
                "label": "Sheep",
                "nameAndClass": "Sheep (VOC2012)",
                "description": "Sheep, not goats",
                "color": "#aa54be"
                },
                {
                "id": 19,
                "label": "Sofa",
                "nameAndClass": "Sofa (VOC2012)",
                "description": "Excludes sofas made up as sofa-beds",
                "color": "#5ab74d"
                },
                {
                "id": 20,
                "label": "Train",
                "nameAndClass": "Train (VOC2012)",
                "description": "Includes train carriages, excludes trams",
                "color": "#7166d9"
                },
                {
                "id": 21,
                "label": "TV/monitor",
                "nameAndClass": "TV/monitor (VOC2012)",
                "description": "Standalone screens (not laptops), not advertising displays",
                "color": "#d14734"
                }
            ]
        }