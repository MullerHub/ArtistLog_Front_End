"use client"

import { useState, useEffect, useRef } from "react"
import useSWR from "swr"
import { 
  FileText, 
  Loader2, 
  Calendar, 
  DollarSign, 
  Check, 
  X, 
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  FileCheck,
  HistoryIcon,
  ChevronDown,
  Send as SendIcon,
  MessageCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { contractsService } from "@/lib/services/contracts.service"
import { proposalsService } from "@/lib/services/proposals.service"
import { messagesService } from "@/lib/services/messages.service"
import { auditService } from "@/lib/services/audit.service"
import { signatureService } from "@/lib/services/signature.service"
import { useAuth } from "@/lib/auth-context"
import { formatDate, formatCurrency } from "@/lib/formatters"
import { ApiError } from "@/lib/api-client"
import type { Contract, ContractStatus, Proposal, Message, AuditLog, SignatureStatus } from "@/lib/types"
import { toast } from "sonner"
import { mutate } from "swr"

const statusConfig = {
  PENDING: {
    label: "Pendente",
    icon: Clock,
    variant: "secondary" as const,
    color: "text-yellow-600",
  },
  "PENDING_COUNTER": {
    label: "Em Negociação",
    icon: AlertCircle,
    variant: "secondary" as const,
    color: "text-blue-600",
  },
  ACCEPTED: {
    label: "Aceito",
    icon: CheckCircle2,
    variant: "default" as const,
    color: "text-green-600",
  },
  REJECTED: {
    label: "Recusado",
    icon: AlertCircle,
    variant: "destructive" as const,
    color: "text-red-600",
  },
  COMPLETED: {
    label: "Concluído",
    icon: Check,
    variant: "outline" as const,
    color: "text-blue-600",
  },
}

// Componente Principal
export default function ContractsPage() {
  const { user } = useAuth()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const { data, isLoading, error } = useSWR(
    user ? "/contracts" : null,
    () => contractsService.getAll({ limit: 50, offset: 0 })
  )

  const handleUpdateStatus = async (contractId: string, newStatus: ContractStatus) => {
    // ⚠️ AVISO: Esta página está em desenvolvimento e será melhorada na v1.1+
    setUpdatingId(contractId)
    try {
      await contractsService.updateStatus(contractId, { status: newStatus })
      toast.success("Status atualizado com sucesso!")
      mutate("/contracts")
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        console.error("[Contracts] updateStatus failed", {
          contractId,
          newStatus,
          status: error.status,
          message: error.message,
          data: error.data,
        })
        toast.error(`Erro ao atualizar status: ${error.message}`)
      } else if (error instanceof Error) {
        console.error("[Contracts] updateStatus failed", {
          contractId,
          newStatus,
          message: error.message,
        })
        toast.error(`Erro ao atualizar status: ${error.message}`)
      } else {
        console.error("[Contracts] updateStatus failed", {
          contractId,
          newStatus,
          error,
        })
        toast.error("Erro ao atualizar status")
      }
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDelete = async (contractId: string) => {
    if (!confirm("Deseja realmente deletar este contrato?")) return
    try {
      await contractsService.delete(contractId)
      toast.success("Contrato deletado com sucesso!")
      mutate("/contracts")
    } catch (error: unknown) {
      toast.error("Erro ao deletar contrato")
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-sm text-destructive">Erro ao carregar contratos</p>
      </div>
    )
  }

  const contracts = data?.items || []
  const isArtist = user?.role === "ARTIST"
  const isVenue = user?.role === "VENUE"

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Contratos</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Gerencie suas propostas de contratos, mensagens, auditoria e assinaturas
        </p>
      </div>

      {/* ⚠️ AVISO DE DESENVOLVIMENTO */}
      <div className="mb-6 rounded-lg border-l-4 border-yellow-500 bg-yellow-50 p-4 dark:bg-yellow-950">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-yellow-600 dark:text-yellow-400 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">
              🚧 Módulo em Desenvolvimento
            </h3>
            <p className="mt-1 text-sm text-yellow-800 dark:text-yellow-200">
              O sistema de contratos está semi-pronto e será totalemente refinado na versão <strong>v1.1+</strong>. 
              Atualmente, os endpoints no backend funcionam completamente. Esta interface será melhorada após o lançamento do MVP.
            </p>
            <p className="mt-2 text-xs text-yellow-700 dark:text-yellow-300">
              <strong>Status:</strong> Backend ✅ | Frontend UI ⚠️ | E2E Tests ⏳
            </p>
          </div>
        </div>
      </div>

      {contracts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-20">
            <FileText className="h-12 w-12 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              {isArtist 
                ? "Você ainda não tem nenhum contrato" 
                : "Você ainda não tem nenhum contrato"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {contracts.map((contract) => (
            <ContractCard 
              key={contract.id}
              contract={contract}
              isExpanded={expandedId === contract.id}
              onToggle={() => setExpandedId(expandedId === contract.id ? null : contract.id)}
              onStatusChange={handleUpdateStatus}
              onDelete={handleDelete}
              updatingId={updatingId}
              isArtist={isArtist}
              isVenue={isVenue}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// COMPONENT: ContractCard com Tabs
// ============================================================================

interface ContractCardProps {
  contract: Contract
  isExpanded: boolean
  onToggle: () => void
  onStatusChange: (contractId: string, newStatus: ContractStatus) => void
  onDelete: (contractId: string) => void
  updatingId: string | null
  isArtist: boolean
  isVenue: boolean
}

function ContractCard({
  contract,
  isExpanded,
  onToggle,
  onStatusChange,
  onDelete,
  updatingId,
  isArtist,
  isVenue,
}: ContractCardProps) {
  const statusConfig: Record<string, { label: string; icon: React.ElementType; variant: any; color: string }> = {
    PENDING: { label: "Pendente", icon: Clock, variant: "secondary", color: "text-yellow-600" },
    ACCEPTED: { label: "Aceito", icon: CheckCircle2, variant: "default", color: "text-green-600" },
    REJECTED: { label: "Recusado", icon: X, variant: "destructive", color: "text-red-600" },
    COMPLETED: { label: "Concluído", icon: Check, variant: "outline", color: "text-blue-600" },
  }

  const config = statusConfig[contract.status]
  const StatusIcon = config.icon

  const canAccept = isVenue && contract.status === "PENDING"
  const canReject = contract.status === "PENDING"
  const canComplete = contract.status === "ACCEPTED"
  const canDelete = contract.status === "PENDING" || contract.status === "REJECTED"

  return (
    <Card className="overflow-hidden" data-testid="contract-card">
      <div
        className="flex flex-col p-6 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold">Contrato #{contract.id.slice(0, 8)}</h3>
              <Badge variant={config.variant} className="flex items-center gap-1" data-testid="status-badge">
                <StatusIcon className="h-3 w-3" />
                {config.label}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {isArtist 
                ? `Venue: ${contract.venue_id.slice(0, 8)}...` 
                : `Artista: ${contract.artist_id.slice(0, 8)}...`}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-6 text-sm flex-shrink-0">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{formatDate(contract.event_date)}</span>
              </div>
              <div className="flex items-center gap-1">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span>{formatCurrency(contract.final_price)}</span>
              </div>
            </div>
            <ChevronDown
              className={`h-5 w-5 transition-transform ${isExpanded ? "rotate-180" : ""}`}
            />
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t p-6">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="details" data-testid="tab-trigger-details">Detalhes</TabsTrigger>
              <TabsTrigger value="proposals" className="flex items-center gap-1" data-testid="tab-trigger-proposals">
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline">Propostas</span>
              </TabsTrigger>
              <TabsTrigger value="messages" className="flex items-center gap-1" data-testid="tab-trigger-messages">
                <MessageCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Chat</span>
              </TabsTrigger>
              <TabsTrigger value="audit" className="flex items-center gap-1" data-testid="tab-trigger-audit">
                <HistoryIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Auditoria</span>
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: Detalhes */}
            <TabsContent value="details" className="space-y-4" data-testid="tab-detalhes">
              <ContractDetailsTab contract={contract} />
              
              {/* Informação sobre permissões do workflow */}
              {isArtist && contract.status === "PENDING" && (
                <div className="flex items-start gap-2 rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <p>
                    <strong>Aguardando aprovação do venue.</strong> Você pode rejeitar esta proposta ou enviar uma contra-proposta na aba "Propostas".
                  </p>
                </div>
              )}
              
              <div className="flex flex-wrap gap-2 pt-4 border-t">
                {canAccept && (
                  <Button
                    size="sm"
                    onClick={() => onStatusChange(contract.id, "ACCEPTED")}
                    disabled={updatingId === contract.id}
                    data-testid="action-button"
                  >
                    <Check className="mr-1 h-3 w-3" />
                    Aceitar
                  </Button>
                )}
                {canReject && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onStatusChange(contract.id, "REJECTED")}
                    disabled={updatingId === contract.id}
                    data-testid="action-button"
                  >
                    <X className="mr-1 h-3 w-3" />
                    Recusar
                  </Button>
                )}
                {canComplete && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onStatusChange(contract.id, "COMPLETED")}
                    disabled={updatingId === contract.id}
                    data-testid="action-button"
                  >
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Marcar como Concluído
                  </Button>
                )}
                {canDelete && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDelete(contract.id)}
                    className="text-destructive hover:text-destructive ml-auto"
                    data-testid="action-button"
                  >
                    Deletar
                  </Button>
                )}
              </div>
            </TabsContent>

            {/* TAB 2: Propostas */}
            <TabsContent value="proposals" className="space-y-4" data-testid="proposals-tab">
              <ProposalsTab contractId={contract.id} />
            </TabsContent>

            {/* TAB 3: Mensagens */}
            <TabsContent value="messages" className="space-y-4" data-testid="messages-tab">
              <MessagesTab contractId={contract.id} />
            </TabsContent>

            {/* TAB 4: Auditoria */}
            <TabsContent value="audit" className="space-y-4" data-testid="audit-tab">
              <AuditTab contractId={contract.id} />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </Card>
  )
}

// ============================================================================
// TAB 1: DETALHES DO CONTRATO
// ============================================================================

function ContractDetailsTab({ contract }: { contract: Contract }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs font-medium text-muted-foreground">Data do Evento</p>
          <p className="mt-1 font-medium">{formatDate(contract.event_date)}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground">Valor do Contrato</p>
          <p className="mt-1 text-lg font-bold">{formatCurrency(contract.final_price)}</p>
        </div>
      </div>

      {(contract.description || contract.message) && (
        <div className="space-y-3 rounded-md border border-border bg-muted/20 p-4">
          {contract.description && (
            <div>
              <p className="text-xs font-medium text-muted-foreground">Descrição</p>
              <p className="mt-1 whitespace-pre-wrap text-sm">{contract.description}</p>
            </div>
          )}
          {contract.message && (
            <div>
              <p className="text-xs font-medium text-muted-foreground">Mensagem</p>
              <p className="mt-1 whitespace-pre-wrap text-sm">{contract.message}</p>
            </div>
          )}
        </div>
      )}

      <div className="text-xs text-muted-foreground">
        Criado em {formatDate(contract.created_at)}
      </div>
    </div>
  )
}

// ============================================================================
// TAB 2: PROPOSTAS (Contra-propostas)
// ============================================================================

function ProposalsTab({ contractId }: { contractId: string }) {
  const [newProposal, setNewProposal] = useState({
    proposed_price: "",
    proposed_date: "",
    proposed_time: "",
    proposed_duration: "",
    message: "",
  })
  const [sending, setSending] = useState(false)

  const { data: proposals, isLoading, mutate } = useSWR(
    contractId ? `/contracts/${contractId}/proposals` : null,
    () => proposalsService.list(contractId)
  )

  const handleSendProposal = async () => {
    if (!newProposal.message.trim()) {
      toast.error("Mensagem é obrigatória")
      return
    }

    setSending(true)
    try {
      await proposalsService.create({
        contract_id: contractId,
        proposed_price: newProposal.proposed_price ? Number(newProposal.proposed_price) : undefined,
        proposed_date: newProposal.proposed_date || undefined,
        proposed_time: newProposal.proposed_time || undefined,
        proposed_duration: newProposal.proposed_duration ? Number(newProposal.proposed_duration) : undefined,
        message: newProposal.message,
      })
      toast.success("Proposta enviada com sucesso!")
      setNewProposal({ proposed_price: "", proposed_date: "", proposed_time: "", proposed_duration: "", message: "" })
      mutate()
    } catch (error: unknown) {
      toast.error("Erro ao enviar proposta")
    } finally {
      setSending(false)
    }
  }

  const handleAcceptProposal = async (proposalId: string) => {
    try {
      await proposalsService.accept(proposalId)
      toast.success("Proposta aceita!")
      mutate()
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        console.error("[Contracts] acceptProposal failed", {
          contractId,
          proposalId,
          status: error.status,
          message: error.message,
          data: error.data,
        })
        toast.error(`Erro ao aceitar proposta: ${error.message}`)
      } else if (error instanceof Error) {
        console.error("[Contracts] acceptProposal failed", {
          contractId,
          proposalId,
          message: error.message,
        })
        toast.error(`Erro ao aceitar proposta: ${error.message}`)
      } else {
        console.error("[Contracts] acceptProposal failed", {
          contractId,
          proposalId,
          error,
        })
        toast.error("Erro ao aceitar proposta")
      }
    }
  }

  const handleRejectProposal = async (proposalId: string) => {
    try {
      await proposalsService.reject(proposalId)
      toast.success("Proposta rejeitada")
      mutate()
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        console.error("[Contracts] rejectProposal failed", {
          contractId,
          proposalId,
          status: error.status,
          message: error.message,
          data: error.data,
        })
        toast.error(`Erro ao rejeitar proposta: ${error.message}`)
      } else if (error instanceof Error) {
        console.error("[Contracts] rejectProposal failed", {
          contractId,
          proposalId,
          message: error.message,
        })
        toast.error(`Erro ao rejeitar proposta: ${error.message}`)
      } else {
        console.error("[Contracts] rejectProposal failed", {
          contractId,
          proposalId,
          error,
        })
        toast.error("Erro ao rejeitar proposta")
      }
    }
  }

  if (isLoading) {
    return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
  }

  const proposalList = proposals?.data || []

  return (
    <div className="space-y-6">
      {/* Input para nova proposta */}
      <div className="space-y-3 rounded-md border border-border bg-muted/20 p-4" data-testid="create-proposal-form">
        <h4 className="font-medium">Enviar Nova Proposta</h4>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            placeholder="Preço (R$)"
            type="number"
            step="0.01"
            value={newProposal.proposed_price}
            onChange={(e) => setNewProposal({ ...newProposal, proposed_price: e.target.value })}
          />
          <Input
            placeholder="Data (YYYY-MM-DD)"
            type="date"
            value={newProposal.proposed_date}
            onChange={(e) => setNewProposal({ ...newProposal, proposed_date: e.target.value })}
          />
          <Input
            placeholder="Horário (HH:MM)"
            type="time"
            value={newProposal.proposed_time}
            onChange={(e) => setNewProposal({ ...newProposal, proposed_time: e.target.value })}
          />
          <Input
            placeholder="Duração (horas)"
            type="number"
            step="0.5"
            value={newProposal.proposed_duration}
            onChange={(e) => setNewProposal({ ...newProposal, proposed_duration: e.target.value })}
          />
        </div>
        <Textarea
          placeholder="Mensagem da proposta (obrigatória)"
          value={newProposal.message}
          onChange={(e) => setNewProposal({ ...newProposal, message: e.target.value })}
          rows={3}
        />
        <Button onClick={handleSendProposal} disabled={sending} className="w-full" data-testid="send-proposal-button">
          {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <SendIcon className="mr-2 h-4 w-4" />}
          Enviar Proposta
        </Button>
      </div>

      {/* Lista de propostas */}
      <div className="space-y-3" data-testid="proposals-list">
        {proposalList.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">Nenhuma proposta ainda</p>
        ) : (
          proposalList.map((proposal: Proposal) => (
            <div key={proposal.id} className="space-y-2 rounded-md border border-border p-3" data-testid="proposal-item">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-sm">
                    Proposta de {proposal.proposed_by_role === "ARTIST" ? "Artista" : "Venue"}
                  </p>
                  <p className="text-xs text-muted-foreground">{formatDate(proposal.created_at)}</p>
                </div>
                <Badge variant={proposal.status === "PENDING" ? "secondary" : "outline"} data-testid="proposal-status">
                  {proposal.status === "ACCEPTED" ? "✅ Aceita" : proposal.status === "REJECTED" ? "❌ Rejeitada" : "⏳ Pendente"}
                </Badge>
              </div>
              {proposal.proposed_price && <p className="text-sm"><strong>Preço:</strong> {formatCurrency(proposal.proposed_price)}</p>}
              {proposal.proposed_date && <p className="text-sm"><strong>Data:</strong> {proposal.proposed_date}</p>}
              {proposal.proposed_duration && <p className="text-sm"><strong>Duração:</strong> {proposal.proposed_duration}h</p>}
              <p className="text-sm whitespace-pre-wrap">{proposal.message}</p>
              {proposal.status === "PENDING" && (
                <div className="flex gap-2 pt-2 border-t">
                  <Button size="sm" onClick={() => handleAcceptProposal(proposal.id)}>
                    <Check className="mr-1 h-3 w-3" /> Aceitar
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleRejectProposal(proposal.id)}>
                    <X className="mr-1 h-3 w-3" /> Rejeitar
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// ============================================================================
// TAB 3: MENSAGENS (Chat)
// ============================================================================

function MessagesTab({ contractId }: { contractId: string }) {
  const [messageText, setMessageText] = useState("")
  const [sending, setSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const { data: messages, isLoading, mutate } = useSWR(
    contractId ? `/contracts/${contractId}/messages` : null,
    () => messagesService.list(contractId, { limit: 50 })
  )

  const { data: unreadCount } = useSWR(
    contractId ? `/contracts/${contractId}/messages/unread` : null,
    () => messagesService.getUnreadCount(contractId)
  )

  const handleSendMessage = async () => {
    if (!messageText.trim()) return

    setSending(true)
    try {
      await messagesService.send({
        contract_id: contractId,
        message: messageText,
      })
      setMessageText("")
      mutate()
    } catch (error: unknown) {
      toast.error("Erro ao enviar mensagem")
    } finally {
      setSending(false)
    }
  }

  const handleMarkAsRead = async (messageId: string) => {
    try {
      await messagesService.markAsRead(messageId)
      mutate()
    } catch (error: unknown) {
      console.error("Erro ao marcar como lida")
    }
  }

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  if (isLoading) {
    return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
  }

  const messageList = messages?.data || []

  return (
    <div className="flex flex-col gap-4 h-96">
      {/* Area de chat */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 border rounded-md p-4 bg-muted/30" data-testid="messages-list">
        {messageList.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">Nenhuma mensagem ainda</p>
        ) : (
          messageList.map((msg: Message) => (
            <div
              key={msg.id}
              className={`p-3 rounded-md text-sm ${
                msg.type === "SYSTEM"
                  ? "bg-blue-50 border border-blue-200 text-blue-900"
                  : "bg-background border border-border"
              }`}
              data-testid="message-item"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1" data-testid={msg.type === "SYSTEM" ? "system-message" : "user-message"}>
                  <p className="font-medium text-xs text-muted-foreground">
                    {msg.type === "SYSTEM" ? "🤖 Sistema" : `👤 ${msg.sender_role}`}
                  </p>
                  <p className="mt-1 whitespace-pre-wrap">{msg.message}</p>
                </div>
                {!msg.read_at && msg.type === "USER" && (
                  <Badge variant="secondary" className="whitespace-nowrap" data-testid="unread-badge">
                    Não lida
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1" data-testid="message-timestamp">{formatDate(msg.created_at)}</p>
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <Textarea
          placeholder="Digite sua mensagem..."
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.ctrlKey) {
              handleSendMessage()
            }
          }}
          rows={2}
          className="resize-none"
        />
        <Button onClick={handleSendMessage} disabled={sending || !messageText.trim()} className="self-end" data-testid="send-message-button">
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendIcon className="h-4 w-4" />}
        </Button>
      </div>

      {unreadCount && unreadCount.unread_count > 0 && (
        <p className="text-xs text-muted-foreground">
          {unreadCount.unread_count} mensagens não-lidas
        </p>
      )}
    </div>
  )
}

// ============================================================================
// TAB 4: AUDITORIA (Timeline)
// ============================================================================

function AuditTab({ contractId }: { contractId: string }) {
  const { data: auditLogs, isLoading } = useSWR(
    contractId ? `/contracts/${contractId}/audit` : null,
    () => auditService.getTrail(contractId)
  )

  if (isLoading) {
    return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
  }

  const logs = auditLogs || []

  return (
    <div className="space-y-4">
      {logs.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-8">Nenhum evento registrado</p>
      ) : (
        <div className="space-y-2" data-testid="audit-timeline">
          {logs.map((log: AuditLog, idx: number) => (
            <div key={log.id} className="relative pl-6 pb-4" data-testid="audit-item">
              {idx !== logs.length - 1 && (
                <div className="absolute left-2 top-6 h-8 border-l-2 border-border" />
              )}
              <div className="absolute left-0 top-1.5 h-4 w-4 rounded-full bg-primary" data-testid="audit-icon" />
              <div className="text-sm">
                <p className="font-medium" data-testid="audit-action">{log.action}</p>
                <p className="text-xs text-muted-foreground" data-testid="audit-user">
                  {log.user_role} • {formatDate(log.created_at)}
                </p>
                {log.new_value && (
                  <p className="mt-1 text-xs text-muted-foreground" data-testid="audit-description">
                    {JSON.stringify(log.new_value).substring(0, 100)}...
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
