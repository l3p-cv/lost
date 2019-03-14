All About Pipelines
*******************

PipeProjects
============

A pipeline project in LOST is defined as a folder that contains
pipeline definition files in json format and related python3 scripts.
Additional,
other files can be placed into this folder that can be accessed by the 
scripts of a pipeline.

Directory Structure
-------------------

.. literalinclude:: my_pipeline_project.txt
    :caption: Example directory structure for a pipeline project.
    :name: pp-dir-structure

The :ref:`listing above <pp-dir-structure>` show an example for a 
directory structure.
Within the project there are two pipeline definition files 
**another_pipeline.json** and **my_pipeline.json**.
These pipelines can use all the scripts (**an_ai_script.py**, 
**another_script.py**, **export_the_annos.py**, **my_script.py**)
inside the project folder.
Some of the scripts may require a special python package you have written.
So if you want to use this package (e.g. **my_special_python_lib**),
just place it also inside the pipeline project folder.
Sometimes it is also useful to place some files into the project folder,
for example a pretrained ai model that should be loaded inside a script.

Importing a Pipeline into LOST
------------------------------

Namespacing
-----------

Pipeline Definition Files
=========================

An Example
----------
.. literalinclude:: ../../../backend/lost/pyapi/examples/pipes/sia/sia_all_tools.json
    :language: json
    :linenos:

Possible Pipeline Elements
--------------------------

AnnoTask Element 
~~~~~~~~~~~~~~~~
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
~~~~~~~~~~~~~~~~~~
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
~~~~~~~~~~~~~~
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
~~~~~~~~~~
.. code-block:: json
   :linenos:
   :emphasize-lines: 4

    {
      "peN" : "[int]",
      "peOut" : "[list of int]|[null]",
      "dataExport" : {}
    }

VisualOutput
~~~~~~~~~~~~
.. code-block:: json
   :linenos:
   :emphasize-lines: 4

    {
      "peN" : "[int]",
      "peOut" : "[list of int]|[null]",
      "visualOutput" : {}
    }

Loop
~~~~
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

