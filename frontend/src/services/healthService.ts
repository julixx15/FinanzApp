import type { HealthResponse } from '../types/api'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export async function checkHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_BASE}/health`)
  if (!response.ok) {
    throw new Error(`Error al consultar el backend: ${response.status}`)
  }
  return response.json() as Promise<HealthResponse>
}
