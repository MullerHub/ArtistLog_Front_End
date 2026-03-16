import type {
  Contract, Proposal, ChatMessage, AuditEntry, ContractTemplate, SignatureStatus,
} from "@/types/contract";

export const MOCK_CONTRACTS: Contract[] = [
  {
    id: "c1",
    title: "Show de Jazz — Bar do Blues",
    status: "negotiating",
    artist_id: "1",
    artist_name: "Lucas Harmonia",
    venue_id: "v1",
    venue_name: "Bar do Blues",
    event_date: "2026-04-15",
    event_type: "Bar/Pub",
    cache_value: 2000,
    description: "Apresentação de voz e violão com repertório de jazz e MPB. Duração de 3 horas com 2 sets.",
    created_at: "2026-03-01T10:00:00Z",
    updated_at: "2026-03-10T14:00:00Z",
  },
  {
    id: "c2",
    title: "Festival Rock — Casa de Shows Maré",
    status: "accepted",
    artist_id: "2",
    artist_name: "Banda Pulsar",
    venue_id: "v6",
    venue_name: "Casa de Shows Maré",
    event_date: "2026-05-20",
    event_type: "Festival",
    cache_value: 8000,
    description: "Show completo com 90 minutos. Banda traz equipamento próprio de iluminação.",
    created_at: "2026-02-15T10:00:00Z",
    updated_at: "2026-03-05T16:00:00Z",
  },
  {
    id: "c3",
    title: "DJ Set — Cervejaria Estrela",
    status: "signed",
    artist_id: "3",
    artist_name: "DJ Marina",
    venue_id: "v4",
    venue_name: "Cervejaria Estrela",
    event_date: "2026-04-05",
    event_type: "Bar/Pub",
    cache_value: 3500,
    description: "DJ set de 4 horas com equipamento próprio e iluminação LED.",
    created_at: "2026-01-20T10:00:00Z",
    updated_at: "2026-03-12T09:00:00Z",
  },
  {
    id: "c4",
    title: "Casamento Silva — Espaço Harmonia",
    status: "completed",
    artist_id: "5",
    artist_name: "Ana Viola",
    venue_id: "v2",
    venue_name: "Espaço Harmonia",
    event_date: "2026-02-14",
    event_type: "Casamento",
    cache_value: 4000,
    description: "Violino na cerimônia e coquetel. Repertório clássico e popular.",
    created_at: "2025-12-10T10:00:00Z",
    updated_at: "2026-02-15T10:00:00Z",
  },
];

export const MOCK_PROPOSALS: Proposal[] = [
  {
    id: "p1", contract_id: "c1", author_id: "owner1", author_name: "Bar do Blues", author_role: "VENUE",
    proposed_value: 1800, proposed_date: "2026-04-15", message: "Gostaríamos de propor R$ 1.800 para o show de 3h.", status: "pending", created_at: "2026-03-01T10:00:00Z",
  },
  {
    id: "p2", contract_id: "c1", author_id: "1", author_name: "Lucas Harmonia", author_role: "ARTIST",
    proposed_value: 2200, proposed_date: "2026-04-15", message: "Contraproposta: R$ 2.200 considerando equipamento próprio.", status: "pending", created_at: "2026-03-03T14:00:00Z",
  },
  {
    id: "p3", contract_id: "c1", author_id: "owner1", author_name: "Bar do Blues", author_role: "VENUE",
    proposed_value: 2000, proposed_date: "2026-04-15", message: "Fechamos em R$ 2.000. Pode ser?", status: "pending", created_at: "2026-03-05T09:00:00Z",
  },
  {
    id: "p4", contract_id: "c2", author_id: "v6", author_name: "Casa de Shows Maré", author_role: "VENUE",
    proposed_value: 8000, proposed_date: "2026-05-20", message: "Proposta aceita. Vamos preparar o contrato.", status: "accepted", created_at: "2026-02-20T10:00:00Z",
  },
];

export const MOCK_CHAT_MESSAGES: ChatMessage[] = [
  { id: "m1", contract_id: "c1", author_id: "owner1", author_name: "Bar do Blues", author_role: "VENUE", content: "Olá Lucas! Gostaríamos de ter você aqui no dia 15/04.", is_read: true, created_at: "2026-03-01T10:05:00Z" },
  { id: "m2", contract_id: "c1", author_id: "1", author_name: "Lucas Harmonia", author_role: "ARTIST", content: "Opa! Vou verificar minha agenda e retorno.", is_read: true, created_at: "2026-03-01T11:20:00Z" },
  { id: "m3", contract_id: "c1", author_id: "1", author_name: "Lucas Harmonia", author_role: "ARTIST", content: "Confirmado! Estou livre no dia 15. Podemos discutir o cachê?", is_read: true, created_at: "2026-03-02T09:00:00Z" },
  { id: "m4", contract_id: "c1", author_id: "owner1", author_name: "Bar do Blues", author_role: "VENUE", content: "Perfeito! Enviei uma proposta formal. Dá uma olhada na aba de propostas.", is_read: false, created_at: "2026-03-05T09:30:00Z" },
];

export const MOCK_AUDIT_ENTRIES: AuditEntry[] = [
  { id: "a1", contract_id: "c1", action: "contract_created", actor_name: "Bar do Blues", actor_role: "VENUE", details: "Contrato criado com proposta inicial de R$ 1.800", created_at: "2026-03-01T10:00:00Z" },
  { id: "a2", contract_id: "c1", action: "proposal_sent", actor_name: "Bar do Blues", actor_role: "VENUE", details: "Proposta de R$ 1.800 enviada", created_at: "2026-03-01T10:00:00Z" },
  { id: "a3", contract_id: "c1", action: "proposal_sent", actor_name: "Lucas Harmonia", actor_role: "ARTIST", details: "Contraproposta de R$ 2.200 enviada", created_at: "2026-03-03T14:00:00Z" },
  { id: "a4", contract_id: "c1", action: "proposal_sent", actor_name: "Bar do Blues", actor_role: "VENUE", details: "Nova proposta de R$ 2.000 enviada", created_at: "2026-03-05T09:00:00Z" },
  { id: "a5", contract_id: "c1", action: "message_sent", actor_name: "Sistema", actor_role: "SYSTEM", details: "4 mensagens trocadas no chat", created_at: "2026-03-05T09:30:00Z" },
  { id: "a6", contract_id: "c3", action: "contract_signed", actor_name: "Sistema", actor_role: "SYSTEM", details: "Contrato assinado por ambas as partes via ZapSign", created_at: "2026-03-12T09:00:00Z" },
];

export const MOCK_TEMPLATES: ContractTemplate[] = [
  { id: "t1", contract_id: "c2", name: "Contrato_Pulsar_Mare_2026.pdf", file_url: "#", uploaded_by: "Casa de Shows Maré", uploaded_by_role: "VENUE", status: "accepted", created_at: "2026-02-25T10:00:00Z" },
  { id: "t2", contract_id: "c1", name: "Modelo_Show_BarDoBlues.pdf", file_url: "#", uploaded_by: "Bar do Blues", uploaded_by_role: "VENUE", status: "pending", created_at: "2026-03-08T10:00:00Z" },
];

export const MOCK_SIGNATURES: SignatureStatus[] = [
  { id: "sig1", contract_id: "c3", signer_name: "DJ Marina", signer_role: "ARTIST", status: "signed", signed_at: "2026-03-11T15:00:00Z" },
  { id: "sig2", contract_id: "c3", signer_name: "Cervejaria Estrela", signer_role: "VENUE", status: "signed", signed_at: "2026-03-12T09:00:00Z" },
  { id: "sig3", contract_id: "c2", signer_name: "Banda Pulsar", signer_role: "ARTIST", status: "pending" },
  { id: "sig4", contract_id: "c2", signer_name: "Casa de Shows Maré", signer_role: "VENUE", status: "pending" },
];
