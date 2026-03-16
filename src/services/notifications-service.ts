import { apiClient } from "@/lib/api-client";
import type { AppNotification } from "@/types/notification";

interface BackendNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  action_url?: string;
  related_entity_type?: string;
  related_entity_id?: string;
}

function mapType(type: string): AppNotification["type"] {
  switch (type) {
    case "booking_request":
    case "contract_created":
      return "booking_request";
    case "booking_confirmed":
    case "contract_accepted":
      return "booking_confirmed";
    case "review_received":
      return "review_received";
    case "message":
    case "contract_message":
      return "message";
    default:
      return "system";
  }
}

function mapEntityType(type?: string): AppNotification["entity_type"] {
  if (!type) return undefined;
  if (type === "artist" || type === "venue" || type === "review") return type;
  if (type === "contract") return "booking";
  return undefined;
}

function normalizeNotification(notification: BackendNotification): AppNotification {
  return {
    id: notification.id,
    type: mapType(notification.type),
    title: notification.title,
    body: notification.message,
    read: notification.is_read,
    created_at: notification.created_at,
    action_url: notification.action_url,
    entity_type: mapEntityType(notification.related_entity_type),
    entity_id: notification.related_entity_id,
  };
}

export const notificationsService = {
  async list(params?: { limit?: number; offset?: number }): Promise<AppNotification[]> {
    const response = await apiClient.get<BackendNotification[]>("/notifications", params as Record<string, unknown>);
    return (response || []).map(normalizeNotification);
  },

  async unreadCount(): Promise<number> {
    const response = await apiClient.get<{ count: number }>("/notifications/unread-count");
    return response.count || 0;
  },

  async markAsRead(id: string): Promise<void> {
    await apiClient.patch(`/notifications/${id}/read`, {});
  },

  async markAllAsRead(): Promise<void> {
    await apiClient.patch("/notifications/read-all", {});
  },
};
