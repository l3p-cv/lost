# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.2] - 2020-08-06
### Fixed
- Do not clutter background through sia css file, when importing sia canvas component
  
## [0.2.1] - 2020-06-20
### Fixed
- Fixed multiple image load events for the same image, that lead to wrong svg sizes

## [0.2.0] - 2020-06-05
### Fixed 
- Added camera move on wasd keys
- Provide canvas key events via prop callback
### Changed
- Show annotation nodes in foreground and label above annotation to prevent that nodes are not accessible by the annotator (see https://github.com/l3p-cv/lost/issues/74)

## [0.1.2] - 2020-04-06
### Removed
- Removed most sia logs that clutter the console
  
## [0.1.1] - 2020-04-06
### Fixed
- Fixed undefined possible labels in canvas
   
## [0.1.0] - 2020-04-06
### Added
- Always reset annotation mode to *view* when getAnnoBackendFormat is called
- Delete annotation in sia canvas correctly, when they are moved out of the image.
- Prevent user from moving image out of canvas
- Confirm label in LabelInput by click on the respective label
- Configure name of the default Label by a prop 
- Provide method to reset canvas zoom
- It is now possible to define custom label colors via canvas *possibleLabels* props 

### Fixed
- Fixed jumping camera when zooming into the image
- Fixed LabelInput on wrong position when image was zoomed

## [0.0.2] - 2020-04-02
### Fixed
- Fixed crash on changing image when label input is active.

## [0.0.1] - 2020-04-01
### Fixed 
- Fixed all annotations lost bug. (see also https://github.com/l3p-cv/lost/issues/51)
  * When a new annotation was created and deleted before a backend update was performed, SIA sent this annotation to backend for an db update
  * The backend then tried to update a db record that did not exists which caused an exception.
  * The result was that all annotation where lost 