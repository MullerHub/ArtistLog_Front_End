---
description: ArtistLog - Indice de Instrucoes (Frontend)
---

# ArtistLog - Chat Instructions (Frontend Focus)

Este diretório contém instruções focadas no frontend e UX. O backend fica apenas como referência de endpoints.

## Estrutura

### project-overview.instructions.md
Sempre carregado. Visão geral do frontend, fluxo de UX e referência rápida de API.

### frontend.instructions.md
applyTo: app/**, components/**, lib/**, hooks/**, styles/**
- Padrões de componentes
- Estado e dados
- Acessibilidade e UX
- Tailwind e layout

### backend-api.instructions.md
applyTo: lib/**, lib/services/**, hooks/**
- Endpoints usados pelo frontend
- Autenticação, headers, erros
- Upload e notificações
- Contratos avançados (propostas, mensagens, auditoria, assinatura)
- Schedules, exact location e integrações externas de geocoding

### testing-guidelines.instructions.md
applyTo: **/*.{test,spec}.ts, **/*.{test,spec}.tsx, tests/**
- Testes de UI e integração
- Estratégia E2E local (mock) e E2E real (backend)
- Boas práticas para seletores estáveis em mobile

### upload-storage.instructions.md
applyTo: components/**, lib/services/**
- UX de upload e validações no cliente

## Nota
Documentação de banco de dados, handlers backend e segurança foram removidos para manter este chat 100% frontend.
