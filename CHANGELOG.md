# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - unreleased
## Added
- Install script for installations without docker
- JupyterLab Integration for Administrators
- pyAPI:
  - Allow to request annotations via LOSTDataframes (see #144)
  - Allow to request annotation labels via label_name (see #144) 
  - Allow to add meta information to annotations via pyAPI
  - request_annos: Added ability to deal with ImageAnno objects from database in order to request annos for a copy of the ImageAnno object.
- Configurations for LOST via database
- pyAPI: Allow to add a image comment via api. This comment will be shown in ImgBar in SIA
- SIA: 
  - Added max canvas size mode. Where canvas takes the maximum container size and is not 
  image oriented as before.
  - Added comment support for 2d annotations
  - Added an InfoBox (AnnoStats) that shows the number of annotation per label in an image
    - This box allows also to hide annotations of a specific label
    - See #86, #160 and #161
- MIA:
  - Show labels as tags
  - Allow to zoom into images in an extra modal
- Cronjob that removes annotations that are not assigned to any image
- ExamplePipes:
  - restructured whole lost out of the box pipeline project
- Dashboard:
  - Personal statistics for annotator and designer roles
- Statistics:
  - Designer statistics for designers - includes all annotation activities of the users of the designer's pipelines
- Datasources:
  - Allow to connect to external filesystems (azure blob storage, s3 bucket, ssh / sftp)
  - Allow to upload and delete files via GUI
  - Allow to create directories via GUI
- PipelineStart:
  - Allow to specify annotation options for SIA and MIA Annotation Tasks
- PipelineRunning:
  - Allow to adapt annotation options for SIA and MIA Annotation Tasks
- PipeProject:
  - Allow to import, update and export pipe projects via UI
- LabelTrees:
  - Allow to import and export label trees via UI
- VisibilityLevels and Roles:
  - Added Admin role + Admin Area 
  - Added global and user specific visibility levels
    - Global datasources and label trees
    - User (Designer) - specific datasources and label trees
- LDAP 
  - Allow to connect to external ldap servers in order to authenticate with external users
- AnnotationTask
  - Allow to generate multiple exports with given presets at any time
- Pipeline import:
  - Import pipelines via git/github or zipfile
- Pipeline export:
  - Export lost pipelines to zip file
- Extendend Logging:
  - Added option for using graylog as central logging platform (Linux support only !)
## Changed
- Use fsspec for filesystem abstraction
  * SIA: Do not send any image urls to frontend
  * MIA
    * Do not send any image urls to frontend
    * If a mia task is annoBased, crop annos on the fly (do not store anno crops in filesystem)
  * fileMan: Use fsspec instead of os for filesystm operations
- SiaReview: 
  * Trigger notification if annotations have been changed but not saved when navigation to another image
- Updated frontend to Core-UI-3
- Use Dask as scheduler instead of clelery
- Replace Anaconda package manager with mamba
- LOST standard export format
  - Added anno_style and anno_format
  - Removed unused columns from dataframe
  - Export anno_data to lists instead of dicts
  - Changed dot column name style to underscore style
- SIA:
  - Save changed and created annotations instantly to backend
## Fixed
- PipeEngine bug: Created wrong pipe graph, when first element in pe list was 
  not first element in pipeline graph
- Fixed raw sql in access to be compatible with postgresql
- Fixed copy bug in import script -> Copied to wrong location, when path had tailing '/'
- PipeStart: Empty labels in annotask not possible anymore
- SIA: 
  - Endless image loading bug
  - Filter Bug -> Do not copy annotations from previous image when filter is active!
## Removed
- removed lost-cv images. This is now integrated into the lost image 
- pyAPI: 
  - request_bbox_annos since it is a special case of request_annos
  - request_image_anno since it is a special case of request_annos
  - add_anno since it has not been used until now

## [1.5.0] - unreleased
### Added
- Added user and password to amqp url if set in .env file (see https://github.com/l3p-cv/lost/issues/133)

## [1.4.2] - 2021-03-12
### Changed 
- ImgBlacklist: 
  * Do not log every blacklist load
  * Warn for other argument types than lists in blacklist add method
  * Return always lists in get_whitelist method
### Fixed
- Version in lost backend init

## [1.4.1] - 2021-03-10
### Fixed
- KeyError while trying to remove script from worker
- Try to fix readthedocs requirements

## [1.4.0] - 2021-02-25
### Added
- SIA:
  * Added maxAnnos to canvasConfig. This allows to define a maximum number of annotations that are allowed per image.
- Pipeline View:
  * Added **Force Annotation Release**-button in running pipeline view for annotation tasks in order to manually release annotations that are locked for inactive users  (fixes https://github.com/l3p-cv/lost/issues/120)
### Changed 
- to_dict()/to_df() method for annotation export -> use annotator.user_name for annotator entry in dict/dataframe
### Fixed
- db.access -> Use with_for_update method when locking images for an annotator in SIA tasks to prevent assignment of same image to multiple annotators 

## [1.3.1] - 2020-12-15
### Change
- Refactor User Management frontend with using reactstrap
- Logmodal update only scroll position if the the scroll position is at the bottom of the textarea
- frontend/src/lost_settings.js -> Automatically determine production or development mode from environment variable
- Moved packages from frontend/src/components/pipeline/package.json to  frontend/src/package.json
### Fixed
- Pipeline throws error when the user pressed ctrl key

## [1.3.0] - 2020-12-11
### Added
- SIA:
  * Frontend annotation time measurement: Annotation time is now measured in frontend, based on user events. For each annotation, user interaction time is measured. 
  * Delete last node of polygon/ line when hitting delete key in create mode (see https://github.com/l3p-cv/lost/issues/102)
  * Added copy & paste for annotations (see https://github.com/l3p-cv/lost/issues/82)
  * Added Sia image filters -> Image can now be *rotated* and *histogram equalization* can be applied for dark images
  * Use *j*-Key as shortcut for junk images
- BaseImage: Installed opencv + dependencies
### Fixed
- SIA:
  * Do not lose polygon annotation when hitting enter in create mode
  * Do not allow to draw a polygon consisting of two points (see https://github.com/l3p-cv/lost/issues/101)
  * Do not collapse line with two points, when confirming with enter  
- Pipeline import:
  * Script parsing fails when list/dictionary literals are not valid JSON (see https://github.com/l3p-cv/lost/issues/97)

## [1.2.2] - 2020-10-08
### Fixed
- Updated conda in order to get lost-cv container running

## [1.2.1] - 2020-10-03
### Fixed
- AnnotationTask deadlock (see https://github.com/l3p-cv/lost/issues/27)
  * A background job was implemented that will release all annotations that have been locked for a specific user for longer than the timespan of *SESSION_TIMEOUT* (defined in .env file). This job is called on a regular basis in the frequency defined by *SESSION_TIMEOUT*.
- Defining *SESSION_TIMEOUT* in .env file leads to exception. 

## [1.3.0-alpha4] - 2020-07-28
### Fixed
- Sorting Running Pipeline and Start Pipeline by Date does not worked correctly
### Added
- DB User: Added api_token column + patch
- Designer can update Arguments in Running Pipeline in Script Nodes
### Change
- Implement Worker Live Log
- Don't report anno_task's current iteration annotations

## [1.3.0-alpha3] - 2020-07-01
### Fixed
- Report webservices: filter options

## [1.3.0-alpha2] - 2020-07-01
### Fixed
- Report webservices: order by pipe element id

## [1.3.0-alpha1] - 2020-06-30 
### Added
- Report webservices for annotation tasks - get annotations per label and annotations per day statistics
- Token webservice for user - get a valid api token

## [1.2.0] - 2020-06-28
### Added
- SIAReview:
  * Review tool for annotation tasks in designer interfaces
  * Allows to view and adjust annotations for SIA and MIA tasks
  * Allows also to filter annotations by iteration 
- Docs: Description of Utf-8 char encoding fix (see https://github.com/l3p-cv/lost/pull/72)
### Changed
- Live logs: Show logs live in pipeline frontend when clicking on logs (see https://github.com/l3p-cv/lost/pull/84)
- Allow html tags inside task instructions and label descriptions (see https://github.com/l3p-cv/lost/pull/78)

## [1.1.4] -  2020-06-08
### Fixed
- Updated nodejs version in oder to get ci running

## [1.1.3] - 2020-06-05
### Added
- SIA: 
  * Added next/ prev image shortcut via ArrowLeft/ArrowRight keys (see https://github.com/l3p-cv/lost/issues/67)
  * Added camera move on wasd keys
### Changed
- SIA: Show annotation nodes in foreground and label above annotation to prevent that nodes are not accessible by the annotator (see https://github.com/l3p-cv/lost/issues/74)


## [1.1.2] - 2020-05-26
### Fixed
-  PyAPI: get_label_tree method did not return any label tree 


## [1.0.1] - 2020-05-26
### Fixed
-  PyAPI: get_label_tree method did not return any label tree 


## [1.1.1] - 2020-05-15
### Added 
- Docs: Migration guide -> How to migrate from 0.0.6 to 1.1.0 (see https://github.com/l3p-cv/lost/pull/71)
- Reduction of docker images size (see https://github.com/l3p-cv/lost/pull/68)
- Use docker-compose for gpu worker (see https://github.com/l3p-cv/lost/pull/65)

## [1.1.0] - 2020-04-06
### Changed
- Usermanagement: Integrated usermanagement refactoring (see also https://github.com/l3p-cv/lost/pull/47)
- SIA:
  * Always reset annotation mode to *view* when getAnnoBackendFormat is called
  * Delete annotation in sia canvas correctly, when they are moved out of the image.
  * Prevent user from moving image out of canvas
  * Confirm label in LabelInput by click on the respective label
  * Configure name of the default Label by a prop 
  * Provide method to reset canvas zoom
  * It is now possible to define custom label colors via canvas *possibleLabels* props 

### Fixed
- SIA: Fixed all annotations lost bug. (see also https://github.com/l3p-cv/lost/issues/51)
  * When a new annotation was created and deleted before a backend update was performed, SIA sent this annotation to backend for an db update
  * The backend then tried to update a db record that did not exists which caused an exception.
  * The result was that all annotation where lost 
- SIA: Fixed crash on changing image when label input is active.
- SIA Fixed jumping camera when zooming into the image
- SIA Fixed LabelInput on wrong position when image was zoomed

## [1.0.0] - 2019-10-17
### Added
- SIA: Delete annotation by hitting Backspace
- Example pipeline for multi label support in SIA
### Fixed 
- SIA: 
  * Close label input field also when clicking on a annotation
  * Autoscale font size in AnnoBar

## [1.0.0-alpha.4] - 2019-10-07
### Added
- MIA: Frontend undo button
### Changed
- Heavy frontend cleanup
### Fixed
- MIA: Allow to assign label by mouse click in dropdown also if underlaying image is excluded

## [1.0.0-alpha.3] - 2019-10-05
### Fixed
- anno_helper.divide_into_patches: output of shifted bbox coordinates.
- blacklist: fixed behaviour of get_whitelist method. Do not put images automatically on blacklist.


## [1.0.0-alpha.2] - 2019-10-04
### Added
- SIA: Added button to delete all 2D annos
### Fixed
- Update AnnoTask progress bar on sia update events
- adapted imageai package installation for gpu container


## [1.0.0-alpha.1] - 2019-10-04
### Added
- Blacklist class for image blacklisting
- Added anno helper & vis to docs
### Changed
- Removed LifeSign from Logger
### Removed
- LifeSign from logging
- frontend cleanup: removed old tools (sia/pipeline)
### Fixed
- fixed destroyed conda env in lost-cv-gpu container

## [1.0.0-alpha.0] - 2019-10-01
### Added
- SIA: New features 
  * Fullscreen mode
  * New GUI design in order to enlarge the image canvas
  * Assignment of image labels for captioning
  * Multi label support -> Assignment of multiple labels per annotation or image
  * Full redo/ undo support
  * Introduced info boxes to show additional information
  * An annotator may mark an image as Junk if it should not be considered for annotation
  * A minimum area for annotations can be defined.
- Database: 
  * Added description field to ImageAnno and TwoDAnno. This can be a description that can be added by an annotator or algorithm und was added for future features.
  * Added new table(track) for track annotation, to prepare the database for the ISA (Image Sequence Annoation) tool.
### Changed
- SIA: Complete rewrite in react.
  * Config of SIA in pipeline definition files.
- Database:
  * In ImageAnno changed track_n -> track_id
### Deprecated
- 
### Removed
- SIA: In pipeline definition files config -> actions -> edit. It is not longer possible to allow/ deny actions when editing an annotation, since it was a feature that nobody used.
### Fixed
- Cron: Set AnnoTask to finished if there no annotations in the current iteration
### Security
- 


## [0.0.7] - 2019-10-01
### Added
- Docs: Added description of @KonradAdamczyk on how to install LOST from a backup
### Fixed
- LOST notification system: @KonradAdamczyk fixed missing lost_url


## [0.0.6] - 2019-09-19
### Added
- GPU Worker lost-cv-gpu now contains the scikit-learn library
### Fixed
- Annotation context can now also be added to monochrome images  
- Fixed typos in pipeline gui


## [0.0.5] - 2019-06-26
### Fixed
- Fixed import of script ENV variables that have been commented out (see commit 72fddfa)
- Fixed offline availability since frontend was loading fonts from web
## [0.0.4] - 2019-05-24
### Fixed
- allow pipelines to be started by users other than admin (groups/user id mix-up)


## [0.0.3] - 2019-05-17
### Changed
- allow arbitrary ports for api access through lost frontend


## [0.0.2] - 2019-04-11
### Added
- Check if pipeline definition files match specification before import or update.
- Allow custom nginx configuration.
### Changed
- allow assigning annotasks to all users and groups in system (see issue #19)
### Fixed
- change label of predicted annotations in sia (see issue #23).
- prevent users from deleting themselves.
- prevent users from deleting their default group, which will prevent pipelines from starting.
- go to last image in sia: not one image too far anymore (see issue #31).
- removed redundant data for sia annotations (see issue #29)
### Security
- added jwt blacklist


## [0.0.1] - 2019-04-08
### Added
- Adjust loop iterations when starting a pipeline
### Changed
- prevent admin user from removing its own designer role
### Fixed
- update_pipe_project.py bug: update of wrong script (see issue #21)
- logout bug: clean redux store and reset axios auth header (see issue #18)
