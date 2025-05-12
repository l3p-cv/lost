from api.triton.api_definition import TritonModelListResponse, TritonModelsQuery
from api.triton.triton_service import TritonService
from lost.api.api import api
from flask_restx import Resource
from flask_pydantic import validate

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