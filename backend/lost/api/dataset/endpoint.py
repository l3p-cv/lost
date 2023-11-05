from flask import request
from flask_restx import Resource, fields
from flask_jwt_extended import jwt_required

from lost.api.api import api

namespace = api.namespace('datasets', description='Dataset API')

datasetModelCreate = api.model("DatasetCreate", {
    "name": fields.String(description="Name of the dataset", example="My dataset"),
    "description": fields.String(description="Short description what the dataset is about", example="Dataset containing all the fancy stuff"),
    "datasourceId": fields.Integer(description="ID of the datasource the dataset saves its content to", example="1"),
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
        return [
            {
                "id": 1,
                "name": "Dataset 1",
                "description": "Description for Dataset 1",
                "datasourceId": 1,
                "createdAt": "2023-10-02 12:34:56",
                "children": [
                    {
                        "id": 5,
                        "name": "Dataset 5",
                        "description": "Description for Dataset 5",
                        "datasourceId": 5,
                        "createdAt": "2023-10-02 12:34:56",
                        "children": []
                    },
                    {
                        "id": 6,
                        "name": "Dataset 6",
                        "description": "Description for Dataset 6",
                        "datasourceId": 3,
                        "createdAt": "2023-10-02 12:34:56",
                        "children": [
                            {
                                "id": 10,
                                "name": "Dataset 10",
                                "description": "Description for Dataset 10",
                                "datasourceId": 3,
                                "createdAt": "2023-10-02 12:34:56",
                                "children": [
                                    {
                                        "id": 6,
                                        "name": "Annotask 1",
                                        "description": "Description for Annotask 1",
                                        "datasourceId": 3,
                                        "createdAt": "2023-10-02 12:34:56",
                                        "children": []
                                    }
                                ]
                            }
                        ]
                    },
                ]
            },
            {
                "id": 2,
                "name": "Dataset 2",
                "description": "Description for Dataset 2",
                "datasourceId": 2,
                "createdAt": "2023-10-02 12:34:56",
                "children": []
            },
            {
                "id": 3,
                "name": "Dataset 3",
                "description": "Description for Dataset 3",
                "datasourceId": 1,
                "createdAt": "2023-10-02 12:34:56",
                "children": [
                    {
                        "id": 7,
                        "name": "Dataset 7",
                        "description": "Description for Dataset 7",
                        "datasourceId": 1,
                        "createdAt": "2023-10-02 12:34:56",
                        "children": []
                    }
                ]
            },
            {
                "id": 4,
                "name": "Dataset 4",
                "description": "Description for Dataset 4",
                "datasourceId": 1,
                "createdAt": "2023-10-02 12:34:56",
                "children": []
            },
        ]
        
    @jwt_required
    @api.doc(description="Creates a new dataset.")
    @api.expect(datasetModelCreate)
    @api.response(201, 'success')
    @api.response(400, 'error', errorMessage)
    def put(self):
        print("TODO")
        return ('', 201)
    
    
    @api.doc(description="Updates a single dataset.")
    @api.expect(datasetModelUpdate)
    @api.response(204, 'success')
    @api.response(400, 'error', errorMessage)
    @jwt_required
    def patch(self, id):
        print("TODO")
        print("ID:", id)
        return ('', 204)
