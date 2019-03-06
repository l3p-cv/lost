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

**MIA** was designed to annotate clusters of similar objects or images.
The idea here is to speed up the annotation process by assigning a 
class label to a whole cluster of images.
The annotators task is remove images that do not belong to the cluster
clicking on these images.
When all wrong images are removed,
the remaining images get the same label assigned by the annotator.

As an example,
in |fig-mia| the annotator clicked on the car since it does not belong 
to the cluster of aeroplanes.
Since he clicked on it the car is grayed out.
Now the annotator moved on to the label input field and selected
**Aeroplane** as label for the remaining images.
Now the annotator needs to click on the **Submit** button to complete 
this annotation step.

.. figure:: images/mia-example.*

    |fig-mia|: An example of MIA.

|fig-mia-controls1| shows the left part of the MIA control panel.
You can see the **label input field** and the current **selected label**
in a red box.

.. figure:: images/mia-controls1.*

    |fig-mia-controls1|: Left part of the MIA control panel.

In |fig-mia-controls2| the right part of the MIA control panel is
presented.
The blue **submit button** on the left can be used to submit the
annotations.

On the right part of the figure there is a **reverse button** to invert
your selection.
When clicked in the example of |fig-mia| the car would be selected for 
annotation again and all aeroplanes would be grayed out.
Next to the **reverse button** there are two **zoom buttons** that can 
be used to scale all presented images simultaneously.
Next to the **zoom buttons** there is a dropdown with name **amount** 
here the annotator can select the maximum number of images that are 
presented at the same time within the cluster view.

.. figure:: images/mia-controls2.*

    |fig-mia-controls2|: Right part of the MIA control panel.

In some cases the annotator may want to have a closer look at a specific
image of the cluster.
In order to **zoom a single image** perform a **double click** on it.
|fig-mia-zoom| shows an example of a single image zoom.
To scale the image back to original size, 
**double click** again.

.. figure:: images/mia-example-zoom.*

    |fig-mia-zoom|: Zoomed view of a specific image of the cluster.

.. |fig-dashboard| replace:: Figure 1
.. |fig-sia| replace:: Figure 2
.. |fig-sia-navigation| replace:: Figure 3
.. |fig-sia-image| replace:: Figure 4
.. |fig-sia-toolbar| replace:: Figure 5
.. |fig-sia-footer| replace:: Figure 6
.. |fig-mia| replace:: Figure 7
.. |fig-mia-controls1| replace:: Figure 8
.. |fig-mia-controls2| replace:: Figure 9
.. |fig-mia-zoom| replace:: Figure 10
