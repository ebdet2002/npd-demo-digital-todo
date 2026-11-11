# Changelog

All notable changes to this project are documented here.
Format loosely follows [Keep a Changelog](https://keepachangelog.com/).

## [1.2.0] - 2026-11-11

### Added
- **Choosable Focus timer length.** Grad students asked to set their own
  block length instead of always getting 25 minutes. The Focus Mode timer
  now offers 15 / 25 / 50 / 90 minute presets plus a **Custom** option that
  reveals a minutes input (1–180). Picking a length restarts the block.
- A **Reset** button restarts the current block at the chosen length.
- The chosen length is persisted to `localStorage`
  (`deep-shallow:timer-minutes`) with the same try/catch fallback as Focus
  Mode, and is reused when Focus Mode advances to the next deep task.
  Frontend-only; no backend or schema change. (Per-task durations stored on
  each task remain a v2 item.)
- Added `FocusTimer.test.jsx` (8 tests). Frontend suite: 16/16 passing.

## [1.1.0] - 2026-11-08

### Fixed
- **Focus Mode no longer resets on page reload.** Trying v1.0.0 end to end
  surfaced an immediate rough edge: the whole point of Focus Mode is to
  protect a block of attention, but reloading the page (or Vite's dev-server
  hot reload) while focused silently dropped you back to the full list with
  every shallow task visible again — the exact interruption the product
  exists to prevent, caused by the browser, not by the user ever asking to
  leave Focus Mode.
- `focusMode` is now persisted to `localStorage` (`deep-shallow:focus-mode`)
  on every toggle and restored on load, wrapped in try/catch so a disabled or
  unavailable `localStorage` degrades to the old in-session-only behavior
  instead of crashing the app.
- Added 2 new frontend tests: one confirming Focus Mode survives an
  unmount/remount cycle (simulating a reload) with the stored value read
  before the task list even finishes loading, and one confirming a fresh
  session with nothing stored still defaults to the full list. Frontend
  suite: 8/8 passing (up from 6/6 in v1.0.0). Backend suite unchanged at
  12/12 passing.

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

