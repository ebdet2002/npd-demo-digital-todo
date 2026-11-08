#!/usr/bin/env bash
# Idempotent setup: Python venv (via uv) for the backend, npm install for the
# frontend. Safe to re-run any time.
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")"

echo "==> Deep/Shallow setup"

if ! command -v uv >/dev/null 2>&1; then
  echo "error: 'uv' is required (https://docs.astral.sh/uv/). Install it and re-run." >&2
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "error: 'npm' is required. Install Node.js and re-run." >&2
  exit 1
fi

# --- Python / backend -------------------------------------------------
if [ -d ".venv" ]; then
  echo "==> .venv already exists, reusing it"
else
  echo "==> Creating Python venv with uv"
  uv venv .venv
fi

echo "==> Installing backend dependencies"
uv pip install -q -r backend/requirements.txt -p .venv

# --- Node / frontend ----------------------------------------------------
echo "==> Installing frontend dependencies"
(cd frontend && npm install --no-fund --no-audit)

# --- .env -----------------------------------------------------------
if [ -f ".env" ]; then
  echo "==> .env already exists, leaving it as-is"
else
  echo "==> Creating .env from .env.example"
  cp .env.example .env
fi

# --- db -----------------------------------------------------------------
mkdir -p db

echo "==> Setup complete. Next: bash start.sh"
