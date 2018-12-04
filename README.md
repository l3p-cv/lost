# LOST - Label Objects and Save Time

## How To Start
TODO

## Tech Stack

### Frontend
1. React, Redux, Reactstrap + CORE UI

### Backend
1. FLASK, SQLAlchemy, RESTplus
2. Celery
3. RabbitMQ
4. MySQL Database

### Other
1. CI: GitLab-CI
2. Docker / Docker-Compose

# Git Workflow and Versioning

## Branches
We use version numbers according to [Semantic Versioning](https://semver.org/spec/v2.0.0.html) (see also [A-Simple-Guide-To-SemVer](https://www.jvandemo.com/a-simple-guide-to-semantic-versioning/)).
Sematic versioning is also used by prominent open source projects like [TensorFlow](https://www.tensorflow.org/programmers_guide/version_compat).

Each Minor version will have its own branch in git for example: *1.0* (Major.Minor)
Each developer is responsible that the code he merges will not break our application!

## Releases
Each release will get a *tag* with *Major.Minor.Patch* version number in git.
Pre-releases are indicated by *Major.Minor.Patch-PreReleaseNumber*