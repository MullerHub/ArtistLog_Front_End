---
description: Frontend upload UX and validation
applyTo: 'components/**,lib/services/**'
---

# Upload UX (Frontend)

## Client Validation

- Accept: JPG, PNG, WebP
- Max size: 10MB (match `uploadService`)
- Show clear error messages near the uploader

## UX Behavior

- Provide preview before upload when possible
- Disable submit while uploading
- Show progress or spinner and success feedback
- Handle retry and cancellation cleanly

## API

- Use `uploadService.uploadPhoto(file)`
- Endpoint: `POST /upload/photo`
- Use `FormData` and keep headers minimal (no manual Content-Type)
