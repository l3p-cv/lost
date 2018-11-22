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
      "drawBox": "[boolean]",
      "addContext": "[float]"
    }

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
      },
      "drawables": {
        "bbox": {
            "minArea": "[float]",
            "minAreaType": "abs|rel"
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

