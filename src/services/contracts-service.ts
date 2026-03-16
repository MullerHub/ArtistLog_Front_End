import { apiClient } from "@/lib/api-client";
import type { AuditEntry, ChatMessage, Contract, ContractTemplate, Proposal } from "@/types/contract";

interface ContractListResponse {
  items: any[];
  total: number;
  limit: number;
  offset: number;
}

function mapStatus(status?: string): Contract["status"] {
  switch ((status || "").toUpperCase()) {
    case "PENDING":
      return "draft";
    case "ACCEPTED":
      return "accepted";
    case "REJECTED":
      return "cancelled";
    case "COMPLETED":
      return "completed";
    default:
      return "negotiating";
  }
}

function normalizeContract(raw: any): Contract {
  return {
    id: raw.id,
    title: raw.title || raw.description || "Contrato",
    status: mapStatus(raw.status),
    artist_id: raw.artist_id,
    artist_name: raw.artist_name || raw.artist_id || "Artista",
    venue_id: raw.venue_id,
    venue_name: raw.venue_name || raw.venue_id || "Contratante",
    event_date: raw.event_date,
    event_type: raw.event_type || "Evento",
    cache_value: raw.final_price || 0,
    description: raw.description || raw.message || "",
    created_at: raw.created_at,
    updated_at: raw.updated_at,
  };
}

function normalizeProposal(raw: any): Proposal {
  return {
    id: raw.id,
    contract_id: raw.contract_id,
    author_id: raw.proposed_by_user_id,
    author_name: raw.proposed_by_user_id || "Usuario",
    author_role: raw.proposed_by_role,
    proposed_value: raw.proposed_price || 0,
    proposed_date: raw.proposed_date || raw.created_at,
    message: raw.message || "",
    status:
      raw.status === "ACCEPTED"
        ? "accepted"
        : raw.status === "REJECTED"
          ? "rejected"
          : "pending",
    created_at: raw.created_at,
  };
}

function normalizeMessage(raw: any): ChatMessage {
  return {
    id: raw.id,
    contract_id: raw.contract_id,
    author_id: raw.sender_id,
    author_name: raw.sender_id || "Usuario",
    author_role: raw.sender_role,
    content: raw.message,
    is_read: !!raw.read_at,
    created_at: raw.created_at,
  };
}

function normalizeAudit(raw: any): AuditEntry {
  return {
    id: raw.id,
    contract_id: raw.contract_id,
    action: raw.action,
    actor_name: raw.user_id || "Sistema",
    actor_role: raw.user_role || "SYSTEM",
    details: raw.action,
    created_at: raw.created_at,
  };
}

function normalizeTemplate(raw: any): ContractTemplate {
  return {
    id: raw.id,
    contract_id: raw.contract_id || "",
    name: raw.template_name || raw.file_name || "Template",
    file_url: raw.file_url || raw.file_path || "",
    uploaded_by: raw.artist_id || "Usuario",
    uploaded_by_role: "ARTIST",
    status: "pending",
    created_at: raw.created_at || new Date().toISOString(),
  };
}

export const contractsService = {
  async list(): Promise<Contract[]> {
    const response = await apiClient.get<ContractListResponse | any[]>("/contracts");
    if (Array.isArray(response)) return response.map(normalizeContract);
    return (response.items || []).map(normalizeContract);
  },

  async getById(id: string): Promise<Contract> {
    const response = await apiClient.get<any>(`/contracts/${id}`);
    return normalizeContract(response);
  },

  async updateStatus(id: string, status: "accepted" | "cancelled" | "completed"): Promise<void> {
    const mapped = status === "accepted" ? "ACCEPTED" : status === "completed" ? "COMPLETED" : "REJECTED";
    await apiClient.patch(`/contracts/${id}/status`, { status: mapped });
  },

  async listProposals(contractId: string): Promise<Proposal[]> {
    const response = await apiClient.get<any>(`/contracts/${contractId}/proposals`);
    const list = Array.isArray(response) ? response : response.data || response.items || [];
    return list.map(normalizeProposal);
  },

  async createProposal(payload: { contract_id: string; proposed_price: number; message: string }): Promise<void> {
    await apiClient.post("/contracts/proposals", payload);
  },

  async acceptProposal(proposalId: string): Promise<void> {
    await apiClient.post(`/contracts/proposals/${proposalId}/accept`, {});
  },

  async rejectProposal(proposalId: string): Promise<void> {
    await apiClient.post(`/contracts/proposals/${proposalId}/reject`, {});
  },

  async listMessages(contractId: string): Promise<ChatMessage[]> {
    const response = await apiClient.get<any>(`/contracts/${contractId}/messages`);
    const list = Array.isArray(response) ? response : response.data || response.items || [];
    return list.map(normalizeMessage);
  },

  async sendMessage(payload: { contract_id: string; message: string }): Promise<void> {
    await apiClient.post("/contracts/messages", payload);
  },

  async markAsRead(messageId: string): Promise<void> {
    await apiClient.post(`/contracts/messages/${messageId}/read`, {});
  },

  async getUnreadCount(contractId: string): Promise<number> {
    const response = await apiClient.get<{ unread_count: number }>(`/contracts/${contractId}/messages/unread`);
    return response.unread_count || 0;
  },

  async getAudit(contractId: string): Promise<AuditEntry[]> {
    const logs = await apiClient.get<any[]>(`/contracts/${contractId}/audit`);
    return (logs || []).map(normalizeAudit);
  },

  async getTemplates(contractId: string): Promise<ContractTemplate[]> {
    const response = await apiClient.get<any>(`/contracts/${contractId}/template`);
    if (!response) return [];
    if (Array.isArray(response)) return response.map(normalizeTemplate);
    if (response.template) return [normalizeTemplate(response.template)];
    return [normalizeTemplate(response)];
  },
};
