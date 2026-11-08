# Deploying to Render

This repo includes a `render.yaml` "blueprint" that defines both services:
a Python web service for the FastAPI backend, and a static site for the
built React frontend, with the frontend's API base URL wired to the
backend's URL automatically. No manual environment-variable copying needed.

## Steps

1. Push this repo to GitHub (already done if you're reading this from the
   published repo).
2. Go to [render.com](https://render.com) and sign in (or create a free
   account).
3. Click **New > Blueprint**.
4. Connect your GitHub account if you haven't already, then select this
   repo (`npd-demo-digital-todo`).
5. Render will detect `render.yaml` at the repo root and show you the two
   services it's about to create: `deep-shallow-backend` (web service) and
   `deep-shallow-frontend` (static site). Review and click **Apply**.
6. Wait for both builds to finish (a few minutes). Render will give you a
   live URL for the frontend, e.g. `https://deep-shallow-frontend.onrender.com`.
7. Open that URL — you should see the app, talking to the backend
   automatically (the frontend's `VITE_API_BASE_URL` was set at build time to
   the backend's Render hostname).

## About the database

The backend uses SQLite on Render's local, ephemeral disk
(`DATABASE_URL=sqlite:///./db/app.db`). That's fine for a classroom demo:
data persists across requests and across the service staying up, but
**resets whenever the service redeploys or restarts** (new code push, Render
spinning the instance down on the free plan after inactivity, etc).

If you want the data to actually stick across redeploys, the one-line fix is
to add a [Render persistent disk](https://render.com/docs/disks) to the
backend service and point `DATABASE_URL` at a path under its mount, e.g.:

```yaml
# in render.yaml, under the deep-shallow-backend service:
disk:
  name: deep-shallow-data
  mountPath: /data
  sizeGB: 1
```

and change the `DATABASE_URL` env var to `sqlite:////data/app.db`. Not done
here on purpose — the demo is meant to show the mechanic, not to be a
production database setup.
