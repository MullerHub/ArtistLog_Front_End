import { apiClient } from "@/lib/api-client";
import type { ContractTemplate } from "@/types/contract";
import { normalizeTemplate, type RawTemplate } from "@/services/contracts-normalizers";

export const signatureService = {
  async getTemplates(contractId: string): Promise<ContractTemplate[]> {
    const response = await apiClient.get<RawTemplate[] | RawTemplate | { template: RawTemplate }>(`/contracts/${contractId}/template`);
    if (!response) return [];
    if (Array.isArray(response)) return response.map((template) => normalizeTemplate(template));

    if (typeof response === "object" && "template" in response) {
      return [normalizeTemplate(response.template)];
    }

    return [normalizeTemplate(response)];
  },
};
