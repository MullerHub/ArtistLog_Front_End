import { apiClient } from "@/lib/api-client"
import type {
  Contract,
  CreateContractRequest,
  UpdateContractStatusRequest,
  ContractListResponse,
} from "@/lib/types"

export const contractsService = {
  async createContract(payload: CreateContractRequest): Promise<Contract> {
    return apiClient.post<Contract>("/contracts", payload)
  },

  async getContract(id: string): Promise<Contract> {
    return apiClient.get<Contract>(`/contracts/${id}`)
  },

  async listContracts(params?: { limit?: number; offset?: number }): Promise<ContractListResponse> {
    return apiClient.get<ContractListResponse>("/contracts", params as Record<string, unknown>)
  },

  async updateContractStatus(id: string, payload: UpdateContractStatusRequest): Promise<Contract> {
    return apiClient.patch<Contract>(`/contracts/${id}/status`, payload)
  },

  async deleteContract(id: string): Promise<void> {
    return apiClient.delete(`/contracts/${id}`)
  },

  // Legacy aliases to avoid breaking existing imports.
  async create(payload: CreateContractRequest): Promise<Contract> {
    return this.createContract(payload)
  },

  async getById(id: string): Promise<Contract> {
    return this.getContract(id)
  },

  async getAll(params?: { limit?: number; offset?: number }): Promise<ContractListResponse> {
    return this.listContracts(params)
  },

  async updateStatus(id: string, payload: UpdateContractStatusRequest): Promise<Contract> {
    return this.updateContractStatus(id, payload)
  },

  async delete(id: string): Promise<void> {
    return this.deleteContract(id)
  },
}
