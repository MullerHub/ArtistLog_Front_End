# 🚀 ArtistLog Frontend - Guia de Deploy MVP v1.0

## Quick Start para Deploy

### Pré-requisitos
- Node.js 18+
- Git
- npm ou pnpm

### 1. Ambiente Local

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.local.example .env.local
# Editar .env.local com valores de produção

# Testar build local
npm run build

# Iniciar servidor de produção localmente
npm start
```

### 2. Variáveis de Ambiente Necessárias

Criar `.env.production` (ou .env.local para desenvolvimento) com:

```bash
# API
NEXT_PUBLIC_API_URL=https://api.artistlog.com  # ou seu backend URL

# Analytics (opcional)
NEXT_PUBLIC_ANALYTICS_ID=

# Feature Flags (opcional)
NEXT_PUBLIC_ENABLE_REAL_TIME=true
NEXT_PUBLIC_ENABLE_WEBSOCKET=true

# Nominatim (para geolocalização)
NEXT_PUBLIC_NOMINATIM_URL=https://nominatim.openstreetmap.org

# BigDataCloud (para reverse geocoding)
NEXT_PUBLIC_BIGDATACLOUD_URL=https://api.bigdatacloud.net/data/reverse-geocode-client
```

### 3. Deploy em Vercel (Recomendado para MVP)

#### Opção A: Via GitHub (Automático)

1. Fazer push do código para GitHub
2. Ir em https://vercel.com
3. Conectar repositório GitHub
4. Vercel detectará automaticamente Next.js
5. Configurar variáveis de ambiente em **Settings → Environment Variables**
6. Clicar em "Deploy"

#### Opção B: Via CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer login
vercel login

# Deploy
vercel --prod

# Vercel pedirá confirmação de variáveis de ambiente
```

### 4. Deploy Alternativo: Docker

```dockerfile
# Dockerfile
FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm ci

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
```

```bash
# Build e deploy com Docker
docker build -t artistlog-frontend:latest .
docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=https://api.artistlog.com artistlog-frontend:latest
```

### 5. Deploy em Servidor Linux (AWS EC2, DigitalOcean, etc)

```bash
# SSH no servidor
ssh ubuntu@seu-servidor.com

# Instalar dependências de sistema
sudo apt update && sudo apt install -y nodejs npm

# Clone repositório
git clone https://github.com/seu-usuario/ArtistLog_Front_End.git
cd ArtistLog_Front_End

# Instalar dependências
npm install

# Build
npm run build

# Iniciar com PM2 (gerenciador de processos)
npm install -g pm2
pm2 start "npm start" --name "artistlog-frontend"
pm2 save
pm2 startup

# Configurar Nginx como reverse proxy
sudo apt install -y nginx
sudo nano /etc/nginx/sites-available/default

# Adicionar config:
# upstream artistlog {
#   server localhost:3000;
# }
# server {
#   listen 80;
#   server_name seu-dominio.com;
#   location / {
#     proxy_pass http://artistlog;
#     proxy_http_version 1.1;
#     proxy_set_header Upgrade $http_upgrade;
#     proxy_set_header Connection 'upgrade';
#     proxy_set_header Host $host;
#     proxy_cache_bypass $http_upgrade;
#   }
# }

sudo systemctl restart nginx
```

### 6. Checklist de Validação Pré-Deploy

```bash
# Type check
npm run type-check

# Linting
npm run lint

# Testes unitários
npm test -- --coverage

# Testes E2E (opcional)
npm run test:e2e

# Build produçãof
npm run build

# Verificar tamanho do bundle
npm run analyze  # se disponível
```

### 7. Monitoramento Pós-Deploy

#### Setup de Error Tracking (Sentry)

```bash
npm install @sentry/nextjs

# Seguir: https://docs.sentry.io/platforms/javascript/guides/nextjs/
```

#### Verificação de Saúde

```bash
# Testar domínio
curl https://seu-dominio.com -I

# Testar API
curl https://seu-dominio.com/api/auth/me -H "Authorization: Bearer test-token"

# Verificar logs (em servidor próprio)
tail -f /var/log/pm2.log
```

### 8. CI/CD com GitHub Actions (Optional)

Criar `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - run: npm ci
      - run: npm run type-check
      - run: npm run lint
      - run: npm test -- --coverage
      
      - name: Deploy to Vercel
        uses: vercel/action@main
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

### 9. Rollback Plan

Se encontrar problemas após deploy:

**Vercel**: Clicar em versão anterior em **Deployments** → **Rollback**

**Servidor próprio**:
```bash
pm2 restart artistlog-frontend
# ou
git checkout <commit-anterior>
npm run build
pm2 restart artistlog-frontend
```

### 10. Performance Checklist Pós-Deploy

- [ ] Lighthouse score > 90 (Performance)
- [ ] Load time < 2s em 4G
- [ ] Load time < 5s em 3G
- [ ] Sem erros críticos em console
- [ ] WebSocket conectando (se habilitado)
- [ ] Auth token salvando/recuperando
- [ ] API comunicando corretamente
- [ ] Images lazy-loading
- [ ] Mobile viewport funcionando

---

## Troubleshooting Comum

### Build falha com "Cannot find module"
```bash
rm -rf node_modules .next
npm install
npm run build
```

### Erro de CORS
- Verificar `NEXT_PUBLIC_API_URL` está correto
- Backend deve ter CORS habilitado para seu domínio

### WebSocket não conectando
- Verificar se backend tem servidor WebSocket
- Checar se firewall permite WSS (WebSocket Secure)

### Token não persistindo
- Verificar localStorage está habilitado no navegador
- Verificar se cookie policy permite

---

## Contato & Suporte

- Issues: GitHub Issues
- Documentação: `/docs`
- Backend API: Veja `INTEGRATION_GUIDE.md`

---

**Status**: MVP v1.0 Ready for Production Deployment
**Data**: 2026-03-04
**Última Atualização**: Deploy Guidelines
