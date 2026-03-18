import { apiClient } from "@/lib/api-client";
import type { ChatMessage } from "@/types/contract";
import {
  normalizeListPayload,
  normalizeMessage,
  type RawMessage,
} from "@/services/contracts-normalizers";

export const messagesService = {
  async list(contractId: string): Promise<ChatMessage[]> {
    const response = await apiClient.get<RawMessage[] | { data?: RawMessage[]; items?: RawMessage[] }>(`/contracts/${contractId}/messages`);
    return normalizeListPayload<RawMessage>(response).map((message) => normalizeMessage(message));
  },

  async send(payload: { contract_id: string; message: string }): Promise<void> {
    await apiClient.post("/contracts/messages", payload);
  },

  async markAsRead(messageId: string): Promise<void> {
    await apiClient.post(`/contracts/messages/${messageId}/read`, {});
  },

  async getUnreadCount(contractId: string): Promise<number> {
    const response = await apiClient.get<{ unread_count: number }>(`/contracts/${contractId}/messages/unread`);
    return response.unread_count || 0;
  },
};
