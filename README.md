# 🎨 ArtistLog - Frontend

> Plataforma de gestão para artistas e contratantes de eventos musicais

[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Playwright](https://img.shields.io/badge/Playwright-1.58.2-45ba4b?logo=playwright)](https://playwright.dev/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://vercel.com/)

## 📋 Sobre

Sistema de gerenciamento de eventos musicais que conecta artistas e contratantes, permitindo:

- 🎤 **Perfis de Artistas** - Portfolio, fotos, gêneros musicais
- 🏛️ **Perfis de Venues** - Locais de eventos, capacidade, localização
- 📍 **Busca por Localização** - Encontre artistas/venues por cidade e raio
- 📝 **Contratos** - Sistema de propostas e gerenciamento (MVP v1.1+)
- 🔔 **Notificações em Tempo Real** - WebSocket para updates instantâneos
- ⭐ **Sistema de Reviews** - Avaliações de artistas e contratantes

## 🚀 Quick Start

### Pré-requisitos

- Node.js 18+ (LTS recomendado: 22.x)
- npm ou pnpm
- Backend rodando (localhost:8080 ou Vercel)

### Instalação

```bash
# Clonar repositório
git clone https://github.com/MullerHub/ArtistLog_Front_End.git
cd ArtistLog_Front_End

# Instalar dependências
npm install

# Configurar ambiente
cp .env.local.example .env.local
# Editar .env.local com URL do backend

# Iniciar desenvolvimento
npm run dev
```

Acesse: http://localhost:3000

Para instruções completas, veja [QUICK_START.md](docs/QUICK_START.md)

## 📦 Stack Tecnológica

### Core

- **Framework:** Next.js 16.1.6 (App Router + Turbopack)
- **Linguagem:** TypeScript 5.7
- **UI:** Shadcn UI + Tailwind CSS
- **State:** React Context + Hooks

### Testes

- **Unit:** Jest + React Testing Library
- **E2E:** Playwright 1.58.2
- **Coverage:** 85%+ target

### Deploy

- **Plataforma:** Vercel (recomendado)
- **CI/CD:** GitHub Actions + Vercel Git Integration
- **Env Management:** Variáveis via Vercel Dashboard

## 🏗️ Estrutura do Projeto

```
ArtistLog_Front_End/
├── app/                      # Next.js App Router
│   ├── (protected)/          # Rotas autenticadas
│   │   ├── artists/          # Descoberta de artistas
│   │   ├── venues/           # Descoberta de venues
│   │   ├── contracts/        # Gerenciamento de contratos
│   │   └── dashboard/        # Dashboard do usuário
│   ├── login/                # Autenticação
│   └── register/             # Registro de usuários
├── components/               # Componentes React
│   ├── ui/                   # Shadcn UI components
│   ├── cards/                # Card components
│   └── __tests__/            # Component tests
├── lib/                      # Lógica de negócio
│   ├── services/             # API services
│   ├── types.ts              # TypeScript types
│   └── utils.ts              # Utilitários
├── hooks/                    # Custom React hooks
├── e2e/                      # Testes Playwright
│   └── fixtures/             # E2E fixtures (session cache)
├── .github/
│   └── instructions/         # Context files for AI agents
└── public/                   # Arquivos estáticos
```

## 🧪 Testes

### Unit Tests (Jest)

```bash
npm test                  # Rodar todos os testes
npm run test:watch        # Watch mode
npm run test:coverage     # Com coverage report
```

### E2E Tests (Playwright)

```bash
npm run test:e2e          # Todos os E2E
npm run test:e2e:local    # Mocks locais (rápido)
npm run test:e2e:real     # Backend real (requer creds)
npm run test:e2e:ui       # Interface gráfica
npm run test:e2e:debug    # Debug mode
```

**⚠️ Importante:** Testes E2E com backend real têm rate limit de 5 logins/15min. Use `--workers=1` e aguarde entre rodadas.

Para detalhes completos, veja [TESTING.md](TESTING.md) e [TESTING_BEST_PRACTICES.md](TESTING_BEST_PRACTICES.md)

## 🚀 Deploy

### Deploy Rápido na Vercel (3 passos)

1. **Conectar:** Importar repositório no [Vercel Dashboard](https://vercel.com/new)
2. **Configurar:** Adicionar `NEXT_PUBLIC_API_URL` nas Environment Variables
3. **Deploy:** Clicar em "Deploy" - pronto! 🎉

Para instruções passo a passo com screenshots, veja [VERCEL_DEPLOY.md](docs/VERCEL_DEPLOY.md)

### Validação Pré-Deploy

```bash
# Executar checklist automático
./scripts/pre-deploy-check.sh

# Build local
npm run build

# Verificar checklist manual
cat docs/DEPLOY_CHECKLIST.md
```

### Deploy Alternativo

- **Docker:** Ver [DEPLOYMENT.md](docs/DEPLOYMENT.md#docker-deployment)
- **Self-hosted:** Ver [DEPLOYMENT.md](docs/DEPLOYMENT.md#self-hosted-deployment)
- **AWS/GCP:** Ver [DEPLOYMENT.md](docs/DEPLOYMENT.md#cloud-providers)

## 📚 Documentação Completa

### Para Desenvolvedores

- 📖 **[DOCS_INDEX.md](docs/DOCS_INDEX.md)** - Índice completo de toda documentação
- 🚀 **[QUICK_START.md](docs/QUICK_START.md)** - Setup inicial detalhado
- 🧪 **[TESTING.md](docs/TESTING.md)** - Guia de testes
- 🔧 **[INTEGRATION_GUIDE.md](docs/INTEGRATION_GUIDE.md)** - Integração com backend

### Para Deploy

- ⚡ **[VERCEL_DEPLOY.md](docs/VERCEL_DEPLOY.md)** - Deploy rápido (3 passos)
- 📋 **[DEPLOY_CHECKLIST.md](docs/DEPLOY_CHECKLIST.md)** - Checklist de validação
- 📖 **[DEPLOYMENT.md](docs/DEPLOYMENT.md)** - Guia completo de deploy

### Para AI Agents

Instruções contextuais em `.github/instructions/`:

- `project-overview.instructions.md` - Visão geral (sempre carregado)
- `frontend.instructions.md` - Padrões de frontend
- `backend-api.instructions.md` - Referência da API
- `database-models.instructions.md` - Modelos e tipos
- `deployment.instructions.md` - Deploy e produção
- `testing-guidelines.instructions.md` - Estratégia de testes

## 🔧 Scripts Disponíveis

### Desenvolvimento

```bash
npm run dev              # Dev server (porta automática)
npm run dev:clean        # Limpa cache e inicia dev
npm run build            # Build de produção
npm start                # Servidor de produção
```

### Qualidade

```bash
npm run type-check       # Verificar TypeScript
npm run lint             # ESLint
npm test                 # Unit tests
npm run test:all         # Unit + E2E local
```

### Deploy

```bash
./scripts/pre-deploy-check.sh    # Validação automática
npm run vercel:build     # Build formato Vercel
npm run vercel:preview   # Deploy preview
npm run vercel:prod      # Deploy produção
```

## 🔑 Variáveis de Ambiente

### Desenvolvimento (`.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### Produção (Vercel Dashboard)

```env
NEXT_PUBLIC_API_URL=https://your-backend.vercel.app
```

Para templates completos, veja `.env.local.example` e `.env.production.example`

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-feature`
3. Commit suas mudanças: `git commit -m 'feat: adiciona nova feature'`
4. Push para a branch: `git push origin feature/nova-feature`
5. Abra um Pull Request

### Padrões de Commit

- `feat:` - Nova feature
- `fix:` - Correção de bug
- `docs:` - Documentação
- `test:` - Testes
- `refactor:` - Refatoração
- `style:` - Formatação
- `chore:` - Manutenção

## 📊 Status do Projeto

- ✅ **Autenticação** - Login/Register completo
- ✅ **Perfis** - Artistas e Venues funcionais
- ✅ **Busca por Localização** - Raio e cidade
- ✅ **Notificações** - WebSocket implementado
- ✅ **Reviews** - Sistema de avaliações
- 🚧 **Contratos** - Propostas em desenvolvimento (v1.1+)

Para status detalhado, veja [MVP_STATUS_REPORT.md](MVP_STATUS_REPORT.md)

## 🆘 Troubleshooting

### Build falha

```bash
rm -rf .next node_modules
npm ci
npm run build
```

### Testes E2E rate limit

```bash
# Limpar cache de sessão
rm /tmp/artistlog-e2e-session-cache.json

# Rodar com 1 worker e aguardar 15min entre tentativas
npx playwright test --workers=1
```

### CORS em produção

Verificar se backend aceita origem Vercel em `CORS_ALLOWED_ORIGINS`

Para mais troubleshooting, veja [DEPLOYMENT.md](docs/DEPLOYMENT.md#troubleshooting)
Para status detalhado, veja [MVP_STATUS_REPORT.md](docs/MVP_STATUS_REPORT.md)

## 📝 Licença

Proprietary - Todos os direitos reservados

## 👥 Equipe

- **Repositório:** [github.com/MullerHub/ArtistLog_Front_End](https://github.com/MullerHub/ArtistLog_Front_End)
- **Backend:** Vercel (produção)

---

**Última Atualização:** 9 de março de 2026  
**Versão:** MVP v1.0  
**Status:** ✅ Pronto para Deploy

---

## 🔗 Links Úteis

- [Documentação Next.js](https://nextjs.org/docs)
- [Documentação Vercel](https://vercel.com/docs)
- [Documentação Playwright](https://playwright.dev/)
- [Documentação Shadcn UI](https://ui.shadcn.com/)
