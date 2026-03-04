#!/bin/bash
set -e
cd /Volumes/programacao/ArtistLog/ArtistLog_Front_End
echo "🧪 Starting Real Backend E2E Tests..."
echo "📍 API Base: http://127.0.0.1:8080"
./node_modules/.bin/playwright test e2e/contracts-real.spec.ts --project=chromium
