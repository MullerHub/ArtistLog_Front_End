export type ContractStatus = "draft" | "negotiating" | "accepted" | "signed" | "completed" | "cancelled";

export interface Contract {
  id: string;
  title: string;
  status: ContractStatus;
  artist_id: string;
  artist_name: string;
  venue_id: string;
  venue_name: string;
  event_date: string;
  event_type: string;
  cache_value: number;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Proposal {
  id: string;
  contract_id: string;
  author_id: string;
  author_name: string;
  author_role: "ARTIST" | "VENUE";
  proposed_value: number;
  proposed_date: string;
  message: string;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
}

export interface ChatMessage {
  id: string;
  contract_id: string;
  author_id: string;
  author_name: string;
  author_role: "ARTIST" | "VENUE";
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface AuditEntry {
  id: string;
  contract_id: string;
  action: string;
  actor_name: string;
  actor_role: "ARTIST" | "VENUE" | "SYSTEM";
  details: string;
  created_at: string;
}

export interface ContractTemplate {
  id: string;
  contract_id: string;
  name: string;
  file_url: string;
  uploaded_by: string;
  uploaded_by_role: "ARTIST" | "VENUE";
  status: "pending" | "accepted" | "rejected";
  created_at: string;
}

export interface SignatureStatus {
  id: string;
  contract_id: string;
  signer_name: string;
  signer_role: "ARTIST" | "VENUE";
  status: "pending" | "signed" | "rejected";
  signed_at?: string;
}

export const CONTRACT_STATUS_LABELS: Record<ContractStatus, string> = {
  draft: "Rascunho",
  negotiating: "Em negociação",
  accepted: "Aceito",
  signed: "Assinado",
  completed: "Concluído",
  cancelled: "Cancelado",
};

export const CONTRACT_STATUS_COLORS: Record<ContractStatus, string> = {
  draft: "bg-muted/20 text-muted-foreground border-border",
  negotiating: "bg-primary/10 text-primary border-primary/20",
  accepted: "bg-success/10 text-success border-success/20",
  signed: "bg-secondary/10 text-secondary border-secondary/20",
  completed: "bg-success/10 text-success border-success/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};
