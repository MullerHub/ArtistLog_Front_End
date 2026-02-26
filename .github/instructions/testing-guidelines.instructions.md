---
description: Frontend testing guidelines
applyTo: '**/*.{test,spec}.ts,**/*.{test,spec}.tsx,tests/**'
---

# Frontend Testing Guidelines

## Scope

- Prefer component tests for UI logic
- Use integration tests for key user flows (login, create contract, claim venue)
- Keep E2E tests minimal and focused

## Patterns

- Assert on user-visible behavior, not implementation details
- Use accessible queries (by role/label/text)
- Mock API calls at the service layer or with MSW

## Performance

- Keep tests small and fast
- Avoid heavy fixtures; build data inline when possible
