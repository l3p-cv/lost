from api.triton.api_definition import TritonInferenceRequest, TritonModelListResponse, TritonModelsQuery
from api.triton.triton_service import TritonService
from lost.logic.file_access import UserFileAccess
from lost.api.api import api
from flask_restx import Resource
from flask_pydantic import validate
from flask_jwt_extended import jwt_required, get_jwt_identity
from lost.settings import LOST_CONFIG
from lost.db import access
from lost.logic import dask_session


namespace = api.namespace('triton', description='API to interact with triton server')


@namespace.route('/models')
class TritonModelList(Resource):
    """
    API endpoint to list all models available on the Triton server.
    """
    # @jwt_required
    @validate(response_by_alias=True, query=TritonModelsQuery)
    def get(self, query: TritonModelsQuery) -> TritonModelListResponse:
        """
        Get a list of all models available on the Triton server.
        """
        triton_service = TritonService(query.server_url)
        models = triton_service.get_available_models()
        return TritonModelListResponse(models=models)


@namespace.route('/liveness')
class TritonServerLiveness(Resource):
    """
    API endpoint to check the liveness of the Triton server.
    """
    # @jwt_required
    @validate(response_by_alias=True, query=TritonModelsQuery)
    def get(self, query: TritonModelsQuery) -> dict:
        """
        Check if the Triton server is live.
        """
        triton_service = TritonService(query.server_url)
        is_live = triton_service.check_server_liveness()
        return {'isLive': is_live}


def load_img(db_img, ufa, user):
    if LOST_CONFIG.worker_management != 'dynamic':
        # need to execute ls for s3fs (don't know why)
        try:
            ufa.fs.ls(db_img.img_path)
        except:
            pass
        img = ufa.load_anno_img(db_img)
    else:
        # TODO: Use UserFileAccess to load image
        img = dask_session.ds_man.read_fs_img(user, db_img.fs, db_img.img_path)
    return img


@namespace.route('/infer')
class TritonModelInfer(Resource):
    # Note: Using POST method for inference since it may involve sending a large payload and
    # the response is not idempotent.
    """
    API endpoint to perform inference using a specific model on the Triton server.
    """
    @jwt_required
    @validate(response_by_alias=True, body=TritonInferenceRequest)
    def post(self, body: TritonInferenceRequest):
        """
        Perform inference using a specific model on the Triton server.
        """
        dbm = access.DBMan(LOST_CONFIG)
        identity = get_jwt_identity()
        user = dbm.get_user_by_id(identity)

        # get image from the database
        db_img = dbm.get_image_anno(body.image_id)
        ufa = UserFileAccess(dbm, user, db_img.fs)
        img = load_img(db_img, ufa, user)

        # get model server url
        inference_model = dbm.get_inference_model_by_id(body.model_id)
        if inference_model is None:
            return {'message': f'Inference Model with id {body.model_id} not found'}, 404
        
        triton_service = TritonService(inference_model.server_url)
        # try:
            # Perform inference
        triton_service.infer(image=img, model=inference_model, inference_request=body, user_id=user.idx, dbm=dbm)
        # except Exception as e:
        #     return {'message': f'Inference failed: {str(e)}'}, 500
        # finally:
        dbm.close_session()

        return {
            'message': 'Inferred annotations saved successfully'
        }