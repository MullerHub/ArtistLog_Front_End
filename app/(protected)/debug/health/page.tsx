"use client"

import { HealthCheckPanel } from "@/components/health-check-panel"

/**
 * Debug Page - Test API connectivity
 * Acesso: /debug/health
 */
export default function DebugHealthPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">🏥 API Health Debug</h1>
          <p className="text-slate-600 mt-2">
            Test connectivity to backend API and check for CORS errors
          </p>
        </div>

        <HealthCheckPanel />

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
          <h3 className="font-semibold text-blue-900">📋 How to Use</h3>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Click "Refresh" to test connectivity</li>
            <li>Check if <code className="bg-white px-1">Health: ✅ Online</code></li>
            <li>Check if <code className="bg-white px-1">CORS: ✅ Allowed</code></li>
            <li>Open DevTools (F12) → Network tab for detailed logs</li>
          </ol>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-2">
          <h3 className="font-semibold text-amber-900">⚠️ Troubleshooting</h3>
          <div className="text-sm text-amber-800 space-y-2">
            <div>
              <strong>❌ CORS: Blocked</strong>
              <p className="ml-2">Backend may not include your domain in CORS_ALLOWED_ORIGINS</p>
            </div>
            <div>
              <strong>❌ Health: Offline</strong>
              <p className="ml-2">Backend is down or unreachable</p>
            </div>
            <div>
              <strong>💡 Still seeing issues?</strong>
              <p className="ml-2">Check browser console (F12) for detailed error messages</p>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-500">
          This page is for debugging only. Remove before production.
        </div>
      </div>
    </div>
  )
}
