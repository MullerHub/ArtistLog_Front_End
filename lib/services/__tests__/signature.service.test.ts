import { signatureService } from "@/lib/services/signature.service"
import { apiClient } from "@/lib/api-client"
import type { SignatureStatus, Signer } from "@/lib/types"

jest.mock("@/lib/api-client", () => ({
  apiClient: {
    post: jest.fn(),
    get: jest.fn(),
  },
}))

describe("SignatureService", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("sendForSignature()", () => {
    it("deve enviar contrato para assinatura", async () => {
      const mockSignature: SignatureStatus = {
        id: "sig_123",
        contract_id: "contract_123",
        zapSign_document_id: "doc_abc123",
        status: "PENDING_SIGNATURE",
        signers: [
          {
            signer_id: "user_artist",
            signer_role: "ARTIST",
            signer_name: "João Silva",
          },
          {
            signer_id: "user_venue",
            signer_role: "VENUE",
            signer_name: "Casa de Show XYZ",
          },
        ],
        pdf_url: "https://cdn.example.com/contract.pdf",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      ;(apiClient.post as jest.Mock).mockResolvedValue(mockSignature)

      const result = await signatureService.sendForSignature({
        contract_id: "contract_123",
        pdf_url: "https://cdn.example.com/contract.pdf",
      })

      expect(apiClient.post).toHaveBeenCalledWith(
        "/contracts/send-for-signature",
        {
          contract_id: "contract_123",
          pdf_url: "https://cdn.example.com/contract.pdf",
        }
      )
      expect(result.status).toBe("PENDING_SIGNATURE")
      expect(result.signers).toHaveLength(2)
    })

    it("deve validar URL do PDF", async () => {
      ;(apiClient.post as jest.Mock).mockRejectedValue(
        new Error("PDF URL é obrigatória e deve ser uma URL HTTPS válida")
      )

      await expect(
        signatureService.sendForSignature({
          contract_id: "contract_123",
          pdf_url: "http://invalid.com/doc.pdf", // HTTP em vez de HTTPS
        })
      ).rejects.toThrow()
    })

    it("deve validar que contrato está ACCEPTED", async () => {
      ;(apiClient.post as jest.Mock).mockRejectedValue(
        new Error("Contrato deve estar em status ACCEPTED para enviar para assinatura")
      )

      await expect(
        signatureService.sendForSignature({
          contract_id: "contract_123",
          pdf_url: "https://cdn.example.com/contract.pdf",
        })
      ).rejects.toThrow("Contrato deve estar em status ACCEPTED")
    })
  })

  describe("getStatus()", () => {
    it("deve retornar PENDING_SIGNATURE quando ninguém assinou", async () => {
      const mockStatus: SignatureStatus = {
        id: "sig_123",
        contract_id: "contract_123",
        zapSign_document_id: "doc_abc123",
        status: "PENDING_SIGNATURE",
        signers: [
          { signer_id: "u1", signer_role: "ARTIST", signer_name: "João" },
          { signer_id: "u2", signer_role: "VENUE", signer_name: "Casa" },
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      ;(apiClient.get as jest.Mock).mockResolvedValue(mockStatus)

      const result = await signatureService.getStatus("contract_123")

      expect(result.status).toBe("PENDING_SIGNATURE")
      expect(result.signers.every(s => !s.signed_at)).toBe(true)
    })

    it("deve retornar PARTIALLY_SIGNED quando um assinou", async () => {
      const mockStatus: SignatureStatus = {
        id: "sig_123",
        contract_id: "contract_123",
        status: "PARTIALLY_SIGNED",
        signers: [
          {
            signer_id: "u1",
            signer_role: "ARTIST",
            signer_name: "João",
            signed_at: new Date().toISOString(),
            ip_address: "192.168.1.100",
          },
          {
            signer_id: "u2",
            signer_role: "VENUE",
            signer_name: "Casa",
          },
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      ;(apiClient.get as jest.Mock).mockResolvedValue(mockStatus)

      const result = await signatureService.getStatus("contract_123")

      expect(result.status).toBe("PARTIALLY_SIGNED")
      expect(result.signers.filter(s => s.signed_at)).toHaveLength(1)
    })

    it("deve retornar FULLY_SIGNED quando ambos assinaram", async () => {
      const mockStatus: SignatureStatus = {
        id: "sig_123",
        contract_id: "contract_123",
        status: "FULLY_SIGNED",
        signers: [
          {
            signer_id: "u1",
            signer_role: "ARTIST",
            signer_name: "João",
            signed_at: "2026-03-02T14:30:00Z",
            ip_address: "192.168.1.100",
          },
          {
            signer_id: "u2",
            signer_role: "VENUE",
            signer_name: "Casa",
            signed_at: "2026-03-02T15:00:00Z",
            ip_address: "203.0.113.45",
          },
        ],
        pdf_url: "https://cdn.example.com/contract-signed.pdf",
        completed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      ;(apiClient.get as jest.Mock).mockResolvedValue(mockStatus)

      const result = await signatureService.getStatus("contract_123")

      expect(result.status).toBe("FULLY_SIGNED")
      expect(result.signers.every(s => s.signed_at)).toBe(true)
      expect(result.pdf_url).toBeDefined()
    })

    it("deve rastrear IP e timestamp de cada signatário", async () => {
      const mockStatus: SignatureStatus = {
        id: "sig_123",
        contract_id: "contract_123",
        status: "FULLY_SIGNED",
        signers: [
          {
            signer_id: "u1",
            signer_role: "ARTIST",
            signer_name: "João",
            signed_at: "2026-03-02T14:30:00Z",
            ip_address: "192.168.1.100",
          },
          {
            signer_id: "u2",
            signer_role: "VENUE",
            signer_name: "Casa",
            signed_at: "2026-03-02T15:00:00Z",
            ip_address: "203.0.113.45",
          },
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      ;(apiClient.get as jest.Mock).mockResolvedValue(mockStatus)

      const result = await signatureService.getStatus("contract_123")

      result.signers.forEach(signer => {
        if (signer.signed_at) {
          expect(signer.ip_address).toBeDefined()
          expect(signer.signed_at).toMatch(/\d{4}-\d{2}-\d{2}T/)
        }
      })
    })

    it("deve retornar SIGNATURE_EXPIRED quando expirou", async () => {
      const mockStatus: SignatureStatus = {
        id: "sig_123",
        contract_id: "contract_123",
        status: "SIGNATURE_EXPIRED",
        signers: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      ;(apiClient.get as jest.Mock).mockResolvedValue(mockStatus)

      const result = await signatureService.getStatus("contract_123")

      expect(result.status).toBe("SIGNATURE_EXPIRED")
    })

    it("deve fazer polling sem problemas", async () => {
      const mockStatus: SignatureStatus = {
        id: "sig_123",
        contract_id: "contract_123",
        status: "PENDING_SIGNATURE",
        signers: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      ;(apiClient.get as jest.Mock).mockResolvedValue(mockStatus)

      // Simula 3 chamadas de polling
      for (let i = 0; i < 3; i++) {
        const result = await signatureService.getStatus("contract_123")
        expect(result).toBeDefined()
      }

      expect(apiClient.get).toHaveBeenCalledTimes(3)
    })
  })
})
