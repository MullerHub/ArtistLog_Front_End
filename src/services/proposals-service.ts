import { apiClient } from "@/lib/api-client";
import type { Proposal } from "@/types/contract";
import {
  normalizeListPayload,
  normalizeProposal,
  type RawProposal,
} from "@/services/contracts-normalizers";

export const proposalsService = {
  async list(contractId: string): Promise<Proposal[]> {
    const response = await apiClient.get<RawProposal[] | { data?: RawProposal[]; items?: RawProposal[] }>(`/contracts/${contractId}/proposals`);
    return normalizeListPayload<RawProposal>(response).map((proposal) => normalizeProposal(proposal));
  },

  async create(payload: { contract_id: string; proposed_price: number; message: string }): Promise<void> {
    await apiClient.post("/contracts/proposals", payload);
  },

  async accept(proposalId: string): Promise<void> {
    await apiClient.post(`/contracts/proposals/${proposalId}/accept`, {});
  },

  async reject(proposalId: string): Promise<void> {
    await apiClient.post(`/contracts/proposals/${proposalId}/reject`, {});
  },
};
