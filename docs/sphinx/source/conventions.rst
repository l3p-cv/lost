Conventions
*******************
#TODO JJ Review

Image coordinate system
=======================
The same coordinate system as in OpenCv is used. So an image is treated as a matix.
The x-axis increases to the right and the y-axis increases while moving downwards
in the coordinate system, as in matrix notation.


Annotations
===========

All annotations are defined relative to the image.
See also :py:class:`lost.db.model.TwoDAnno`.


Bounding Box definition
-----------------------
* x: Defines the x-coordinate of the center of a bounding box (relative, in pixels).
* y: Defines the y-coordinate of the center of a bounding box (relative, in pixels).
* width: Defines the width of a bbox (relative, in pixels).
* height: Defines the height of a bbox (relative, in pixels).
