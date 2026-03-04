#!/bin/bash
set -e
cd /Volumes/programacao/ArtistLog/ArtistLog_Front_End

echo "🧪 E2E Tests com Mocks (Local)"
echo "================================"
./node_modules/.bin/playwright test e2e/contracts-local.spec.ts --project=chromium 2>&1 | tail -100

echo ""
echo "✅ Testes Locais Completados"
echo "Para testes REAIS, configure:"
echo "export E2E_EMAIL=seu_email@artistas.com"
echo "export E2E_PASSWORD=sua_senha"
echo "E depois rode: npm run test:e2e:real"
