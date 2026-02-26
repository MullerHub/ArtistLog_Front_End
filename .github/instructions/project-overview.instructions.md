---
description: ArtistLog - Visao geral do frontend (sempre carregado)
---

# ArtistLog - Frontend Overview

## O que é ArtistLog
Plataforma para conexão entre artistas (músicos, DJs, bandas) e venues (casas de show, bares, eventos). O frontend prioriza descoberta, contratos e agenda com UX acessível.

## Stack Frontend
- Next.js 14 (App Router)
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
