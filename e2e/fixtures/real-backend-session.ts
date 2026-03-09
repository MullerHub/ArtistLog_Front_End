import type { APIRequestContext, Page } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || process.env.E2E_API_URL || 'http://127.0.0.1:8080'
const E2E_EMAIL =
  process.env.E2E_EMAIL || process.env.E2E_ARTIST_EMAIL || 'artist1@test.com'
const E2E_PASSWORD =
  process.env.E2E_PASSWORD || process.env.E2E_ARTIST_PASSWORD || 'senha123'

interface LoginResponse {
  access_token: string
}

interface CachedSession {
  token: string
  user: unknown
  timestamp: number
}

const CACHE_FILE = path.join(os.tmpdir(), 'artistlog-e2e-session-cache.json')
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

function loadCachedSession(): CachedSession | null {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const data = fs.readFileSync(CACHE_FILE, 'utf-8')
      const session = JSON.parse(data) as CachedSession
      // Check if cache is still valid (within TTL)
      if (Date.now() - session.timestamp < CACHE_TTL) {
        return session
      }
    }
  } catch (error) {
    console.warn('[E2E] Failed to load cached session:', error)
  }
  return null
}

function saveCachedSession(session: CachedSession): void {
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(session), 'utf-8')
  } catch (error) {
    console.warn('[E2E] Failed to save cached session:', error)
  }
}

export async function setupRealBackendSession(
  page: Page,
  request: APIRequestContext
): Promise<void> {
  const cachedSession = loadCachedSession()
  
  if (cachedSession) {
    console.log('[E2E] Using cached session from file')
    await page.addInitScript(
      ({ token, currentUser }) => {
        localStorage.setItem('artistlog_token', token)
        localStorage.setItem('artistlog_user', JSON.stringify(currentUser))
      },
      { token: cachedSession.token, currentUser: cachedSession.user }
    )
    return
  }

  console.log('[E2E] No cached session found, logging in...')
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
  const session: CachedSession = {
    token: loginData.access_token,
    user,
    timestamp: Date.now(),
  }
  
  saveCachedSession(session)

  await page.addInitScript(
    ({ token, currentUser }) => {
      localStorage.setItem('artistlog_token', token)
      localStorage.setItem('artistlog_user', JSON.stringify(currentUser))
    },
    { token: loginData.access_token, currentUser: user }
  )
}
