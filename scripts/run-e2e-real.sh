#!/bin/bash
# Script para rodar testes E2E com backend real
# Uso:
#   E2E_EMAIL=seu@email.com E2E_PASSWORD=senha ./run-e2e-real.sh

set -e
cd /Volumes/programacao/ArtistLog/ArtistLog_Front_End

# Verificar se credenciais foram fornecidas
if [ -z "$E2E_EMAIL" ] || [ -z "$E2E_PASSWORD" ]; then
  echo "❌ ERRO: Credenciais ausentes!"
  echo ""
  echo "Configure as variáveis de ambiente antes de rodar:"
  echo "  export E2E_EMAIL=artista@exemplo.com"
  echo "  export E2E_PASSWORD=Sua_Senha_123"
  echo ""
  echo "Ou rode assim:"
  echo "  E2E_EMAIL=artista@exemplo.com E2E_PASSWORD=senha ./run-e2e-real.sh"
  exit 1
fi

echo "🧪 Rodando E2E Tests com Backend REAL"
echo "======================================"
echo "📍 API: ${NEXT_PUBLIC_API_URL:-http://127.0.0.1:8080}"
echo "👤 Email: $E2E_EMAIL"
echo ""

# Exportar para que playwright possa usar
export NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL:-http://127.0.0.1:8080}

./node_modules/.bin/playwright test e2e/contracts-real.spec.ts --project=chromium

echo ""
echo "✅ Testes completos!"
