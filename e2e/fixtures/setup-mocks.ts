import { Page, Route } from '@playwright/test'
import {
  mockUser,
  mockVenueUser,
  mockContract,
  mockProposals,
  mockMessages,
  mockAuditLogs,
  mockContractTemplate,
} from './contracts-mocks'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.E2E_API_URL || 'http://127.0.0.1:8080'

function buildApiRoutePattern(pathname: string): RegExp {
  const escapedBase = API_BASE_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`^${escapedBase}${pathname}(?:\\?.*)?$`)
}

async function setupNotificationMocks(page: Page) {
  await page.route(/\/notifications\/unread-count(?:\?.*)?$/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ count: 0 }),
    })
  })

  await page.route(/\/notifications(?:\?.*)?$/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    })
  })

  await page.route(/\/notifications\/read-all(?:\?.*)?$/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'ok' }),
    })
  })

  await page.route(/\/notifications\/[^/]+\/read(?:\?.*)?$/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'ok' }),
    })
  })
}

/**
 * Configura mocks completos de API para testes de contratos
 * Todos os dados são simulados - não depende de backend real
 */
export async function setupContractsMocks(page: Page, options?: { role?: 'ARTIST' | 'VENUE' }) {
  await setupNotificationMocks(page)

  // Estado mutável para simular mudanças durante os testes
  let contracts = [mockContract]
  let proposals = [...mockProposals]
  let messages = [...mockMessages]
  let templates = [{ ...mockContractTemplate }]
  let acceptance: Record<string, unknown> | undefined

  const role = options?.role === 'VENUE' ? 'VENUE' : 'ARTIST'
  const currentUser = role === 'VENUE' ? mockVenueUser : mockUser

  // Intercepta autenticação
  await page.route(/http:\/\/(localhost|127\.0\.0\.1):8080\/auth\/me(?:\?.*)?$/, async (route) => {
    console.log('✅ [MOCK] Intercepted: GET /auth/me')
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(currentUser),
    })
  })

  // Intercepta todas as rotas de contratos
  await page.route(/http:\/\/(localhost|127\.0\.0\.1):8080\/contracts(?:\/.*)?(?:\?.*)?$/, async (route: Route) => {
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

    // POST /contracts - Criar contrato
    if (method === 'POST' && pathname === '/contracts') {
      const body = request.postDataJSON() as Record<string, unknown>
      const newContract = {
        ...mockContract,
        id: `contract-${contracts.length + 1}`,
        artist_id: String(body.artist_id || mockContract.artist_id),
        venue_id: String(body.venue_id || mockContract.venue_id),
        event_date: String(body.event_date || mockContract.event_date),
        final_price: Number(body.final_price || mockContract.final_price),
        description: (body.description as string) || mockContract.description,
        message: (body.message as string) || mockContract.message,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      contracts = [newContract, ...contracts]
      return route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(newContract),
      })
    }

    // GET /contracts/templates/my
    if (method === 'GET' && pathname === '/contracts/templates/my') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(templates),
      })
    }

    // POST /contracts/templates
    if (method === 'POST' && pathname === '/contracts/templates') {
      const newTemplate = {
        ...mockContractTemplate,
        id: `template-${templates.length + 1}`,
        template_name: `Template ${templates.length + 1}`,
        file_path: `contract_templates/template-${templates.length + 1}.pdf`,
        file_name: `template-${templates.length + 1}.pdf`,
        file_size_bytes: 120000,
        content_hash: `sha256-template-${templates.length + 1}`,
        version: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      templates = [newTemplate, ...templates]

      return route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(newTemplate),
      })
    }

    // GET /contracts/templates/{template_id}/download
    if (method === 'GET' && /^\/contracts\/templates\/[^/]+\/download$/.test(pathname)) {
      return route.fulfill({
        status: 200,
        contentType: 'application/pdf',
        headers: {
          'Content-Disposition': 'attachment; filename="template.pdf"',
        },
        body: '%PDF-1.4 mocked',
      })
    }

    // GET /contracts/{id}/template
    if (method === 'GET' && /^\/contracts\/[^/]+\/template$/.test(pathname)) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          template: templates[0],
          acceptance,
        }),
      })
    }

    // POST /contracts/{id}/accept-template
    if (method === 'POST' && /^\/contracts\/[^/]+\/accept-template$/.test(pathname)) {
      const templateId = pathname.split('/')[2]
      const body = request.postDataJSON() as Record<string, unknown>
      acceptance = {
        id: 'acceptance-1',
        contract_id: templateId,
        template_id: body?.template_id || templates[0]?.id,
        accepted_by_role: 'VENUE',
        accepted_at: new Date().toISOString(),
        accepted_by_ip: '127.0.0.1',
        metadata: JSON.stringify(body?.metadata || {}),
        created_at: new Date().toISOString(),
      }
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(acceptance),
      })
    }

    // POST /contracts/{id}/reject-template
    if (method === 'POST' && /^\/contracts\/[^/]+\/reject-template$/.test(pathname)) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Template rejected' }),
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
    if (method === 'POST' && /^\/contracts\/proposals\/[^/]+\/accept$/.test(pathname)) {
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
    if (method === 'POST' && /^\/contracts\/proposals\/[^/]+\/reject$/.test(pathname)) {
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
  await page.context().addInitScript((user) => {
    localStorage.setItem('artistlog_token', 'mock-token-test')
    localStorage.setItem('artistlog_user', JSON.stringify(user))
  }, currentUser)
}

/**
 * Configuração simplificada apenas para autenticação
 * Usa para testes que não precisam de dados completos de contratos
 */
export async function setupAuthMocks(page: Page) {
  await setupNotificationMocks(page)

  await page.route(/\/auth\/me(?:\?.*)?$/, async (route) => {
    console.log('✅ [MOCK] Intercepted: GET /auth/me')
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockUser),
    })
  })

  await page.context().addInitScript((user) => {
    localStorage.setItem('artistlog_token', 'mock-token-test')
    localStorage.setItem('artistlog_user', JSON.stringify(user))
  }, mockUser)
}
