"use client"

import { useState } from "react"
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
  AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { contractsService } from "@/lib/services/contracts.service"
import { useAuth } from "@/lib/auth-context"
import { formatDate, formatCurrency } from "@/lib/formatters"
import type { Contract, ContractStatus } from "@/lib/types"
import { toast } from "sonner"
import { mutate } from "swr"

const statusConfig = {
  PENDING: {
    label: "Pendente",
    icon: Clock,
    variant: "secondary" as const,
    color: "text-yellow-600",
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

export default function ContractsPage() {
  const { user } = useAuth()
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const { data, isLoading, error } = useSWR(
    user ? "/contracts" : null,
    () => contractsService.getAll({ limit: 50, offset: 0 })
  )

  const handleUpdateStatus = async (contractId: string, newStatus: ContractStatus) => {
    setUpdatingId(contractId)
    try {
      await contractsService.updateStatus(contractId, { status: newStatus })
      toast.success("Status atualizado com sucesso!")
      mutate("/contracts")
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(`Erro: ${error.message}`)
      } else {
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
      if (error instanceof Error) {
        toast.error(`Erro: ${error.message}`)
      } else {
        toast.error("Erro ao deletar contrato")
      }
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
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Contratos</h1>
        <p className="text-sm text-muted-foreground">
          {isArtist ? "Suas propostas enviadas para venues" : "Propostas recebidas de artistas"}
        </p>
      </div>

      {contracts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-20">
            <FileText className="h-12 w-12 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              {isArtist 
                ? "Você ainda não enviou nenhuma proposta" 
                : "Você ainda não recebeu nenhuma proposta"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {contracts.map((contract) => {
            const config = statusConfig[contract.status]
            const StatusIcon = config.icon
            const canAccept = isVenue && contract.status === "PENDING"
            const canReject = contract.status === "PENDING"
            const canComplete = contract.status === "ACCEPTED"
            const canDelete = contract.status === "PENDING" || contract.status === "REJECTED"

            return (
              <Card key={contract.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                        Contrato #{contract.id.slice(0, 8)}
                      </CardTitle>
                      <CardDescription>
                        {isArtist 
                          ? `Venue: ${contract.venue_id.slice(0, 8)}...` 
                          : `Artista: ${contract.artist_id.slice(0, 8)}...`}
                      </CardDescription>
                    </div>
                    <Badge variant={config.variant} className="flex items-center gap-1">
                      <StatusIcon className="h-3 w-3" />
                      {config.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Data do Evento:</span>
                      <span className="font-medium">{formatDate(contract.event_date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Valor:</span>
                      <span className="font-medium">{formatCurrency(contract.final_price)}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {canAccept && (
                      <Button
                        size="sm"
                        onClick={() => handleUpdateStatus(contract.id, "ACCEPTED")}
                        disabled={updatingId === contract.id}
                      >
                        <Check className="mr-1 h-3 w-3" />
                        Aceitar
                      </Button>
                    )}
                    {canReject && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateStatus(contract.id, "REJECTED")}
                        disabled={updatingId === contract.id}
                      >
                        <X className="mr-1 h-3 w-3" />
                        Recusar
                      </Button>
                    )}
                    {canComplete && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateStatus(contract.id, "COMPLETED")}
                        disabled={updatingId === contract.id}
                      >
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Marcar como Concluído
                      </Button>
                    )}
                    {canDelete && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(contract.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        Deletar
                      </Button>
                    )}
                  </div>

                  <div className="pt-2 text-xs text-muted-foreground">
                    Criado em {formatDate(contract.created_at)}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
