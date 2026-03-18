import type { AuditEntry, ChatMessage, Contract, ContractTemplate, Proposal } from "@/types/contract";

export interface RawContract {
  id: string;
  title?: string;
  description?: string;
  message?: string;
  status?: string;
  artist_id: string;
  artist_name?: string;
  venue_id: string;
  venue_name?: string;
  event_date: string;
  event_type?: string;
  final_price?: number;
  created_at: string;
  updated_at: string;
}

export interface RawProposal {
  id: string;
  contract_id: string;
  proposed_by_user_id: string;
  proposed_by_role: "ARTIST" | "VENUE";
  proposed_price?: number;
  proposed_date?: string;
  message?: string;
  status?: string;
  created_at: string;
}

export interface RawMessage {
  id: string;
  contract_id: string;
  sender_id: string;
  sender_role: "ARTIST" | "VENUE";
  message: string;
  read_at?: string | null;
  created_at: string;
}

export interface RawAudit {
  id: string;
  contract_id: string;
  action: string;
  user_id?: string;
  user_role?: "ARTIST" | "VENUE" | "SYSTEM";
  created_at: string;
}

export interface RawTemplate {
  id: string;
  contract_id?: string;
  template_name?: string;
  file_name?: string;
  file_url?: string;
  file_path?: string;
  artist_id?: string;
  created_at?: string;
}

export interface ContractListResponse {
  items: RawContract[];
  total: number;
  limit: number;
  offset: number;
}

export function mapContractStatus(status?: string): Contract["status"] {
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

export function normalizeContract(raw: RawContract): Contract {
  return {
    id: raw.id,
    title: raw.title || raw.description || "Contrato",
    status: mapContractStatus(raw.status),
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

export function normalizeProposal(raw: RawProposal): Proposal {
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

export function normalizeMessage(raw: RawMessage): ChatMessage {
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

export function normalizeAudit(raw: RawAudit): AuditEntry {
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

export function normalizeTemplate(raw: RawTemplate): ContractTemplate {
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

export function normalizeListPayload<T>(response: unknown): T[] {
  if (Array.isArray(response)) return response as T[];
  if (response && typeof response === "object") {
    const value = response as { data?: unknown; items?: unknown };
    if (Array.isArray(value.data)) return value.data as T[];
    if (Array.isArray(value.items)) return value.items as T[];
  }
  return [];
}
