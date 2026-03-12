// ============================================
// ArtistLog - API Client (fetch-based)
// ============================================

const LOCAL_API_URL = "http://localhost:8080"
const RENDER_API_URL = "https://artistlog-backend-latest.onrender.com"

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, "")
}

function isLocalhostHost(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1"
}

function isLocalUrl(url: string): boolean {
  return /localhost|127\.0\.0\.1/i.test(url)
}

function resolveApiBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL?.trim()
  const hasWindow = typeof window !== "undefined"
  const currentHost = hasWindow ? window.location.hostname : ""
  const runningLocally = hasWindow && isLocalhostHost(currentHost)

  if (envUrl) {
    if (!runningLocally && hasWindow && isLocalUrl(envUrl)) {
      console.warn(
        `[API] NEXT_PUBLIC_API_URL (${envUrl}) points to localhost in production. Falling back to ${RENDER_API_URL}.`
      )
      return RENDER_API_URL
    }
    return normalizeBaseUrl(envUrl)
  }

  return runningLocally ? LOCAL_API_URL : RENDER_API_URL
}

const API_BASE_URL = resolveApiBaseUrl()

class ApiError extends Error {
  status: number
  data: unknown

  constructor(message: string, status: number, data?: unknown) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.data = data
  }
}

async function parseResponseBody(response: Response, endpoint: string): Promise<unknown> {
  const contentType = response.headers.get("content-type") || ""

  if (contentType.includes("application/json")) {
    try {
      return await response.json()
    } catch (parseErr) {
      console.error(`[API] JSON Parse error ${endpoint}:`, parseErr)
      return null
    }
  }

  try {
    const text = await response.text()
    return text || null
  } catch (readErr) {
    console.error(`[API] Response read error ${endpoint}:`, readErr)
    return null
  }
}

function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("artistlog_token")
}

function setToken(token: string): void {
  if (typeof window === "undefined") return
  localStorage.setItem("artistlog_token", token)
}

function removeToken(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem("artistlog_token")
  localStorage.removeItem("artistlog_user")
}

function mapNetworkError(endpoint: string, url: string, err: unknown): ApiError | null {
  if (!(err instanceof TypeError)) {
    return null
  }

  const localhostTarget = isLocalUrl(url)
  if (localhostTarget) {
    return new ApiError(
      `Nao foi possivel conectar ao servidor local (${url}). Verifique se o backend esta ativo e se o CORS permite a origem do frontend. Endpoint: ${endpoint}`,
      0,
      { endpoint, url, cause: err.message }
    )
  }

  return new ApiError(
    `Falha de rede ao acessar a API (${endpoint}). Verifique conexao, URL da API e configuracao de CORS.`,
    0,
    { endpoint, url, cause: err.message }
  )
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  const token = getToken()

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  }

  if (token) {
    ;(headers as Record<string, string>)["Authorization"] = `Bearer ${token}`
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (response.status === 401) {
      removeToken()
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        window.location.href = "/login"
      }
      throw new ApiError("Unauthorized", 401)
    }

    if (response.status === 204) {
      return undefined as T
    }

    const data = await parseResponseBody(response, endpoint)

    if (!response.ok) {
      const fallbackMessage = typeof data === "string" && data.trim().length > 0
        ? data
        : `HTTP ${response.status}`

      throw new ApiError(
        (data as any)?.message || (data as any)?.description || fallbackMessage,
        response.status,
        data
      )
    }

    return data as T
  } catch (err) {
    if (err instanceof ApiError) throw err
    const networkError = mapNetworkError(endpoint, url, err)
    if (networkError) throw networkError
    console.error("[API Exception]", endpoint, err)
    throw err
  }
}

async function requestFormData<T>(
  endpoint: string,
  formData: FormData
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  const token = getToken()

  const headers: HeadersInit = {}
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: formData,
    })

    if (response.status === 401) {
      removeToken()
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        window.location.href = "/login"
      }
      throw new ApiError("Unauthorized", 401)
    }

    if (!response.ok) {
      const data = await parseResponseBody(response, endpoint)
      throw new ApiError(
        (data as any)?.message || (data as any)?.description || (typeof data === "string" && data) || "Upload failed",
        response.status,
        data
      )
    }

    return response.json()
  } catch (err) {
    console.error("Erro na requisição (FormData):", err)
    throw err
  }
}

async function requestBlob(endpoint: string): Promise<Blob> {
  const url = `${API_BASE_URL}${endpoint}`
  const token = getToken()

  const headers: HeadersInit = {}
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  try {
    const response = await fetch(url, {
      method: "GET",
      headers,
    })

    if (response.status === 401) {
      removeToken()
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        window.location.href = "/login"
      }
      throw new ApiError("Unauthorized", 401)
    }

    if (!response.ok) {
      const data = await parseResponseBody(response, endpoint)
      throw new ApiError(
        (data as any)?.message || (data as any)?.description || "Download failed",
        response.status,
        data
      )
    }

    return response.blob()
  } catch (err) {
    if (err instanceof ApiError) throw err
    const networkError = mapNetworkError(endpoint, url, err)
    if (networkError) throw networkError
    console.error("[API Blob Exception]", endpoint, err)
    throw err
  }
}

// Request pública (sem token) para endpoints que não requerem autenticação
async function requestPublic<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (response.status === 204) {
      return undefined as T
    }

    const data = await parseResponseBody(response, endpoint)

    if (!response.ok) {
      const fallbackMessage = typeof data === "string" && data.trim().length > 0
        ? data
        : `HTTP ${response.status}`

      throw new ApiError(
        (data as any)?.message || (data as any)?.description || fallbackMessage,
        response.status,
        data
      )
    }

    return data as T
  } catch (err) {
    if (err instanceof ApiError) throw err
    const networkError = mapNetworkError(endpoint, url, err)
    if (networkError) throw networkError
    console.error("[API Exception]", endpoint, err)
    throw err
  }
}

// Request silenciosa que não causa logout em 401
async function requestSilent<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  const token = getToken()

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  }

  if (token) {
    ;(headers as Record<string, string>)["Authorization"] = `Bearer ${token}`
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })

    // Em requisições silenciosas, ignoramos 401 e não fazemos logout
    if (response.status === 401) {
      return undefined as T
    }

    if (response.status === 204) {
      return undefined as T
    }

    const data = await parseResponseBody(response, endpoint)

    if (!response.ok) {
      throw new ApiError(
        (data as any)?.message || (data as any)?.description || "Request failed",
        response.status,
        data
      )
    }

    return data as T
  } catch (err) {
    // Não relança o erro - é silencioso
    return undefined as T
  }
}

export const apiClient = {
  get: <T>(endpoint: string, params?: Record<string, unknown>) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.append(key, String(value))
        }
      })
    }
    const query = searchParams.toString()
    return request<T>(`${endpoint}${query ? `?${query}` : ""}`)
  },

  post: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string) =>
    request<T>(endpoint, { method: "DELETE" }),

  upload: <T>(endpoint: string, formData: FormData) =>
    requestFormData<T>(endpoint, formData),

  download: (endpoint: string) => requestBlob(endpoint),

  // Para endpoints não-críticos (como view tracking) que não devem logout em 401
  postSilent: <T>(endpoint: string, body?: unknown) =>
    requestSilent<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),

  // Para endpoints públicos (sem autenticação)
  postPublic: <T>(endpoint: string, body?: unknown) =>
    requestPublic<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),

  // Para endpoints públicos não-críticos (silencioso + sem token)
  postPublicSilent: <T>(endpoint: string, body?: unknown) => {
    return requestPublic<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }).catch(() => undefined as T)
  },
}

export { ApiError, getToken, setToken, removeToken, API_BASE_URL, requestSilent, requestPublic }
