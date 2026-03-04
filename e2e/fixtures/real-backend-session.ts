import type { APIRequestContext, Page } from '@playwright/test'

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || process.env.E2E_API_URL || 'http://127.0.0.1:8080'
const E2E_EMAIL =
  process.env.E2E_EMAIL || process.env.E2E_ARTIST_EMAIL || 'artist1@test.com'
const E2E_PASSWORD =
  process.env.E2E_PASSWORD || process.env.E2E_ARTIST_PASSWORD || 'senha123'

interface LoginResponse {
  access_token: string
}

export async function setupRealBackendSession(
  page: Page,
  request: APIRequestContext
): Promise<void> {
  const loginResponse = await request.post(`${API_BASE_URL}/auth/login`, {
    data: {
      email: E2E_EMAIL,
      password: E2E_PASSWORD,
    },
  })

  if (!loginResponse.ok()) {
    const body = await loginResponse.text()
    throw new Error(
      `[E2E] Falha no login real (${loginResponse.status()}). Configure E2E_EMAIL/E2E_PASSWORD. Resposta: ${body}`
    )
  }

  const loginData = (await loginResponse.json()) as LoginResponse

  if (!loginData.access_token) {
    throw new Error('[E2E] Login sem access_token no backend real')
  }

  const meResponse = await request.get(`${API_BASE_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${loginData.access_token}`,
    },
  })

  if (!meResponse.ok()) {
    const body = await meResponse.text()
    throw new Error(
      `[E2E] Falha no /auth/me real (${meResponse.status()}). Resposta: ${body}`
    )
  }

  const user = await meResponse.json()

  await page.addInitScript(
    ({ token, currentUser }) => {
      localStorage.setItem('artistlog_token', token)
      localStorage.setItem('artistlog_user', JSON.stringify(currentUser))
    },
    { token: loginData.access_token, currentUser: user }
  )
}
