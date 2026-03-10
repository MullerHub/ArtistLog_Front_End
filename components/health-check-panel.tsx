"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { checkApiHealth, testCORSConnection } from "@/lib/health-check"
import { API_BASE_URL } from "@/lib/api-client"

export function HealthCheckPanel() {
  const [health, setHealth] = useState<Awaited<ReturnType<typeof checkApiHealth>> | null>(null)
  const [cors, setCors] = useState<Awaited<ReturnType<typeof testCORSConnection>> | null>(null)
  const [loading, setLoading] = useState(false)

  const handleCheck = async () => {
    setLoading(true)
    try {
      const [healthData, corsData] = await Promise.all([
        checkApiHealth(),
        testCORSConnection(),
      ])
      setHealth(healthData)
      setCors(corsData)
    } catch (err) {
      console.error("Health check error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Auto-check on mount
    handleCheck()
  }, [])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>API Health Check</span>
          <Button size="sm" onClick={handleCheck} disabled={loading}>
            {loading ? "Checking..." : "Refresh"}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Backend URL */}
        <div className="text-sm">
          <span className="font-semibold">Backend:</span>
          <code className="ml-2 text-xs bg-slate-100 px-2 py-1 rounded">{API_BASE_URL}</code>
        </div>

        {/* Health Status */}
        {health && (
          <div className="p-3 border rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Health:</span>
              <Badge variant={health.status === "ok" ? "default" : "destructive"}>
                {health.status === "ok" ? "✅ Online" : "❌ Offline"}
              </Badge>
            </div>
            {health.uptime && (
              <div className="text-xs text-slate-600">
                Uptime: {health.uptime}
              </div>
            )}
            {health.error && (
              <div className="text-xs text-red-600">
                Error: {health.error}
              </div>
            )}
          </div>
        )}

        {/* CORS Status */}
        {cors && (
          <div className="p-3 border rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold">CORS:</span>
              <Badge variant={cors.cors === "ok" ? "default" : "destructive"}>
                {cors.cors === "ok" ? "✅ Allowed" : "❌ Blocked"}
              </Badge>
            </div>
            <div className="text-xs text-slate-600">
              Origin: {cors.origin}
            </div>
            {cors.error && (
              <div className="text-xs text-red-600 font-mono">
                {cors.error}
              </div>
            )}
            {cors.sample != null && (
              <details className="text-xs">
                <summary className="cursor-pointer hover:underline">Sample Data</summary>
                <pre className="mt-2 bg-slate-50 p-2 rounded overflow-auto text-xs">
                  {JSON.stringify(cors.sample as unknown, null, 2)}
                </pre>
              </details>
            )}
          </div>
        )}

        {/* Debug Info */}
        <div className="text-xs text-slate-500 space-y-1">
          <p>💡 Open DevTools (F12) → Network tab to see requests</p>
          <p>🔍 Check Console for detailed error messages</p>
        </div>
      </CardContent>
    </Card>
  )
}
