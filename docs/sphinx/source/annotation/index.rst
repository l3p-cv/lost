.. _annotators:

For Annotators
**************
#TODO GR Review

.. _annotators-your-dashboard:

Your Dashboard
==============
.. figure:: ../images/annotator-dashboard.*

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

.. _annotators-sia:

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
SIA consists of three main components.
These components are the canvas, 
the image bar and the tool bar  

.. figure:: ../images/sia-example.*

    |fig-sia|: An example of SIA.

.. figure:: ../images/sia-canvas.*

    |fig-sia-canvas|: An example of the SIA canvas component.
    It presents the image to the annotator. By right click, 
    you can draw annotations on the image.

.. figure:: ../images/sia-image-bar.*

    |fig-sia-image-bar|: The image bar component provides information 
    about the image. Beginning with the filename of the image and the
    id of this image in the database. This is followed by the number of
    the image in the current annotation session and the overall number of
    images to annotate. The last information is the label that was given
    to the whole image, if provided.

.. figure:: ../images/sia-toolbar.*

    |fig-sia-tool-bar|: The toolbar provides a control to assign a label
    to the whole image. The navigation between images. Buttons to select
    the annotation tool. A button to toggle the SIA fullscreen mode.
    A junk button to mark the whole image as junk that should not be 
    considered. A control to delete all annotations in the image.
    A settings button and a help button.

.. warning:: There may be also tasks where you can not assign a label 
    to an annotation.
    The designer of pipeline a can decide that no class labels should be
    assigned.

.. warning:: 
    Please note that there may be also tasks where no new annotations can
    be drawn and where you only can delete or adjust annotations.

.. note::
    Please note that not all tools may be available for all tasks.
    The designer of a pipeline can decide to allow only specific tools.

.. _annotators-mia:

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

.. figure:: ../images/mia-example.*

    |fig-mia|: An example of MIA.

|fig-mia-controls1| shows the left part of the MIA control panel.
You can see the **label input field** and the current **selected label**
in a red box.

.. figure:: ../images/mia-controls1.*

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

.. figure:: ../images/mia-controls2.*

    |fig-mia-controls2|: Right part of the MIA control panel.

In some cases the annotator may want to have a closer look at a specific
image of the cluster.
In order to **zoom a single image** perform a **double click** on it.
|fig-mia-zoom| shows an example of a single image zoom.
To scale the image back to original size, 
**double click** again.

.. figure:: ../images/mia-example-zoom.*

    |fig-mia-zoom|: Zoomed view of a specific image of the cluster.

.. |fig-dashboard| replace:: Figure 1
.. |fig-sia| replace:: Figure 2
.. |fig-sia-canvas| replace:: Figure 3
.. |fig-sia-image-bar| replace:: Figure 4
.. |fig-sia-tool-bar| replace:: Figure 5
.. |fig-sia-footer| replace:: Figure 6
.. |fig-mia| replace:: Figure 7
.. |fig-mia-controls1| replace:: Figure 8
.. |fig-mia-controls2| replace:: Figure 9
.. |fig-mia-zoom| replace:: Figure 10
