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

## 🎯 Project-Specific Guidelines

**Critical information for AI coding agents working on this project:**

### Project Overview
- **LOST** (Label Objects and Save Time): web-based collaborative image annotation platform
- **Architecture**: full-stack monorepo — FastAPI backend (`backend/lost`) + React SPA (`frontend/lost`); everything runs via docker compose
- **Domain**: annotation pipelines (SIA single-image, MIA multi-image), label trees, dataset exports, file browser (S3/Azure/FTP/...), statistics, review workflows, Triton inference integration

### Subproject guides
- Before editing under `backend/` — read `backend/AGENTS.md` (Python standards, module map, D2/CCB rules, schema patches, harness commands)
- Before editing under `frontend/` — read `frontend/AGENTS.md` (JS/TS standards, app nesting, structure, red lint baselines)
- Before touching the annotation domain (SIA/MIA, pipelines, review) — read the "Annotation domain map" in `backend/AGENTS.md` and the "Annotation UI map" in `frontend/AGENTS.md`

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

### Testing
- All suites are docker-only; CI runs only the in-package unit tests.
- The golden-snapshot API suite (`backend/tests/`) is the regression net — dev-run before merging API changes; commands and harness rules live in `backend/AGENTS.md` and `backend/tests/README.md`.

### Common Gotchas
- `docker/compose/.env` is committed with dev defaults — don't put real secrets there; a real env always wins
- `docs/develop.md` tech-stack section is stale (Flask/Celery era) — trust the code
- Frontend lint/tsc baselines are red (pre-existing) — see `frontend/AGENTS.md` before "fixing" anything
- Backend lint baseline is version-sensitive (locked ruff 0.11.8) — see `backend/AGENTS.md` before "fixing" anything

---

*Hand-crafted per l3bm AGENTS.md house style. Update pass: refresh the Generated timestamp, fold in new subsystems and entry points — see drafting playbook §7.*
