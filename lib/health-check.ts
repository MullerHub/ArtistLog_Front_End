import { API_BASE_URL } from "@/lib/api-client"

/**
 * Health Check - Verifica conectividade com a API
 */
export async function checkApiHealth(): Promise<{
  status: "ok" | "error"
  backend: string
  timestamp: string
  uptime?: string
  error?: string
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`)
    
    if (!response.ok) {
      return {
        status: "error",
        backend: API_BASE_URL,
        timestamp: new Date().toISOString(),
        error: `HTTP ${response.status}`,
      }
    }

    const data = (await response.json()) as Record<string, unknown>
    
    return {
      status: "ok",
      backend: API_BASE_URL,
      timestamp: new Date().toISOString(),
      uptime: String(data.uptime),
    }
  } catch (err) {
    return {
      status: "error",
      backend: API_BASE_URL,
      timestamp: new Date().toISOString(),
      error: err instanceof Error ? err.message : String(err),
    }
  }
}

/**
 * Teste CORS - Simula requisição real do frontend
 */
export async function testCORSConnection(): Promise<{
  cors: "ok" | "blocked"
  origin: string
  endpoint: string
  sample?: unknown
  error?: string
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/artists?limit=1`)
    
    if (response.status === 0) {
      return {
        cors: "blocked",
        origin: typeof window !== "undefined" ? window.location.origin : "unknown",
        endpoint: "GET /artists",
        error: "CORS blocked - check browser console",
      }
    }

    const data = await response.json()
    
    return {
      cors: "ok",
      origin: typeof window !== "undefined" ? window.location.origin : "unknown",
      endpoint: `${API_BASE_URL}/artists`,
      sample: Array.isArray(data) ? data.slice(0, 1) : data,
    }
  } catch (err) {
    return {
      cors: "blocked",
      origin: typeof window !== "undefined" ? window.location.origin : "unknown",
      endpoint: `${API_BASE_URL}/artists`,
      error: err instanceof Error ? err.message : String(err),
    }
  }
}
