# AGENTS.md — frontend/ (LOST React SPA)

> Scoped to `frontend/`. The root `AGENTS.md` carries company core principles, git
> workflow, and repo-wide guidelines — they apply here too and are not repeated.

## The app is nested one level deeper
Run everything from `frontend/lost/`, not `frontend/`:
- `frontend/` itself holds only `Dockerfile` and `nginx.conf` (production static serving)
- The Vite/React app, `package.json`, configs and sources live in `frontend/lost/`

## Commands (from `frontend/lost/`)
- `bun install` — bun only (`bun.lock` is tracked; `package-lock.json` is gitignored)
- `bun run dev` / `bun start` — Vite dev server on :3000
- `bun run build` — **the verification gate**: vite build bundles but does NOT typecheck
- `bun run format` — prettier over `src/`

## JavaScript/TypeScript Standards

### 1. General Coding Standards
- **Formatter**: prettier — `bun run format` (no prettier config file; editor defaults, format-on-save).
- **Linter**: eslint 9 flat config (`eslint.config.mjs`). ⚠️ `bun run lint` fails at baseline
  with 172 parser errors (`parserOptions.project` points at the solution-style `tsconfig.json`
  with `files: []`) — pre-existing, not caused by your change; don't fix the eslint config as a
  side quest.
- **Naming**: `PascalCase` components/containers (`src/components`, `src/containers`),
  `camelCase` everything else.
- **Mixed JS/TS**: the codebase is mostly `.jsx` with growing `.ts/.tsx` — follow the local
  style of the file you edit.
- **API modules**: one file per namespace in `src/api/` (`user.tsx`, `sia.tsx`, `pipeline/`, ...).

### 2. React & Frontend Patterns
- React 19, functional components + hooks only; CoreUI 5 component library.
- State: Redux + react-query v3 for server state; i18n via react-i18next
  (`src/assets/locales/{de,en}.json`).
- Dev API base: `src/lost_settings.js` → `VITE_BACKEND_PORT` (default: 80 for the compose
  stack); production uses same-origin `/api`.
- Runtime config: `public/config.js` sets `globalThis.__APP_CONFIG__` (overwritten in production).

### 3. TypeScript
- `tsconfig.app.json`: `strict: true` + `checkJs`, but `noImplicitAny: false`; pre-existing
  type errors exist — `bunx tsc --noEmit` is not a clean baseline.
- **Verification gate is `bun run build`** (vite build) — it does NOT typecheck.

### 4. Testing
- No frontend tests exist. (The `bun test` note in `frontend/lost/README.md` is Vite
  template boilerplate.)

## Structure (`frontend/lost/src/`)
- `api/` — one module per API namespace (`user.tsx`, `sia.tsx`, `pipeline/`, ...)
- `containers/`, `components/` — PascalCase; CoreUI 5 UI framework
- `assets/locales/{de,en}.json` — react-i18next translations
- `lost_settings.js` — API base URL construction (see React patterns above)
- `public/config.js` — runtime config injection
- Mixed `.jsx` / `.tsx` / `.ts` — follow the local style of the file you edit
