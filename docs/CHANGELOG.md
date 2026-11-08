# Changelog

All notable changes to this project are documented here.
Format loosely follows [Keep a Changelog](https://keepachangelog.com/).

## [1.0.0] - 2026-11-08

Initial working version. Built via the `arr-digital-spec` → `arr-digital-proto`
skill pipeline from `docs/WHY.md`.

### Added
- FastAPI backend (`backend/`) with a `Task` model (title, description,
  category `deep`|`shallow`, done, created_at) and full CRUD at `/api/tasks`,
  plus `/api/tasks?focus_mode=true` which hides shallow tasks (and overrides
  any conflicting `category` filter) and `/api/tasks/counts` for quick-glance
  counts.
- 12 pytest cases covering CRUD, validation, the focus-mode filter, and the
  focus-mode-overrides-category edge case.
- React + Vite frontend (`frontend/`) implementing the two core views:
  `FullListView` (grouped Deep/Shallow, surfaced shallow tasks) and
  `FocusView` (current deep task + countdown timer, hidden-shallow-count
  badge, empty state when no deep work is queued).
- 6 vitest + React Testing Library tests exercising Focus Mode toggling and
  the error-retry banner.
- Brand package (`brand/colors.json`, `brand/fonts.md`, `brand/logo.svg`)
  wired into the frontend via `theme.css` and `index.html`.
- `db/schema.sql` and `db/seed.py` with 8 realistic mixed deep/shallow rows.
- `setup.sh` (idempotent venv + npm install) and `start.sh` (port-fallback
  launcher for both services).
- Two reusable Claude Code skills committed under `.claude/skills/`:
  `arr-digital-spec` and `arr-digital-proto`.

