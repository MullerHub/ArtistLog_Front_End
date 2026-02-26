---
description: Frontend patterns, UX, and component standards
applyTo: 'app/**,components/**,lib/**,hooks/**,styles/**'
---

# Frontend Guidelines

## Component Patterns

- Prefer small, focused components with clear props
- Keep data fetching in services and hooks, not inside presentational components
- Use `lib/types` for shared API models
- Use `components/ui` for base UI elements and compose upward

## State and Data

- `apiClient` is the single source for HTTP calls
- Use React Query for async state and caching
- Handle `loading`, `error`, and `empty` states explicitly

## UX and Accessibility

- Always support keyboard navigation
- Provide visible focus and `aria-*` where needed
- Form errors must be readable and near the input
- Avoid layout shift by reserving space for content

## Styling

- Use Tailwind utility classes with consistent spacing scale
- Avoid inline styles unless needed for dynamic values
- Keep layout responsive (mobile first)

## Routing

- Use App Router conventions
- Place protected pages under `app/(protected)`
- Use `AuthProvider` for auth state and guard logic
