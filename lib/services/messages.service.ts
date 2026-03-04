import { apiClient } from "@/lib/api-client"
import type { Message, MessageListResponse, UnreadCountResponse } from "@/lib/types"

function normalizeMessageListResponse(
  response: MessageListResponse | Message[] | { items?: Message[]; total?: number; limit?: number; offset?: number },
  params?: { limit?: number; offset?: number }
): MessageListResponse {
  if (Array.isArray(response)) {
    return {
      data: response,
      total: response.length,
      limit: params?.limit ?? response.length,
      offset: params?.offset ?? 0,
    }
  }

  if (response && "items" in response && Array.isArray(response.items)) {
    return {
      data: response.items,
      total: response.total ?? response.items.length,
      limit: response.limit ?? params?.limit ?? response.items.length,
      offset: response.offset ?? params?.offset ?? 0,
    }
  }

  if (response && "data" in response && Array.isArray(response.data)) {
    return response
  }

  return {
    data: [],
    total: 0,
    limit: params?.limit ?? 0,
    offset: params?.offset ?? 0,
  }
}

export const messagesService = {
  /**
   * Envia uma mensagem em um contrato
   */
  async send(payload: { contract_id: string; message: string }): Promise<Message> {
    return apiClient.post<Message>("/contracts/messages", payload)
  },

  /**
   * Lista todas as mensagens de um contrato
   */
  async list(
    contractId: string,
    params?: { limit?: number; offset?: number }
  ): Promise<MessageListResponse> {
    const response = await apiClient.get<
      MessageListResponse | Message[] | { items?: Message[]; total?: number; limit?: number; offset?: number }
    >(
      `/contracts/${contractId}/messages`,
      params as Record<string, unknown>
    )

    return normalizeMessageListResponse(response, params)
  },

  /**
   * Marca uma mensagem como lida
   */
  async markAsRead(messageId: string): Promise<Message> {
    return apiClient.post<Message>(`/contracts/messages/${messageId}/read`, {})
  },

  /**
   * Obtém a contagem de mensagens não-lidas
   */
  async getUnreadCount(contractId: string): Promise<UnreadCountResponse> {
    return apiClient.get<UnreadCountResponse>(`/contracts/${contractId}/messages/unread`)
  },
}
