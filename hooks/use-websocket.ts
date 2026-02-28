import { useEffect, useState, useRef, useCallback } from "react"
import { useAuth } from "@/lib/auth-context"

interface WebSocketMessage {
  type: string
  payload: Record<string, unknown>
}

export function useWebSocket() {
  const { token } = useAuth()
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttemptsRef = useRef(0)

  const connect = useCallback(() => {
    if (!token) {
      return
    }

    // Close existing connection
    if (wsRef.current) {
      wsRef.current.close()
    }

    // Determine WebSocket URL (ws:// or wss://)
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:"
    const wsUrl = `${protocol}//${window.location.hostname}:8080/ws`

    try {
      const ws = new WebSocket(wsUrl)

      ws.onopen = () => {
        setIsConnected(true)
        reconnectAttemptsRef.current = 0

        // Send authentication (if needed by your backend)
        // In this case, JWT is sent via query param or handled server-side
      }

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          setLastMessage(message)
        } catch (error) {
          console.error("[WebSocket] Error parsing message:", error)
        }
      }

      ws.onerror = (error) => {
        console.error("[WebSocket] Error:", error)
      }

      ws.onclose = () => {
        setIsConnected(false)

        // Reconnect with exponential backoff
        const maxAttempts = 10
        const baseDelay = 1000
        const maxDelay = 30000

        if (reconnectAttemptsRef.current < maxAttempts) {
          const delay = Math.min(
            baseDelay * Math.pow(2, reconnectAttemptsRef.current),
            maxDelay
          )

          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++
            connect()
          }, delay)

        }
      }

      wsRef.current = ws
    } catch (error) {
      console.error("[WebSocket] Connection error:", error)
    }
  }, [token])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }

    setIsConnected(false)
  }, [])

  const sendMessage = useCallback((type: string, payload: Record<string, unknown>) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, payload }))
    }
  }, [])

  // Connect on mount when token is available
  useEffect(() => {
    if (token) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [token, connect, disconnect])

  // Send ping every 30 seconds to keep connection alive
  useEffect(() => {
    if (!isConnected) return

    const pingInterval = setInterval(() => {
      sendMessage("ping", { timestamp: Date.now() })
    }, 30000)

    return () => clearInterval(pingInterval)
  }, [isConnected, sendMessage])

  return {
    isConnected,
    lastMessage,
    sendMessage,
    reconnect: connect,
  }
}
