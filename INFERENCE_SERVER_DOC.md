# Inference Server Implementation Documentation

LOST supports adding inference servers in order to make annotating images faster and more efficient. The server needs to implemented using Nvidia Triton Inference Server.

## Pre-Requisites
Please make yourself familiar with:
- [Nvidia Triton Inference Server](https://docs.nvidia.com/deeplearning/triton-inference-server/user-guide/docs/index.html)
- [Implement a Python backend using Triton Inference Server](https://docs.nvidia.com/deeplearning/triton-inference-server/user-guide/docs/python_backend/README.html#quick-start)


## Guidelines
Please follow the below guidelines when implementing a server in Triton Inference Server.

### YOLO and similar models
Models that just accept a single image as an input.

#### Object Detection
Input and Output formats in `config.pbtxt`:

```
input [
    {
        name: "img"
        data_type: TYPE_FP32
        dims: [-1, -1, -1]
    }
]


output [
    {
      	name: "detections"
      	data_type: TYPE_FP32
    	dims: [-1, 6]
    }
]
```

Description of Inputs and Outputs:

- **Input (`img`)**:  
    The input tensor `img` represents the image data to be processed by the model. It is expected to be a floating-point tensor (`TYPE_FP32`) with three dimensions: height, width, and channels. Pass a `numpy` array.

- **Output (`detections`)**:  
    The output tensor `detections` should contain the results of the object detection process. It is a floating-point tensor (`TYPE_FP32`) with two dimensions: the number of detected objects and a fixed size of 6 for each detection. Each detection should include the following information:

    1. **left**: The x-coordinate of the top-left corner of the bounding box.
    2. **top**: The y-coordinate of the top-left corner of the bounding box.
    3. **width**: The width of the bounding box.
    4. **height**: The height of the bounding box.
    5. **confidence score**: A value between 0 and 1 indicating the confidence level of the detection.
    6. **class_id**: The identifier of the detected object's class.

#### Object Segmentation
Input and Output formats in `config.pbtxt`:

```
input [
    {
        name: "img"
        data_type: TYPE_FP32
        dims: [-1, -1, -1]
    }
]


output [
    {
      	name: "polygons"
      	data_type: TYPE_FP32
    	dims: [-1, -1]
    },
    {
        name: "class_ids",
        data_type: TYPE_FP32
        dims: [-1]
    }
]
```
Description of Inputs and Outputs:

- **Input (`img`)**:  
    The input tensor `img` represents the image data to be processed by the model. It is expected to be a floating-point tensor (`TYPE_FP32`) with three dimensions: height, width, and channels. Pass a `numpy` array.

- **Output (`polygons`)**:  
    The output tensor `polygons` contains the segmentation results in the form of polygon coordinates. It is a floating-point tensor (`TYPE_FP32`) with two dimensions: the number of detected objects and a variable number of points defining the polygons for each object.

- **Output (`class_ids`)**:  
    The output tensor `class_ids` provides the class identifiers for the segmented objects. It is a floating-point tensor (`TYPE_FP32`) with one dimension, where each entry corresponds to the class ID of a detected object. It has a 1-1 correspondence with the `polygons` tensor.