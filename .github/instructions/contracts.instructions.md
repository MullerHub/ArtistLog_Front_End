---
description: ArtistLog - Contratos (Em desenvolvimento - será ocultado na v1.0)
---

# ArtistLog - Contratos (Status: Semi-Pronto - Em Pausa)

## ⚠️ Status Atual (2026-03-04)

**Versão**: MVP v1.0  
**Status**: SEMI-PRONTO - **SERÁ OCULTADO DO MENU PARA O MVP v1.0**  
**Motivo**: Funcionalidade secundária para lançamento inicial, foco em Discovery + Basics

## O que foi implementado

### ✅ Backend (100% Pronto)
- API endpoints completos para contratos
- Propostas (counter-proposals)
- Mensagens/Chat
- Auditoria (Audit Trail)
- Assinatura Digital (Signature endpoints)

### ✅ Frontend - Estrutura
- Página de contratos com tabs (Detalhes, Propostas, Chat, Auditoria)
- Services completos (contracts, proposals, messages, audit, signature)
- Tipos TypeScript definidos
- Error handling com ApiError logging
- UI com Shadcn/ui components

### ⚠️ Frontend - Problemas conhecidos
- E2E tests requer dados seed no backend (contracts não estão sendo retornados)
- Verificação de permissões (artist vs venue) requer mais testes
- Fluxo de assinatura digital precisa de validação
- UX de mobile poderia ser melhorada

### ❌ Não Implementado
- Real-time updates (WebSocket para contratos)
- Notificações de contract events
- Payment integration
- Contract templates

## Plano para v1.1+

1. **Limpar dados do backend** - Garantir contratos com seed data
2. **E2E completo** - Testar todos os fluxos
3. **Melhorar UX** - Simplificar interface
4. **Adicionar notificações** - Integrar com notification center
5. **Payment** - Stripe/PagSeguro
6. **Templates** - Contratos pré-feitos

## Arquivo Principal

- `app/(protected)/contracts/page.tsx` - Página com tabs (530 linhas)
- `lib/services/contracts.service.ts` - API client
- `lib/services/proposals.service.ts` - Counter-proposals
- `lib/services/messages.service.ts` - Chat
- `lib/services/audit.service.ts` - Audit trail
- `lib/services/signature.service.ts` - Digital signature

## Para Reabilitar no Futuro

1. Remover aviso de "Em Desenvolvimento" em `contracts/page.tsx`
2. Adicionar link voltar ao menu
3. Rodar E2E tests com dados seed: `npm run test:e2e contracts`
4. Revisar permissions (artist vs venue)
5. Melhorar UX em mobile
6. Re-testar fluxo completo

## Notas de Desenvolvimento

- Service functions estão prontas para uso
- Logging completo com ApiError details
- Permission checks implementados (mas precisam validação)
- UI responsiva, mas mobile poderia ter melhor UX
- Backend valida: "only venue can accept contract"

## Próxima Pessoa que Pegar Isso

1. Ler este arquivo
2. Verificar MVP_DEPLOYMENT_CHECKLIST.md
3. Desabilitar aviso em contracts/page.tsx
4. Popule backend com dados de teste
5. Execute E2E suite
6. Teste em mobile
7. Integrate com notifications

---

**Criado**: 2026-03-04  
**Próxima Revisão**: MVP v1.1  
**Responsável**: @dev-team
