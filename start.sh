#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "=== SDG Nexus v12 Startup ==="
echo "Directory: $SCRIPT_DIR"

# ── Backend ─────────────────────────────────────────────────────────────────
cd "$SCRIPT_DIR/backend"

if [ ! -f ".env" ]; then
  echo "ERROR: backend/.env not found. Copy backend/.env.example or create it."
  exit 1
fi

echo ""
echo "--- Starting FastAPI backend on http://localhost:8000 ---"
echo "Install deps first: pip install -r requirements.txt"
echo ""

if command -v uvicorn &>/dev/null; then
  uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
  BACKEND_PID=$!
  echo "Backend PID: $BACKEND_PID"
else
  echo "WARN: uvicorn not found. Run: pip install -r requirements.txt"
fi

# ── Frontend ─────────────────────────────────────────────────────────────────
cd "$SCRIPT_DIR/frontend"

echo ""
echo "--- Starting Vite frontend on http://localhost:5173 ---"
echo ""

if command -v npm &>/dev/null; then
  if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
  fi
  npm run dev &
  FRONTEND_PID=$!
  echo "Frontend PID: $FRONTEND_PID"
else
  echo "WARN: npm not found."
fi

echo ""
echo "=== SDG Nexus running ==="
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:8000"
echo "  API docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop both servers."

wait
