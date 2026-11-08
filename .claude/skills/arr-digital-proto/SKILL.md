---
name: arr-digital-proto
description: Scaffold a working three-tier app (FastAPI backend, React/Vite frontend, SQLite db) from a SPEC.md + brand/ package produced by arr-digital-spec. Use when a spec and brand package already exist and it's time to generate the actual running prototype, including tests, run scripts, and version tagging.
---

# arr-digital-proto

Takes `docs/SPEC.md` + `brand/` (as produced by `arr-digital-spec`) and scaffolds a
real, runnable three-tier app: Python/FastAPI backend, React/Vite frontend, SQLite
database — with tests, run scripts, and semver/git conventions wired up from the
start. The output is meant to actually run, not illustrate an architecture.

## Preconditions

Before starting, confirm `docs/SPEC.md`, `brand/colors.json`, `brand/fonts.md`,
and `brand/logo.svg` exist. If any is missing, stop and run `arr-digital-spec`
first (or tell the user to) — do not invent a spec inline, the whole point of
splitting the two skills is that the spec is reviewed before code exists.

## Process

### Step 1 — Parse the spec into a build plan

From `docs/SPEC.md`:
- `## Data Model` → one SQLAlchemy model + one Pydantic schema pair per entity.
  Map types informally (`str`, `int`, `bool`, `datetime`, enum lists like
  `"deep"|"shallow"` → a `CheckConstraint` or `Enum`). Every model gets an
  autoincrement `id` primary key and, unless the spec says otherwise, a
  `created_at` timestamp defaulting to now.
- `## API Surface` → one FastAPI route per line, grouped into a router per
  resource. Query params described in the spec (e.g. a boolean filter) become
  typed `Query(...)` parameters, not magic strings.
- `## UI States` → one React view/condition per line. Don't skip the empty state
  or the toggled-mode state — those are usually where the product's actual novelty
  lives.

### Step 2 — Backend (`backend/`)

- `backend/requirements.txt`: fastapi, uvicorn[standard], sqlalchemy, pydantic,
  python-dotenv, pytest, httpx (for the TestClient).
- `backend/app/models.py`: SQLAlchemy models from the data model.
- `backend/app/schemas.py`: Pydantic request/response schemas.
- `backend/app/database.py`: engine + session, reading `DATABASE_URL` from env
  (default to a file under `db/`), with a `get_db` dependency.
- `backend/app/main.py`: FastAPI app, CORS open for local dev, routers mounted.
- `backend/tests/`: pytest suite using `TestClient` against an in-memory or temp
  SQLite db (never the real `db/app.db`). Every endpoint gets at least one
  happy-path test and one edge-case test (e.g. the mode filter actually filters).
  Tests must assert on real response bodies/status codes — no placeholder
  `assert True`.

### Step 3 — Database (`db/`)

- `db/schema.sql`: the DDL mirroring the SQLAlchemy models (kept as documentation
  / for anyone who wants to inspect the db without the app).
- `db/seed.py`: a small script inserting a handful of realistic rows spanning the
  interesting states in the data model (for this product: a mix of deep/shallow
  tasks, some done, some not). Idempotent — safe to re-run (clear + reseed, or
  upsert).

### Step 4 — Frontend (`frontend/`)

Scaffold with Vite's React template conventions (`frontend/index.html`,
`frontend/src/main.jsx`, `frontend/src/App.jsx`, `frontend/vite.config.js`,
`frontend/package.json`). Apply the brand package per the consumption contract
below. Build one component per UI-state line from the spec. Wire API calls to the
backend's base URL via an env var (`VITE_API_BASE_URL`, default
`http://localhost:<BACKEND_PORT>`), never hardcoded.

Testing: `vitest` + `@testing-library/react` + `jsdom`. At least one test per
interactive behavior the spec's UI States call out as load-bearing (e.g. a mode
toggle that hides/shows items) — assert on rendered DOM, not implementation
details.

**Brand consumption** (contract from `arr-digital-spec`):
- Read `brand/colors.json` → emit `frontend/src/theme.css` with `:root` custom
  properties `--color-primary`, `--color-secondary`, `--color-background`,
  `--color-surface`, `--color-text` (plus `--color-accent`/`--color-muted` if
  present, else derive: accent = secondary, muted = a tint of text). Import this
  file once in `main.jsx`.
- Read `brand/fonts.md` → find the two `### Heading: ...` / `### Body: ...`
  headings and their Google Fonts link; add a `<link>` tag in `index.html` and set
  `--font-heading` / `--font-body` in `theme.css`.
- Copy `brand/logo.svg` to `frontend/src/assets/logo.svg`; render it inline in the
  top nav.

### Step 5 — Root-level wiring

- `.env.example` at repo root with every env var referenced above (ports,
  `DATABASE_URL`, `VITE_API_BASE_URL`), never a `.env` with real secrets (there
  shouldn't be any for a local demo, but keep the convention anyway).
- `setup.sh`: idempotent. Use `uv venv` + `uv pip install -r backend/requirements.txt`
  for Python; `npm install` (in `frontend/`) for JS. Skip steps whose output
  already exists in a way that's safe to detect (e.g. skip `uv venv` if `.venv`
  already has the right Python, but always re-run installs since they're cheap
  and idempotent by nature).
- `start.sh`: load `.env`, resolve `BACKEND_PORT`/`FRONTEND_PORT` by probing with
  `lsof -i :$PORT` and incrementing past anything already bound, export the
  resolved ports (and `VITE_API_BASE_URL` pointing at the resolved backend port),
  launch `uvicorn` and the Vite dev server concurrently, print both final URLs,
  and trap `SIGINT` to kill both child processes together.

### Step 6 — Versioning conventions

- Semver starts at `0.1.0` during scaffolding; the first version where
  `setup.sh && start.sh` demonstrably works end-to-end (both services up, both
  test suites green) gets tagged `v1.0.0`.
- Conventional commits throughout (`feat:`, `fix:`, `test:`, `chore:`, `docs:`) —
  one logical change per commit, not one commit per skill run.
- Every version bump updates `docs/CHANGELOG.md` (Keep a Changelog style) and gets
  an annotated git tag matching the version (`git tag -a vX.Y.Z -m "..."`).
- A later iteration that changes behavior (not just scaffolding) bumps minor
  (`v1.1.0`) if it's a genuine improvement with no breaking change, patch for a
  pure bugfix, major for a breaking API/schema change.

## Output checklist

Before finishing, confirm: backend starts and serves the API surface from the
spec; frontend starts and renders every UI state; `pytest` and the frontend test
suite both pass; `setup.sh` and `start.sh` are executable and idempotent;
`db/seed.py` has been run at least once against a real (non-test) db file.
