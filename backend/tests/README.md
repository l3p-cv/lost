# Backend Test Suite

This directory contains the **golden-snapshot comparison harness** built to verify the
Flask → FastAPI migration (P0 of the migration plan), plus the **OpenID mock tests**.

The idea: every covered API route is called through a test client, and its normalized
response is compared (structurally or exactly) against a **recorded reference response**
("golden snapshot") committed under [`golden/`](golden/). If FastAPI ever deviates from
the established behavior — different status, different body shape, different types — the
comparison fails with a precise diff.

> **Current state (post P1.3 cutover):** FastAPI is the *only* backend server; all Flask
> client paths have been removed from the harness. Tests run in-process against the
> FastAPI app via `fastapi.testclient.TestClient`. The goldens (originally captured from
> Flask, re-recorded from FastAPI where parity was verified) now serve as the regression
> net for future development.

## Contents

- [Inventory](#inventory)
- [Directory layout](#directory-layout)
- [How the harness works — the flow](#how-the-harness-works--the-flow)
- [How to run](#how-to-run)
- [Core fixtures (`tests/conftest.py`)](#core-fixtures-testsconftestpy)
- [Test data management](#test-data-management)
- [Anatomy of a compare test](#anatomy-of-a-compare-test)
- [Snapshot format & naming](#snapshot-format--naming)
- [Comparison modes & redactions](#comparison-modes--redactions)
- [OpenID mock tests (`tests/auth/`)](#openid-mock-tests-testsauth)
- [Adding coverage for a new endpoint or namespace](#adding-coverage-for-a-new-endpoint-or-namespace)
- [Coverage & known gaps](#coverage--known-gaps)

## Inventory

| Area | Path | Contents |
| --- | --- | --- |
| API comparison (golden snapshots) | `tests/compare/` | 17 spec files + 17 runners, 100 active parametrized cases, 40 intentionally skipped specs |
| OpenID auth (mocked IDP) | `tests/auth/` | 7 active tests (`test_openid_fastapi.py`); Flask twin module-skipped |
| Reference responses | `tests/golden/` | 127 JSON snapshots across 16 namespaces |
| Harness infrastructure | `tests/helpers/` | client, comparator, recorder, seed, lookups, specs |

## Directory layout

```
backend/tests/
├── conftest.py              # env loading, CLI flags (--record/--target/--cleanup), core fixtures
├── auth/                    # OpenID tests against a mocked IDP
│   ├── conftest.py          # RSA keys, patched IDP config, fake JWKS client
│   ├── mocks.py             # IDP mocks (token endpoint, id_token factory)
│   ├── test_openid_flask.py # module-level skipped (Flask removed at P1.3)
│   └── test_openid_fastapi.py
├── compare/                 # golden-snapshot comparison suite
│   ├── migration_status.py  # central registry: which namespaces are on FastAPI
│   ├── <name>_specs.py      # RouteSpec definitions per namespace (17 files)
│   └── test_<name>_compare.py  # runners (17 files)
├── helpers/
│   ├── client.py            # FastAPI TestClient wrapper (Flask path removed)
│   ├── comparator.py        # assert_equal (structural/exact/binary) + golden load/save
│   ├── recorder.py          # RequestSpec, capture(), save()
│   ├── seed.py              # create/cleanup compare_test_* users (direct DB access)
│   ├── lookups.py           # name-based ID lookups (no hardcoded IDs)
│   ├── init_test_data.py    # idempotent test-data seeder (run by run_snapshots.sh)
│   └── specs.py             # RouteSpec dataclass
└── golden/<namespace>/      # recorded reference responses (committed to git)
```

## How the harness works — the flow

1. **Spec definition** — each namespace has a `<name>_specs.py` file defining a list of
   `RouteSpec` objects (see [Anatomy](#anatomy-of-a-compare-test)). A `RouteSpec` wraps a
   `RequestSpec` (method, path, headers, json/params/files, comparison mode) plus test
   metadata: `skip`/`skip_reason`, optional `setup(dbm) → context`, optional
   `follow_up` request and `cleanup(dbm, context)`.

2. **Client selection** — the runner parametrizes over the active specs with
   `pytest.mark.parametrize(..., indirect=["client"])`. Each spec's `target` (resolved
   via `migration_status.target_for(<namespace>)`) is handed to the `client` fixture as
   `request.param`. Since the P1.3 cutover only `"fastapi"` is accepted — the fixture
   builds an in-process FastAPI `TestClient` (no HTTP server needed).

3. **Setup** — if the spec has a `setup` callable, it runs first with a `DBMan` handle.
   The returned context dict supplies `{placeholder}` substitutions for the request
   path/body (e.g. `"/api/user/{user_id}"` → real DB id) and may also mint tokens or
   flag a runtime skip (`context["skip"]` when a seeded entity is missing).

4. **Capture** — `recorder.capture(client, spec)` sends the primary request through the
   TestClient (multipart via `files=`/`data=`, query params via `params=`) and normalizes
   the response to `{status, headers, body}`: JSON bodies parsed, empty JSON bodies →
   `None` (204 No Content), non-JSON payloads stored as binary metadata
   (`{"_binary": true, "content_type", "sha256", "size"}`).

5. **Compare or record**
   - **Normal mode** — the golden snapshot is loaded from
     `tests/golden/<namespace>/<spec.name>.json` and checked with
     `comparator.assert_equal(golden, captured, mode)` (see
     [Comparison modes](#comparison-modes--redactions)). Failures raise an
     `AssertionError` with a bullet list of diffs.
   - **Record mode** (`--record`) — the captured response is *saved* as the new golden,
     then immediately loaded back and compared, so a broken recording fails the test
     right away instead of committing a bad snapshot.

6. **Follow-up & cleanup** — if the spec defines a `follow_up` (mutate-then-GET), it is
     captured, saved and compared the same way (golden path = follow-up `label`). The
     `cleanup(dbm, context)` callable always runs in a `finally` block.

```
 RouteSpec ──▶ runner (parametrize, indirect client)
                 │
                 ├─ setup(dbm) ─▶ context ─▶ path/body substitution
                 ├─ capture(client, spec) ─▶ {status, headers, body}
                 ├─ --record ? save(golden) : load(golden)
                 ├─ assert_equal(golden, captured, mode)
                 ├─ follow_up (optional) ─▶ capture/save/compare
                 └─ finally: cleanup(dbm, context)
```

## How to run

### Prerequisites

- Docker + Compose v2. The compose project name is `lost`, so the backend container is
  `lost-backend-1` (override with the `LOST_CONTAINER` env var).
- `docker/compose/compose.override.yaml` must exist — it bind-mounts `backend/` to
  `/code/` inside the container, which is what makes `tests/` visible there.
- `docker/compose/.env` must exist (DB credentials, `LOST_SECRET_KEY`, Redis settings…).
  It is also loaded by `tests/conftest.py` at import time so the tests reach the
  compose MySQL.
- The `admin` user (seeded by `initlost.py`) must exist — the `auth_token` fixture
  fails with a hint if it doesn't.

### `backend/run_snapshots.sh` (recommended)

The wrapper does everything in order: start the compose stack (if not running) →
`initlost.py` (idempotent DB seed) → `init_test_data.py` (idempotent `compare_test_*`
test data) → bind-mount check → run pytest inside the container.

```bash
# From the repo root:

./backend/run_snapshots.sh                                # collect-only sanity check
./backend/run_snapshots.sh tests/compare/ -v               # full comparison suite
./backend/run_snapshots.sh tests/compare/test_user_compare.py -v
./backend/run_snapshots.sh tests/compare/ -k GET_user_self -v
./backend/run_snapshots.sh tests/auth/ -v                 # OpenID mock tests
./backend/run_snapshots.sh tests/compare/ --record -v     # re-record goldens
./backend/run_snapshots.sh tests/compare/ --cleanup       # force-remove leftover test data
./backend/run_snapshots.sh tests/compare/ -v --verbose    # also dump container logs after run
```

| Flag | Consumed by | Meaning |
| --- | --- | --- |
| `--record` | pytest (`tests/conftest.py`) | Re-record golden snapshots from the live app (capture → save → compare). Overwrites `golden/*.json`. |
| `--cleanup` | pytest (`tests/conftest.py`) + `init_test_data` | Force-remove leftover `compare_test_*` data before running. |
| `--target` | pytest (`tests/conftest.py`) | Which app to test. Only `fastapi` is valid since the cutover (default). |
| `--verbose` | the shell script | Print the last 50 container log lines after the run. |
| anything else (`-v`, `-k`, paths…) | forwarded to pytest | Standard pytest arguments. |

With no arguments the script runs `pytest --collect-only -q` (just verifies the harness
loads). On failure it prints the `--verbose` hint.

### Direct pytest (inside the container)

```bash
docker exec lost-backend-1 bash -lc "cd /code && python -m pytest tests/compare/ -v"
```

Note: `backend/pyproject.toml` sets `[tool.pytest.ini_options] testpaths = ["tests"]`, so
running bare `pytest` inside `backend/` collects this suite.

## Core fixtures (`tests/conftest.py`)

| Fixture | Scope | What it does |
| --- | --- | --- |
| `dbm` | session | `DBMan(LOST_CONFIG)` handle for direct DB access; closed on teardown. |
| `auth_token` | session | Mints an admin JWT **directly** via `LoginManager(...).create_jwt_pyjwt(...)` (not via the login endpoint — keeps tests decoupled from token routes). `admin` holds all three roles, so the token passes every role check. |
| `auth_headers` | function | `{"Authorization": "Bearer <auth_token>"}`. |
| `client` | function | The test client. Indirect-parametrized with the spec's `target`; builds a FastAPI `TestClient(app, raise_server_exceptions=False)` (500s come back as responses instead of exceptions). Any target other than `"fastapi"` hard-fails. |
| `seed` | function | Wraps `helpers/seed.py`, tracks users created during the test and deletes them on teardown; honors `--cleanup`. |
| `record` | session | Boolean from `--record`. |
| `target` | session | String from `--target` (fallback when a spec has no explicit target). |

`tests/conftest.py` also loads `docker/compose/.env` into `os.environ` (via `setdefault`,
so a real env always wins) at import time, before `lost.settings` is imported anywhere.

## Test data management

The suite never relies on hardcoded IDs or pre-existing dev data:

- **`helpers/init_test_data.py`** — idempotent seeder run by `run_snapshots.sh` (and
  usable standalone: `python3 tests/helpers/init_test_data.py --cleanup`). Creates all
  `compare_test_*` entities if missing: SIA pipe/annotask (with 3 OOTB VOC2012 images,
  one labeled bbox), MIA pipe/annotask (IN_PROGRESS, 2 labeled images),
  `compare_test_dataset`, `compare_test_group`, DB-only annotask/dataset export rows
  (list endpoints only — downloads stay skipped), a test inference model
  ("compare_test Dummy YOLO"), and required label leaves.
- **`helpers/lookups.py`** — resolves `compare_test_*` entities **by name** and returns
  their DB ids. Specs convert a `None` lookup into a runtime `pytest.skip`
  ("compare_test_… not found — run init_test_data.py") instead of failing.
- **`helpers/seed.py`** — creates/cleans up test users directly in the DB (bypasses the
  API) for mutate-then-GET tests. All test entities are prefixed `compare_test_`, so
  they are easy to identify and remove. `cleanup_all_test_users` powers `--cleanup`.
- **Self-cleaning specs** — every mutating spec defines a `cleanup(dbm, context)`; the
  runner calls it in a `finally` block. Spec setup intentionally does **not** create a
  `ChoosenAnnoTask` — the choose specs manage that in their own setup/cleanup.

## Anatomy of a compare test

A **spec file** defines the routes; a **runner file** executes them. Example
(`compare/user_specs.py`):

```python
from tests.helpers.recorder import RequestSpec
from tests.helpers.specs import RouteSpec
from tests.compare.migration_status import target_for

_TARGET = target_for("user")   # "fastapi"

def _setup_existing_user(dbm):
    user = create_test_user(dbm)
    return {"user_id": user.idx, "user_name": user.user_name, "user_obj": user}

specs.append(RouteSpec(
    name="PATCH_user_update",
    request=RequestSpec(
        method="PATCH",
        path="/api/user/{user_id}",          # {user_id} substituted from setup context
        json={"email": f"updated_{unique_suffix()}@test.local", ...},
        mode="structural",
    ),
    follow_up=RequestSpec(                   # mutate-then-GET
        method="GET",
        path="/api/user/{user_id}",
        mode="structural",
        label="PATCH_user_update__then_GET",
    ),
    setup=_setup_existing_user,
    cleanup=_cleanup_existing_user,
    target=_TARGET,
))
```

And the runner pattern (all 17 runners share it):

```python
_ACTIVE_SPECS = get_active_user_specs()

@pytest.mark.parametrize(
    "spec,client",
    [(s, s.target) for s in _ACTIVE_SPECS],
    indirect=["client"],                     # s.target goes to the client fixture
    ids=[s.name for s in _ACTIVE_SPECS],     # stable ids: test_user_route[GET_user_self]
)
def test_user_route(client, auth_headers, dbm, record, spec: RouteSpec):
    _run_spec(client, auth_headers, dbm, spec, record=record)
```

`indirect=["client"]` is the key trick: the second tuple element (`s.target`) is not a
test argument — it is passed to the `client` fixture as `request.param`, so **each spec
individually selects which app it runs against**.

**`RouteSpec` fields** (`helpers/specs.py`):

| Field | Purpose |
| --- | --- |
| `name` | Short id → snapshot filename + pytest test id. |
| `request` | Primary `RequestSpec`: method, path, headers, json, params, data, files, label, mode. |
| `skip` / `skip_reason` | Skip non-snapshotable routes (non-deterministic, destructive, manually verified); reason is documentation. |
| `follow_up` | Optional second request (usually GET) to verify a mutation. |
| `setup(dbm)` | Optional; returns a context dict substituted into `{placeholder}` paths/bodies; may set `context["skip"]` for runtime skips or `context["fresh_token"]` to override auth. |
| `cleanup(dbm, context)` | Optional; always runs in `finally`. |
| `target` | App to test. **Warning: defaults to `"flask"`, which hard-fails post-cutover — always pass `target=_TARGET`.** |

## Snapshot format & naming

Goldens live at `tests/golden/<namespace>/<RouteSpec.name>.json`; follow-up requests are
saved under their `label` (convention: `<SPEC_NAME>__then_GET`). Written with
`indent=2, sort_keys=True` for diff-friendly commits. Example
(`golden/system/GET_system_version.json`):

```json
{
  "mode": "exact",
  "request": {
    "headers": { "Authorization": "<AUTH>" },
    "method": "GET",
    "path": "/api/system/version"
  },
  "response": {
    "body": "development",
    "headers": { "access-control-allow-origin": "*", "content-type": "application/json" },
    "status": 200
  }
}
```

`Authorization` headers are always rewritten to `<AUTH>` before saving, and request
`json`/`params` are echoed into the recorded request.

## Comparison modes & redactions

Each spec picks a mode (`RequestSpec.mode`):

| Mode | Behavior | Used for |
| --- | --- | --- |
| `structural` (default) | Recursive: same keys, same types, same nesting. List lengths ignored (only the first element's shape is compared); scalars compared by **type only**. | DB-dependent list/detail endpoints (most specs). |
| `exact` | Deep-equal after normalization (keys, list lengths, scalar type + value). | Static endpoints (`/api/system/version`, `/api/sia/configuration`). |
| `binary` | Compares the `content-type` header plus stored metadata (`sha256`, `size`); bytes are never stored. | Images, thumbnails, parquet exports. |

Status codes are always compared exactly; headers are always compared structurally.

**Redactions** (`comparator.py`) keep snapshots stable across runs:

- IDs (`idx`, `id`, `user_id`, `group_id`, `anno_task_id`, …) → `<ID>`
- Tokens (`api_token`, `token`, `refresh_token`, …) → `<TOKEN>`
- Timestamps / volatile values (`created_at`, `updated_at`, `progress`, `timestamp`, …) → `<TS>` / `<REDACTED>`
- Volatile headers are stripped (`date`, `server`, `set-cookie`, CORS headers — CORS is
  added by middleware and differed between Flask and FastAPI).

## OpenID mock tests (`tests/auth/`)

The `auth` namespace talks to an external Authentik IDP, so it is tested with a fully
**mocked IDP** instead of golden snapshots:

- `mocks.py` builds the fake IDP: a `fake_post` recording token-endpoint calls, a fake
  JWKS client, and `create_id_token()` signing test id_tokens with a real RSA-2048 key
  (so RS256 verification actually runs).
- `conftest.py` patches `openid_service._CONFIG` with fake-IDP values and resets the
  JWKS cache between tests.
- `test_openid_fastapi.py` mounts **only** `OpenidEndpoint.router` on a minimal FastAPI
  app (no dask/triton/AppFileMan) and runs the 7 scenarios:
  1. `login` → 302 redirect to the IDP with `state`/`nonce`/`client_id`
  2. `callback` happy path → user auto-created, temp code issued, token endpoint called
     with the right grant
  3. `callback` with IDP error → 401
  4. `callback` state mismatch → 400
  5. `callback` missing code → 400
  6. `POST /token` happy path → JWT + refresh token; annotator group → role mapping
  7. `POST /token` expired code → 401
- `test_openid_flask.py` is the historical Flask twin, module-level skipped since the
  P1.3 cutover (kept for reference).

## Adding coverage for a new endpoint or namespace

1. **Seed data** — if the route needs entities, extend `helpers/init_test_data.py`
   (idempotent, `compare_test_*` naming) and add a name-based lookup to
   `helpers/lookups.py`.
2. **Spec file** — create `compare/<name>_specs.py` with a `get_<name>_specs()`
   function returning `RouteSpec`s. Always stamp `target=_TARGET` from
   `target_for("<namespace>")`. Use `mode="exact"` for static routes, `"binary"` for
   file payloads, `"structural"` otherwise. Prefer `setup`/`cleanup` +
   `follow_up` for mutations over hitting real dev data.
3. **Runner** — copy an existing `test_<name>_compare.py` runner (the `_run_spec`
   pattern: setup → capture → save/compare → follow-up → finally cleanup).
4. **Register** — add the namespace to `migration_status.py`'s `MIGRATED` set if it is
   (obviously) served by FastAPI.
5. **Record** — run
   `./backend/run_snapshots.sh tests/compare/test_<name>_compare.py --record -v`,
   **review the generated `golden/<name>/*.json` diff** (redactions applied? right
   mode?), then commit snapshots + specs together.
6. **Verify** — re-run without `--record`; then run the full suite
   (`./backend/run_snapshots.sh tests/compare/ -v`) to catch cross-suite interference.

## Coverage & known gaps

Active/skipped spec counts per namespace (from the spec files):

| Namespace | Specs | Active | Skipped | Notes |
| --- | --- | --- | --- | --- |
| annotasks | 23 | 18 | 5 | largest surface |
| config | 2 | 1 | 1 | vestigial PATCH not used by FE |
| data | 3 | 2 | 1 | base64/binary images |
| dataset | 13 | 9 | 4 | 2 orphaned goldens from a now-skipped DELETE spec |
| filebrowser | 12 | 7 | 5 | uploads re-recorded (Flask upload tests were broken) |
| group | 4 | 4 | 0 | |
| inference_model | 5 | 5 | 0 | covered (contrary to older planning docs) |
| instructions | 4 | 4 | 0 | |
| instructionmedia | 2 | 0 | 2 | tested manually (runner has empty param set → skip) |
| label | 8 | 8 | 0 | CSV export + import |
| mia | 8 | 5 | 3 | |
| pipeline | 19 | 9 | 10 | |
| sia | 18 | 15 | 3 | most logic-heavy |
| statistics | 2 | 2 | 0 | |
| system | 4 | 3 | 1 | |
| user | 11 | 7 | 4 | token routes skipped (non-deterministic JWTs) |
| worker | 2 | 1 | 1 | |

Additional notes:

- **`triton` has no tests at all** (not "skipped") — no spec file, runner or golden
  namespace exists. It is untested by this suite.
- **`auth`** is covered by the 7 OpenID mock tests, not by golden snapshots.
- 40 skipped `RouteSpec`s are intentional and carry a documented `skip_reason`
  (non-deterministic JWTs, destructive mutations, binary downloads, manually verified in
  P1.2…).
- Latent footguns (inert today): `RouteSpec.target` defaults to `"flask"` and
  `migration_status.target_for()` returns `"flask"` for unknown namespaces — both
  hard-fail post-cutover. Always pass `target=_TARGET` in new specs.
- The `--record` flow is capture → save → compare in one step, so a broken recording
  fails immediately instead of landing in `golden/`.
