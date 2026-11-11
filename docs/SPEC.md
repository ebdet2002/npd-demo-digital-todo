# SPEC: Deep/Shallow

## Problem
Flat todo lists rank tasks by date or priority but not by the kind of attention
they require. Short, numerous shallow tasks sit next to long deep tasks, so
opening the list to start deep work exposes quick wins that get done first,
breaking focus before it starts. No ranking or sorting scheme fixes this — the
fix has to hide shallow tasks from view during a protected work block, not just
rank them lower.

## Target User
A grad student or knowledge worker who has at least one task per day that needs
an unbroken block of attention (writing, analysis, coding) and several smaller
reactive tasks (email, forms, scheduling) competing for the same todo list.

## User Stories
- As a user, I want to create a task and tag it Deep or Shallow, so that the app
  knows which category it belongs to.
- As a user, I want to see my full list grouped by Deep and Shallow when Focus
  Mode is off, so that I can triage everything at a glance.
- As a user, I want to toggle Focus Mode on and have shallow tasks disappear, so
  that nothing shallow can pull my attention while I'm doing deep work.
- As a user, I want Focus Mode to show me one current deep task plus a timer, so
  that I have a single, protected target instead of a list to compare against.
- As a user, I want to mark a task done from either view, so that completing work
  updates the same underlying list.
- As a user, I want to see how many shallow tasks are hidden while Focus Mode is
  on, so that I know they weren't lost, just deferred.
- As a user, I want to edit or delete a task, so that I can correct mistakes.
- As a user, I want to choose my focus block length (presets or a custom
  number of minutes), so that the timer fits how long I can actually focus.
- As a user (v2), I want to set a custom timer duration per deep task, so that
  different tasks can get different protected block lengths.
- As a user (v2), I want Focus Mode to auto-advance to the next deep task when the
  timer ends, so that I don't have to return to the full list to pick one.

## Data Model

### Task
- `id`: integer, primary key, autoincrement
- `title`: string, required, max 200 chars
- `description`: string, optional
- `category`: enum `"deep" | "shallow"`, required
- `done`: boolean, default `false`
- `created_at`: datetime, default now, set once

## API Surface
- `GET /api/tasks` — list tasks — query: `category` (`deep`|`shallow`, optional),
  `focus_mode` (bool, optional; when true, excludes `category=shallow`), `done`
  (bool, optional) — returns `Task[]`
- `POST /api/tasks` — create a task — body: `title`, `description?`, `category` —
  returns the created `Task`
- `GET /api/tasks/{id}` — fetch one task — returns `Task` or 404
- `PATCH /api/tasks/{id}` — partial update (title/description/category/done) —
  returns updated `Task` or 404
- `DELETE /api/tasks/{id}` — delete a task — returns 204 or 404
- `GET /api/tasks/counts` — quick counts — returns `{ deep_open, shallow_open,
  shallow_hidden_in_focus }` for the focus-mode "N hidden" indicator

## UI States
- **Full list (Focus Mode off)**: two grouped columns/sections, Deep and Shallow,
  each task showing title, description, done checkbox; new-task form visible.
- **Focus Mode on, deep task available**: shallow tasks hidden entirely; one
  current (first open) deep task shown large with a countdown timer; a badge
  shows the count of hidden shallow tasks; remaining deep tasks queued below,
  collapsed.
- **Focus Mode on, no open deep tasks**: empty state — "No deep work queued" —
  with a prompt to add one or switch Focus Mode off; shallow-hidden count still
  shown.
- **Empty state (no tasks at all)**: prompt to add the first task, Focus Mode
  toggle still visible but inert.
- **Error state**: API unreachable — inline banner, list area shows a retry
  action instead of stale/empty content.

## v1 Scope cut-line
**v1 ships**: CRUD on tasks, deep/shallow tagging, Focus Mode toggle with
hide-shallow behavior, countdown timer on the current deep task, hidden-shallow
count badge, SQLite persistence, seed data.

**Explicitly not v1**: per-task custom timer length (v2 — needs a UI for duration
input, not core to proving the hide-shallow mechanic), auto-advance to next deep
task on timer end (v2 — needs a decision on what "done with this block" means
that's outside this demo's scope), multi-user accounts/auth (out of scope for a
single-user classroom demo), due dates/scheduling (a deliberately different axis
than Deep/Shallow — mixing it in would dilute the demo's one point).
