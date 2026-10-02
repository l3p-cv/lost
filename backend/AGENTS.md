# AGENTS.md — backend/ (LOST FastAPI backend)

> Scoped to `backend/`. The root `AGENTS.md` carries company core principles, git
> workflow, and repo-wide guidelines — they apply here too and are not repeated.

## Commands (run from `backend/`)
- Lint: `uvx ruff@0.11.8 check --no-fix .` — ruff 0.11.8 is the locked version (`uv.lock`);
  newer ruff reports ~800 pre-existing findings — never mass-fix unrelated ones
- Typecheck: `uvx mypy@1.15.0` (locked; config in `pyproject.toml`: `files=["lost"]`,
  `disallow_untyped_defs`, triton excluded)
- Bare `pytest` from here collects `tests/` (golden-snapshot suite) — needs the compose
  stack + `docker/compose/.env`. In-package unit tests (`lost/logic/test/`, `lost/pyapi/test/`)
  run in the container (`pytest.sh` / `run_snapshots.sh`)
- Imports are rooted at `backend/` (`from lost...`); inside the container this dir is
  `/code` (`PYTHONPATH=/code`)

## Module map (`lost/`)
- `controllers/` — 19 API namespaces; CCB split per module: `<Name>Endpoint.py` (routes,
  schemas, responses) → `<Name>Coordination.py` (thin delegation) → `<Name>Business.py`
  (framework-free domain logic). Shared infra at controllers root: `Dependencies.py`
  (auth guards + coordination factories), `Responses.py` (legacy response vocabulary),
  `Exceptions.py` (`DomainError`, `NotAuthorizedError`), `AuthorizationService.py`
- `logic/` — shared machinery: `db_access.py`, `file_man.py`/`file_access.py`, dask session,
  `init/` (DB bootstrap), `jobs/` (cron), `pipeline/`, `user.py`, `email.py`, `log.py`
- `pyapi/` — scripting API for user-authored pipeline scripts, executed on dask workers
  (legacy zone: `S101` asserts ignored on purpose)
- `db/` — `model.py`, `access.py` (`DBMan` — the only session boundary), `db_patches/`
  (schema patches), `state.py`, `roles.py`, `vis_level.py`
- `cli/` — import/export tools (pipe projects, label trees)
- `utils/`, `templates/email/` — helpers, email templates
- `fastapi_app.py` — app factory; `settings.py` → `LOST_CONFIG` (via root `lostconfig.py`)
- `__init__.py` — intentionally EMPTY (the Docker build stamps `__version__` into it)

## Python Standards

### 1. General Coding Standards
- **Linter**: `ruff check --no-fix .` — config in `pyproject.toml` (line length **120**,
  `fix = false`, rules incl. S/B/C4/I/TRY/UP; `controllers/triton` excluded).
- **Naming**: `snake_case` (vars/funcs), `PascalCase` (classes), `UPPER_SNAKE_CASE` (constants).
- **Path Handling**: prefer `pathlib.Path` in new code; legacy uses `os.*` — don't mass-migrate.
- **String Formatting**: f-strings are used everywhere, including legacy logging calls; new
  modules (e.g. `fastapi_app.py`) use structured `logger.info("event", extra={...})` — prefer
  that for new code.
- **Imports**: Absolute imports only (`from lost...`); no relative imports. Group: Stdlib →
  Third-party → Local.
- **Package Manager**: `uv` (`uv.lock`); the container installs from `uv pip compile pyproject.toml`.

### 2. Type Hinting
- Mypy is configured in `pyproject.toml` (`files = ["lost"]`, `disallow_untyped_defs = true`);
  annotate all defs in new code; locked version **1.15.0**.
- Use modern syntax (`list[str]`, `str | None`) over `List`, `Optional`, `Union` — new code already does.
- `lost/controllers/triton` is excluded from mypy.

### 3. Documentation (Google Style)
- Google Style docstrings (summary in imperative mood, Args/Returns/Raises) — e.g.
  `LabelTree` in `lost/controllers/label/LabelBusiness.py`.
- New modules carry a module docstring stating their CCB layer context (see `backend/lost/README.md`).

### 4. Exception Handling — the D2 pattern
- **Business layer raises plain `DomainError` subclasses** (no HTTP vocabulary), defined in
  each module's Business file; the Endpoint catches them and builds the byte-exact legacy
  response via `lost/controllers/Responses.py`.
- `NotAuthorizedError` is the shared permission-guard error and the **only** globally-handled
  domain error.
- `raise ... from e` to preserve stack traces; no new bare `except:` (legacy has ~70 — leave them).

```python
# Business (framework-free)
from lost.controllers.Exceptions import DomainError

class DuplicateLabelTreeError(DomainError):
    """Raised when a label tree name already exists."""

# Endpoint
from lost.controllers import Responses

try:
    tree = coordination.create_tree(name)
except DuplicateLabelTreeError as e:
    return Responses.conflict(str(e))
return Responses.ok(result)
```

### 5. Logging
- stdlib `logging`, module loggers via `logging.getLogger(__name__)`; GELF/Graylog when configured.
- Prefer structured fields (`extra={...}`) in new code over f-string interpolation.

### 6. Async Patterns
- FastAPI endpoints are mostly sync `def` today; a few `async def` exist. Don't convert
  wholesale — use `async def` only where it demonstrably helps.

### 7. Web Service Standards (FastAPI)
- Pydantic for request/response validation; `Depends()` for auth (`controllers/Dependencies.py`:
  `require_role`, annotask resource guards) and DB access (`DBMan`).
- **Do NOT raise `HTTPException` in migrated namespaces** — use the D2 pattern
  (`DomainError` → `Responses`) to keep byte-exact legacy responses.
- Response vocabulary: `Responses.ok / no_content / bad_request / unauthorized / forbidden /
  not_found / conflict / precondition_failed / unprocessable / internal / plain_text`.
- CCB layering is enforced by `tests/architecture/test_layering.py` — register every
  fully-split module in its `SPLIT_MODULES` registry.

## Schema changes (no alembic)
- Schema change ⇒ new patch file + entry in `lost/db/db_patches/patches.py` `patch_dict`,
  applied by `lost/logic/init/initlost.py` — then re-run `initlost.py`.

## Testing (docker-only)
Golden-snapshot API suite — the regression net (`tests/`, not in CI):

```bash
./run_snapshots.sh tests/compare/ -v                 # from backend/ (script self-locates repo root)
./backend/run_snapshots.sh tests/compare/ -v         # or from repo root
./backend/run_snapshots.sh tests/compare/ -k GET_user_self -v
./backend/run_snapshots.sh tests/compare/ --record -v # re-record goldens
./backend/run_snapshots.sh tests/compare/ --cleanup   # remove leftover test data
```

**Harness rules** (full detail in `tests/README.md` and `tests/AGENTS.md` — read before
touching the suite):
- Never `--record` to silence a failure — root-cause first; record NEW specs only (via `-k`),
  review the golden diff, commit specs + goldens together
- `RouteSpec.target` defaults to `"flask"` and hard-fails post-cutover — always
  `target=_TARGET` from `target_for("<namespace>")`
- After an API commit, `dbm.session.rollback()` before by-name lookups through the
  session-scoped `dbm` (repeatable-read trap)
- Test entities: `compare_test_` prefix only; seed via `tests/helpers/init_test_data.py`,
  look up by name via `helpers/lookups.py` (`None` → runtime skip); never hardcode IDs
- Exact-mode specs: fixed names + hardcoded nonexistent IDs (`999999`) only
- New endpoint coverage: extend seeder + lookups → spec file (`<name>_specs.py`) + runner →
  register namespace in `compare/migration_status.py` `MIGRATED` → `--record` new specs →
  verify without `--record` → full suite
- `auth_token` fixture mints an admin JWT directly via `LoginManager.create_jwt_pyjwt`
  (admin holds all roles); requires the `admin` user seeded by `initlost.py`

## Gotchas
- `lost/__init__.py` is empty on purpose — overwritten at image build with a `__version__` stamp
- `controllers/triton/` is excluded from lint/typecheck and untested
- Bare `except:` and asserts in `pyapi/`+`logic/` are known legacy debt (per-file ruff
  ignores) — leave them
