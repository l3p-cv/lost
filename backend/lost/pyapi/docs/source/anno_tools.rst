Annotation Tools
****************


Single Image Annotation (SIA)
=============================

Example Definition of a SIA Task 
--------------------------------
.. code-block:: json
   :emphasize-lines: 6, 8-30
   :linenos:

    {
      "peN": 2,
      "peOut": [3,7],
      "annoTask": {
        "name": "BBoxAnnotation",
        "type": "sia",
        "instructions": "Please draw bounding boxes for all objects in image",
        "configuration": {
          "tools": {
            "point": false,
            "line": false,
            "polygon": false,
            "bbox": true
          },
          "actions": {
            "drawing": true,
            "labeling": false,
            "edit": {
              "label": false,
              "bounds": true,
              "delete": true
            }
          },
          "drawables": {
            "bbox": {
              "minArea": 250,
              "minAreaType": "abs"
            }
          }
        }
      }
    }

Multi Image Annotation (MIA)
============================

Example Definition of a MIA Task
--------------------------------

.. code-block:: json
   :emphasize-lines: 6,8-13
   :linenos:
    
    {
      "peN" : 1,
      "peOut" : [3,12],
      "annoTask" : {
        "name" : "MultiImageAnnotation",
        "type" : "mia",
        "instructions" : "Please assign the correct class label.",
        "configuration":{
          "type": "annoBased",
          "showProposedLabel": true,
          "drawBox": false,
          "addContext": 0.0
        }
      }
    }

Configuration
-------------
**"type"**
    * If "type" is **"imageBased"** a whole image will be presented in the clustered view.
    * If "type" is **"annoBased"** all TwoDAnnotations related to an image will be cropped and presented in the clustered view.
**"showProposedLabel"**
    * If **true**, the assigned sim_class will be interpreted as label and be used as pre-selection of the label in the MIA tool. 
**"drawBox"**
    * If **"true"** and **"type" : "annoBased"** a box will be drawn around the TwoDAnnotations.
**"addContext"**
    * If **"type" : "annoBased"** and **"addContext" > 0.0**, "addContext" defines the amount of pixels that will be added to the area of the annotation relative to the width and height of the annotation.  
