# 🎯 Backend Features - Frontend Implementation Guide

**Data**: 2 de março de 2026  
**Status**: ✅ Serviços criados e integrados  
**TypeScript**: ✅ Tipos definidos  
**Build**: ✅ Compilado com sucesso  

---

## 📋 Resumo das Features

O backend implementou 4 grandes features com 14 endpoints no total. Todos os serviços frontend foram criados para integração.

### ✅ Serviços Criados

1. **proposalsService** - Gerenciar contra-propostas
2. **messagesService** - Gerenciar chat/mensagens
3. **auditService** - Trilha de auditoria
4. **signatureService** - Assinatura digital ZapSign

---

## 🔄 FEATURE 1: PROPOSTAS (Contra-Propostas)

### Endpoints Backend

```
POST   /contracts/proposals                    → Criar proposta
GET    /contracts/{id}/proposals               → Listar propostas
POST   /contracts/proposals/{id}/accept        → Aceitar proposta
POST   /contracts/proposals/{id}/reject        → Rejeitar proposta
```

### Uso no Frontend

```typescript
import { proposalsService } from "@/lib/services/proposals.service"

// Criar contra-proposta
await proposalsService.create({
  contract_id: "abc123",
  proposed_price: 2800,
  proposed_date: "2026-04-20",
  proposed_time: "20:30",
  proposed_duration: 2.5,
  message: "Nova proposta com melhor data"
})

// Listar propostas de um contrato
const result = await proposalsService.list("contract_id", {
  limit: 50,
  status: "PENDING"
})

// Aceitar proposta
await proposalsService.accept("proposal_id", "Tudo certo!")

// Rejeitar proposta
await proposalsService.reject("proposal_id", "Não consigo fazer nesse valor")
```

### Tipos TypeScript

```typescript
interface Proposal {
  id: string
  contract_id: string
  proposed_by_user_id: string
  proposed_by_role: "ARTIST" | "VENUE"
  proposed_price?: number
  proposed_date?: string
  proposed_time?: string
  proposed_duration?: number
  message: string
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "SUPERSEDED"
  rejection_message?: string
  created_at: string
  updated_at: string
}
```

---

## 💬 FEATURE 2: MENSAGENS (Chat)

### Endpoints Backend

```
POST   /contracts/messages                     → Enviar mensagem
GET    /contracts/{id}/messages                → Listar mensagens
POST   /contracts/messages/{id}/read           → Marcar lida
GET    /contracts/{id}/messages/unread         → Contar não-lidas
```

### Uso no Frontend

```typescript
import { messagesService } from "@/lib/services/messages.service"

// Enviar mensagem
await messagesService.send({
  contract_id: "abc123",
  message: "Tudo certo com os detalhes técnicos?"
})

// Listar mensagens
const result = await messagesService.list("contract_id", {
  limit: 50,
  offset: 0
})

// Marcar como lida
await messagesService.markAsRead("message_id")

// Contar não-lidas
const unread = await messagesService.getUnreadCount("contract_id")
// Retorna: { contract_id: "...", unread_count: 3, last_unread_at: "..." }
```

### Tipos TypeScript

```typescript
interface Message {
  id: string
  contract_id: string
  sender_id: string
  sender_role: "ARTIST" | "VENUE"
  message: string
  type: "USER" | "SYSTEM"
  is_system_message: boolean
  read_at?: string
  created_at: string
  updated_at: string
}

interface UnreadCountResponse {
  contract_id: string
  unread_count: number
  last_unread_at?: string
}
```

---

## 📊 FEATURE 3: AUDITORIA (Trilha)

### Endpoints Backend

```
GET    /contracts/{id}/audit                   → Trilha completa
GET    /contracts/{id}/audit/logs              → Com paginação
GET    /contracts/audit/user                   → Suas ações
```

### Uso no Frontend

```typescript
import { auditService } from "@/lib/services/audit.service"

// Obter trilha completa
const trail = await auditService.getTrail("contract_id")

// Listar com paginação
const result = await auditService.listLogs("contract_id", {
  limit: 50,
  offset: 0,
  action: "SEND_PROPOSAL"  // filtrar por ação
})

// Auditoria do usuário
const userAudit = await auditService.getUserAudit({
  limit: 50,
  offset: 0
})
```

### Tipos TypeScript

```typescript
interface AuditLog {
  id: string
  contract_id: string
  user_id: string
  user_role: "ARTIST" | "VENUE"
  action: "CREATE" | "UPDATE_STATUS" | "SEND_PROPOSAL" | "ACCEPT_PROPOSAL" 
          | "REJECT_PROPOSAL" | "SEND_MESSAGE" | "SIGNATURE_SENT" 
          | "SIGNATURE_COMPLETED" | "SIGNATURE_CANCELLED" | "SOFT_DELETE"
  old_value?: Record<string, unknown>
  new_value?: Record<string, unknown>
  created_at: string
}
```

---

## ✍️ FEATURE 4: ASSINATURA DIGITAL (ZapSign)

### Endpoints Backend

```
POST   /contracts/send-for-signature           → Enviar para ZapSign
GET    /contracts/{id}/signature-status        → Verificar status
POST   /webhooks/signature-completed           → Callback automático
```

### Uso no Frontend

```typescript
import { signatureService } from "@/lib/services/signature.service"

// Enviar para assinatura
await signatureService.sendForSignature({
  contract_id: "abc123",
  pdf_url: "https://cdn.example.com/contract.pdf"
})

// Verificar status (com polling)
const status = await signatureService.getStatus("contract_id")

// Implementar polling a cada 10s
useEffect(() => {
  const interval = setInterval(async () => {
    const status = await signatureService.getStatus(contractId)
    if (status.status === "FULLY_SIGNED") {
      clearInterval(interval)
      toast.success("Contrato assinado!")
    }
  }, 10000)
  
  return () => clearInterval(interval)
}, [contractId])
```

### Tipos TypeScript

```typescript
interface SignatureStatus {
  id: string
  contract_id: string
  zapSign_document_id?: string
  status: "PENDING_SIGNATURE" | "PARTIALLY_SIGNED" | "FULLY_SIGNED" 
          | "SIGNATURE_CANCELLED" | "SIGNATURE_EXPIRED"
  signers: Signer[]
  pdf_url?: string
  completed_at?: string
  created_at: string
  updated_at: string
}

interface Signer {
  signer_id: string
  signer_role: "ARTIST" | "VENUE"
  signer_name: string
  signed_at?: string
  ip_address?: string
}
```

---

## 🎯 Próximos Passos - Implementação de Componentes

### TAB 1: PROPOSTAS
- [ ] Componente `ProposalsList.tsx` - lista de propostas
- [ ] Componente `ProposalCard.tsx` - card individual
- [ ] Modal `SendProposalModal.tsx` - enviar proposta
- [ ] Integrar em `/app/(protected)/contracts/page.tsx`

### TAB 2: MENSAGENS
- [ ] Componente `ChatMessages.tsx` - lista de mensagens
- [ ] Componente `MessageBubble.tsx` - bolha individual
- [ ] Input `MessageInput.tsx` - enviar mensagem
- [ ] Badge com contador de não-lidas
- [ ] Auto-scroll para última mensagem

### TAB 3: AUDITORIA
- [ ] Componente `AuditTimeline.tsx` - timeline visual
- [ ] Componente `AuditTable.tsx` - tabela detalhada
- [ ] Filtros por ação
- [ ] Paginação

### TAB 4: ASSINATURA
- [ ] Componente `SignatureStatus.tsx` - status progress
- [ ] Modal `SendForSignatureModal.tsx` - enviar
- [ ] Polling automático a cada 10s
- [ ] Download PDF quando completo
- [ ] Mostrar signatários com status individual

---

## 📁 Arquivo de Referência

**Tipos definidos**: [lib/types.ts](lib/types.ts)

**Serviços criados**:
- [lib/services/proposals.service.ts](lib/services/proposals.service.ts)
- [lib/services/messages.service.ts](lib/services/messages.service.ts)
- [lib/services/audit.service.ts](lib/services/audit.service.ts)
- [lib/services/signature.service.ts](lib/services/signature.service.ts)

---

## ✅ Validação

- ✅ Build TypeScript: Compilado com sucesso
- ✅ Tipos: Todos os tipos definidos
- ✅ Serviços: Todos os 4 serviços criados
- ✅ Endpoints: Alinhados com backend

**Próxima etapa**: Implementar componentes React para cada feature
