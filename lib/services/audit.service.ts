import { apiClient } from "@/lib/api-client"
import type { AuditLog, AuditLogListResponse, UserAuditResponse } from "@/lib/types"

export const auditService = {
  /**
   * Obtém a trilha completa de auditoria de um contrato
   */
  async getTrail(contractId: string): Promise<AuditLog[]> {
    return apiClient.get<AuditLog[]>(`/contracts/${contractId}/audit`)
  },

  /**
   * Lista logs de auditoria com paginação
   */
  async listLogs(
    contractId: string,
    params?: { limit?: number; offset?: number; action?: string }
  ): Promise<AuditLogListResponse> {
    return apiClient.get<AuditLogListResponse>(
      `/contracts/${contractId}/audit/logs`,
      params as Record<string, unknown>
    )
  },

  /**
   * Obtém auditoria de todas as ações do usuário autenticado
   */
  async getUserAudit(params?: { limit?: number; offset?: number }): Promise<UserAuditResponse> {
    return apiClient.get<UserAuditResponse>("/contracts/audit/user", params as Record<string, unknown>)
  },
}
