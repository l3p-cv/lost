from flask import request
from flask_restx import Resource
from flask_jwt_extended import jwt_required

from lost.api.api import api

namespace = api.namespace('datasets', description='Dataset API')


@namespace.route('/')
@namespace.route('')
class Datasets(Resource):
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
                        "datasourceId": 1,
                        "createdAt": "2023-10-02 12:34:56",
                        "children": []
                    },
                    {
                        "id": 6,
                        "name": "Dataset 6",
                        "description": "Description for Dataset 6",
                        "datasourceId": 1,
                        "createdAt": "2023-10-02 12:34:56",
                        "children": []
                    },
                ]
            },
            {
                "id": 2,
                "name": "Dataset 2",
                "description": "Description for Dataset 2",
                "datasourceId": 1,
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
    def put(self):
        print("TODO")
        return ('', 201)


@namespace.route('/<int:id>')
class Dataset(Resource):
    @jwt_required
    def patch(self, id):
        print("TODO")
        print("ID:", id)
        return ('', 204)
