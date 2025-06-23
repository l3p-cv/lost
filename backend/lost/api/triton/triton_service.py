import cv2
import flask
import requests
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



def process_polygon(polygon, img_id, img_width, img_height, class_id=None, labels=None):
    data = []
    for point in polygon:
        x, y = point
        data.append({
            "x": x / img_width,
            "y": y / img_height
        })

    lost_class = next((item for item in labels["labels"] if int(item.get("externalId")) == int(class_id)), None) if  (labels and class_id is not None) else None


    return {
        "anno": {
            "id": f"new{uuid.uuid4().int}",
            "type": dtype.TwoDAnno.TYPE_TO_STR[dtype.TwoDAnno.POLYGON],
            "data": data,
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
        "action": "annoCreatedFinalNode"
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

        if model.model_type == InferenceModelType.YOLO:
            client = self.get_triton_client()
            labels = sia.get_label_trees(dbm, user_id)
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
            
            elif model.task_type == InferenceModelTaskType.SEGMENTATION:
                polygon_output = grpcclient.InferRequestedOutput("polygons")
                class_ids_output = grpcclient.InferRequestedOutput("class_ids")
                response = client.infer(model_name=model_name, inputs=[input], outputs=[polygon_output, class_ids_output])
                polygons = response.as_numpy("polygons")
                class_ids = response.as_numpy("class_ids")

                if polygons is None or class_ids is None:
                    flask.current_app.logger.debug("No polygons found in the response.")
                    return
                
                img_height, img_width = image.shape[:2]
                for polygon, class_id in zip(polygons, class_ids):
                    processed_polygon = process_polygon(polygon, inference_request.image_id, img_width, img_height, class_id, labels)
                    sia.update_one_thing(dbm, processed_polygon, user_id)
                    
        elif model.model_type == InferenceModelType.SAM:
            image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB) # convert to RGB
            image = image.astype(np.uint8)
            img_height, img_width = image.shape[:2]

            if inference_request.prompts is None:
                raise ValueError("Prompts are required for SAM model inference.")

            points = np.array([[
                [round(p.x * img_width), round(p.y * img_height)]
                for p in inference_request.prompts.points]
            ], dtype=np.int64) if inference_request.prompts.points else None

            labels = np.array([
                [1 if p.label == "positive" else 0 for p in inference_request.prompts.points]
            ], dtype=np.int64) if inference_request.prompts.points else None

            bbox = np.array(
                (
                    [
                        round(inference_request.prompts.bbox.x_min * img_width), 
                        round(inference_request.prompts.bbox.y_min * img_height), 
                        round(inference_request.prompts.bbox.x_max * img_width), 
                        round(inference_request.prompts.bbox.y_max * img_height)
                    ]
                ),
                dtype=np.int64
            ) if inference_request.prompts.bbox else None

            payload = {
                "image": image.tolist(),
                "points": points.tolist() if points is not None and points.size > 0 else None,  
                "labels": labels.tolist() if labels is not None and labels.size > 0 else None,
                "imageId": inference_request.image_id,
                "bboxes": bbox.tolist() if bbox is not None and bbox.size > 0 else None,
            }

            sam_response = requests.post(f"http://{model.server_url}/segment/", json=payload)
            if sam_response.status_code != 200:
                raise RuntimeError(f"Failed to get response from SAM service: {sam_response.text}")
            sam_output = sam_response.json()

            polygons = sam_output.get("polygons", [])
            for polygon in polygons:
                processed_polygon = process_polygon(polygon, inference_request.image_id, img_width, img_height)
                sia.update_one_thing(dbm, processed_polygon, user_id)
        else:
            raise ValueError(f"Unsupported model type: {model.model_type}")

        