#!/bin/bash

set -e

echo "🔥 Matando todos os processos node/next/pnpm..."
killall -9 node 2>/dev/null || true
killall -9 next 2>/dev/null || true
killall -9 pnpm 2>/dev/null || true
sleep 3

echo "🧹 Limpando locks, cache e artifacts..."
rm -rf .next .turbo .turbopack node_modules/.cache 2>/dev/null || true
rm -f .next/dev/lock 2>/dev/null || true
find . -name "*.lock" -type f -delete 2>/dev/null || true

echo "✅ Desocupando porta 3000..."
lsof -ti:3000 | xargs -r kill -9 2>/dev/null || true
sleep 2

echo "🚀 Iniciando Next.js (com fallback automático de porta)"
pnpm dev
