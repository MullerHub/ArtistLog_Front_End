import type { Notification } from "@/lib/services/notifications.service"

export type NotificationRegistryItem = {
  type: string
  label: string
  description: string
  icon: string
  status: "active" | "planned"
  allowManualTest?: boolean
}

type NotificationMetadata = {
  contract_id?: string
  venue_id?: string
  artist_id?: string
  review_id?: string
  target_tab?: string
  [key: string]: unknown
}

export const notificationRegistry: NotificationRegistryItem[] = [
  {
    type: "contract_received",
    label: "📝 Contrato Recebido",
    description: "Novo contrato recebido",
    icon: "📝",
    status: "active",
    allowManualTest: true,
  },
  {
    type: "contract_accepted",
    label: "✅ Contrato Aceito",
    description: "Seu contrato foi aceito",
    icon: "✅",
    status: "active",
    allowManualTest: true,
  },
  {
    type: "contract_rejected",
    label: "❌ Contrato Rejeitado",
    description: "Seu contrato foi rejeitado",
    icon: "❌",
    status: "active",
    allowManualTest: true,
  },
  {
    type: "contract_completed",
    label: "🎉 Contrato Concluído",
    description: "Contrato foi concluído com sucesso",
    icon: "🎉",
    status: "active",
    allowManualTest: true,
  },
  {
    type: "review_received",
    label: "⭐ Avaliação Recebida",
    description: "Você recebeu uma nova avaliação",
    icon: "⭐",
    status: "active",
    allowManualTest: true,
  },
  {
    type: "community_venue_claimed",
    label: "🏢 Venue Comunitária Reivindicada",
    description: "Uma venue comunitária foi reivindicada",
    icon: "🏢",
    status: "active",
    allowManualTest: true,
  },
  {
    type: "community_venue_created",
    label: "📍 Venue Comunitária Criada",
    description: "Artista criou uma nova venue comunitária",
    icon: "📍",
    status: "active",
    allowManualTest: false,
  },
  {
    type: "welcome",
    label: "👋 Boas-vindas",
    description: "Notificação de boas-vindas",
    icon: "👋",
    status: "active",
    allowManualTest: true,
  },
  {
    type: "community_venue_approved",
    label: "✅ Venue Comunitária Aprovada",
    description: "Feedback futuro para venues comunitárias moderadas/aprovadas",
    icon: "✅",
    status: "planned",
  },
  {
    type: "community_venue_rejected",
    label: "⚠️ Venue Comunitária Rejeitada",
    description: "Feedback futuro quando uma sugestão não for aceita",
    icon: "⚠️",
    status: "planned",
  },
  {
    type: "venue_claim_approved",
    label: "🔓 Reivindicação Aprovada",
    description: "Confirmar quando a reivindicação de venue for aprovada",
    icon: "🔓",
    status: "planned",
  },
  {
    type: "venue_claim_rejected",
    label: "🚫 Reivindicação Recusada",
    description: "Confirmar quando a reivindicação de venue for recusada",
    icon: "🚫",
    status: "planned",
  },
  {
    type: "contract_signature_pending",
    label: "✍️ Assinatura Pendente",
    description: "Lembrar o usuário que ainda falta assinar um contrato",
    icon: "✍️",
    status: "planned",
  },
  {
    type: "schedule_slot_reminder",
    label: "🗓️ Lembrete de Agenda",
    description: "Avisar sobre disponibilidade ou evento próximo",
    icon: "🗓️",
    status: "planned",
  },
  {
    type: "artist_profile_viewed_milestone",
    label: "👀 Marco de Visualizações",
    description: "Avisar quando o perfil atingir metas de visualização",
    icon: "👀",
    status: "planned",
  },
]

export const manualTestNotificationTypes = notificationRegistry.filter(
  (item) => item.status === "active" && item.allowManualTest
)

export const plannedNotificationTypes = notificationRegistry.filter(
  (item) => item.status === "planned"
)

export function getNotificationIcon(type: string): string {
  return notificationRegistry.find((item) => item.type === type)?.icon ?? "🔔"
}

function getMetadata(notification: Notification): NotificationMetadata | null {
  if (!notification.metadata || typeof notification.metadata !== "object") {
    return null
  }

  return notification.metadata as NotificationMetadata
}

function resolveEntityHref(notification: Notification): string | null {
  const metadata = getMetadata(notification)
  const relatedEntityId = notification.related_entity_id
  const relatedEntityType = notification.related_entity_type

  if (relatedEntityId && (relatedEntityType === "venue" || relatedEntityType === "community_venue")) {
    return `/venues/${relatedEntityId}`
  }

  if (relatedEntityId && relatedEntityType === "artist") {
    return `/artists/${relatedEntityId}`
  }

  if (relatedEntityId && relatedEntityType === "contract") {
    return `/contracts?highlight=${relatedEntityId}`
  }

  if (metadata?.venue_id && typeof metadata.venue_id === "string") {
    return `/venues/${metadata.venue_id}`
  }

  if (metadata?.artist_id && typeof metadata.artist_id === "string") {
    return `/artists/${metadata.artist_id}`
  }

  if (metadata?.contract_id && typeof metadata.contract_id === "string") {
    return `/contracts?highlight=${metadata.contract_id}`
  }

  return null
}

export function resolveNotificationHref(notification: Notification): string {
  if (notification.action_url) {
    return notification.action_url
  }

  const entityHref = resolveEntityHref(notification)
  if (entityHref) {
    return entityHref
  }

  switch (notification.type) {
    case "community_venue_created":
      return notification.related_entity_id ? `/venues/${notification.related_entity_id}` : "/venues/community?created=1"
    case "community_venue_claimed":
      return notification.related_entity_id ? `/venues/${notification.related_entity_id}` : "/venues/community"
    case "contract_received":
    case "contract_accepted":
    case "contract_rejected":
    case "contract_completed":
    case "contract_signature_pending":
      return "/contracts"
    case "review_received":
      return "/reviews"
    case "schedule_slot_reminder":
      return "/schedule"
    case "artist_profile_viewed_milestone":
      return "/dashboard"
    case "venue_claim_approved":
    case "venue_claim_rejected":
      return "/venues/claim"
    case "community_venue_approved":
    case "community_venue_rejected":
      return "/venues/community"
    case "welcome":
    default:
      return "/dashboard"
  }
}

export function isNotificationNavigable(notification: Notification): boolean {
  return Boolean(resolveNotificationHref(notification))
}
