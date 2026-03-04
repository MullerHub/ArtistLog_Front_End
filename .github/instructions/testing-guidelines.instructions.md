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
