import { apiClient } from "@/lib/api-client"
import type { SignatureStatus } from "@/lib/types"

export const signatureService = {
  /**
   * Envia um contrato para assinatura digital (ZapSign)
   */
  async sendForSignature(payload: {
    contract_id: string
    pdf_url: string
  }): Promise<SignatureStatus> {
    return apiClient.post<SignatureStatus>("/contracts/send-for-signature", payload)
  },

  /**
   * Verifica o status da assinatura digital
   */
  async getStatus(contractId: string): Promise<SignatureStatus> {
    return apiClient.get<SignatureStatus>(`/contracts/${contractId}/signature-status`)
  },

  /**
   * Webhook para callback automático do ZapSign (não chamar diretamente)
   * Apenas documentado para referência
   */
  // POST /webhooks/signature-completed é chamado automaticamente pelo ZapSign
}
