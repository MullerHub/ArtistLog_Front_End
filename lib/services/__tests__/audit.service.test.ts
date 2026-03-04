import { auditService } from "@/lib/services/audit.service"
import { apiClient } from "@/lib/api-client"
import type { AuditLog, AuditLogListResponse, UserAuditResponse } from "@/lib/types"

jest.mock("@/lib/api-client", () => ({
  apiClient: {
    get: jest.fn(),
  },
}))

describe("AuditService", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("getTrail()", () => {
    it("deve retornar trilha completa de auditoria", async () => {
      const mockTrail: AuditLog[] = [
        {
          id: "audit_1",
          contract_id: "contract_123",
          user_id: "user_1",
          user_role: "ARTIST",
          action: "CREATE",
          new_value: { price: 2500, date: "2026-04-15" },
          created_at: new Date().toISOString(),
        },
        {
          id: "audit_2",
          contract_id: "contract_123",
          user_id: "user_2",
          user_role: "VENUE",
          action: "UPDATE_STATUS",
          old_value: { status: "PENDING" },
          new_value: { status: "ACCEPTED" },
          created_at: new Date().toISOString(),
        },
      ]

      ;(apiClient.get as jest.Mock).mockResolvedValue(mockTrail)

      const result = await auditService.getTrail("contract_123")

      expect(apiClient.get).toHaveBeenCalledWith(
        "/contracts/contract_123/audit"
      )
      expect(result).toHaveLength(2)
      expect(result[0].action).toBe("CREATE")
      expect(result[1].action).toBe("UPDATE_STATUS")
    })

    it("deve rastrear múltiplas ações", async () => {
      const mockTrail: AuditLog[] = [
        { id: "1", contract_id: "c", user_id: "u", user_role: "ARTIST", action: "CREATE", created_at: "" },
        { id: "2", contract_id: "c", user_id: "u", user_role: "ARTIST", action: "SEND_PROPOSAL", created_at: "" },
        { id: "3", contract_id: "c", user_id: "u", user_role: "VENUE", action: "ACCEPT_PROPOSAL", created_at: "" },
        { id: "4", contract_id: "c", user_id: "u", user_role: "ARTIST", action: "SIGNATURE_SENT", created_at: "" },
        { id: "5", contract_id: "c", user_id: "u", user_role: "ARTIST", action: "SIGNATURE_COMPLETED", created_at: "" },
      ]

      ;(apiClient.get as jest.Mock).mockResolvedValue(mockTrail)

      const result = await auditService.getTrail("contract_123")

      expect(result).toHaveLength(5)
      const actions = result.map(log => log.action)
      expect(actions).toContain("CREATE")
      expect(actions).toContain("SEND_PROPOSAL")
      expect(actions).toContain("ACCEPT_PROPOSAL")
      expect(actions).toContain("SIGNATURE_COMPLETED")
    })
  })

  describe("listLogs()", () => {
    it("deve listar logs com paginação", async () => {
      const mockLogs: AuditLogListResponse = {
        data: [
          {
            id: "audit_1",
            contract_id: "contract_123",
            user_id: "user_1",
            user_role: "ARTIST",
            action: "CREATE",
            created_at: new Date().toISOString(),
          },
        ],
        total: 50,
        limit: 50,
        offset: 0,
      }

      ;(apiClient.get as jest.Mock).mockResolvedValue(mockLogs)

      const result = await auditService.listLogs("contract_123", {
        limit: 50,
        offset: 0,
      })

      expect(apiClient.get).toHaveBeenCalledWith(
        "/contracts/contract_123/audit/logs",
        { limit: 50, offset: 0 }
      )
      expect(result.total).toBe(50)
    })

    it("deve filtrar logs por ação", async () => {
      const mockLogs: AuditLogListResponse = {
        data: [
          {
            id: "audit_1",
            contract_id: "contract_123",
            user_id: "user_1",
            user_role: "ARTIST",
            action: "SEND_PROPOSAL",
            created_at: new Date().toISOString(),
          },
        ],
        total: 5,
        limit: 50,
        offset: 0,
      }

      ;(apiClient.get as jest.Mock).mockResolvedValue(mockLogs)

      const result = await auditService.listLogs("contract_123", {
        action: "SEND_PROPOSAL",
      })

      expect(apiClient.get).toHaveBeenCalledWith(
        "/contracts/contract_123/audit/logs",
        { action: "SEND_PROPOSAL" }
      )
      expect(result.data[0].action).toBe("SEND_PROPOSAL")
    })
  })

  describe("getUserAudit()", () => {
    it("deve retornar auditoria do usuário", async () => {
      const mockUserAudit: UserAuditResponse = {
        user_id: "user_123",
        data: [
          {
            id: "audit_1",
            contract_id: "contract_123",
            user_id: "user_123",
            user_role: "ARTIST",
            action: "CREATE",
            created_at: new Date().toISOString(),
          },
          {
            id: "audit_2",
            contract_id: "contract_456",
            user_id: "user_123",
            user_role: "ARTIST",
            action: "SEND_PROPOSAL",
            created_at: new Date().toISOString(),
          },
        ],
        total: 2,
        limit: 50,
        offset: 0,
      }

      ;(apiClient.get as jest.Mock).mockResolvedValue(mockUserAudit)

      const result = await auditService.getUserAudit()

      expect(apiClient.get).toHaveBeenCalledWith(
        "/contracts/audit/user",
        undefined
      )
      expect(result.user_id).toBe("user_123")
      expect(result.data).toHaveLength(2)
    })

    it("deve mostrar todas as ações de um usuário", async () => {
      const mockUserAudit: UserAuditResponse = {
        user_id: "user_123",
        data: [
          { id: "1", contract_id: "c1", user_id: "user_123", user_role: "ARTIST", action: "CREATE", created_at: "" },
          { id: "2", contract_id: "c1", user_id: "user_123", user_role: "ARTIST", action: "SEND_PROPOSAL", created_at: "" },
          { id: "3", contract_id: "c2", user_id: "user_123", user_role: "ARTIST", action: "ACCEPT_PROPOSAL", created_at: "" },
        ],
        total: 3,
        limit: 50,
        offset: 0,
      }

      ;(apiClient.get as jest.Mock).mockResolvedValue(mockUserAudit)

      const result = await auditService.getUserAudit({ limit: 50, offset: 0 })

      expect(result.data.length).toBeGreaterThan(0)
      expect(result.data.every(log => log.user_id === "user_123")).toBe(true)
    })
  })
})
