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

Auth:
- `POST /auth/login`
- `POST /auth/signup/artist`
- `POST /auth/signup/venue`
- `GET /auth/me`

Artists:
- `GET /artists`
- `GET /artists/{id}`
- `PATCH /artists/{id}`
- `PATCH /artists/{id}/availability`
- `POST /artists/{id}/location`

Venues:
- `GET /venues`
- `GET /venues/{id}`
- `PATCH /venues/{id}`
- `GET /venues/nearby`
- `GET /venues/{id}/available-artists`
- `GET /venues/{id}/reviews`
- `POST /venues/{id}/reviews`

Community Venues:
- `POST /venues/community`
- `GET /venues/community`
- `GET /venues/claim-candidates`
- `POST /venues/{id}/claim`

Contracts:
- `POST /contracts`
- `GET /contracts`
- `GET /contracts/{id}`
- `PATCH /contracts/{id}/status`
- `DELETE /contracts/{id}`

Notifications:
- `GET /notifications`
- `GET /notifications/unread-count`
- `PATCH /notifications/{id}/read`
- `PATCH /notifications/read-all`
- `GET /notifications/preferences`
- `PATCH /notifications/preferences`

Uploads:
- `POST /upload/photo`

Cities:
- `GET /cities/search`

## Pagination Conventions

- List endpoints use `limit` and `offset` when available
- Client side should default `limit` sensibly and keep UI stable on load
