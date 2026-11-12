/**
 * Cliente base para la API de FinanzApp.
 * Centraliza la URL base y el manejo de errores HTTP.
 */

export const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  })

  if (!response.ok) {
    let detail = `Error ${response.status}`
    try {
      const body = await response.json() as { detail?: string }
      if (body.detail) detail = String(body.detail)
    } catch { /* ignorar */ }
    throw new ApiError(response.status, detail)
  }

  // 204 No Content
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}
