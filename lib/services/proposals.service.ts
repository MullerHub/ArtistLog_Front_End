import { apiClient } from "@/lib/api-client"
import type { Proposal, ProposalListResponse } from "@/lib/types"

function normalizeProposalListResponse(
  response: ProposalListResponse | Proposal[] | { items?: Proposal[]; total?: number; limit?: number; offset?: number },
  params?: { limit?: number; offset?: number }
): ProposalListResponse {
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

export const proposalsService = {
  /**
   * Cria uma nova contra-proposta
   */
  async create(payload: {
    contract_id: string
    proposed_price?: number
    proposed_date?: string
    proposed_time?: string
    proposed_duration?: number
    message: string
  }): Promise<Proposal> {
    return apiClient.post<Proposal>("/contracts/proposals", payload)
  },

  /**
   * Lista todas as propostas de um contrato
   */
  async list(
    contractId: string,
    params?: { limit?: number; offset?: number; status?: string }
  ): Promise<ProposalListResponse> {
    const response = await apiClient.get<
      ProposalListResponse | Proposal[] | { items?: Proposal[]; total?: number; limit?: number; offset?: number }
    >(
      `/contracts/${contractId}/proposals`,
      params as Record<string, unknown>
    )

    return normalizeProposalListResponse(response, params)
  },

  /**
   * Aceita uma proposta
   */
  async accept(proposalId: string, message?: string): Promise<Proposal> {
    return apiClient.post<Proposal>(`/contracts/proposals/${proposalId}/accept`, {
      ...(message && { message }),
    })
  },

  /**
   * Rejeita uma proposta
   */
  async reject(proposalId: string, message?: string): Promise<Proposal> {
    return apiClient.post<Proposal>(`/contracts/proposals/${proposalId}/reject`, {
      ...(message && { message }),
    })
  },
}
