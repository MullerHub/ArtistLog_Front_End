import { proposalsService } from "@/lib/services/proposals.service"
import { apiClient } from "@/lib/api-client"
import type { Proposal, ProposalListResponse } from "@/lib/types"

// Mock do apiClient
jest.mock("@/lib/api-client", () => ({
  apiClient: {
    post: jest.fn(),
    get: jest.fn(),
  },
}))

describe("ProposalsService", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("create()", () => {
    it("deve enviar uma nova proposta", async () => {
      const mockProposal: Proposal = {
        id: "prop_123",
        contract_id: "contract_123",
        proposed_by_user_id: "user_123",
        proposed_by_role: "ARTIST",
        proposed_price: 2800,
        proposed_date: "2026-04-20",
        proposed_time: "20:30",
        proposed_duration: 2.5,
        message: "Nova proposta",
        status: "PENDING",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      ;(apiClient.post as jest.Mock).mockResolvedValue(mockProposal)

      const result = await proposalsService.create({
        contract_id: "contract_123",
        proposed_price: 2800,
        proposed_date: "2026-04-20",
        proposed_time: "20:30",
        proposed_duration: 2.5,
        message: "Nova proposta",
      })

      expect(apiClient.post).toHaveBeenCalledWith("/contracts/proposals", {
        contract_id: "contract_123",
        proposed_price: 2800,
        proposed_date: "2026-04-20",
        proposed_time: "20:30",
        proposed_duration: 2.5,
        message: "Nova proposta",
      })
      expect(result).toEqual(mockProposal)
    })

    it("deve validar campos obrigatórios", async () => {
      ;(apiClient.post as jest.Mock).mockRejectedValue(
        new Error("Mensagem é obrigatória")
      )

      await expect(
        proposalsService.create({
          contract_id: "contract_123",
          message: "",
        })
      ).rejects.toThrow("Mensagem é obrigatória")
    })
  })

  describe("list()", () => {
    it("deve listar propostas de um contrato", async () => {
      const mockProposals: ProposalListResponse = {
        data: [
          {
            id: "prop_1",
            contract_id: "contract_123",
            proposed_by_user_id: "user_1",
            proposed_by_role: "ARTIST",
            proposed_price: 2500,
            message: "Proposta 1",
            status: "PENDING",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
        total: 1,
        limit: 50,
        offset: 0,
      }

      ;(apiClient.get as jest.Mock).mockResolvedValue(mockProposals)

      const result = await proposalsService.list("contract_123")

      expect(apiClient.get).toHaveBeenCalledWith(
        "/contracts/contract_123/proposals",
        undefined
      )
      expect(result).toEqual(mockProposals)
      expect(result.data).toHaveLength(1)
    })

    it("deve filtrar propostas por status", async () => {
      const mockProposals: ProposalListResponse = {
        data: [],
        total: 0,
        limit: 50,
        offset: 0,
      }

      ;(apiClient.get as jest.Mock).mockResolvedValue(mockProposals)

      await proposalsService.list("contract_123", { status: "ACCEPTED" })

      expect(apiClient.get).toHaveBeenCalledWith(
        "/contracts/contract_123/proposals",
        { status: "ACCEPTED" }
      )
    })
  })

  describe("accept()", () => {
    it("deve aceitar uma proposta", async () => {
      const mockProposal: Proposal = {
        id: "prop_123",
        contract_id: "contract_123",
        proposed_by_user_id: "user_123",
        proposed_by_role: "ARTIST",
        proposed_price: 2800,
        message: "Proposta aceita",
        status: "ACCEPTED",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      ;(apiClient.post as jest.Mock).mockResolvedValue(mockProposal)

      const result = await proposalsService.accept("prop_123")

      expect(apiClient.post).toHaveBeenCalledWith(
        "/contracts/proposals/prop_123/accept",
        {}
      )
      expect(result.status).toBe("ACCEPTED")
    })

    it("deve aceitar proposta com mensagem opcional", async () => {
      ;(apiClient.post as jest.Mock).mockResolvedValue({})

      await proposalsService.accept("prop_123", "Aceito com essas mudanças")

      expect(apiClient.post).toHaveBeenCalledWith(
        "/contracts/proposals/prop_123/accept",
        { message: "Aceito com essas mudanças" }
      )
    })
  })

  describe("reject()", () => {
    it("deve rejeitar uma proposta", async () => {
      const mockProposal: Proposal = {
        id: "prop_123",
        contract_id: "contract_123",
        proposed_by_user_id: "user_123",
        proposed_by_role: "ARTIST",
        message: "Proposta rejeitada",
        status: "REJECTED",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      ;(apiClient.post as jest.Mock).mockResolvedValue(mockProposal)

      const result = await proposalsService.reject("prop_123")

      expect(apiClient.post).toHaveBeenCalledWith(
        "/contracts/proposals/prop_123/reject",
        {}
      )
      expect(result.status).toBe("REJECTED")
    })
  })
})
