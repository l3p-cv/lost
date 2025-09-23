---
sidebar_position: 1
---

# Getting Started

## Setup LOST

LOST releases are hosted on DockerHub and shipped in Containers. See
`quick-setup` for more information.

## Getting Data into LOST

### Image Data

In the current version there is no GUI available in order to load images
into LOST. So we will use the command line and a file explorer to do
that. An image dataset in LOST is just a folder with images. LOST will
recognize all folders that are located at *path_to_lost/data/data/media*
in your filesystem, as it is mounted into the container. In order to add
your dataset just copy it to the path below e.g.:

> ``` bash
> # Copy your dataset into the LOST media folder
> cp -r path/to/my/dataset path_to_lost/data/data/media 
>
> # It may be required that you copy it as a super user since the 
> # docker container that executes LOST is running as root service 
> # and owns the media folder.
> sudo cp -r path/to/my/dataset path_to_lost/data/data/media
> ```

Then, if not already available, it is time to create a **DataSource**,
with which you can then use a file browser and select your data, for
a **Pipeline** to use. For the specifics, please refer to the
[***Datasource** page here*](/docs/managing_annotation_pipelines/datasources#adding-a-new-datasource).

### LabelTrees

Each LabelLeaf needs to have at least a **name**. Optional
information for a LabelLeaf are a **description**, an **abbreviation**,
an **external ID** (maybe from another system) and a color with which
the label is displayed. LOST provides a GUI
to create or edit LabelTrees and an import of LabelTrees defined in a
CSV file via the command line or GUI. In order to be able to edit LabelTrees in
LOST, you need to login as a user with role **Designer**. After login, you
need to click the **Labels** button on the left navigation bar.

## Users, Groups and Roles

There are three roles in LOST: A **Designer**, an **Annotator** and an Admin role.
All roles have different views and access to information. An **Annotator's** job is just
to work on annotation tasks that are assigned to them, while a
**Designer** may do more advanced stuff and everything an **Annotator**
may do. For example a **Designer** will start annotation piplines and
choose or edit LabelTrees for the annotation tasks.
Lastly, an **Admin** is the most "powerful" role, as only these users can
manage other users, groups and other things, which are integral parts of LOST.

Independent of their role, a user can be part of one or multiple user
**Groups**. This way, annotation tasks can be a assigned to **Groups**
of users that can work collaborative on the same task.

In order to manage users and groups, go to the **Admin Area** through the
left menu bar. Please note that only users with the role **Admin**
are allowed to access this part of LOST.

## Starting an Annotation Pipeline

Such a pipeline defines the order in which specific pipeline
elements will be executed. Possible elements include **Datasources**,
**Scripts** and **AnnotationTasks**.

Each version of LOST is equipped with a selection of standard pipelines
that can be used as a quick start to annotate your data. In order to
start an annotation pipeline you need to be logged in in as a user with
role **Designer** and click on the **Start Pipeline** button on the left
navigation bar. Now you will see a table with possible pipelines that
can be started.

After selecting a pipeline by clicking on a specific row in the table, you
need to configure it. A visualization of the selected pipeline will be
displayed. In most cases, a **Datasource** is the first element of a
pipeline. Click on it and select an available dataset. After a click on
the **OK** button the pipeline element will turn green to indicate that
the configuration was successful.

The next element you need to look for is an **AnnotationTask**. After
clicking on it a wizard will pop up and guide you through the
configuration of this AnnotationTask. In the first step, a **name** and
**instructions** for the AnnotationTask can be defined. Click on the
next button and select a user or group of users that should perform this
AnnotationTask. Now a **LabelTree** need to be selected by clicking on a
specific tree in the table. Now a visualization of the **LabelTree**
will be displayed. Here you can select a subset of labels that should be
used for the AnnotationTask. The idea is that each parent leaf
represents a category that can be selected to use all direct child leafs
as labels. So if you click on a leaf, all direct child leafs will be
used as possible labels for the AnnotationTask. It is possible to select
multiple leafs as label categories and then proceed. After configuring the
last of these tabs, click on **OK** and the configuration of this AnnotationTask
is done.

Now visit all other pipeline elements that have not been configured (indicated by
a yellow color) and move on to the next step in the wizard, by clicking "Next".
In the upper right corner of the screen. Here you have to
enter a **name** and a **description** of your pipeline. After entering
these informations you can click on the checkmark symbol to get to the
**Start Pipe** button. With a click on this button your annotation
pipeline will be started, good job.

You can monitor the state of all running pipelines by clicking on the
**Pipelines** button in the left navigation bar.

To get to a specific pipeline, click on the **inspect pipelines**
with the eye-symbol in the row of the according pipeline in the table.

For a simple start, use the minimal **mia** and **sia** pipelines,
according to your needs. Should you already have annotations
in LOST format, you can reannotate them with the **mia_request_again**
and **sia_request_again** pipeline templates.

## Annotating Images

After the **AnnotationTask** has been created by the pipeline, the selected annotators
will be able to work on it. The tasks are available under the point **Annotation**,
you can see in the navigation bar on the left.
If you are logged in as a user with role **Annotator** you
see this directly after login.

Here you can see a table with all available **AnnotationTasks** for you.
Click on the **Annotate** button in the row of a taks you want to work on
and you will be redirected to one of the annotation tools (see also the
[*annotators*](/docs/annotation.md) chapter). Now instructions will pop up and you are ready to
annotate.

## Downloading Annotation Results

Exports can be done either by GUI or the API.

### Export Per GUI

The tradtional way to export annotations is by using the GUI.
This provides two ways to export the data, one of them being
by going to the Pipeline the **AnnotationTask** was created in,
like described above, in the **Starting an Annotation Pipeline**
section. There, when inspecting the according pipeline, you can
select the **AnnotationTask**. In the first tab of the now opened
window, **Generate Export**, you can first generate an export. Then,
in the tab right next to it, **Available Exports**, you can download
all created exports of this **AnnotationTask**.

To export the data of a whole **Dataset** or a single **AnnootationTask**
within one, go to the **Datasets** page, reachable through the
navigation bar. There, select the button with "export datasets"
Here are Buttons to first generate new exports and then to
download them.

### Export Per API

For automated exports or otherwise exporting by using the API, please
refer to the API documentation under ```<Adress-of-the-LOST-Service>/api```.
