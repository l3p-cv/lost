All About Scripts
*****************
**Scripts** are specific elements that are part of a LOST annotation 
pipeline.
A script element is implemented as a python3 module.
The :ref:`listing below <aascripts-anno-all-imgs>` shows an example of 
such a script.
This script will request image annotations for all images of a dataset.

.. literalinclude:: ../../../backend/lost/pyapi/examples/pipes/mia/anno_all_imgs.py
    :caption: Listing 1: An example LOST script.
    :name: aascripts-anno-all-imgs

In order to implement a script you need to create a python class that 
inherits from :py:class:`lost.pyapi.script.Script`.
Your class needs to implement a **main** method needs to be instantiated
within your python script.
The :ref:`listing below <aascripts-hello-world>` shows a minimum example
for a script.

.. code-block:: python
    :linenos:
    :caption: Listing 2: A minimum example for a script in LOST
    :name: aascripts-hello-world

    from lost.pyapi import script

    class MyScript(script.Script):

        def main(self):
            self.logger.info('Hello World!')

    if __name__ == "__main__":
        MyScript()

Pipeline Element Model
======================

As all pipeline elements a script has an **input** and an **output** object.
Via these it is connected to other elements in a pipeline 
(see also :ref:`aapipelines-pipe-def-files`).

Inside a script you can exchange information with the connected elements
by using the **self.inp** object of class 
:py:class:`lost.pyapi.inout.Input` and 
the **self.outp** of type :py:class:`lost.pyapi.inout.ScriptOutput`.


Requesting Annotations
======================

Annotation Broadcasting
-----------------------

Contexts to store files
=======================

Script ARGUMENTS
================

Script ENVS
================

Logging
================
