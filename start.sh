#!/usr/bin/env bash
# Launches the backend (uvicorn) and frontend (vite dev server) together.
# Reads BACKEND_PORT / FRONTEND_PORT from .env, and if either port is already
# taken, walks forward to the next free port before launching.
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")"

if [ ! -f ".env" ]; then
  echo "==> No .env found, copying .env.example -> .env"
  cp .env.example .env
fi

# shellcheck disable=SC1091
set -a
source .env
set +a

BACKEND_PORT="${BACKEND_PORT:-8000}"
FRONTEND_PORT="${FRONTEND_PORT:-5173}"

port_is_free() {
  local port="$1"
  if command -v lsof >/dev/null 2>&1; then
    ! lsof -i ":${port}" -sTCP:LISTEN >/dev/null 2>&1
  else
    # Fallback if lsof isn't available: try to bind with a short python check.
    ! (exec 3<>"/dev/tcp/127.0.0.1/${port}") 2>/dev/null
  fi
}

find_free_port() {
  local port="$1"
  while ! port_is_free "$port"; do
    echo "   port ${port} is busy, trying $((port + 1))..." >&2
    port=$((port + 1))
  done
  echo "$port"
}

echo "==> Resolving backend port (requested: ${BACKEND_PORT})"
RESOLVED_BACKEND_PORT="$(find_free_port "$BACKEND_PORT")"

echo "==> Resolving frontend port (requested: ${FRONTEND_PORT})"
RESOLVED_FRONTEND_PORT="$(find_free_port "$FRONTEND_PORT")"

export BACKEND_PORT="$RESOLVED_BACKEND_PORT"
export FRONTEND_PORT="$RESOLVED_FRONTEND_PORT"
export VITE_API_BASE_URL="http://localhost:${RESOLVED_BACKEND_PORT}"
export DATABASE_URL="${DATABASE_URL:-sqlite:///./db/app.db}"

mkdir -p db

PIDS=()

cleanup() {
  echo ""
  echo "==> Shutting down..."
  for pid in "${PIDS[@]:-}"; do
    if [ -n "$pid" ] && kill -0 "$pid" >/dev/null 2>&1; then
      kill "$pid" >/dev/null 2>&1 || true
    fi
  done
  wait >/dev/null 2>&1 || true
}
trap cleanup SIGINT SIGTERM EXIT

if [ ! -x ".venv/bin/python" ]; then
  echo "error: .venv not found. Run 'bash setup.sh' first." >&2
  exit 1
fi

echo "==> Starting backend on port ${RESOLVED_BACKEND_PORT}"
(cd backend && ../.venv/bin/python -m uvicorn app.main:app \
  --host 0.0.0.0 --port "${RESOLVED_BACKEND_PORT}" --reload) &
PIDS+=($!)

echo "==> Starting frontend on port ${RESOLVED_FRONTEND_PORT}"
(cd frontend && VITE_API_BASE_URL="$VITE_API_BASE_URL" npx vite --port "${RESOLVED_FRONTEND_PORT}" --strictPort) &
PIDS+=($!)

sleep 2

echo ""
echo "================================================================"
echo "  Backend:  http://localhost:${RESOLVED_BACKEND_PORT}  (docs: /docs)"
echo "  Frontend: http://localhost:${RESOLVED_FRONTEND_PORT}"
echo "================================================================"
echo "  Press Ctrl+C to stop both."
echo ""

wait
