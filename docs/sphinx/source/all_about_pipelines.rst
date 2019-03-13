All About Pipeline
******************

PipeProjects
============

Directory Structure
--------------------

Importing a Pipeline into LOST
------------------------------

Namespacing
-----------

Pipeline Definition files
=========================

Example
-------
.. literalinclude:: ../../examples/pipes/anno_all_imgs/anno_all_mia.json
   :language: json
   :emphasize-lines: 1
   :linenos:

AnnoTask Element 
-----------------
.. code-block:: json
   :linenos:
   :emphasize-lines: 4
    
    {
      "peN" : "[int]",
      "peOut" : "[list of int]|[null]",
      "annoTask" : {
        "name" : "[string]",
        "type" : "mia|sia",
        "instructions" : "[string]",
        "configuration":{"..."}
      }
    }

If **"type"** is **"mia"** the configuration will be the following:

.. code-block:: json
   :linenos:

    {
      "type": "annoBased|imageBased",
      "showProposedLabel": "[boolean]",
      "drawAnno": "[boolean]",
      "addContext": "[float]"
    }

**"type"**
    * If "type" is **"imageBased"** a whole image will be presented in the clustered view.
    * If "type" is **"annoBased"** all TwoDAnnotations related to an image will be cropped and presented in the clustered view.
**"showProposedLabel"**
    * If **true**, the assigned sim_class will be interpreted as label and be used as pre-selection of the label in the MIA tool. 
**"drawAnno"**
    * If **"true"** and **"type" : "annoBased"** a box will be drawn around the TwoDAnnotations.
**"addContext"**
    * If **"type" : "annoBased"** and **"addContext" > 0.0**, "addContext" defines the amount of pixels that will be added to the area of the annotation relative to the width and height of the annotation.  

If **"type"** is **"sia"** the configuration will be the following:

.. code-block:: json
   :linenos:

    {
      "tools": {
        "point": "[boolean]",
        "line": "[boolean]",
        "polygon": "[boolean]",
        "bbox": "[boolean]"
      },
      "actions": {
        "drawing": "[boolean]",
        "labeling": "[boolean]",
        "edit": {
          "label": "[boolean]",
          "bounds": "[boolean]",
          "delete": "[boolean]"
        }
      }
    }

DataSource Element 
------------------
.. code-block:: json
   :linenos:
   :emphasize-lines: 4

    {
      "peN" : "[int]",
      "peOut" : "[list of int]|[null]",
      "datasource" : {
        "type" : "rawFile"
      }
    }

Script Element
--------------
.. code-block:: json
   :linenos:
   :emphasize-lines: 4

    {
      "peN" : "[int]",
      "peOut" : "[list of int]|[null]",
      "script" : {
        "path": "[string]",
        "description" : "[string]"
      }
    }

Overwriting Script Arguments

DataExport
----------
.. code-block:: json
   :linenos:
   :emphasize-lines: 4

    {
      "peN" : "[int]",
      "peOut" : "[list of int]|[null]",
      "dataExport" : {}
    }

VisualOutput
------------
.. code-block:: json
   :linenos:
   :emphasize-lines: 4

    {
      "peN" : "[int]",
      "peOut" : "[list of int]|[null]",
      "visualOutput" : {}
    }

Loop
----
.. code-block:: json
   :linenos:
   :emphasize-lines: 4

    {
      "peN": "[int]",
      "peOut": "[list of int]|[null]",
      "loop": {
        "maxIteration": "[int]|[null]",
        "peJumpId": "[int]"
      }
    }

