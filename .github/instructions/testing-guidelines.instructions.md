---
description: Frontend testing guidelines
applyTo: '**/*.{test,spec}.ts,**/*.{test,spec}.tsx,tests/**'
---

# Frontend Testing Guidelines

## Scope

- Prefer component tests for UI logic
- Use integration tests for key user flows (login, create contract, claim venue)
- Keep E2E tests minimal and focused

## E2E Modes (Current)

- Local E2E (default): usar mocks Playwright (`page.route`) para execução estável e rápida.
- Real E2E (integração): usar backend real com dados seed/mockados no backend.
- Para contratos:
	- Local: `e2e/contracts-local.spec.ts`
	- Real: `e2e/contracts-real.spec.ts`

## Patterns

- Assert on user-visible behavior, not implementation details
- Use accessible queries (by role/label/text)
- Mock API calls at the service layer or with MSW
- Em UI responsiva/mobile, quando labels ficam ocultas, preferir `data-testid` estável para interação.

## Performance

- Keep tests small and fast
- Avoid heavy fixtures; build data inline when possible
- Rodar smoke em Chromium para feedback rápido e suíte completa em todos os projetos no CI.

## E2E Authentication and Backend

- Real backend fixture: `e2e/fixtures/real-backend-session.ts`
- Session caching: File-based cache em `/tmp/artistlog-e2e-session-cache.json` (TTL 5 min)
- Evita rate limit: Backend permite max 5 logins/15min por IP, cache reutiliza sessão
- Environment variables:
  - `E2E_EMAIL` - email do usuário de teste
  - `E2E_PASSWORD` - senha do usuário
  - `NEXT_PUBLIC_API_URL` - URL do backend (local ou staging)
- Run com `--workers=1` para garantir compartilhamento de cache entre specs
