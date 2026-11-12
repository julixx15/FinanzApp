import { apiFetch } from './api'
import type { Movimiento, ResumenFinanciero, DatoGrafico } from '../types/domain'

// ─── Tipos de respuesta del backend ──────────────────────────────────────────

interface MovimientoAPI {
  id: number
  tipo: 'ingreso' | 'gasto' | 'ahorro'
  monto: string   // Decimal viene como string desde Python
  categoria: string
  descripcion: string
  fecha: string
  creado_en: string
}

interface ResumenAPI {
  total_ingresos: string
  total_gastos: string
  total_ahorros: string
  saldo_disponible: string
}

interface HistorialMensualAPI {
  periodo: string
  nombre: string
  ingresos: number
  gastos: number
  ahorros: number
  saldo: number
}

interface MovimientoCreate {
  tipo: 'ingreso' | 'gasto' | 'ahorro'
  monto: string
  categoria: string
  descripcion?: string
  fecha: string
}

// ─── Conversores ─────────────────────────────────────────────────────────────

function apiAMovimiento(m: MovimientoAPI): Movimiento {
  return {
    id: m.id,
    tipo: m.tipo,
    monto: parseFloat(m.monto),
    categoria: m.categoria,
    descripcion: m.descripcion,
    fecha: m.fecha,
  }
}

function apiAResumen(r: ResumenAPI): ResumenFinanciero {
  return {
    totalIngresos:   parseFloat(r.total_ingresos),
    totalGastos:     parseFloat(r.total_gastos),
    totalAhorros:    parseFloat(r.total_ahorros),
    saldoDisponible: parseFloat(r.saldo_disponible),
  }
}

// ─── Servicios ───────────────────────────────────────────────────────────────

export async function listarMovimientos(params?: {
  tipo?: string
  categoria?: string
  fecha_desde?: string
  fecha_hasta?: string
  limite?: number
}): Promise<Movimiento[]> {
  const query = new URLSearchParams()
  if (params?.tipo)         query.set('tipo', params.tipo)
  if (params?.categoria)    query.set('categoria', params.categoria)
  if (params?.fecha_desde)  query.set('fecha_desde', params.fecha_desde)
  if (params?.fecha_hasta)  query.set('fecha_hasta', params.fecha_hasta)
  if (params?.limite)       query.set('limite', String(params.limite))

  const qs = query.toString()
  const data = await apiFetch<MovimientoAPI[]>(`/movimientos/${qs ? `?${qs}` : ''}`)
  return data.map(apiAMovimiento)
}

export async function crearMovimiento(datos: MovimientoCreate): Promise<Movimiento> {
  const data = await apiFetch<MovimientoAPI>('/movimientos/', {
    method: 'POST',
    body: JSON.stringify(datos),
  })
  return apiAMovimiento(data)
}

export async function eliminarMovimiento(id: number): Promise<void> {
  await apiFetch<void>(`/movimientos/${id}`, { method: 'DELETE' })
}

export async function obtenerResumen(params?: {
  fecha_desde?: string
  fecha_hasta?: string
}): Promise<ResumenFinanciero> {
  const query = new URLSearchParams()
  if (params?.fecha_desde) query.set('fecha_desde', params.fecha_desde)
  if (params?.fecha_hasta) query.set('fecha_hasta', params.fecha_hasta)
  const qs = query.toString()
  const data = await apiFetch<ResumenAPI>(`/movimientos/resumen${qs ? `?${qs}` : ''}`)
  return apiAResumen(data)
}

export async function obtenerCategorias(): Promise<string[]> {
  return apiFetch<string[]>('/movimientos/categorias')
}

export async function obtenerHistorialMensual(): Promise<DatoGrafico[]> {
  const data = await apiFetch<HistorialMensualAPI[]>('/movimientos/historial-mensual')
  return data.map(h => ({
    nombre:   h.nombre,
    ingresos: h.ingresos,
    gastos:   h.gastos,
    ahorros:  h.ahorros,
  }))
}
