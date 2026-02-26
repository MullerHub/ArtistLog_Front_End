---
description: Frontend data models and types
applyTo: 'lib/types.ts,lib/services/**,components/**,app/**'
---

# Frontend Types and Models

## Source of Truth

- Types live in `lib/types.ts`
- Services should return typed responses and avoid `any`
- Normalize response shapes in services when API returns arrays or objects

## Common Patterns

- `ListResponse` types include `items`, `total`, `limit`, `offset`
- Use optional fields for partial updates and form drafts
- Prefer explicit unions for enums (status, roles, notification types)

## Mapping and Formatting

- UI components should accept view-friendly props (formatted dates, labels)
- Format raw API values in `lib/formatters` or small helpers

## Error Safety

- Keep API error parsing inside `apiClient`
- UI should display user-friendly messages and avoid leaking raw payloads
