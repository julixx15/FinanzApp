import { useEffect, useState } from 'react'
import { checkHealth } from './services/healthService'
import type { HealthResponse } from './types/api'
import './index.css'

function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkHealth()
      .then(setHealth)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Error desconocido')
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl shadow-md p-10 max-w-md w-full">
        <h1 className="text-3xl font-bold text-blue-600 mb-2">FinanzApp</h1>
        <p className="text-gray-500 mb-8 text-sm">
          Gestión de finanzas personales
        </p>

        <div className="border rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Estado del backend
          </h2>

          {loading && (
            <p className="text-gray-500 text-sm">Conectando...</p>
          )}

          {error && (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {health && (
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                <span className="text-green-700 font-medium">
                  {health.status}
                </span>
              </div>
              <p className="text-gray-500">Versión: {health.version}</p>
              <p className="text-gray-500">Base de datos: {health.database}</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

export default App
