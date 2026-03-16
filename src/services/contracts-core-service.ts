import { apiClient } from "@/lib/api-client";
import type { Contract } from "@/types/contract";
import {
  normalizeContract,
  type ContractListResponse,
  type RawContract,
} from "@/services/contracts-normalizers";

export const contractsCoreService = {
  async list(): Promise<Contract[]> {
    const response = await apiClient.get<ContractListResponse | RawContract[]>("/contracts");
    if (Array.isArray(response)) {
      return response.map((contract) => normalizeContract(contract));
    }
    return (response.items || []).map((contract) => normalizeContract(contract));
  },

  async getById(id: string): Promise<Contract> {
    const response = await apiClient.get<RawContract>(`/contracts/${id}`);
    return normalizeContract(response);
  },

  async updateStatus(id: string, status: "accepted" | "cancelled" | "completed"): Promise<void> {
    const mapped = status === "accepted" ? "ACCEPTED" : status === "completed" ? "COMPLETED" : "REJECTED";
    await apiClient.patch(`/contracts/${id}/status`, { status: mapped });
  },
};
