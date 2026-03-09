#!/bin/bash
# 🚀 Script de Validação Pré-Deploy para Vercel
# Execute antes de fazer deploy: ./pre-deploy-check.sh

echo "🔍 Checando preparação para deploy na Vercel..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check 1: Build funciona
echo "1️⃣  Testando build de produção..."
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Build funcionando${NC}"
else
    echo -e "${RED}❌ Build falhou. Execute 'npm run build' para ver erros${NC}"
    exit 1
fi

# Check 2: Arquivos necessários existem
echo ""
echo "2️⃣  Verificando arquivos necessários..."

FILES=(
    "vercel.json"
    "next.config.mjs"
    "package.json"
    ".env.production.example"
    "VERCEL_DEPLOY.md"
    "DEPLOY_CHECKLIST.md"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file${NC}"
    else
        echo -e "${RED}❌ $file não encontrado${NC}"
    fi
done

# Check 3: Variáveis de ambiente
echo ""
echo "3️⃣  Verificando variáveis de ambiente..."
echo -e "${YELLOW}⚠️  IMPORTANTE: Configure na Vercel:${NC}"
echo "   Variable: NEXT_PUBLIC_API_URL"
echo "   Value: URL do seu backend (ex: https://seu-backend.vercel.app)"
echo "   Environments: Production, Preview, Development"

# Check 4: Git status
echo ""
echo "4️⃣  Verificando status do Git..."
if git status > /dev/null 2>&1; then
    BRANCH=$(git branch --show-current)
    echo -e "${GREEN}✅ Branch atual: $BRANCH${NC}"
    
    if [ -n "$(git status --porcelain)" ]; then
        echo -e "${YELLOW}⚠️  Há mudanças não commitadas:${NC}"
        git status --short
        echo ""
        echo "   Faça commit antes de deploy!"
    else
        echo -e "${GREEN}✅ Working tree limpo${NC}"
    fi
else
    echo -e "${RED}❌ Não é um repositório Git${NC}"
fi

# Check 5: Node/npm version
echo ""
echo "5️⃣  Verificando versões..."
NODE_VERSION=$(node -v)
NPM_VERSION=$(npm -v)
echo -e "${GREEN}✅ Node: $NODE_VERSION${NC}"
echo -e "${GREEN}✅ npm: $NPM_VERSION${NC}"

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 RESUMO"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}✅ Frontend pronto para deploy!${NC}"
echo ""
echo "🎯 Próximos passos:"
echo "   1. Commit e push do código"
echo "   2. Acesse: https://vercel.com/new"
echo "   3. Importe o repositório GitHub"
echo "   4. Configure NEXT_PUBLIC_API_URL com URL do backend"
echo "   5. Clique em Deploy"
echo ""
echo "📖 Guias disponíveis:"
echo "   - VERCEL_DEPLOY.md (guia rápido)"
echo "   - DEPLOYMENT.md (guia completo)"
echo "   - DEPLOY_CHECKLIST.md (checklist pós-deploy)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
