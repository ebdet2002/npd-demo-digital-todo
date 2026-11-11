# Deep/Shallow

A todo app built for a UVA New Product Development guest lecture, as a
demo of fast, structured product iteration — from a one-paragraph problem
statement to a deployed, tested, versioned app.

## The Why

Grad students and knowledge workers juggle two very different kinds of work:
deep, sustained focus work (writing, research, analysis) and shallow,
reactive admin (email, forms, scheduling). Ordinary todo apps treat every
task the same, so opening the list to start deep work exposes a pile of
quick, satisfying shallow tasks right next to it — and those get done first,
breaking focus before it starts.

**The product's bet**: tag every task **Deep** or **Shallow**, and give the
app a **Focus Mode** toggle that changes what's even visible, not just how
it's sorted.

- **Focus Mode ON** — shallow tasks are hidden entirely. You see only the
  current deep task and a countdown timer (15/25/50/90 min or a custom
  length, remembered across reloads), plus a badge showing how many
  shallow tasks are waiting (deferred, not lost).
- **Focus Mode OFF** — the full list, grouped by Deep / Shallow, with
  shallow tasks surfaced for exactly the moments they're suited for.

Full narrative: [`docs/WHY.md`](docs/WHY.md). Full spec: [`docs/SPEC.md`](docs/SPEC.md).

## How it was built: two composable Claude Code skills

This repo was built with two reusable skills, committed under
[`.claude/skills/`](.claude/skills/), meant to be genuinely reusable beyond
this one project:

- **[`arr-digital-spec`](.claude/skills/arr-digital-spec/SKILL.md)** — turns
  a `docs/WHY.md` into a token-efficient `docs/SPEC.md` (Problem, Target
  User, User Stories, Data Model, API Surface, UI States, v1 scope cut-line)
  plus a brand package (`brand/colors.json`, `brand/fonts.md`,
  `brand/logo.svg`).
- **[`arr-digital-proto`](.claude/skills/arr-digital-proto/SKILL.md)** —
  takes that spec + brand package and scaffolds the actual three-tier app:
  FastAPI backend, React/Vite frontend, SQLite database, run scripts, and
  test suites — reading the spec's Data Model / API Surface / UI States
  sections and the brand package's exact file/field layout, so the two
  skills compose without a human re-typing anything in between.

Each skill's `SKILL.md` documents its own process in full; running them in
order on this repo's `docs/WHY.md` is what produced `docs/SPEC.md`, `brand/`,
and the app scaffold you see here.

## Project layout

```
backend/    FastAPI + SQLAlchemy app (Task CRUD, focus-mode filtering)
frontend/   React + Vite app (FullListView, FocusView, Focus Mode toggle)
db/         schema.sql + seed.py (realistic mixed deep/shallow seed data)
docs/       WHY.md, SPEC.md, CHANGELOG.md
brand/      colors.json, fonts.md, logo.svg
.claude/skills/   the two skills described above
```

## Running it locally

Requires [`uv`](https://docs.astral.sh/uv/) and Node/npm.

```bash
bash setup.sh   # idempotent: creates/updates the venv, installs frontend deps
bash start.sh   # launches backend + frontend, picking free ports automatically
```

`start.sh` reads `BACKEND_PORT` / `FRONTEND_PORT` from `.env` (copied from
`.env.example` on first run), and if either port is already in use, walks
forward to the next free one and prints the resolved URLs it actually
started on — so it's safe to run even with other local services up.

To load some example data:

```bash
.venv/bin/python db/seed.py
```

### Running the tests

```bash
# backend
cd backend && ../.venv/bin/python -m pytest -q

# frontend
cd frontend && npm test
```

## Versioning

Semver, tagged in git. See [`docs/CHANGELOG.md`](docs/CHANGELOG.md) for the
full history.

- **v1.0.0** — initial working app: Task CRUD, Deep/Shallow tagging, Focus
  Mode with hide-shallow behavior and countdown timer, hidden-shallow-count
  badge, SQLite persistence + seed data, both test suites green.
- **v1.1.0** — one iteration pass after using the v1.0.0 app end to end (see
  CHANGELOG for exactly what changed and why).

## Deploying

Deployment is prepped but not executed from this environment (no Render
credentials here). See [`DEPLOY.md`](DEPLOY.md) for exact steps: push to
GitHub (done), go to render.com, **New > Blueprint**, point it at this repo,
and `render.yaml` provisions both the backend web service and the frontend
static site with the API URL wired up automatically.
