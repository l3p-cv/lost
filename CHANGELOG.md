# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).


## [Unreleased] - 2019-09-19

### Added
- SIA: New features 
  * Fullscreen mode
  * New GUI design in order to enlarge the image canvas
  * Assignment of image labels for captioning
  * Mulit label support -> Assignment of multiple labels per annotation or image
  * Full redo/ undo support
  * Introduced info boxes to show additional information
  * An annotator may mark an image as Junk if it should not be considered for annotation
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

## [0.0.6] - 2019-09-19
### Added
- GPU Worker lost-cv-gpu now contains the scikit-learn library

### Fixed
- Annotation context can now also be added to monochrome images  
- Fixed typos in pipeline gui


## [0.0.5] - 2019-06-26
### Added
-

### Changed
- 

### Deprecated
- 

### Removed
-

### Fixed
- Fixed import of script ENV variables that have been commented out (see commit 72fddfa)
- Fixed offline availability since frontend was loading fonts from web

### Security
- 

## [0.0.4] - 2019-05-24
### Added
-

### Changed
- 

### Deprecated
- 

### Removed
-

### Fixed
- allow pipelines to be started by users other than admin (groups/user id mix-up)

### Security
- 

## [0.0.3] - 2019-05-17
### Added
- 

### Changed
- allow arbitrary ports for api access through lost frontend

### Deprecated
- 

### Removed
-

### Fixed
- 

### Security
- 

## [0.0.2] - 2019-04-11
### Added
- Check if pipeline definition files match specification before import or update.
- Allow custom nginx configuration.

### Changed
- allow assigning annotasks to all users and groups in system (see issue #19)

### Deprecated
- 

### Removed
-

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

### Deprecated
- 

### Removed
-

### Fixed
- update_pipe_project.py bug: update of wrong script (see issue #21)
- logout bug: clean redux store and reset axios auth header (see issue #18)

### Security
-
