/**
 * Módulo centralizado de llamadas HTTP al recurso Movimientos.
 *
 * Todas las llamadas a la API pasan por aquí — ningún componente
 * ni hook hace fetch directamente.
 *
 * Los montos se envían como strings numéricos para respetar la
 * precisión Decimal del backend (evita errores de punto flotante).
 */

import type {
  MovimientoApiResponse,
  MovimientoListApiResponse,
  MovimientoCreateRequest,
  MovimientoUpdateRequest,
  MovimientosFiltros,
} from '../types/api'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

// ------------------------------------------------------------------ //
// Helpers internos                                                     //
// ------------------------------------------------------------------ //

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let mensaje = `Error ${res.status}`
    try {
      const body = await res.json() as { detail?: unknown }
      if (typeof body.detail === 'string') {
        mensaje = body.detail
      } else if (Array.isArray(body.detail)) {
        mensaje = body.detail
          .map((e: { msg?: string }) => e.msg ?? JSON.stringify(e))
          .join('; ')
      }
    } catch {
      // la respuesta no era JSON — usar mensaje genérico
    }
    throw new Error(mensaje)
  }
  return res.json() as Promise<T>
}

function buildUrl(path: string, params?: Record<string, string>): string {
  const url = new URL(`${API_BASE}${path}`)
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '') url.searchParams.set(k, v)
    })
  }
  return url.toString()
}

// ------------------------------------------------------------------ //
// Operaciones CRUD                                                     //
// ------------------------------------------------------------------ //

/** Lista movimientos con filtros y paginación opcionales. */
export async function listarMovimientos(
  filtros: MovimientosFiltros = {},
): Promise<MovimientoListApiResponse> {
  const params: Record<string, string> = {}
  if (filtros.tipo)        params['tipo']        = filtros.tipo
  if (filtros.categoria)   params['categoria']   = filtros.categoria
  if (filtros.fecha_desde) params['fecha_desde'] = filtros.fecha_desde
  if (filtros.fecha_hasta) params['fecha_hasta'] = filtros.fecha_hasta
  if (filtros.limit)       params['limit']       = String(filtros.limit)
  if (filtros.offset)      params['offset']      = String(filtros.offset)

  const res = await fetch(buildUrl('/movimientos', params))
  return handleResponse<MovimientoListApiResponse>(res)
}

/** Crea un nuevo movimiento. */
export async function crearMovimiento(
  data: MovimientoCreateRequest,
): Promise<MovimientoApiResponse> {
  const res = await fetch(buildUrl('/movimientos'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return handleResponse<MovimientoApiResponse>(res)
}

/** Obtiene un movimiento por id. */
export async function obtenerMovimiento(id: number): Promise<MovimientoApiResponse> {
  const res = await fetch(buildUrl(`/movimientos/${id}`))
  return handleResponse<MovimientoApiResponse>(res)
}

/** Actualiza parcialmente un movimiento. */
export async function actualizarMovimiento(
  id: number,
  data: MovimientoUpdateRequest,
): Promise<MovimientoApiResponse> {
  const res = await fetch(buildUrl(`/movimientos/${id}`), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return handleResponse<MovimientoApiResponse>(res)
}

/** Elimina un movimiento. Lanza error si no existe. */
export async function eliminarMovimiento(id: number): Promise<void> {
  const res = await fetch(buildUrl(`/movimientos/${id}`), {
    method: 'DELETE',
  })
  if (!res.ok) {
    await handleResponse<void>(res)
  }
}
