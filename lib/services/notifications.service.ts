import { apiClient } from "@/lib/api-client"

export interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  message: string
  related_entity_id?: string
  related_entity_type?: string
  is_read: boolean
  created_at: string
  updated_at: string
}

export interface NotificationPreferences {
  contract_received_email: boolean
  contract_accepted_email: boolean
  contract_rejected_email: boolean
  contract_completed_email: boolean
  review_received_email: boolean
  community_venue_claimed_email: boolean
}

export const notificationsService = {
  /**
   * Get user notifications with pagination
   */
  async getNotifications(params: {
    limit?: number
    offset?: number
  }): Promise<Notification[]> {
    return apiClient.get("/notifications", params as Record<string, unknown>)
  },

  /**
   * Get count of unread notifications
   */
  async getUnreadCount(): Promise<{ count: number }> {
    return apiClient.get("/notifications/unread-count")
  },

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: string): Promise<{ message: string }> {
    return apiClient.patch(`/notifications/${notificationId}/read`, {})
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<{ message: string }> {
    return apiClient.patch("/notifications/read-all", {})
  },

  /**
   * Get notification preferences
   */
  async getPreferences(): Promise<NotificationPreferences> {
    return apiClient.get("/notifications/preferences")
  },

  /**
   * Update notification preferences
   */
  async updatePreferences(
    preferences: Partial<NotificationPreferences>
  ): Promise<{ message: string }> {
    return apiClient.patch("/notifications/preferences", preferences)
  },
}
