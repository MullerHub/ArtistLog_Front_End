---
description: API reference for frontend usage
applyTo: 'lib/**,lib/services/**,hooks/**'
---

# API Reference (Frontend)

## Base URL and Auth

- Base URL: `NEXT_PUBLIC_API_URL` (fallback `http://localhost:8080`)
- Auth header: `Authorization: Bearer <token>`
- Token storage: `localStorage['artistlog_token']`
- User cache: `localStorage['artistlog_user']`

## Error Handling

- `apiClient` throws `ApiError` with `status` and `data`
- On `401`, token is cleared and user is redirected to `/login`
- Surface friendly errors in UI, keep details for logs

## Endpoints Used by the Frontend

### Auth
- `POST /auth/login`
- `POST /auth/signup/artist`
- `POST /auth/signup/venue`
- `GET /auth/me`

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

### Contracts (Signature)
- `POST /contracts/send-for-signature`
- `GET /contracts/{contractId}/signature-status`
- `POST /webhooks/signature-completed` (webhook externo, não chamado diretamente no frontend)

### Notifications
- `GET /notifications`
- `GET /notifications/unread-count`
- `PATCH /notifications/{id}/read`
- `PATCH /notifications/read-all`
- `GET /notifications/preferences`
- `PATCH /notifications/preferences`
- `POST /notifications/test`

### Location / City / Upload
- `GET /cities/search`
- `PATCH /me/location`
- `POST /upload/photo`

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
