---
description: API reference for frontend usage
applyTo: 'lib/**,lib/services/**,hooks/**'
---

# API Reference (Frontend)

## Base URL and Auth

### Base URL Resolution (Smart Fallback)
Implementado em `lib/api-client.ts` > `resolveApiBaseUrl()`:

1. **Se `NEXT_PUBLIC_API_URL` está definido:**
   - E frontend rode em `localhost` → usa como-é (útil para dev local)
   - E frontend rode em produção (Vercel) + aponta para `localhost` → fallback para Render
   - E frontend rode em produção + aponta para URL válida → usa como-é ✅

2. **Se `NEXT_PUBLIC_API_URL` não definido:**
   - Frontend em `localhost` → fallback para `http://localhost:8080`
   - Frontend em produção (Vercel) → fallback para `https://artistlog-backend-latest.onrender.com` ✅

**Importante:** Em produção na Vercel, se `NEXT_PUBLIC_API_URL` não estiver configurada ou apontar para `localhost`, o frontend automaticamente cai no fallback Render. Isso protege contra misconfigurações.

### Produção Current (Mar/2026)
- **Frontend URL:** `https://artist-log-front-end.vercel.app`
- **Backend URL:** `https://artistlog-backend-latest.onrender.com`
- **CORS (Backend):** `Access-Control-Allow-Origin: https://artist-log-front-end.vercel.app` (single origin)

- Auth header: `Authorization: Bearer <token>`
- Token storage: `localStorage['artistlog_token']`
- User cache: `localStorage['artistlog_user']`

## Error Handling

- `apiClient` throws `ApiError` with `status` and `data`
- On `401`, token is cleared and user is redirected to `/login`
- Surface friendly errors in UI, keep details for logs

## Endpoints Used by the Frontend

### Públicos (sem autenticação)
- `GET /health` — Healthcheck
- `GET /ready` — Readiness check
- `POST /auth/signup/artist` — Cadastro artista
- `POST /auth/signup/venue` — Cadastro venue
- `POST /auth/login` — Login
- `POST /auth/forgot-password` — Solicitar recuperação de senha
- `POST /auth/reset-password` — Redefinir senha
- `GET /cities/search` — Busca cidades
- `POST /cities/reload` — Recarrega cache cidades
- `POST /cities/update` — Atualiza municípios
- `GET /artists` — Lista artistas (com filtros)
- `GET /artists/{id}` — Perfil público artista
- `POST /artists/{id}/view` — Incrementa views artista (silencioso)
- `GET /venues` — Lista venues (com filtros)
- `GET /venues/{id}` — Perfil público venue
- `POST /venues/{id}/view` — Incrementa views venue (silencioso)
- `GET /venues/{id}/reviews` — Reviews de venue

### Autenticados (JWT)
- `GET /auth/me` — Dados do usuário autenticado
- `PATCH /auth/change-password` — Troca senha

### Artists
- `GET /artists`
- `GET /artists/{id}`
- `PATCH /artists/{id}`
- `PATCH /artists/{id}/availability`
- `POST /artists/{id}/location`
- `POST /artists/{id}/view` (public, silencioso via `postPublicSilent`)

### Artist Schedule
- `GET /artists/me/schedule`
- `PATCH /artists/me/schedule`
- `POST /artists/me/schedule/slots`
- `DELETE /artists/me/schedule/slots/{slotId}`
- `GET /artists/{artistId}/schedule`
- `POST /artists/{artistId}/schedule`

### Venues
- `GET /venues`
- `GET /venues/{id}`
- `PATCH /venues/{id}`
- `PATCH /venues/{id}/location` (exact location)
- `GET /venues/nearby`
- `GET /venues/{id}/available-artists`
- `GET /venues/{id}/reviews`
- `POST /venues/{id}/reviews`
- `POST /venues/{id}/view` (public, silencioso via `postPublicSilent`)

### Community Venues
- `POST /venues/community`
- `GET /venues/community`
- `GET /venues/claim-candidates`
- `POST /venues/{id}/claim`

### Location
- `GET /cities/search`
- `PATCH /me/location`

### Contracts (Core)
- `POST /contracts`
- `GET /contracts`
- `GET /contracts/{id}`
- `PATCH /contracts/{id}/status`
- `DELETE /contracts/{id}`

### Contracts (Proposals)
- `POST /contracts/proposals`
- `GET /contracts/{contractId}/proposals`
- `POST /contracts/proposals/{proposalId}/accept`
- `POST /contracts/proposals/{proposalId}/reject`

### Contracts (Messages)
- `POST /contracts/messages`
- `GET /contracts/{contractId}/messages`
- `POST /contracts/messages/{messageId}/read`
- `GET /contracts/{contractId}/messages/unread`

### Contracts (Audit)
- `GET /contracts/{contractId}/audit`
- `GET /contracts/{contractId}/audit/logs`
- `GET /contracts/audit/user`

### Contracts (Templates)
- `POST /contracts/templates` (multipart/form-data: `file`, `template_name`, `description`)
- `GET /contracts/templates/my` (query opcional: `include_inactive=true`)
- `GET /contracts/{id}/template`
- `POST /contracts/{id}/accept-template`
- `POST /contracts/{id}/reject-template`

### Notifications
- `GET /notifications`
- `GET /notifications/unread-count`
- `PATCH /notifications/{id}/read`
- `PATCH /notifications/read-all`
- `GET /notifications/preferences`
- `PATCH /notifications/preferences`
- `POST /notifications/test`

**Frontend expectation for notification payloads:**
- Base fields já usados: `id`, `type`, `title`, `message`, `is_read`, `created_at`
- Navegação contextual deve preferir `action_url` quando o backend enviar
- Para navegação por entidade, backend pode enviar `related_entity_id` + `related_entity_type`
- `metadata` opcional é suportado no frontend para futuros casos (`venue_id`, `contract_id`, `artist_id`, etc.)
- Caso prioritário atual: `community_venue_created` com `related_entity_id` deve abrir `/venues/{id}`

### Upload
- `POST /upload/photo`

### WebSocket
- `GET /ws` — Notificações em tempo real (autenticado)

### External APIs (frontend)
- Nominatim: `GET https://nominatim.openstreetmap.org/search`
- BigDataCloud Reverse Geocode: `GET https://api.bigdatacloud.net/data/reverse-geocode-client`

## Current Integration Notes

- Contratos avançados (propostas, mensagens, auditoria e assinatura) já estão integrados no frontend.
- Existem dois fluxos E2E para contratos:
	- Local com mock (`e2e/contracts-local.spec.ts`)
	- Real com backend (`e2e/contracts-real.spec.ts`)
- Em mobile, labels de abas podem ficar ocultas; para testes E2E preferir `data-testid`.

## Checklist para Novo Endpoint/Feature

- Adicionar tipos em `lib/types.ts`.
- Adicionar/atualizar service em `lib/services/*` com tipagem forte.
- Integrar UI (`app/**` e `components/**`) com estados loading/error/empty.
- Cobrir com testes unitários do service (`lib/services/__tests__/**`).
- Se fluxo crítico, adicionar E2E local e, quando aplicável, E2E real.
- Atualizar esta documentação (`.github/instructions/**`) com endpoint e payload final.

## Pagination Conventions

- List endpoints use `limit` and `offset` when available
- Client side should default `limit` sensibly and keep UI stable on load
