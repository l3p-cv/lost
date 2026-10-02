# Coding Standards for AI-Assisted Development

> **Hand-crafted** per l3bm AGENTS.md house style  
> **Generated**: 2026-10-02  
> **Detected**: Python + JavaScript/TypeScript  
>
> This file contains coding standards for AI agents and developers.

---

## 🎯 Core Development Principles

**AI agents should follow these guidelines when writing code:**

### 1. Keep It Simple, Stupid (KISS)
- Favor simple, readable solutions over clever ones; avoid premature optimization
- Prefer explicit over implicit code
- Break complex problems into smaller, manageable pieces

### 2. Maintain High Quality

#### 2.1 Test-Driven Development (Where Practical)
Write tests for new features and bug fixes when it makes sense.

**Prioritize tests for:**
- Business logic and algorithms
- API endpoints and public interfaces
- Bug fixes (regression tests)
- Complex utility functions

#### 2.2 Breaking Changes Awareness
**CRITICAL**: Before implementing changes that affect existing callers, AI agents MUST ask for user confirmation.

**Breaking changes include:**
- Function/method signature changes (parameters, return types)
- Renaming/removing public APIs, classes, or methods
- Changing API endpoints, response formats, database schemas, or config formats

**Required protocol:**
1. Identify breaking change and search for affected callers (grep/glob)
2. Ask user: "⚠️ Breaking change: [description]. Found X affected files. Proceed?"
3. Wait for explicit approval before implementing

**Non-breaking** (safe to proceed): New optional parameters with defaults, internal refactoring, new functions/endpoints, docs, performance improvements

### 3. Read Before Changing
- Always read related files before modifying code; match existing patterns
- Verify function signatures, imports, and types - don't assume
- Ask user when uncertain about architectural decisions

### 4. Work Incrementally
- Break features into smallest viable steps; ensure each is testable
- Avoid changing multiple unrelated things simultaneously
- Allow for early user review and course correction

### 5. Fail Fast and Loud
- Validate inputs at function entry; use assertions for invariants
- Throw specific, meaningful exceptions (not generic errors)
- Only catch exceptions when you can handle them meaningfully; log at service boundaries

---

## 📍 Repository Entry Points

**Entry points and their purposes:**

### `backend/lost/fastapi_app.py` (ACTIVE)
- FastAPI application factory — the one true ASGI app (`uvicorn lost.fastapi_app:app`, port 8000)
- Flat `/api/<namespace>` routes, 19 namespaces; CORS always-on
- Global handler maps `NotAuthorizedError` to the standard 403 body
- Graylog (GELF UDP) attached at module load when `use_graylog` is set

### `backend/entrypoint.sh` (ACTIVE — container CMD)
- Waits for MySQL → `initlost.py` → `initworker.py` → dask scheduler/worker → cron jobs → uvicorn

### `backend/lost/logic/init/initlost.py` (ACTIVE)
- Idempotent DB bootstrap: applies db_patches, seeds admin/roles, imports OOTB pipelines — re-run after schema changes

### `frontend/lost/index.html` + `frontend/lost/src/index.jsx` (ACTIVE)
- Vite bootstrap; React 19 root render inside `React.StrictMode`

### `frontend/lost/src/App.jsx` (ACTIVE)
- Main application component: i18n init (react-i18next, `src/assets/locales/{de,en}.json`), `QueryClientProvider` (react-query), `BrowserRouter`/`Routes`, axios wiring via `API_URL` from `lost_settings.js`

### `frontend/nginx.conf` (ACTIVE — production)
- Serves built `dist/` behind traefik; API stays same-origin `/api`

### `docker/compose/compose.yaml` (ACTIVE)
- Full stack: traefik :80, MySQL :3306, phpMyAdmin :8081, Redis
- `compose.override.yaml` (auto-included) builds images from source and bind-mounts `backend/` → `/code` in the container

### Legacy / do not follow
- `docs/develop.md` — tech-stack section is stale (Flask/Celery/RabbitMQ); the code is FastAPI/dask/Redis
- `lost-env.sh` — stale `PYTHONPATH` (`src/backend`); config comes from `docker/compose/.env` and `LOST_*` vars
- `backend/lost/settings.py` — ACTIVE config holder (`LOST_CONFIG`), but its Flask-era keys are vestigial
- `backend/lost/__init__.py` — intentionally empty; Docker build overwrites it with a `__version__` stamp

---

## Git Workflow

**Branching:** `master` with short-lived feature/bug branches (`feature/name`, `bug/name`). Merge via MR. **Tagging is the release mechanism** — GitLab CI publishes images only on git tags (SemVer, see `docs/develop.md`). Always push to remote, sync with master regularly, delete after merge.

**Best Practices:**
1. **Atomic commits** - One logical change per commit that compiles/passes tests
2. **Keep updated** - Regularly merge master to reduce conflicts
3. **Push early** - Make work available for collaboration
4. **Clean whitespace** - Use `git diff --check` before committing
5. **Clear messages** - Focus on "why" with context for maintainers
6. **Review before push** - Check for debug code, secrets, verify staged files
7. **Test before merge** - Run full test suite, verify CI/CD passes

Also: record notable changes in the root `CHANGELOG.md` under `## unreleased`.

---

## Python Standards

### 1. General Coding Standards

- **Linter**: `ruff check --no-fix .` from `backend/` — config in `backend/pyproject.toml` (line length **120**, `fix = false`, rules incl. S/B/C4/I/TRY/UP; `lost/controllers/triton` excluded). `uv.lock` pins ruff **0.11.8** — use `uvx ruff@0.11.8 check --no-fix .`; newer ruff versions report ~800 pre-existing findings — never mass-fix unrelated ones.
- **Naming**: `snake_case` (vars/funcs), `PascalCase` (classes), `UPPER_SNAKE_CASE` (constants).
- **Path Handling**: prefer `pathlib.Path` in new code; legacy uses `os.*` — don't mass-migrate.
- **String Formatting**: f-strings are used everywhere, including legacy logging calls; new modules (e.g. `fastapi_app.py`) use structured `logger.info("event", extra={...})` — prefer that for new code.
- **Imports**: Absolute imports only (`from lost...`); no relative imports. Group: Stdlib → Third-party → Local.
- **Package Manager**: `uv` (`uv.lock`); the container installs from `uv pip compile pyproject.toml`.

### 2. Type Hinting

- Mypy is configured in `backend/pyproject.toml` (`files = ["lost"]`, `disallow_untyped_defs = true`); locked version **1.15.0** → `uvx mypy@1.15.0` from `backend/`. Annotate all defs in new code.
- Use modern syntax (`list[str]`, `str | None`) over `List`, `Optional`, `Union` — new code already does.
- `lost/controllers/triton` is excluded from mypy.

### 3. Documentation (Google Style)

- Google Style docstrings (summary in imperative mood, Args/Returns/Raises) — e.g. `LabelTree` in `lost/controllers/label/LabelBusiness.py`.
- New modules carry a module docstring stating their CCB layer context (see `backend/lost/README.md`).

### 4. Exception Handling — the D2 pattern

- **Business layer raises plain `DomainError` subclasses** (no HTTP vocabulary), defined in each module's Business file; the Endpoint catches them and builds the byte-exact legacy response via `lost/controllers/Responses.py`.
- `NotAuthorizedError` is the shared permission-guard error and the **only** globally-handled domain error.
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

- FastAPI endpoints are mostly sync `def` today; a few `async def` exist. Don't convert wholesale — use `async def` only where it demonstrably helps.

### 7. Testing (Pytest, docker-only)

- Suites: `backend/tests/` (golden-snapshot compare, auth, architecture) and in-package unit tests (`lost/logic/test/`, `lost/pyapi/test/`).
- All tests need the compose stack (live MySQL + seeded `admin`). No coverage threshold is enforced.

### 8. Web Service Standards (FastAPI)

- Pydantic for request/response validation; `Depends()` for auth (`lost/controllers/Dependencies.py`: `require_role`, annotask resource guards) and DB access (`DBMan`).
- **Do NOT raise `HTTPException` in migrated namespaces** — use the D2 pattern (`DomainError` → `Responses`) to keep byte-exact legacy responses.
- Response vocabulary: `Responses.ok / no_content / bad_request / unauthorized / forbidden / not_found / conflict / precondition_failed / unprocessable / internal / plain_text`.
- CCB layering is enforced by `backend/tests/architecture/test_layering.py` — register every fully-split module in its `SPLIT_MODULES` registry.

---

## JavaScript/TypeScript Standards

### 1. General Coding Standards

- **Package manager**: bun only (`bun.lock` is tracked; `package-lock.json` is gitignored).
- **Formatter**: prettier — `bun run format` (no prettier config file; editor defaults, format-on-save).
- **Linter**: eslint 9 flat config (`eslint.config.mjs`). ⚠️ `bun run lint` fails at baseline with 172 parser errors (`parserOptions.project` points at the solution-style `tsconfig.json` with `files: []`) — pre-existing, not caused by your change; don't fix the eslint config as a side quest.
- **Naming**: `PascalCase` components/containers (`src/components`, `src/containers`), `camelCase` everything else.
- **Mixed JS/TS**: the codebase is mostly `.jsx` with growing `.ts/.tsx` — follow the local style of the file you edit.
- **API modules**: one file per namespace in `src/api/` (`user.tsx`, `sia.tsx`, `pipeline/`, ...).

### 2. React & Frontend Patterns

- React 19, functional components + hooks only; CoreUI 5 component library.
- State: Redux + react-query v3 for server state; i18n via react-i18next (`src/assets/locales/{de,en}.json`).
- Dev API base: `src/lost_settings.js` → `VITE_BACKEND_PORT` (default: 80 for the compose stack); production uses same-origin `/api`.
- Runtime config: `public/config.js` sets `globalThis.__APP_CONFIG__` (overwritten in production).

### 3. TypeScript

- `tsconfig.app.json`: `strict: true` + `checkJs`, but `noImplicitAny: false`; pre-existing type errors exist.
- **Verification gate is `bun run build`** (vite build) — it does NOT typecheck; `bunx tsc --noEmit` is not a clean baseline.

### 4. Testing

- No frontend tests exist. (The `bun test` note in `frontend/lost/README.md` is Vite template boilerplate.)

---

## 🎯 Project-Specific Guidelines

**Critical information for AI coding agents working on this project:**

### Project Overview
- **LOST** (Label Objects and Save Time): web-based collaborative image annotation platform
- **Architecture**: full-stack monorepo — FastAPI backend (`backend/lost`) + React SPA (`frontend/lost`); everything runs via docker compose
- **Domain**: annotation pipelines (SIA single-image, MIA multi-image), label trees, dataset exports, file browser (S3/Azure/FTP/...), statistics, review workflows, Triton inference integration

### Backend Architecture

**CCB split** per namespace under `lost/controllers/<name>/`:
- `<Name>Endpoint.py` — routes, schemas, response construction (catches `DomainError` → `Responses`)
- `<Name>Coordination.py` — thin delegation only
- `<Name>Business.py` — framework-free domain logic (no fastapi imports)
- Enforced by `backend/tests/architecture/test_layering.py` (one-way imports, framework-free business/coordination, `SPLIT_MODULES` registry)

**Shared infrastructure** (controllers root): `Dependencies.py` (auth guards + coordination factories), `Responses.py` (legacy response vocabulary), `Exceptions.py` (`DomainError`, `NotAuthorizedError`), `AuthorizationService.py`.

**Database:**
- SQLAlchemy 2 on MySQL via `DBMan` (`lost/db/access.py`) — the only session boundary; close sessions in `finally` or use fixtures that do
- **No alembic** — schema changes require a new patch file + entry in `lost/db/db_patches/patches.py` `patch_dict` (applied by `initlost.py`)

**Pipeline engine:** user-authored scripts run on dask workers via `lost/pyapi/` (legacy zone: `S101` asserts ignored on purpose in `pyapi/` and `logic/`).

**Triton:** `lost/controllers/triton` (Nvidia inference integration, see `INFERENCE_SERVER_DOC.md`) is excluded from lint/typecheck and has no tests.

### Environment Variables
- All backend config flows through `lostconfig.LOSTConfig` reading `LOST_*` vars (`lost_db_*`, `lost_secret_key`, `lost_redis_*`, `lost_worker_*`, mail, jupyter, ...).
- `docker/compose/.env` is **committed** with dev defaults and doubles as the env source for `tests/conftest.py` (loaded via `os.environ.setdefault` — a real env always wins). Don't put real secrets there.

### CI/CD (`.gitlab-ci.yml`)
- Stages: build (test images) → test (compose + `pytest.sh`) → release (**git tags only**: `l3pcv/lost-{frontend,backend}:$TAG`)
- **CI runs only the in-package unit tests** (`pytest /code/lost`); the golden-snapshot suite is dev-run only — run it yourself before merging API changes.
- Docs (docusaurus, `docs/`) deploy via GitHub workflow.

### Development Workflow (docker-based)
- `cd docker/compose && docker compose up` — traefik :80 routes `/` → frontend, `/api`+`/docs`+`/openapi.json`+`/redoc` → backend :8000; MySQL :3306; phpMyAdmin :8081.
- `compose.override.yaml` bind-mounts `backend/` → `/code`: backend edits are live without rebuilds. Frontend changes need a rebuild (`docker compose build frontend`) or `bun run dev` against the stack.
- Backend debugging: `docker exec lost-backend-1 ...` (container name overridable via `LOST_CONTAINER`).

### Testing (docker-only)
Golden-snapshot API suite — the regression net (`backend/tests/`, not in CI):

```bash
./backend/run_snapshots.sh tests/compare/ -v                     # full suite
./backend/run_snapshots.sh tests/compare/test_user_compare.py -v # focused file
./backend/run_snapshots.sh tests/compare/ -k GET_user_self -v    # focused test
./backend/run_snapshots.sh tests/compare/ --record -v            # re-record goldens
./backend/run_snapshots.sh tests/compare/ --cleanup              # remove leftover test data
```
Direct: `docker exec lost-backend-1 bash -lc "cd /code && python -m pytest tests/compare/ -v"`

**Harness rules** (full detail in `backend/tests/README.md` and `backend/tests/AGENTS.md` — read before touching the suite):
- Never `--record` to silence a failure — root-cause first; record NEW specs only (via `-k`), review the golden diff, commit specs + goldens together
- `RouteSpec.target` defaults to `"flask"` and hard-fails post-cutover — always `target=_TARGET` from `target_for("<namespace>")`
- After an API commit, `dbm.session.rollback()` before by-name lookups through the session-scoped `dbm` (repeatable-read trap)
- Test entities: `compare_test_` prefix only; seed via `tests/helpers/init_test_data.py`, look up by name via `helpers/lookups.py` (`None` → runtime skip); never hardcode IDs
- Exact-mode specs: fixed names + hardcoded nonexistent IDs (`999999`) only

**New endpoint coverage:** extend seeder + lookups → spec file (`<name>_specs.py`) + runner → register namespace in `compare/migration_status.py` `MIGRATED` → `--record` new specs → verify without `--record` → full suite.

**Fixtures:** `auth_token` mints an admin JWT directly via `LoginManager.create_jwt_pyjwt` (admin holds all roles) — decoupled from login routes; requires the `admin` user seeded by `initlost.py`.

### Common Gotchas
- `backend/lost/__init__.py` is empty on purpose — overwritten at image build with a `__version__` stamp
- `bun run lint` and `tsc` baselines are red (pre-existing) — verify frontend changes with `bun run build`
- Backend lint baseline is version-sensitive: locked ruff 0.11.8 vs. newer ruff → ~800 pre-existing findings; don't mass-fix
- `docs/develop.md` tech-stack section is stale (Flask/Celery era) — trust the code
- Bare `except:` and asserts in `pyapi/`+`logic/` are known legacy debt (per-file ruff ignores) — leave them

---

*Hand-crafted per l3bm AGENTS.md house style. Update pass: refresh the Generated timestamp, fold in new subsystems and entry points — see drafting playbook §7.*
