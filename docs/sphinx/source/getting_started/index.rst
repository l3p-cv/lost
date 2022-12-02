Getting Started
****************

Setup LOST
=================
LOST releases are hosted on DockerHub and shipped in Containers.
See :ref:`quick-setup` for more information.


Getting Data into LOST
======================

Image Data
----------------------
In the current version there is no GUI available in order to load images 
into LOST. 
So we will use the command line or a file explorer to do that.
An image dataset in LOST is just a folder with images. 
LOST will recognize all folders that are located at 
*path_to_lost/data/data/media* in your filesystem as a dataset.
In order to add your dataset just copy it to the path above e.g.:

    .. code-block:: bash

        # Copy your dataset into the LOST media folder
        cp -r path/to/my/dataset path_to_lost/data/data/media 
        
        # It may be required that you copy it as a super user since the 
        # docker container that executes LOST is running as root service 
        # and owns the media folder.
        sudo cp -r path/to/my/dataset path_to_lost/data/data/media

LabelTrees
----------------------
#TODO Review + add import export feature link 
Labels are organized in LabelTrees.
Each LabelLeaf need to have at least a **name**.
Optional information for a LabelLeaf are a **description**,
an **abbreviation** and an **external ID** (maybe from another system).
LOST provides a GUI to create or edit LabelTrees and an import 
of LabelTrees defined in a CSV file via the command line.
In order to be able to edit LabelTrees in LOST you need to login as a user
with role **Designer**.
After login you need to click on the **Labels** button on the left 
navigation bar. 


Users, Groups and Roles
=======================
#TODO GR Add Admin Role + Link to visibilty docs
There are two main user roles in LOST: 
A **Designer** and an **Annotator** role.
Both roles have different views and access to information.
An **Annotators** job is just to work on annotation tasks that are assigned to him,
while a **Designer** may do more advanced stuff and everything 
an **Annotator** may do.
For example a **Designer** will start annotation piplines and choose or edit
LabelTrees for the annotation tasks.

Independent of its role a user can be part of one or multiple user **Groups**.
In this way annotation tasks can be a assigned to **Groups** of users that 
can work collaborative on the same task.

In order to manage users and groups, 
click on the **Users** icon on the left menu bar.
Please note that only users with the role **Designer** are allowed to 
manage users.

Starting an Annotation Pipeline
===============================
#TODO GR Review !
All annotation processes in LOST are modeled as pipelines.
Such a pipeline defines the order in which specific pipeline elements will
be executed.
Possible elements are
**Datasources**, **Scripts**, **AnnotationTasks**, **DataExports**
and **VisualOutputs**. 

Each version of LOST is equipped with a selection of standard pipelines 
that can be used as a quick start to annotate your data.
In order to start an annotation pipeline you need to be logged in in as 
a user with role **Designer** and click on the **Start Pipeline** button
on the left navigation bar.
Now you will see a table with possible pipelines that can be started.

After selecting a pipeline by a click on a specific row in the table 
you need to configure it.
A visualization of the selected pipeline will be displayed.
In most cases a **Datasource** is the first element of a pipeline.
Click on it and select an available dataset.
After a click on the **OK** button the pipeline element will turn green
to indicate that the configuration was successful. 

The next element you need to look for is an **AnnotationTask**.
After clicking on it a wizard will pop up and guide you through the
configuration of this AnnotationTask.
In the first step a **name** and **instructions** for the AnnotationTask
can be defined.
Click on the next button and select a user or 
group of users that should perform this AnnotationTask.
Now a **LabelTree** need to be selected by clicking on a specific 
tree in the table.
Now a visualization of the **LabelTree** will be displayed. 
Here you can select a subset of labels that should be used for the
AnnotationTask.
The idea is that each parent leaf represents a category that can 
be selected to use all direct child leafs as labels.
So if you click on a leaf, 
all direct child leafs will be used as possible labels for the AnnotationTask.
It is possible to select multiple leafs as label categories.
After selecting the label subset click on **OK** and the configuration
of this AnnotationTask is done.

Now visit all other elements that not have been configured
(indicated by a yellow color) and move on to the next step in the wizard.
Here you can enter a **name** and a **description** of your pipeline.
After entering these information you can click on the checkmark symbol 
to get to the **Start Pipe** button. 
With a click on this button your annotation pipeline will be started :-)

You can monitor the state of all running pipelines on your **Designer**
dashboard.
To get to a specific pipeline click on the **Dashboard** button in the 
left navigation bar and select a pipeline in the table.

Out of the box pipelines
====================
#TODO GR 

Annotate Your Images
====================
#TODO GR Update + Add links to SIA / MIA docs
Once your pipeline has requested all annotations for an **AnnotationTask**,
selected annotators will be able to work on it.
If you are logged in as a user with role **Designer** you can now 
switch to the annotator view by clicking on the **Annotator** button
at the upper right corner of your browser.
You will be redirected to the :ref:`annotator dashboard <annotators-your-dashboard>`.
If you are logged in as a user with role **Annotator** you see this 
dashboard directly after login.

Here you can see a table with all available **AnnotationTasks** for you.
Click on a task you want to work on and you will be redirected to one of 
the annotation tools (see also the :ref:`annotators` chapter).
Now instructions will pop up and you are ready to annotate.


Download Your Annotation Results
================================

Instant Annotation Export
----------------------
#TODO GR

Out Of The Box pack_dataset Pipeline
----------------------
#TODO GR

Data Export Pipeline Element
----------------------
#TODO GR
All example pipelines in LOST have a **Script** element that will export
your annotations to a CSV file when the annotation process has finished.
To download this file go to the **Designer** dashboard that is part of the
**Designer** view and select a pipeline.
A visualization of the annotation process will be displayed.
Look for a **DataExport** element and click on it.
A pop up will appear that shows all files that are available for download.
Now click on a file and the download will start.
