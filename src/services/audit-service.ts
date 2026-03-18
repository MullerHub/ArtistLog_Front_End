import { apiClient } from "@/lib/api-client";
import type { AuditEntry } from "@/types/contract";
import { normalizeAudit, type RawAudit } from "@/services/contracts-normalizers";

export const auditService = {
  async list(contractId: string): Promise<AuditEntry[]> {
    const response = await apiClient.get<RawAudit[]>(`/contracts/${contractId}/audit`);
    if (!Array.isArray(response)) return [];
    return response.map((entry) => normalizeAudit(entry));
  },
};
