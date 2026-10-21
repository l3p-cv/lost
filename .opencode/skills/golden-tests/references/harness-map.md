# Harness Map — backend/tests golden-snapshot suite

Authoritative docs: `backend/tests/README.md` (flow + rules) and `backend/tests/AGENTS.md`
(agent map). This file summarizes what each harness piece does, so generated spec code
fits the machinery. Read it when unsure where something lives or how it behaves.

## Layout

```
backend/tests/
├── conftest.py              # env loading, CLI flags (--record/--target/--cleanup), core fixtures
├── auth/                    # OpenID tests against a mocked IDP (no goldens)
├── compare/
│   ├── migration_status.py  # MIGRATED set + target_for()
│   ├── <name>_specs.py      # RouteSpec definitions per namespace (17 files)
│   └── test_<name>_compare.py  # runners (17 files)
├── helpers/
│   ├── client.py            # FastAPI TestClient wrapper
│   ├── comparator.py        # assert_equal (structural/exact/binary) + golden load/save
│   ├── recorder.py          # RequestSpec, capture(), save()
│   ├── seed.py              # create/cleanup compare_test_* users (direct DB)
│   ├── lookups.py           # name-based ID lookups (no hardcoded IDs)
│   ├── init_test_data.py    # idempotent test-data seeder (run by run_snapshots.sh)
│   └── specs.py             # RouteSpec dataclass
└── golden/<namespace>/      # recorded reference responses (committed to git)
```

## conftest.py fixtures

| Fixture | Scope | Role |
| --- | --- | --- |
| `dbm` | session | `DBMan(LOST_CONFIG)` for direct DB access; closed on teardown |
| `auth_token` | session | Admin JWT minted directly via `LoginManager(...).create_jwt_pyjwt(...)` (not via the login endpoint; admin holds all roles) |
| `auth_headers` | function | `{"Authorization": "Bearer <token>"}` |
| `client` | function | Indirect-parametrized; builds `fastapi.testclient.TestClient(app, raise_server_exceptions=False)`; any target other than `"fastapi"` hard-fails |
| `seed` | function | Wraps `helpers/seed.py`; tracks users created during the test and deletes them on teardown; honors `--cleanup` |
| `record` | session | Boolean from `--record` |
| `target` | session | String from `--target` (fallback when a spec has no explicit target) |

`conftest.py` loads `docker/compose/.env` into `os.environ` (`setdefault` — real env
wins) at import time, before `lost.settings` is imported anywhere.

## helpers/

- **specs.py** — `RouteSpec` dataclass: `name`, `request`, `skip`, `skip_reason`,
  `follow_up`, `setup(dbm) → context`, `cleanup(dbm, context)`, `target`.
  Landmine: `target` defaults to `"flask"` and hard-fails post-cutover — always stamp
  `target=_TARGET`.
- **recorder.py** — `RequestSpec` (method, path, headers, json, params, data, files,
  label, mode). `capture(client, spec)` normalizes the response to
  `{status, headers, body}`: JSON bodies parsed, empty JSON → `None` (204), non-JSON
  payloads stored as `{"_binary": true, "content_type", "sha256", "size"}`.
  `save(gpath, captured)` writes goldens; `Authorization` headers are rewritten to
  `<AUTH>` before saving; request `json`/`params` are echoed into the golden.
- **comparator.py** — `load_golden(rel_path)`, `save_golden(rel_path, data)`,
  `assert_equal(golden, actual, mode)`, `normalize(response)`. Status codes always
  compared exactly; headers always compared structurally.
- **comparator redactions** — `_REDACTED_KEYS` redacts values for: IDs (`idx`, `id`,
  `user_id`, `group_id`, `groupId`, `anno_task_id`, `dataset_id`, `pipe_id`, …),
  tokens (`api_token`, `token`, `refresh_token`, `access_token`, …), timestamps and
  volatile values (`created_at`, `updatedAt`, `timestamp`, `date`, `started_at`,
  `finished_at`, `progress`, `last_seen`, `lastActivity`, …).
  `_STRIP_HEADERS` drops `date`, `server`, `content-length`, `set-cookie`,
  `connection`, `x-powered-by`, `vary`, `allow` + CORS headers.
  **When a new endpoint returns a volatile key that is not in `_REDACTED_KEYS`, add
  the key there — do not bake noise into the golden.**
- **seed.py** — `TEST_PREFIX = "compare_test_"`, `unique_suffix()` (uuid4 hex[:8]),
  `create_test_user(dbm)` (user + default group + annotator role, direct DB),
  `cleanup_test_user(dbm, user)`, `cleanup_all_test_users(dbm)` (powers `--cleanup`).
- **lookups.py** — name-based ID lookups (`get_test_sia_annotask_id(dbm)`,
  `get_test_dataset_id(dbm)`, …). All return `None` when the entity is missing; specs
  convert `None` into a runtime `pytest.skip` ("run init_test_data.py").
- **init_test_data.py** — idempotent seeder run by `run_snapshots.sh` (also usable
  standalone: `python3 tests/helpers/init_test_data.py --cleanup`). Creates all
  `compare_test_*` entities if missing: SIA pipe/annotask (3 OOTB VOC2012 images, one
  labeled bbox), MIA pipe/annotask (IN_PROGRESS, 2 labeled images), test dataset,
  test group, annotask/dataset export rows, inference model ("compare_test Dummy
  YOLO"), required label leaves. Extend it when a new route needs persistent entities.

## compare/

- **migration_status.py** — `MIGRATED` set (19 namespaces) +
  `target_for(namespace) → "fastapi" | "flask"`. A new namespace MUST be added to
  `MIGRATED` or its specs hard-fail with the flask target.
- **`<name>_specs.py`** — `get_<name>_specs() → list[RouteSpec]` plus
  `get_active_<name>_specs()` (filters `skip`). Routes are appended under numbered
  comments (`# 3. POST /api/group — ...`) — keep that style.
- **`test_<name>_compare.py`** — runner: parametrizes over active specs with
  `indirect=["client"]` (each spec's `target` selects the app via the `client`
  fixture); flow: setup → capture → save-if-record → assert → follow_up →
  `finally: cleanup`.

## golden/<namespace>/

One JSON file per spec name; follow-ups saved under their `label`
(convention: `<SPEC_NAME>__then_GET`). Written with `indent=2, sort_keys=True` for
diff-friendly commits. Structure: `{mode, request: {method, path, headers, json?,
params?}, response: {status, headers, body}}`. Committed to git — specs + goldens
are committed together.

## run_snapshots.sh flow

1. Ensure container `lost-backend-1` is running (override via `LOST_CONTAINER`);
   otherwise `docker compose up -d --build` with compose.yaml + compose.override.yaml
   (the override bind-mounts `backend/` → `/code` — what makes `tests/` visible inside)
2. `initlost.py` — idempotent DB seed (admin user, roles, OOTB pipelines)
3. `init_test_data.py` — idempotent `compare_test_*` test data
4. Bind-mount check (`/code/tests` visible in container)
5. `python -m pytest <args>` inside the container (`cd /code`)

Flags: `--record` and `--cleanup` are forwarded to pytest; `--verbose` is
script-only (dumps last 50 container log lines). No args → `--collect-only` sanity
check. Run from repo root as `./backend/run_snapshots.sh ...`.

## Mode selection guide

| Route kind | Mode |
| --- | --- |
| DB-dependent list/detail endpoints | `structural` (default) |
| Static routes (version, configuration) | `exact` |
| Error paths (D2) | `exact` — fixed names + hardcoded nonexistent IDs (`999999`), no setup/cleanup |
| Binary payloads (images, thumbnails, exports) | `binary` — but note: ALL binary-download routes are currently `skip=True` with a documented `skip_reason` (recorder limitation); prefer a skip over a broken golden |
| Non-deterministic / destructive routes | `skip=True` + `skip_reason` (documentation for future readers) |
