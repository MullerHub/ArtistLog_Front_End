#!/bin/bash

set -e

echo "🔥 Matando todos os processos node/next/pnpm..."
# Kill processes on macOS/Linux with better error handling
ps aux | grep -E "next dev|pnpm dev" | grep -v grep | awk '{print $2}' | xargs -r kill -9 2>/dev/null || true
killall -9 node 2>/dev/null || true
sleep 2

echo "🧹 Limpando locks, cache e artifacts..."
rm -rf .next/.turbo .next/dev .turbo .turbopack node_modules/.cache 2>/dev/null || true
rm -f .next/dev/lock .next/cache/next-server.js.nft.json 2>/dev/null || true

echo "📍 Encontrando primeira porta disponível..."
# Function to find available port starting from 3000
find_available_port() {
  local port=3000
  local max_port=3020
  while [ $port -le $max_port ]; do
    if ! lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
      echo $port
      return 0
    fi
    port=$((port + 1))
  done
  echo "3000"  # fallback to 3000
}

PORT=$(find_available_port)
echo "✅ Usando porta $PORT"

echo "🚀 Iniciando Next.js dev server..."
PORT=$PORT pnpm dev --port=$PORT 2>&1
