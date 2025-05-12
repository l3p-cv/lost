import flask
import tritonclient.grpc as grpcclient
from tritonclient.utils import InferenceServerException


class TritonService:
    def __init__(self, url: str):
        """
        Initialize the TritonService with the Triton server URL.
        """
        self.url = url
        self._client = None

    def get_triton_client(self):
        """
        Initialize and return the Triton gRPC client.
        """
        if self._client is None:
            try:
                self._client = grpcclient.InferenceServerClient(url=self.url)
                flask.current_app.logger.info(f"Connected to Triton server at {self.url}")
            except Exception as e:
                raise ConnectionError(f"Failed to connect to Triton server: {str(e)}")
        return self._client

    def get_available_models(self):
        """
        Return a list of available models on the Triton server.
        """
        client = self.get_triton_client()
        try:
            metadata = client.get_model_repository_index()
            return [model.name for model in metadata.models]
        except InferenceServerException as e:
            raise RuntimeError(f"Failed to fetch model list: {str(e)}")

    def check_server_liveness(self):
        """
        Check whether the Triton server is live.
        """
        client = self.get_triton_client()
        try:
            return client.is_server_live()
        except InferenceServerException as e:
            raise RuntimeError(f"Server liveness check failed: {str(e)}")
