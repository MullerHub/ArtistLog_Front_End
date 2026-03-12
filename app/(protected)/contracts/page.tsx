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
  HistoryIcon,
  ChevronDown,
  Send as SendIcon,
  MessageCircle,
  Upload,
  Plus,
  Filter
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { proposalsService } from "@/lib/services/proposals.service"
import { messagesService } from "@/lib/services/messages.service"
import { auditService } from "@/lib/services/audit.service"
import { contractTemplatesService } from "@/lib/services/contract-templates.service"
import { useAuth } from "@/lib/auth-context"
import { formatDate, formatCurrency } from "@/lib/formatters"
import { ApiError } from "@/lib/api-client"
import type { Contract, ContractStatus, Proposal, Message, AuditLog, ContractTemplate } from "@/lib/types"
import { toast } from "sonner"
import { useContractsWorkspace } from "@/hooks/use-contracts-workspace"
import { useContractTemplates, validateTemplateUploadFile } from "@/hooks/use-contract-templates"
import { ContractStatusBadge } from "@/components/contracts/contract-status-badge"
import { TemplateDownloadButton } from "@/components/contracts/template-download-button"
import { TemplateDecisionModal } from "@/components/contracts/template-decision-modal"

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

function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return "-"
  if (bytes < 1024) return `${bytes} B`

  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(1)} KB`

  const mb = kb / 1024
  return `${mb.toFixed(1)} MB`
}

// Componente Principal
export default function ContractsPage() {
  const { user } = useAuth()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [createForm, setCreateForm] = useState({
    artist_id: "",
    venue_id: "",
    event_date: "",
    final_price: "",
    description: "",
    message: "",
    event_time: "",
    duration_hours: "",
    equipment_requirements: "",
    terms: "",
  })

  const {
    contracts,
    total,
    limit,
    offset,
    statusFilter,
    isLoading,
    error,
    canGoNext,
    canGoPrev,
    setStatusFilter,
    setLimit,
    goNext,
    goPrev,
    createContract,
    updateContractStatus,
    deleteContract,
    refresh,
  } = useContractsWorkspace(20)

  const handleUpdateStatus = async (contractId: string, newStatus: ContractStatus) => {
    setUpdatingId(contractId)
    try {
      await updateContractStatus(contractId, { status: newStatus })
      toast.success("Status atualizado com sucesso!")
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
      await deleteContract(contractId)
      toast.success("Contrato deletado com sucesso!")
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        toast.error(error.message)
      } else {
        toast.error("Erro ao deletar contrato")
      }
    }
  }

  const handleCreateContract = async () => {
    if (!createForm.artist_id || !createForm.venue_id || !createForm.event_date || !createForm.final_price) {
      toast.error("Preencha artista, venue, data e valor final")
      return
    }

    setCreating(true)
    try {
      await createContract({
        artist_id: createForm.artist_id,
        venue_id: createForm.venue_id,
        event_date: createForm.event_date,
        final_price: Number(createForm.final_price),
        description: createForm.description || undefined,
        message: createForm.message || undefined,
        event_time: createForm.event_time || undefined,
        duration_hours: createForm.duration_hours ? Number(createForm.duration_hours) : undefined,
        equipment_requirements: createForm.equipment_requirements || undefined,
        terms: createForm.terms || undefined,
      })
      toast.success("Contrato criado com sucesso")
      setCreateForm({
        artist_id: "",
        venue_id: "",
        event_date: "",
        final_price: "",
        description: "",
        message: "",
        event_time: "",
        duration_hours: "",
        equipment_requirements: "",
        terms: "",
      })
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        toast.error(error.message)
      } else {
        toast.error("Erro ao criar contrato")
      }
    } finally {
      setCreating(false)
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

      <Card className="mb-6" data-testid="contract-create-form">
        <CardHeader>
          <CardTitle className="text-lg">Criar Contrato</CardTitle>
          <CardDescription>Preencha os campos principais para gerar uma nova proposta.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <Input
            placeholder="artist_id"
            value={createForm.artist_id}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, artist_id: e.target.value }))}
          />
          <Input
            placeholder="venue_id"
            value={createForm.venue_id}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, venue_id: e.target.value }))}
          />
          <Input
            type="date"
            value={createForm.event_date}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, event_date: e.target.value }))}
          />
          <Input
            placeholder="Valor final"
            type="number"
            value={createForm.final_price}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, final_price: e.target.value }))}
          />
          <Input
            placeholder="Horario (HH:MM)"
            type="time"
            value={createForm.event_time}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, event_time: e.target.value }))}
          />
          <Input
            placeholder="Duracao (horas)"
            type="number"
            step="0.5"
            value={createForm.duration_hours}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, duration_hours: e.target.value }))}
          />
          <Textarea
            className="sm:col-span-2"
            placeholder="Descricao"
            value={createForm.description}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, description: e.target.value }))}
          />
          <Textarea
            className="sm:col-span-2"
            placeholder="Mensagem"
            value={createForm.message}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, message: e.target.value }))}
          />
          <Textarea
            className="sm:col-span-2"
            placeholder="Requisitos de equipamento"
            value={createForm.equipment_requirements}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, equipment_requirements: e.target.value }))}
          />
          <Textarea
            className="sm:col-span-2"
            placeholder="Termos"
            value={createForm.terms}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, terms: e.target.value }))}
          />
          <Button onClick={handleCreateContract} disabled={creating} className="sm:col-span-2">
            {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
            Criar Contrato
          </Button>
        </CardContent>
      </Card>

      <TemplatesManager isArtist={isArtist} />

      <Card className="mb-6">
        <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Button size="sm" variant={statusFilter === "ALL" ? "default" : "outline"} onClick={() => setStatusFilter("ALL")}>Todos</Button>
            <Button size="sm" variant={statusFilter === "PENDING" ? "default" : "outline"} onClick={() => setStatusFilter("PENDING")}>PENDING</Button>
            <Button size="sm" variant={statusFilter === "ACCEPTED" ? "default" : "outline"} onClick={() => setStatusFilter("ACCEPTED")}>ACCEPTED</Button>
            <Button size="sm" variant={statusFilter === "REJECTED" ? "default" : "outline"} onClick={() => setStatusFilter("REJECTED")}>REJECTED</Button>
            <Button size="sm" variant={statusFilter === "COMPLETED" ? "default" : "outline"} onClick={() => setStatusFilter("COMPLETED")}>COMPLETED</Button>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="contracts-limit" className="text-xs text-muted-foreground">Por pagina</Label>
            <Input
              id="contracts-limit"
              type="number"
              min={5}
              max={100}
              value={limit}
              onChange={(e) => setLimit(Math.max(5, Math.min(100, Number(e.target.value) || 20)))}
              className="h-8 w-20"
            />
            <Button size="sm" variant="outline" onClick={goPrev} disabled={!canGoPrev}>Anterior</Button>
            <Button size="sm" variant="outline" onClick={goNext} disabled={!canGoNext}>Proxima</Button>
            <span className="text-xs text-muted-foreground">offset {offset} / total {total}</span>
          </div>
        </CardContent>
      </Card>

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

function TemplatesManager({ isArtist }: { isArtist: boolean }) {
  const [templateName, setTemplateName] = useState("")
  const [description, setDescription] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const {
    templates,
    includeInactive,
    isLoading,
    error,
    setIncludeInactive,
    uploadTemplate,
    refresh,
  } = useContractTemplates()

  const handleUpload = async () => {
    if (!isArtist) {
      toast.error("Somente artistas podem subir templates")
      return
    }

    if (!file) {
      toast.error("Selecione um arquivo")
      return
    }

    const validationError = validateTemplateUploadFile(file)
    if (validationError) {
      toast.error(validationError)
      return
    }

    if (!templateName.trim()) {
      toast.error("Nome do template é obrigatório")
      return
    }

    setUploading(true)
    try {
      await uploadTemplate({
        file,
        template_name: templateName.trim(),
        description: description.trim() || undefined,
      })
      toast.success("Template enviado com sucesso")
      setTemplateName("")
      setDescription("")
      setFile(null)
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        toast.error(error.message)
      } else {
        toast.error("Erro ao enviar template")
      }
    } finally {
      setUploading(false)
    }
  }

  return (
    <Card className="mb-6" data-testid="contract-templates-panel">
      <CardHeader>
        <CardTitle>Templates de Contrato</CardTitle>
        <CardDescription>
          Tela de "Meus Templates" para upload, listagem e download seguro de PDF.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isArtist ? (
          <div className="grid gap-3 rounded-md border border-border bg-muted/20 p-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="template-name">Nome do template</Label>
              <Input
                id="template-name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Ex.: Contrato show bar pequeno"
                data-testid="template-name-input"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="template-description">Descrição (opcional)</Label>
              <Textarea
                id="template-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Observações do template"
                rows={3}
                data-testid="template-description-input"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="template-file">Arquivo</Label>
              <Input
                id="template-file"
                type="file"
                accept=".pdf,application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                data-testid="template-file-input"
              />
              <p className="text-xs text-muted-foreground">
                Aceita apenas PDF de ate 10MB.
              </p>
            </div>

            <Button onClick={handleUpload} disabled={uploading} className="sm:col-span-2" data-testid="template-upload-button">
              {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
              Enviar Template
            </Button>
          </div>
        ) : (
          <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
            Somente artistas podem subir templates. Como venue, voce decide o aceite/rejeicao no detalhe do contrato.
          </div>
        )}

        <div className="space-y-3" data-testid="my-templates-list">
          <div className="flex items-center justify-between gap-3">
            <h4 className="font-medium">Meus Templates</h4>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setIncludeInactive(!includeInactive)}
            >
              {includeInactive ? "Ocultar inativos" : "Incluir inativos"}
            </Button>
          </div>
          {isLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : error ? (
            <div className="space-y-2">
              <p className="text-sm text-destructive">Não foi possível carregar seus templates.</p>
              <Button size="sm" variant="outline" onClick={() => refresh()}>Tentar novamente</Button>
            </div>
          ) : templates.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum template cadastrado ainda.</p>
          ) : (
            <div className="space-y-2">
              {templates.map((template) => (
                <div key={template.id} className="rounded-md border border-border p-3" data-testid="template-item">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-sm">{template.template_name}</p>
                      {template.description && (
                        <p className="mt-1 text-sm text-muted-foreground">{template.description}</p>
                      )}
                      <p className="mt-1 text-xs text-muted-foreground">
                        v{template.version} • {template.file_path || template.file_name || "Arquivo sem nome"} • {formatFileSize(template.file_size_bytes)}
                      </p>
                      <p className="text-xs text-muted-foreground">Criado em {formatDate(template.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={template.is_active === false ? "outline" : "default"}>
                        {template.is_active === false ? "Inativo" : "Ativo"}
                      </Badge>
                      <TemplateDownloadButton templateId={template.id} fileName={`${template.template_name}.pdf`} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
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
              <div data-testid="status-badge">
                <ContractStatusBadge status={contract.status} />
              </div>
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

              <ContractTemplateDecisionPanel
                contractId={contract.id}
                contractStatus={contract.status}
                isVenue={isVenue}
              />
              
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

function ContractTemplateDecisionPanel({
  contractId,
  contractStatus,
  isVenue,
}: {
  contractId: string
  contractStatus: ContractStatus
  isVenue: boolean
}) {
  const [decisionMessage, setDecisionMessage] = useState("")

  const { data: templateDetail, isLoading, mutate: mutateTemplate } = useSWR(
    contractId ? `/contracts/${contractId}/template` : null,
    async () => {
      try {
        return await contractTemplatesService.getContractTemplate(contractId)
      } catch (error: unknown) {
        if (error instanceof ApiError && error.status === 404) {
          return null
        }
        throw error
      }
    },
    {
      shouldRetryOnError: false,
    }
  )

  const template = templateDetail?.template
  const acceptance = templateDetail?.acceptance

  const handleDecision = async (decision: "accept" | "reject") => {
    if (!isVenue) {
      toast.error("Somente contratantes podem decidir o template")
      return
    }

    if (!template) {
      toast.error("Nenhum template associado para decisao")
      return
    }

    try {
      if (decision === "accept") {
        await contractTemplatesService.acceptTemplate(contractId, {
          template_id: template.id,
          contract_id: contractId,
          metadata: {
            device: "web",
            browser: typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
            note: decisionMessage.trim() || undefined,
          },
        })
        toast.success("Template aceito com sucesso")
      } else {
        await contractTemplatesService.rejectTemplate(contractId)
        toast.success("Template rejeitado")
      }

      setDecisionMessage("")
      await mutateTemplate()
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        toast.error(error.message)
      } else {
        toast.error("Erro ao processar template")
      }
    }
  }

  const canDecide = isVenue && contractStatus === "PENDING"
  const isAccepted = contractStatus === "ACCEPTED"
  const isRejected = contractStatus === "REJECTED"
  const isCompleted = contractStatus === "COMPLETED"

  return (
    <div className="space-y-3 rounded-md border border-border bg-muted/20 p-4" data-testid="contract-template-decision-panel">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h4 className="font-medium">Template vinculado ao contrato</h4>
          <p className="text-xs text-muted-foreground">
            Visualize o template atual e registre sua decisão.
          </p>
        </div>
        {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
      </div>

      {!isLoading && !template ? (
        <p className="text-sm text-muted-foreground">Nenhum template associado a este contrato.</p>
      ) : template ? (
        <div className="space-y-2 rounded-md border border-border bg-background p-3">
          <p className="font-medium text-sm">{template.template_name}</p>
          {template.description && <p className="text-sm text-muted-foreground">{template.description}</p>}
          <p className="text-xs text-muted-foreground">
            v{template.version} • {template.file_path || template.file_name || "Arquivo sem nome"} • {formatFileSize(template.file_size_bytes)}
          </p>
          {acceptance?.accepted_at ? (
            <p className="text-xs text-green-700">Aceite registrado em {formatDate(acceptance.accepted_at)} por {acceptance.accepted_by_role}</p>
          ) : null}
          <TemplateDownloadButton templateId={template.id} fileName={`${template.template_name}.pdf`} />
        </div>
      ) : null}

      {template && canDecide && (
        <>
          <div className="space-y-2">
            <Label htmlFor={`template-decision-${contractId}`}>Mensagem da decisão (opcional)</Label>
            <Textarea
              id={`template-decision-${contractId}`}
              value={decisionMessage}
              onChange={(e) => setDecisionMessage(e.target.value)}
              placeholder="Ex.: Ajustar cláusula de horário e pagamento."
              rows={2}
              data-testid="template-decision-message"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <TemplateDecisionModal
              triggerLabel="Aceitar Template"
              title="Confirmar aceite do template"
              description="Voce confirma o aceite deste template para o contrato atual?"
              confirmLabel="Confirmar Aceite"
              onConfirm={() => handleDecision("accept")}
              triggerTestId="accept-template-button"
              confirmTestId="confirm-accept-template-button"
            />
            <TemplateDecisionModal
              triggerLabel="Rejeitar Template"
              title="Confirmar rejeicao do template"
              description="Ao rejeitar, o contrato fica apenas para historico ate nova proposta/template."
              confirmLabel="Confirmar Rejeicao"
              variant="outline"
              onConfirm={() => handleDecision("reject")}
              triggerTestId="reject-template-button"
              confirmTestId="confirm-reject-template-button"
            />
          </div>
        </>
      )}

      {isAccepted ? <p className="text-sm text-green-700">Template aceito. Rejeicao bloqueada para este contrato.</p> : null}
      {isRejected ? <p className="text-sm text-muted-foreground">Contrato rejeitado: somente leitura historica. Envie nova proposta/template para retomar.</p> : null}
      {isCompleted ? <p className="text-sm text-muted-foreground">Contrato concluido: somente historico.</p> : null}
    </div>
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
        {contract.event_time && (
          <div>
            <p className="text-xs font-medium text-muted-foreground">Horario</p>
            <p className="mt-1 font-medium">{contract.event_time}</p>
          </div>
        )}
        {contract.duration_hours && (
          <div>
            <p className="text-xs font-medium text-muted-foreground">Duracao</p>
            <p className="mt-1 font-medium">{contract.duration_hours}h</p>
          </div>
        )}
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

      {(contract.equipment_requirements || contract.terms) && (
        <div className="space-y-3 rounded-md border border-border bg-muted/20 p-4">
          {contract.equipment_requirements && (
            <div>
              <p className="text-xs font-medium text-muted-foreground">Requisitos de equipamento</p>
              <p className="mt-1 whitespace-pre-wrap text-sm">{contract.equipment_requirements}</p>
            </div>
          )}
          {contract.terms && (
            <div>
              <p className="text-xs font-medium text-muted-foreground">Termos</p>
              <p className="mt-1 whitespace-pre-wrap text-sm">{contract.terms}</p>
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
