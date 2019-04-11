# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
- Check if pipeline definition files match specification before import or update.
- Allow custom nginx configuration.

### Changed
- 

### Deprecated
- 

### Removed
-

### Fixed
- change label of predicted annotations in sia (see issue #23).
- prevent users from deleting themselves.
- prevent users from deleting their default group, which will prevent pipelines from starting.

### Security
-

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
