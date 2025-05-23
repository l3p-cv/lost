import flask
import tritonclient.grpc as grpcclient
from tritonclient.utils import InferenceServerException

from api.inference_model.api_definition import InferenceModelTaskType, InferenceModelType
from api.triton.api_definition import TritonInferenceRequest
import numpy as np
import uuid
from datetime import datetime, timezone

from db import dtype
from db.model import InferenceModel
from lost.logic import sia


def process_detection(detection, img_height, img_width, img_id, labels):
    x, y, w, h, conf, class_id = detection
    x = int(x) # top left x
    y = int(y) # top left y
    w = int(w)
    h = int(h)
    class_id = int(class_id)
    
    # processed box
    box = {
        "x": (x + (w / 2)) / img_width,
        "y": (y + (h / 2)) / img_height,
        "w": w / img_width,
        "h": h / img_height,
    }

    lost_class = next((item for item in labels["labels"] if int(item.get("externalId")) == class_id), None)


    return {
        "anno": {
            "id": f"new{uuid.uuid4().int}",
            "type": dtype.TwoDAnno.TYPE_TO_STR[dtype.TwoDAnno.BBOX],
            "data": box,
            "mode": "view",
            "status": "new",
            "labelIds": [lost_class['id']] if lost_class else [],
            "selectedNode": 2,
            "annoTime": 0,
            "timestamp": datetime.now(timezone.utc).timestamp() * 1000
        },
        "img": {
            "imgActions": [],
            "imgId": img_id,
            "annoTime": 0,
        },
        "action": "annoCreated"
    }



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

    def infer(self, image:np.ndarray, model: InferenceModel, inference_request: TritonInferenceRequest, user_id, dbm):
        """
        Perform inference using a specific model on the Triton server.
        """
        client = self.get_triton_client()

        labels = sia.get_label_trees(dbm, user_id)

        if model.model_type == InferenceModelType.YOLO:
            image = image.astype(np.float32)
            input = grpcclient.InferInput("img", image.shape, "FP32")
            input.set_data_from_numpy(image)
            model_name = model.name

            if model.task_type == InferenceModelTaskType.DETECTION:
                output = grpcclient.InferRequestedOutput("detections")
                response = client.infer(model_name=model_name, inputs=[input], outputs=[output])
                detections = response.as_numpy("detections")
                
                if detections is None:
                    flask.current_app.logger.debug("No detections found in the response.")
                    return

                # print(f"Detections: {detections}")

                img_height, img_width = image.shape[:2]
                for det in detections:
                    processed_detection = process_detection(det, img_height, img_width, inference_request.image_id, labels)
                    sia.update_one_thing(dbm, processed_detection, user_id)
                    
        elif model.model_type == InferenceModelType.SAM:
            # todo
            pass
        else:
            raise ValueError(f"Unsupported model type: {model.model_type}")

        