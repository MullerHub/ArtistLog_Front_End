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
  scope?: string
}

interface SessionCredentials {
  email: string
  password: string
}

type SessionCacheStore = Record<string, CachedSession>

const CACHE_FILE = path.join(os.tmpdir(), 'artistlog-e2e-session-cache.json')
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

function loadSessionCacheStore(): SessionCacheStore {
  try {
    if (!fs.existsSync(CACHE_FILE)) {
      return {}
    }

    const data = fs.readFileSync(CACHE_FILE, 'utf-8')
    const parsed = JSON.parse(data) as SessionCacheStore | CachedSession

    // Backward compatibility with legacy single-session cache format.
    if (typeof parsed === 'object' && parsed !== null && 'token' in parsed && 'timestamp' in parsed) {
      const legacy = parsed as CachedSession
      const legacyScope = legacy.scope || 'legacy-default'
      return { [legacyScope]: legacy }
    }

    return (parsed as SessionCacheStore) || {}
  } catch (error) {
    console.warn('[E2E] Failed to load cached session store:', error)
    return {}
  }
}

function getCachedSession(scope: string): CachedSession | null {
  const store = loadSessionCacheStore()
  const session = store[scope]

  if (!session) {
    return null
  }

  if (Date.now() - session.timestamp >= CACHE_TTL) {
    delete store[scope]
    saveSessionCacheStore(store)
    return null
  }

  return session
}

function saveSessionCacheStore(store: SessionCacheStore): void {
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(store), 'utf-8')
  } catch (error) {
    console.warn('[E2E] Failed to save cached session store:', error)
  }
}

function saveCachedSession(scope: string, session: CachedSession): void {
  const store = loadSessionCacheStore()
  store[scope] = session
  saveSessionCacheStore(store)
}

export async function setupRealBackendSession(
  page: Page,
  request: APIRequestContext,
  credentials?: SessionCredentials
): Promise<void> {
  const targetEmail = credentials?.email || E2E_EMAIL
  const targetPassword = credentials?.password || E2E_PASSWORD
  const cacheScopeKey = `${targetEmail.toLowerCase()}::${API_BASE_URL}`

  const cachedSession = getCachedSession(cacheScopeKey)

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
      email: targetEmail,
      password: targetPassword,
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
    scope: cacheScopeKey,
  }

  saveCachedSession(cacheScopeKey, session)

  await page.addInitScript(
    ({ token, currentUser }) => {
      localStorage.setItem('artistlog_token', token)
      localStorage.setItem('artistlog_user', JSON.stringify(currentUser))
    },
    { token: loginData.access_token, currentUser: user }
  )
}
