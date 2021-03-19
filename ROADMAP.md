# LOST 2.x - Getting LOST in the world of big data

## Update Dependencies
- [ ] CoreUI 2.x -> 3.x | Frontend
- [ ] React 16.x -> 17.x | Frontend
- [ ] Fix security alerts in js packages | Frontend
- [ ] Fix security alerts in python packages | Backend
- [ ] Replace restplus library with restx | Backend | [#89](https://github.com/l3p-cv/lost/issues/89)

## Filesystem abstraction and external datasources
- [ ] Use [fsspec](https://filesystem-spec.readthedocs.io/) as filesystem abstraction layer (enable compatibility with s3, HDFS, ...) | Backend: Filesystem | 
- [ ] Extend Datasource-Element to be able to handle external data stores and filesystems | Frontend | [#121](https://github.com/l3p-cv/lost/issues/121)
- [ ] GUI for external data sources | Frontend

## Use dask instead of celery
- [ ] Use dask as new task scheduler instead of celery | Backend: PipeEngine 

## LDAP Integration
- [ ] LDAP integration | Backend: User/Groups 
- [ ] GUI Adjustments User/ Groups| Frontend: User/Groups

## Database extension
- [ ] Extension for phoenix db access | Backend: Database

## Add user role admin
- [ ] Add role administrator | Backend/Frontend 
- [ ] Move user management to new administrator role | Backend/Frontend 

## LOST Config via GUI
- [ ] DB Adjustments | Backend 
- [ ] Move LOST configuration to GUI for new administrator role | Frontend 

## SIA Features
- [ ] Support biggest possible layout for difficult aspect ratios | Frontend: SIA 
- [ ] Delete annotation in creation mode when hitting ESC | Frontend: SIA

## pyAPI Features
- [ ] Enable pyAPI to request annotations by label name (instead of label_leaf_id) | Backend: pyAPI 
- [ ] Enable pyAPI to request annotations for DataFrame in LOSTFormat | Backend: pyAPI 

## Export Features
- [ ] Export label trees via GUI | Frontend/Backend: LabelTrees 
- [ ] Instant annotation export for annotation tasks and scripts via GUI | Frontend/Backend: AnnoTask | [#41](https://github.com/l3p-cv/lost/issues/41)

## LOST Dataset Handler
- [ ] Provide an extensive library for annotation data handling in LOST | Backend

## Simplify Pipeline import
- [ ] Easy import of pipelines without the need to copy pipe projects | Backend: PipeEngine 

## Worker management
- [ ] Use database method for script allocation | Backend: WorkerManagement

## Import Features
- [ ] Import label trees via GUI | Frontend/Backend: LabelTrees 
- [ ] Import lost pipeline via GUI | Frontend/Backend: Pipeline

## Running pipeline features
- [ ] Allow to edit used labels in an annotation task for running pipelines | Frontend/Backend: AnnoTask 
- [ ] Allow to edit assignees in an annotation task for running pipelines | Frontend/Backend: AnnoTask 

## Fine-grained visibility levels
- [ ] Visibility levels for Pipeline templates/ instances | Frontend 
- [ ] Visibility levels for label trees| Frontend 