import { messagesService } from "@/lib/services/messages.service"
import { apiClient } from "@/lib/api-client"
import type { Message, MessageListResponse, UnreadCountResponse } from "@/lib/types"

jest.mock("@/lib/api-client", () => ({
  apiClient: {
    post: jest.fn(),
    get: jest.fn(),
  },
}))

describe("MessagesService", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("send()", () => {
    it("deve enviar uma mensagem", async () => {
      const mockMessage: Message = {
        id: "msg_123",
        contract_id: "contract_123",
        sender_id: "user_123",
        sender_role: "ARTIST",
        message: "Tudo certo?",
        type: "USER",
        is_system_message: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      ;(apiClient.post as jest.Mock).mockResolvedValue(mockMessage)

      const result = await messagesService.send({
        contract_id: "contract_123",
        message: "Tudo certo?",
      })

      expect(apiClient.post).toHaveBeenCalledWith("/contracts/messages", {
        contract_id: "contract_123",
        message: "Tudo certo?",
      })
      expect(result).toEqual(mockMessage)
      expect(result.type).toBe("USER")
    })

    it("deve validar mensagem não-vazia", async () => {
      ;(apiClient.post as jest.Mock).mockRejectedValue(
        new Error("Mensagem deve ter no mínimo 1 caractere")
      )

      await expect(
        messagesService.send({
          contract_id: "contract_123",
          message: "",
        })
      ).rejects.toThrow()
    })
  })

  describe("list()", () => {
    it("deve listar mensagens de um contrato", async () => {
      const mockMessages: MessageListResponse = {
        data: [
          {
            id: "msg_1",
            contract_id: "contract_123",
            sender_id: "user_1",
            sender_role: "ARTIST",
            message: "Primeira mensagem",
            type: "USER",
            is_system_message: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: "msg_2",
            contract_id: "contract_123",
            sender_id: "system",
            sender_role: "ARTIST",
            message: "Proposta foi aceita",
            type: "SYSTEM",
            is_system_message: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
        total: 2,
        limit: 50,
        offset: 0,
      }

      ;(apiClient.get as jest.Mock).mockResolvedValue(mockMessages)

      const result = await messagesService.list("contract_123")

      expect(apiClient.get).toHaveBeenCalledWith(
        "/contracts/contract_123/messages",
        undefined
      )
      expect(result.data).toHaveLength(2)
      expect(result.data[1].type).toBe("SYSTEM")
    })

    it("deve paginar mensagens", async () => {
      ;(apiClient.get as jest.Mock).mockResolvedValue({
        data: [],
        total: 100,
        limit: 50,
        offset: 50,
      })

      await messagesService.list("contract_123", { limit: 50, offset: 50 })

      expect(apiClient.get).toHaveBeenCalledWith(
        "/contracts/contract_123/messages",
        { limit: 50, offset: 50 }
      )
    })
  })

  describe("markAsRead()", () => {
    it("deve marcar mensagem como lida", async () => {
      const mockMessage: Message = {
        id: "msg_123",
        contract_id: "contract_123",
        sender_id: "user_123",
        sender_role: "ARTIST",
        message: "Mensagem lida",
        type: "USER",
        is_system_message: false,
        read_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      ;(apiClient.post as jest.Mock).mockResolvedValue(mockMessage)

      const result = await messagesService.markAsRead("msg_123")

      expect(apiClient.post).toHaveBeenCalledWith(
        "/contracts/messages/msg_123/read",
        {}
      )
      expect(result.read_at).toBeDefined()
    })
  })

  describe("getUnreadCount()", () => {
    it("deve retornar contagem de não-lidas", async () => {
      const mockCount: UnreadCountResponse = {
        contract_id: "contract_123",
        unread_count: 5,
        last_unread_at: new Date().toISOString(),
      }

      ;(apiClient.get as jest.Mock).mockResolvedValue(mockCount)

      const result = await messagesService.getUnreadCount("contract_123")

      expect(apiClient.get).toHaveBeenCalledWith(
        "/contracts/contract_123/messages/unread"
      )
      expect(result.unread_count).toBe(5)
    })

    it("deve retornar 0 quando não há não-lidas", async () => {
      const mockCount: UnreadCountResponse = {
        contract_id: "contract_123",
        unread_count: 0,
      }

      ;(apiClient.get as jest.Mock).mockResolvedValue(mockCount)

      const result = await messagesService.getUnreadCount("contract_123")

      expect(result.unread_count).toBe(0)
    })
  })
})
