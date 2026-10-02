# AGENTS.md — frontend/ (LOST React SPA)

> Scoped to `frontend/`. The root `AGENTS.md` carries company core principles, git
> workflow, and repo-wide guidelines — they apply here too and are not repeated.

## The app is nested one level deeper
Run everything from `frontend/lost/`, not `frontend/`:
- `frontend/` itself holds only `Dockerfile`, `nginx.conf`, `.dockerignore` (production
  static serving) and this `AGENTS.md`
- The Vite/React app, `package.json`, configs and sources live in `frontend/lost/`

## Commands (from `frontend/lost/`)
- `bun install` — bun only (`bun.lock` is tracked; `package-lock.json` is gitignored)
- `bun run dev` — Vite dev server on its default port :5173 (no port is configured)
- `bun start` — dev server forced to :3000 (`vite --open --host --port 3000`)
- `bun run build` — **the verification gate**: vite build bundles but does NOT typecheck
- `bun run format` — prettier over `src/`

## JavaScript/TypeScript Standards

### 1. General Coding Standards
- **Formatter**: prettier — `bun run format`; config is `.prettierrc.json` (`semi: false`,
  `singleQuote: true`, `printWidth: 90`, `tabWidth: 2`).
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
- State: react-query v3 for server state (`redux` is declared in `package.json` but unused
  in `src/` — vestigial); i18n via react-i18next (`src/assets/locales/{de,en}.json`).
- Dev API base: `src/lost_settings.js` → `VITE_BACKEND_PORT` (default: 80 for the compose
  stack); production uses same-origin `/api`.
- Runtime config: `public/config.js` sets `globalThis.__APP_CONFIG__` (overwritten in production).

### 3. TypeScript
- `tsconfig.app.json`: `strict: true` + `checkJs`, but `noImplicitAny: false`; pre-existing
  type errors exist (~774) — `bunx tsc -p tsconfig.app.json --noEmit` is not a clean
  baseline. ⚠️ bare `bunx tsc --noEmit` is a silent no-op (exit 0): it reads the
  solution-style root `tsconfig.json` (`files: []`) and checks nothing.
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

## Annotation UI map
The annotation domain drives most of the SPA. Route registry: `src/guiSetup.jsx`
(`/annotation` → `/sia/*` → `/mia/*`, `/annotasks/:id/review`, dataset review).

- `src/containers/Annotation/` — the annotation screens: `AnnotationTable.tsx` (pick a
  task), `SingleImageAnnotation.tsx` / `MultiImageAnnotation.tsx` (route components),
  `SIA/SiaWrapper.tsx` (data/persistence bridge), `MIA/` (grid + controls), `AnnoTask/`
  (progress, task list, review page)
- ⚠️ `containers/pipeline/` (lowercase) is the designer workflow (start/running pipes,
  annotask modals); `containers/Pipelines/` (uppercase) is only pipeline *projects*
- **`lost-sia` is an npm package** (upstream `l3p-cv/lost-sia`): canvas, tools, keyboard
  shortcuts and undo/redo live there — not in this repo. SPA side is `SiaWrapper.tsx` +
  `legacyHelper.tsx` (backend legacy format `bBoxes/points/lines/polygons` ↔ package
  `Annotation` objects — has its own `@TODO`)
- **No autosave** — every edit is persisted immediately (`PATCH /api/sia` via
  `src/api/sia.tsx`), carrying `annoTime` accumulated since image load; new annos get
  tempIds (`new-*`) reconciled with server ids via ref. Undo/redo replays those mutations
  over the network
- **`SiaWrapper` is shared by three screens** — SIA annotask, annotask review, dataset
  review (`isReview` / `isDatasetMode` branches everywhere); changes affect all three
- react-query for annotation data: `staleTime`/`cacheTime` 0 + `refetchOnWindowFocus:
  false` (freshness matters); mutations invalidate ad-hoc keys (`['miaAnnos']`,
  `['currentannotask']`, ...)
- Layout invariant: the SIA canvas must never resize — don't wrap in `CContainer`, keep
  the sidebar absolutely positioned (`SingleImageAnnotation.tsx` comments)
