#!/bin/bash
set -e

REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$REPO_DIR/backend"
FRONTEND_DIR="$REPO_DIR/frontend"

echo "=== SBD Store Server Setup ==="
echo ""

command -v node >/dev/null 2>&1 || { echo "ERROR: Node.js tidak terinstall. Install dulu: https://nodejs.org"; exit 1; }
command -v psql >/dev/null 2>&1 || { echo "ERROR: PostgreSQL tidak terinstall."; exit 1; }

echo "[1/5] Install backend dependencies..."
cd "$BACKEND_DIR"
npm install

echo ""
echo "[2/5] Setup database & seed data..."
if [ ! -f "$BACKEND_DIR/.env" ]; then
  echo "ERROR: File .env tidak ditemukan di backend/"
  echo "Buat dari .env.example dan isi kredensial database:"
  echo "  cp backend/.env.example backend/.env"
  exit 1
fi
npm run setup

echo ""
echo "[3/5] Install frontend dependencies..."
cd "$FRONTEND_DIR"
npm install

echo ""
echo "[4/5] Build frontend..."
npm run build

echo ""
echo "[5/5] Setup selesai!"
echo ""
echo "Cara menjalankan:"
echo "  Backend  : cd backend && npm start    (port 3131)"
echo "  Frontend : cd frontend && npm start   (port 3132)"
echo ""
echo "Atau gunakan setup-pm2.sh untuk auto-restart."
