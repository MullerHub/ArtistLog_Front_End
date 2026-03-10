---
description: ArtistLog - Visao geral do frontend (sempre carregado)
---

# ArtistLog - Frontend Overview

## O que é ArtistLog
Plataforma para conexão entre artistas (músicos, DJs, bandas) e venues (casas de show, bares, eventos). O frontend prioriza descoberta, contratos e agenda com UX acessível.

## Stack Frontend
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS + Shadcn UI
- React Query para chamadas de API

## Estrutura do Frontend

- app/ -> rotas do App Router
  - app/(protected)/ -> área autenticada
  - app/login, app/register -> autenticação
- components/ -> UI e componentes de domínio
- lib/ -> api client, services e types
- hooks/ -> hooks reutilizáveis
- styles/ -> estilos globais

## Nomenclatura

- **Venues** (técnico) = **Contratantes** (UI visível)
  - Rotas: `/venues`
  - Services: `venuesService`
  - Types: `Venue`, `VenueType`
  - Menu: "Contratantes"

## Princípios de UX e Acessibilidade

- Navegação 100% por teclado (Tab, Enter, Escape)
- Formulários com feedback imediato e mensagens claras
- Estados de loading, erro e empty sempre visíveis
- Evitar layout shift: reservar espaço para listas, cards e imagens
- Foco visível e consistente

## Estado e Dados

- `apiClient` centraliza headers, token e erros
- `authService` controla login e persistência de usuário
- `AuthProvider` cuida do bootstrap e refresh do usuário
- Serviços em `lib/services/*` isolam chamadas por domínio

## Referência Rápida de API (Backend)

Base URL: `NEXT_PUBLIC_API_URL` (fallback `http://localhost:8080`).
Autenticação: header `Authorization: Bearer <token>`.

Público:
- `POST /auth/signup/artist`
- `POST /auth/signup/venue`
- `POST /auth/login`
- `GET /artists`
- `GET /artists/{id}`
- `GET /venues`
- `GET /venues/{id}`
- `GET /cities/search`

Autenticado:
- `GET /auth/me`
- `PATCH /artists/{id}`
- `PATCH /artists/{id}/availability`
- `POST /artists/{id}/location`
- `PATCH /venues/{id}`
- `GET /venues/nearby`
- `GET /venues/{id}/available-artists`
- `GET /venues/{id}/reviews`
- `POST /venues/{id}/reviews`
- `POST /venues/community`
- `GET /venues/community`
- `GET /venues/claim-candidates`
- `POST /venues/{id}/claim`
- `POST /contracts`
- `GET /contracts`
- `GET /contracts/{id}`
- `PATCH /contracts/{id}/status`
- `DELETE /contracts/{id}`
- `POST /upload/photo`
- `GET /notifications`
- `GET /notifications/unread-count`
- `PATCH /notifications/{id}/read`
- `PATCH /notifications/read-all`
- `GET /notifications/preferences`
- `PATCH /notifications/preferences`

## UX Areas Ativas

- Community Venues: criação, busca e claim
- Contract Proposal: detalhes adicionais e tags
- Notification Center: leitura e preferências
- Contracts Workspace: tabs de Detalhes, Propostas, Chat, Auditoria e Assinatura
- Artist/Venue Location: base location + exact location (map + persistência)

## ⚠️ Status de Features (MVP v1.0)

### Contratos - SEMI-PRONTO (SERÁ OCULTADO)
- Backend: ✅ 100% pronto (todos endpoints funcionam)
- Frontend UI: ⚠️ Implementada mas será refinada em v1.1+
- E2E Tests: ⏳ Requer dados seed no backend
- **Decisão MVP**: Ocultado do menu para não comprometer lançamento. Endpoints existem no backend para uso futuro.
- **Plano**: Melhorar UX, E2E, notificações em v1.1+

Ver: `.github/instructions/contracts.instructions.md` para detalhes

### Descoberta (Discovery) - PRONTO ✅
- Artists: busca, filtros, detalhes
- Venues: busca, filtros, detalhes  
- Reviews: listagem e criação

### Gerenciamento - PRONTO ✅
- Profiles: edição, fotos, disponibilidade
- Localização: base + exact com mapa
- Preferências: settings do usuário

## Estado Atual (Mar/2026)

- Contratos têm integração completa com módulos avançados:
  - Propostas (`proposalsService`)
  - Mensagens (`messagesService`)
  - Auditoria (`auditService`)
  - Assinatura digital (`signatureService`)
- E2E de contratos foi separado em:
  - `contracts-local.spec.ts` (mocks frontend)
  - `contracts-real.spec.ts` (backend real com dados seed/mockados no backend)
- Para mobile, os testes devem usar seletores estáveis (`data-testid`) em vez de labels visíveis.
- Cache de sessão E2E implementado em arquivo temporário para evitar rate limit do backend

## Deploy e Produção

### Workflow de Branches (Obrigatório)
- Desenvolvimento diário: `development`
- Features/correções: criar branch a partir de `development` (`feature/*`, `fix/*`)
- `main` fica reservado para release estável e deploy de produção
- Só promover para `main` quando a entrega estiver validada (tests + revisão)

### Status: ✅ Ativo em Produção (Vercel)
- Frontend: `https://artist-log-front-end.vercel.app` (Vercel)
- Backend: `https://artistlog-backend-latest.onrender.com` (Render)
- Build validado: `npm run build` funciona
- Configuração: `vercel.json` com headers de segurança
- API conectada: ✅ CORS corrigido (single origin)

### API Base URL Resolution
`lib/api-client.ts` implementa fallback inteligente:
```
Production (Vercel) sem NEXT_PUBLIC_API_URL? → https://artistlog-backend-latest.onrender.com
Development (localhost)? → http://localhost:8080
```

### Variáveis de Ambiente
**Produção (Render):** Env var `CORS_ALLOWED_ORIGINS` deve ter apenas `Vercel domain`
```
CORS_ALLOWED_ORIGINS=https://artist-log-front-end.vercel.app
```

**Frontend (Vercel):**
```
NEXT_PUBLIC_API_URL=https://artistlog-backend-latest.onrender.com
```

### Docs de Deploy
- **Deployment:** `.github/instructions/deployment.instructions.md`
- **CORS Setup:** `CORS_ISSUE.md` (diagnóstico e solução)
- **API Health:** `/debug/health` (verificar conectividade no frontend)

## Próximas Features (Contexto para Desenvolvimento)

- Expandir cobertura E2E real para artistas/venues com seed controlado.
- Consolidar fluxo de assinatura com feedback de status em tempo real.
- Evoluir trilha de auditoria com filtros e paginação no UI.
- Reforçar robustez de testes mobile em componentes com conteúdo responsivo/oculto.
