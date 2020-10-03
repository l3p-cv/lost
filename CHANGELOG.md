# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.2-alpha.0] - 2020-10-03
### Fixed
- Do not specify python version in environment.yml of lost-cv container to prevent build fail.

## [1.2.1] - 2020-10-03
### Fixed
- AnnotationTask deadlock (see https://github.com/l3p-cv/lost/issues/27)
  * A background job was implemented that will release all annotations that have been locked for a specific user for longer than the timespan of *SESSION_TIMEOUT* (defined in .env file). This job is called on a regular basis in the frequency defined by *SESSION_TIMEOUT*.
- Defining *SESSION_TIMEOUT* in .env file leads to exception. 

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
