import { Page, Route } from '@playwright/test'
import { mockUser, mockContract, mockProposals, mockMessages, mockAuditLogs } from './contracts-mocks'

/**
 * Configura mocks completos de API para testes de contratos
 * Todos os dados são simulados - não depende de backend real
 */
export async function setupContractsMocks(page: Page) {
  const API_BASE = 'http://localhost:8080'
  
  // Estado mutável para simular mudanças durante os testes
  let contracts = [mockContract]
  let proposals = [...mockProposals]
  let messages = [...mockMessages]

  // Intercepta autenticação
  await page.route(`${API_BASE}/auth/me`, async (route) => {
    console.log('✅ [MOCK] Intercepted: GET /auth/me')
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockUser),
    })
  })

  // Intercepta todas as rotas de contratos
  await page.route(`${API_BASE}/contracts**`, async (route: Route) => {
    const request = route.request()
    const url = request.url()
    const urlObj = new URL(url)
    const pathname = urlObj.pathname
    const method = request.method()

    console.log(`[MOCK] ${method} ${url}`)

    // GET /contracts - Lista de contratos
    if (method === 'GET' && pathname === '/contracts') {
      console.log('✅ [MOCK] Responding: GET /contracts with', contracts.length, 'items')
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: contracts,
          total: contracts.length,
          limit: 50,
          offset: 0,
        }),
      })
    }

    // GET /contracts/{id}/proposals
    if (method === 'GET' && url.includes('/proposals')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: proposals }),
      })
    }

    // POST /contracts/proposals - Criar proposta
    if (method === 'POST' && url.includes('/contracts/proposals') && !url.includes('/accept') && !url.includes('/reject')) {
      const body = request.postDataJSON() as any
      const newProposal = {
        id: `proposal-${proposals.length + 1}`,
        contract_id: mockContract.id,
        proposed_by_id: 'artist-1',
        proposed_by_role: 'ARTIST',
        proposed_price: body.proposed_price ?? null,
        message: body.message,
        status: 'PENDING',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      proposals = [...proposals, newProposal]
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(newProposal),
      })
    }

    // POST /contracts/proposals/{id}/accept
    if (method === 'POST' && url.includes('/accept')) {
      const proposalId = url.split('/proposals/')[1]?.split('/accept')[0]
      proposals = proposals.map((p) =>
        p.id === proposalId ? { ...p, status: 'ACCEPTED' } : p
      )
      const accepted = proposals.find((p) => p.id === proposalId)
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(accepted),
      })
    }

    // POST /contracts/proposals/{id}/reject
    if (method === 'POST' && url.includes('/reject')) {
      const proposalId = url.split('/proposals/')[1]?.split('/reject')[0]
      proposals = proposals.map((p) =>
        p.id === proposalId ? { ...p, status: 'REJECTED' } : p
      )
      const rejected = proposals.find((p) => p.id === proposalId)
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(rejected),
      })
    }

    // GET /contracts/{id}/messages
    if (method === 'GET' && url.includes('/messages') && !url.includes('/unread')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: messages }),
      })
    }

    // GET /contracts/{id}/messages/unread
    if (method === 'GET' && url.includes('/messages/unread')) {
      const unread = messages.filter((m: any) => m.type === 'USER' && !m.read_at).length
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ unread_count: unread }),
      })
    }

    // POST /contracts/messages - Enviar mensagem
    if (method === 'POST' && url.includes('/contracts/messages')) {
      const body = request.postDataJSON() as any
      const newMessage = {
        id: `message-${messages.length + 1}`,
        contract_id: mockContract.id,
        sender_id: 'artist-1',
        sender_role: 'ARTIST',
        message: body.message,
        type: 'USER',
        read_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      messages = [...messages, newMessage]
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(newMessage),
      })
    }

    // GET /contracts/{id}/audit
    if (method === 'GET' && url.includes('/audit')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockAuditLogs),
      })
    }

    // PATCH /contracts/{id}/status
    if (method === 'PATCH' && url.includes('/status')) {
      const body = request.postDataJSON() as any
      contracts = contracts.map((c) =>
        c.id === mockContract.id ? { ...c, status: body.status } : c
      )
      const updated = contracts.find((c) => c.id === mockContract.id)
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(updated),
      })
    }

    // DELETE /contracts/{id}
    if (method === 'DELETE') {
      contracts = contracts.filter((c) => c.id !== mockContract.id)
      return route.fulfill({ status: 204 })
    }

    // Fallback - rota não encontrada
    console.warn(`[MOCK] Unhandled route: ${method} ${url}`)
    return route.fulfill({ status: 404, body: 'Not Found' })
  })

  // Configura localStorage com token e usuário
  await page.addInitScript((user) => {
    localStorage.setItem('artistlog_token', 'mock-token-test')
    localStorage.setItem('artistlog_user', JSON.stringify(user))
  }, mockUser)
}

/**
 * Configuração simplificada apenas para autenticação
 * Usa para testes que não precisam de dados completos de contratos
 */
export async function setupAuthMocks(page: Page) {
  const API_BASE = 'http://localhost:8080'
  
  await page.route(`${API_BASE}/auth/me`, async (route) => {
    console.log('✅ [MOCK] Intercepted: GET /auth/me')
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockUser),
    })
  })

  await page.addInitScript((user) => {
    localStorage.setItem('artistlog_token', 'mock-token-test')
    localStorage.setItem('artistlog_user', JSON.stringify(user))
  }, mockUser)
}
