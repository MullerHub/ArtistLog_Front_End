/**
 * Mocks de dados para testes E2E de contratos
 * Todos os dados são simulados e não dependem de backend real
 */

export const mockUser = {
  id: 'user-artist-1',
  email: 'artist@example.com',
  role: 'ARTIST',
  profile_completed: true,
}

export const mockContract = {
  id: 'contract-1',
  artist_id: 'artist-1',
  venue_id: 'venue-1',
  event_date: '2026-03-15',
  final_price: 3500,
  status: 'PENDING',
  description: 'Show principal da noite',
  message: 'Chegar 1h antes do evento',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

export const mockProposals = [
  {
    id: 'proposal-1',
    contract_id: 'contract-1',
    proposed_by_id: 'venue-1',
    proposed_by_role: 'VENUE',
    proposed_price: 3600,
    message: 'Podemos ajustar para este valor?',
    status: 'PENDING',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export const mockMessages = [
  {
    id: 'message-1',
    contract_id: 'contract-1',
    sender_id: 'venue-1',
    sender_role: 'VENUE',
    message: 'Confirmado, aguardando retorno.',
    type: 'USER',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export const mockAuditLogs = [
  {
    id: 'audit-1',
    contract_id: 'contract-1',
    user_id: 'venue-1',
    user_role: 'VENUE',
    action: 'CREATE',
    new_value: { status: 'PENDING' },
    created_at: new Date().toISOString(),
  },
  {
    id: 'audit-2',
    contract_id: 'contract-1',
    user_id: 'artist-1',
    user_role: 'ARTIST',
    action: 'SEND_PROPOSAL',
    new_value: { proposed_price: 3600 },
    created_at: new Date().toISOString(),
  },
]
