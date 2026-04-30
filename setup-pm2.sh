#!/bin/bash
set -e

REPO_DIR="$(cd "$(dirname "$0")" && pwd)"

command -v pm2 >/dev/null 2>&1 || { echo "Install pm2 dulu: npm install -g pm2"; exit 1; }

pm2 delete sbd-backend 2>/dev/null || true
pm2 delete sbd-frontend 2>/dev/null || true

pm2 start "$REPO_DIR/backend/server.js" \
  --name sbd-backend \
  --cwd "$REPO_DIR/backend"

pm2 start "npm" \
  --name sbd-frontend \
  --cwd "$REPO_DIR/frontend" \
  -- start

pm2 save
pm2 list

echo ""
echo "Backend  : http://localhost:3131"
echo "Frontend : http://localhost:3132"
