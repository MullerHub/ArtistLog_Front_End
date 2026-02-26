// ============================================
// ArtistLog - API Client (fetch-based)
// ============================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

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

  const data = await response.json()

  if (!response.ok) {
    throw new ApiError(
      data.message || data.description || "Request failed",
      response.status,
      data
    )
  }

  return data as T
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

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: formData,
  })

  if (!response.ok) {
    const data = await response.json()
    throw new ApiError(
      data.message || "Upload failed",
      response.status,
      data
    )
  }

  return response.json()
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
}

export { ApiError, getToken, setToken, removeToken, API_BASE_URL }
