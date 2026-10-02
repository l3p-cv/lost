# AGENTS.md — Golden-Snapshot Harness (Domain Reference)

> `README.md` in this directory is the authoritative harness documentation — read it
> before changing anything here. This file is the agent-oriented map.

## Domain model
- **RouteSpec** (`helpers/specs.py`): wraps a `RequestSpec` (method/path/json/params/files/`mode`)
  plus `setup(dbm) → context`, optional `follow_up` request, `cleanup(dbm, context)`,
  `skip`/`skip_reason`, and `target`.
- **Runner** (`compare/test_<name>_compare.py`): parametrizes specs with `indirect=["client"]`;
  flow: setup → capture → record-or-compare → follow_up → `finally: cleanup`.
- **Goldens** (`golden/<namespace>/<RouteSpec.name>.json`): written with `indent=2, sort_keys=True`;
  committed to git.
- **Modes**: `structural` (default; keys/types only), `exact` (static routes), `binary`
  (content-type + sha256/size). IDs/tokens/timestamps are redacted by `helpers/comparator.py`.
- **OpenID**: `auth/` tests a mocked IDP (real RSA-signed id_tokens); no goldens.

## Hard rules (rationale in README.md)
1. `RouteSpec.target` defaults to `"flask"` and hard-fails post-cutover — always
   `target=_TARGET` from `compare/migration_status.py`.
2. Never `--record` to silence a failure — root-cause first. Record NEW specs only;
   review the golden diff; commit specs + goldens together.
3. `dbm.session.rollback()` before by-name lookups after an API commit (repeatable-read trap).
4. Test entities: `compare_test_` prefix, seeded by `helpers/init_test_data.py`, looked up
   by NAME via `helpers/lookups.py`; `None` lookup → runtime skip; never hardcode IDs.
5. Exact-mode specs: fixed names + hardcoded nonexistent IDs (`999999`) only.
6. ruff config is `fix = false` — always `ruff check --no-fix`.

## Run (from repo root)
`./backend/run_snapshots.sh [tests/...] [pytest args] [--record|--cleanup] [--verbose]`
Starts the compose stack if needed, seeds the DB and `compare_test_*` data, then runs
pytest inside container `lost-backend-1` (override via `LOST_CONTAINER`).
