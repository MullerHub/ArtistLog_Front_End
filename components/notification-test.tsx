"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Send } from "lucide-react"
import { ApiError } from "@/lib/api-client"
import { notificationsService } from "@/lib/services/notifications.service"
import { toast } from "sonner"

const NOTIFICATION_TYPES = [
  { value: "contract_received", label: "📝 Contrato Recebido", description: "Novo contrato recebido" },
  { value: "contract_accepted", label: "✅ Contrato Aceito", description: "Seu contrato foi aceito" },
  { value: "contract_rejected", label: "❌ Contrato Rejeitado", description: "Seu contrato foi rejeitado" },
  { value: "contract_completed", label: "🎉 Contrato Completo", description: "Contrato foi concluído com sucesso" },
  { value: "review_received", label: "⭐ Avaliação Recebida", description: "Você recebeu uma nova avaliação" },
  { value: "community_venue_claimed", label: "🏢 Venue Comunitário Reclamado", description: "Um venue comunitário foi reclamado" },
  { value: "welcome", label: "👋 Boas-vindas", description: "Notificação de boas-vindas" },
]

export function NotificationTest() {
  const [selectedType, setSelectedType] = useState<string>(NOTIFICATION_TYPES[0].value)
  const [isLoading, setIsLoading] = useState(false)

  const handleSendNotification = async () => {
    setIsLoading(true)
    try {
      await notificationsService.sendTestNotification(selectedType)
      
      const notifType = NOTIFICATION_TYPES.find(n => n.value === selectedType)
      toast.success(`Notificação de teste enviada: ${notifType?.label}`)
    } catch (error) {
      console.error("❌ Error sending test notification:", error)
      if (error instanceof ApiError) {
        const backendMessage =
          (error.data as { message?: string; description?: string } | null)?.message ||
          (error.data as { message?: string; description?: string } | null)?.description ||
          (typeof error.data === "string" ? error.data : null)

        toast.error(
          backendMessage
            ? `Erro ao enviar notificação de teste: ${backendMessage}`
            : `Erro ao enviar notificação de teste (HTTP ${error.status})`
        )
      } else {
        toast.error("Erro ao enviar notificação de teste")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>🧪 Teste de Notificações</CardTitle>
        <CardDescription>
          Envie notificações de teste para validar o sistema de notificações em tempo real
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Tipo de Notificação</label>
          <div className="grid grid-cols-1 gap-2">
            {NOTIFICATION_TYPES.map((notifType) => (
              <button
                key={notifType.value}
                onClick={() => setSelectedType(notifType.value)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  selectedType === notifType.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="font-medium">{notifType.label}</div>
                <div className="text-sm text-muted-foreground">{notifType.description}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="pt-2">
          <Button
            onClick={handleSendNotification}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Enviar Notificação de Teste
              </>
            )}
          </Button>
        </div>

        <div className="bg-muted/50 p-3 rounded-lg text-sm space-y-1">
          <p className="font-medium">💡 Como funciona:</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Clique em um tipo de notificação</li>
            <li>Clique no botão para enviar a notificação de teste</li>
            <li>Verifique o ícone de notificação na barra superior</li>
            <li>Abra o painel de notificações para ver a mensagem</li>
            <li>A notificação também aparecerá em tempo real via WebSocket se conectado</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
