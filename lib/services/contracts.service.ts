import { apiClient } from "@/lib/api-client"
import type {
  Contract,
  CreateContractRequest,
  UpdateContractStatusRequest,
  ContractListResponse,
} from "@/lib/types"

export const contractsService = {
  /**
   * Cria um novo contrato
   */
  async create(payload: CreateContractRequest): Promise<Contract> {
    return apiClient.post<Contract>("/contracts", payload)
  },

  /**
   * Busca um contrato por ID
   */
  async getById(id: string): Promise<Contract> {
    return apiClient.get<Contract>(`/contracts/${id}`)
  },

  /**
   * Lista todos os contratos do usuário autenticado
   */
  async getAll(params?: { limit?: number; offset?: number }): Promise<ContractListResponse> {
    return apiClient.get<ContractListResponse>("/contracts", params as Record<string, unknown>)
  },

  /**
   * Atualiza o status de um contrato
   */
  async updateStatus(id: string, payload: UpdateContractStatusRequest): Promise<Contract> {
    return apiClient.patch<Contract>(`/contracts/${id}/status`, payload)
  },

  /**
   * Deleta um contrato (apenas PENDING ou REJECTED)
   */
  async delete(id: string): Promise<void> {
    return apiClient.delete(`/contracts/${id}`)
  },
}
