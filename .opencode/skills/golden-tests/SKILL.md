---
name: golden-tests
description: Generate golden-snapshot API test coverage for new LOST FastAPI endpoints and namespaces using the backend/tests compare harness (RouteSpec spec files, runners, recorded goldens). Use when asked to add golden tests, golden snapshots, or API test coverage for a new endpoint, a new namespace, or newly added routes; when a user mentions RouteSpec, a specs file, the /golden-tests command, or recording goldens after backend API changes. Classifies each request as endpoint (append RouteSpec entries to the existing specs file) or namespace (create specs file, runner, golden dir, and MIGRATED registration) and delivers the generated code plus record and verify commands. Use ONLY in the LOST repository for its backend golden-snapshot suite, not for other test suites.
---

# Golden Tests — LOST API Coverage Generator

Add golden-snapshot test coverage for new LOST FastAPI endpoints or namespaces.
The harness lives in `backend/tests/` — if anything is unfamiliar, read
`backend/tests/README.md` and `backend/tests/AGENTS.md` before generating code.

## Workflow

1. **Gate** — confirm the harness is present (below)
2. **Classify** — resolve each argument to a namespace + endpoint-or-namespace
3. **Branch** — run the matching flow per argument
4. **Deliver** — generated spec code + the record/verify commands

## Gate

Stop and report — do not proceed — unless all three exist:

- `backend/tests/helpers/specs.py` (RouteSpec dataclass)
- `backend/tests/compare/migration_status.py` (MIGRATED registry)
- `backend/run_snapshots.sh` (harness runner)

## Classify

Argument shapes:

- `METHOD /api/...` → endpoint request (e.g. `GET /api/pipeline/project/global`)
- bare name → namespace (e.g. `group`, `triton`)

Resolve a URL prefix to its harness namespace — the prefix does not always match
the spec-file stem or the `target_for` argument:

| URL prefix | Spec file (tests/compare/) | target_for(...) | Golden dir (tests/golden/) |
| --- | --- | --- | --- |
| /api/annotasks | annotask_specs.py | annotasks | annotasks/ |
| /api/datasets | dataset_specs.py | datasets | dataset/ |
| /api/instructions | instruction_specs.py | instructions | instructions/ |
| /api/fb | filebrowser_specs.py | filebrowser | filebrowser/ |
| /api/media | instructionmedia_specs.py | instructionmedia | instructionmedia/ |
| /api/models | inference_model_specs.py | inference_model | inference_model/ |
| /api/auth/openid | (none — mock tests) | auth | (no goldens) |
| /api/user | user_specs.py | user | user/ |
| /api/group | group_specs.py | group | group/ |
| /api/sia | sia_specs.py | sia | sia/ |
| /api/mia | mia_specs.py | mia | mia/ |
| /api/pipeline | pipeline_specs.py | pipeline | pipeline/ |
| /api/data | data_specs.py | data | data/ |
| /api/label | label_specs.py | label | label/ |
| /api/worker | worker_specs.py | worker | worker/ |
| /api/statistics | statistics_specs.py | statistics | statistics/ |
| /api/config | config_specs.py | config | config/ |
| /api/system | system_specs.py | system | system/ |

Decision rule (the core):

- `backend/tests/compare/<name>_specs.py` **exists** → **endpoint flow**
- **missing** → **namespace flow**

Special cases:

- `auth` — no goldens; covered by mocked-IDP tests in `backend/tests/auth/`.
  Extend that pattern instead of the compare suite.
- `triton` — a tag exists in `_OPENPI_TAGS` but no router is mounted in
  `fastapi_app.py`; the namespace flow's prereq gate stops it until mounted.

## Endpoint flow

1. Read the module's Endpoint file — routes, methods, params, body schemas, role
   guards (`backend/lost/controllers/<Module>/<Module>Endpoint.py`)
2. Read the existing `<name>_specs.py` — match its imports, numbering comments, style
3. Author the RouteSpec(s) per [references/spec-patterns.md](references/spec-patterns.md)
4. If the route needs DB entities: extend `backend/tests/helpers/init_test_data.py`
   (idempotent, `compare_test_` prefix) and `backend/tests/helpers/lookups.py`
   (name-based lookup, `None` → runtime skip)
5. Append to `<name>_specs.py` — runners pick up new specs automatically; no runner edit
6. Non-deterministic / destructive / binary-download routes: skip with a documented
   `skip_reason` instead of forcing a golden
7. Deliver the hand-off commands (below)

Gap-scan mode (bare existing namespace): list the module's routes, diff against the
paths covered in `<name>_specs.py`, cover the uncovered routes via the steps above.

## Namespace flow

1. **Prereq gate — STOP and report if missing:** the module exports `router`;
   `backend/lost/fastapi_app.py` imports it and calls `app.include_router(...,
   prefix=API_PREFIX + "/<path>")`; `_OPENPI_TAGS` has the tag
2. Follow [references/namespace-flow.md](references/namespace-flow.md) — naming,
   seeder-vs-ephemeral, spec file, runner from the embedded templates, MIGRATED
   registration, golden dir, record/verify

## Hard rules (always)

- Stamp `target=_TARGET` from `target_for("<name>")` — the RouteSpec default is
  `"flask"` and hard-fails post-cutover
- Never re-record to silence a failure — root-cause first; record NEW specs only (via `-k`)
- Test entities: `compare_test_` prefix only; name-based lookups; never hardcode IDs
  (sole exception: nonexistent `999999` in exact-mode error specs)
- `dbm.session.rollback()` before by-name lookups after an API commit (repeatable-read trap)
- Exact-mode bodies: fixed names only — never `unique_suffix()`
- Commit specs + goldens together
- Harness file roles and internals: [references/harness-map.md](references/harness-map.md)

## Hand-off commands

```bash
# record NEW specs only (never re-record a whole namespace):
./backend/run_snapshots.sh tests/compare/test_<name>_compare.py -k <SPEC_NAME> --record -v
# verify without recording:
./backend/run_snapshots.sh tests/compare/test_<name>_compare.py -k <SPEC_NAME> -v
# full suite (catches cross-suite interference):
./backend/run_snapshots.sh tests/compare/ -v
```

Review the generated `backend/tests/golden/<name>/<SPEC_NAME>.json` diff (redactions
applied? right mode?) before committing.

## Fallback interpretation

- Vague request ("add tests for my new endpoints"): discover candidates via
  `git diff master --name-only -- backend/lost/controllers backend/lost/fastapi_app.py`
  plus `git status --short`; present the list; confirm with the user first
- Empty diff or nothing recognizable: ask for the namespace or endpoint — never guess
- URL prefix absent from the mapping table: check `fastapi_app.py`'s `include_router`
  calls first; confirm the harness name with the user
