# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.2] - 2020-04-02
### Fixed
- Fixed crash on changing image when label input is active.

## [0.0.1] - 2020-04-01
### Fixed 
- Fixed all annotations lost bug. (see also https://github.com/l3p-cv/lost/issues/51)
  * When a new annotation was created and deleted before a backend update was performed, SIA sent this annotation to backend for an db update
  * The backend then tried to update a db record that did not exists which caused an exception.
  * The result was that all annotation where lost 