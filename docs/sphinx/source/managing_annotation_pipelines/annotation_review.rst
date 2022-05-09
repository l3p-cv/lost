.. _annotation-review:

Annotation Review
*****************
#TODO JJ Review

.. _sia-review:

SIA-Review-Tool For Designers
=============================

As owner of a pipeline it is often required to have a quick look at the current 
annotation progress or to correct single annotations of an annotation task.
For that purpose we implemented the SIA-Review tool. It is available for users
with the role designer and can be accessed via the pipeline view,
when clicking on the *Review Annotations* button.

.. figure:: images/lost-review-btn.*

    |fig-review-btn|: Review button inside the details view of an annotation task.

|fig-review-btn| show the detail popup of an annotation task in a pipeline.
When clicking on the *Review Annotations* button you will be redirected to the 
**SIA Review Tool**. |fig-review-sia| shows the review interface.

.. figure:: images/lost-review-sia.*

    |fig-review-sia|: Interface of the **SIA Review Tool**

In contrast to the normal :ref:`SIA Annotation Tool <annotators-sia>` you 
need to explicitly click on the 
**SAVE button** in order to save changes. When moving to the next image without 
saving, no changes will be stored. Everything else will be similar to the 
:ref:`SIA Annotation Tool <annotators-sia>`. 
The review tool can be used to review all types of annotation tasks (SIA and MIA)

.. figure:: images/lost-review-filter.*

    |fig-review-filter|: Filter box, where images can be filtered by iteration.

|fig-review-filter| shows the filter box where images/annotation can be filtered 
by iteration.

.. |fig-review-btn| replace:: Figure 1
.. |fig-review-sia| replace:: Figure 2
.. |fig-review-filter| replace:: Figure 3