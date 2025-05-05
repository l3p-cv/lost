
from sqlalchemy.exc import IntegrityError
from lost.api.inference_model.api_definition import InferenceModelListResponse, InferenceModelRequest, InferenceModelResponse
from flask_restx import Resource
from lost.db import access
from lost.api.api import api
from lost.settings import LOST_CONFIG
from flask_pydantic import validate
from flask_jwt_extended import jwt_required


namespace = api.namespace('models', description='API to manage inference models')

@namespace.route('')
class InferenceModelList(Resource):
    # @jwt_required
    @validate(response_by_alias=True)
    def get(self) -> InferenceModelListResponse:
        dbm = access.DBMan(LOST_CONFIG)
        models = dbm.get_all_inference_models()
        dbm.close_session()
        models = [
            InferenceModelResponse(
                id=model.idx,
                name=model.name,
                display_name=model.display_name,
                server_url=model.server_url,
                prompts=model.prompts,
                type=model.type,
                last_updated=model.last_updated,
            )
            for model in models
        ]

        return InferenceModelListResponse(models=models)

    @jwt_required
    @validate(response_by_alias=True, body=InferenceModelRequest)
    def post(self, body: InferenceModelRequest):
        dbm = access.DBMan(LOST_CONFIG)
        try:
            model = dbm.create_inference_model(body)
        except IntegrityError as e:
            if 'Duplicate entry' in str(e):
                dbm.close_session()
                return {'message': f'Model with display name "{body.display_name}" already exists'}, 400
            else:
                raise e
        except Exception as e:
            raise e
        model = InferenceModelResponse(
            id=model.idx,
            name=model.name,
            display_name=model.display_name,
            server_url=model.server_url,
            prompts=model.prompts,
            type=model.type,
            last_updated=model.last_updated,
        )
        dbm.close_session()
        return model, 201


@namespace.route('/<int:idx>')
class InferenceModelResource(Resource):
    @jwt_required
    @validate(response_by_alias=True)
    def get(self, idx):
        dbm = access.DBMan(LOST_CONFIG)
        model = dbm.get_inference_model_by_id(idx)
        if model is None:
            return {'message': 'Model not found'}, 404
        model = InferenceModelResponse(
            id=model.idx,
            name=model.name,
            display_name=model.display_name,
            server_url=model.server_url,
            prompts=model.prompts,
            type=model.type,
            last_updated=model.last_updated,
        )
        dbm.close_session()
        return model

    @jwt_required
    @validate(response_by_alias=True, body=InferenceModelRequest)
    def put(self, idx, body: InferenceModelRequest):
        dbm = access.DBMan(LOST_CONFIG)
        try:
            model = dbm.update_inference_model(idx, body)
            if model is None:
                return {'message': 'Model not found'}, 404
        except IntegrityError as e:
            if 'Duplicate entry' in str(e):
                dbm.close_session()
                return {'message': f'Model with display name "{body.display_name}" already exists'}, 400
            else:
                raise e
        except Exception as e:
            raise e
        model = InferenceModelResponse(
            id=model.idx,
            name=model.name,
            display_name=model.display_name,
            server_url=model.server_url,
            prompts=model.prompts,
            type=model.type,
            last_updated=model.last_updated,
        )
        dbm.close_session()
        return model, 200

    @jwt_required
    def delete(self, idx):
        dbm = access.DBMan(LOST_CONFIG)
        dbm.delete_inference_model(idx)
        dbm.close_session()
        
        return {}, 204
