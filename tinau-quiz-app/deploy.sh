#!/usr/bin/env bash
set -euo pipefail

echo "[deploy.sh] Installing dependencies..."
if command -v corepack >/dev/null 2>&1; then
  corepack pnpm install
else
  if command -v pnpm >/dev/null 2>&1; then
    pnpm install
  else
    echo "pnpm is not installed. Install it with 'npm install -g pnpm' or use corepack."
    exit 1
  fi
fi

echo "[deploy.sh] Building frontend..."
pnpm --dir frontend build

echo "[deploy.sh] Build complete."

if command -v vercel >/dev/null 2>&1; then
  echo "[deploy.sh] Deploying to Vercel..."
  vercel --prod
else
  echo "[deploy.sh] Vercel CLI not found. Install it with 'npm install -g vercel' and then run 'vercel --prod' manually."
fi
