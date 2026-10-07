---
description: Add golden-snapshot test coverage for new LOST API endpoints or namespaces
---

Use the **golden-tests** skill to add golden-snapshot test coverage for the LOST backend API.

Arguments: $ARGUMENTS

If arguments are present, pass them to the skill verbatim. Each argument is one of:

- An endpoint: `METHOD /api/<path>` — e.g. `GET /api/pipeline/project/global`
- A namespace: a bare name — e.g. `group`, `triton`

If the arguments are empty, discover candidates first:

1. Run `git diff master --name-only -- backend/lost/controllers backend/lost/fastapi_app.py` and `git status --short -- backend/lost/controllers backend/lost/fastapi_app.py`
2. Summarize the added/changed endpoint files and any new router registrations in `backend/lost/fastapi_app.py`
3. Ask the user to confirm which endpoints or namespaces to cover

Then hand off — the skill owns everything after this point: gating, classification (endpoint vs namespace), spec generation, and the record/verify commands.
