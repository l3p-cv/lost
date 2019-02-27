.. _annotators:

For Annotators
**************

.. _annotators-your-dashboard:

Your Dashboard
==============
.. figure:: images/annotator-dashboard.*

    |fig-dashboard|: The annotator dashboard.

In |fig-dashboard| you can see an example of the annotator dashboard.
At the top, the progress and some statistics of the current 
selected **AnnotationTask** are shown.

In the table on the button all available AnnotationTasks are 
presented.
A click on a specific row will direct you to the annotation tool that is
required to accomplish the selected AnnotationTask.
Rows that have a grey background mark finished tasks and can not be 
selected to work on.

Getting To Know SIA - A Single Image Annotation Tool
====================================================

SIA was designed to annotate single images with **Points**, 
**Lines**,
**Polygons** and **Boxes**.
To each of the above mentioned annotations a **class label** can also be
assigned.

|fig-sia| shows an example of the SIA tool.
At the top you can see a progess bar with some information about the 
current AnnotationTask.
Beyond this bar the actual annotation tool is presented.
SIA consists of four main components.

.. figure:: images/sia-example.*

    |fig-sia|: An example of SIA.

The navigation component in |fig-sia-navigation| gives you all 
information of a current selected annotation. 
On the left you can see a preview of the annotated pixels.
In our example the bounding box around the person on the image was
selected.
Right next to this preview the current class label of the box is displayed
and could be changed by typing in the input box or with a click on it.

.. warning:: There may be also tasks where you can not assign a label 
    to an annotation.
    The designer of pipeline a can decide that no class labels should be
    assigned.

Under the label input box a description of the class label is shown.
If we move further to the right we see the coordinates that define the
box and two different types of arrows.
The **arrows inside of the circle** let you move to the first image you
have annotated and to the last image.
The **arrows without a circle** let you navigate to the next and previous
image of your annotation task.

.. figure:: images/sia-navigation.*

    |fig-sia-navigation|: SIA navigation and annotation detail component.
    The input field allows to assign a class label to the current selected
    annotation.

|fig-sia-image| presents the heart of SIA.
On the canvas you can draw the actual annotations once you have selected
a tool from the toolbar (|fig-sia-toolbar|).
You can start drawing with a right click on the canvas. 
Now SIA will switch into an **edit mode** and all 
already present annotation will disappear in order to keep the annotator 
focused on the current annotation.
After leaving the edit mode all annotation will be shown again.
In the case of polygon and line annotations you need to hit the enter key
or perform a double click to exit the edit mode.

.. warning:: 
    Pleas note that there may be also tasks where no new annotations can
    be drawn and where you only can delete or adjust annotations.

.. figure:: images/sia-image.*

    |fig-sia-image|: SIA annotation canvas component where the annotator
    will draw his annotations.

|fig-sia-toolbar| shows the toolbar of SIA.
Here you can switch between a point, 
a line, 
a polygon and a box tool by performing a left click on the specific button.

.. note::
    Please note that not all tool may be available for all tasks.
    The designer of a pipeline can decide to allow only specific tools.

.. figure:: images/sia-toolbar.*

    |fig-sia-toolbar|: SIA toolbar component with point, line, polygon
    and box tool .

|fig-sia-footer| presents the footer component of SIA. 
On the left there is a button with a rubbish bin. 
This button should be clicked when the annotator has the feeling that 
it makes no sense to annotate this image.
The middle of the footer displays the name of the current image and its 
ID in the database.
On the right side of the footer you can see how many images have been 
annotated in this task.

.. figure:: images/sia-footer.*

    |fig-sia-footer|: SIA footer - with information on image name and id.

Meet MIA - A Multi Image Annotation Tool
========================================
.. figure:: images/mia-example.*

    |fig-mia|: An example of MIA.


.. |fig-dashboard| replace:: Figure 1
.. |fig-sia| replace:: Figure 2
.. |fig-sia-navigation| replace:: Figure 3
.. |fig-sia-image| replace:: Figure 4
.. |fig-sia-toolbar| replace:: Figure 5
.. |fig-sia-footer| replace:: Figure 6
.. |fig-mia| replace:: Figure 7