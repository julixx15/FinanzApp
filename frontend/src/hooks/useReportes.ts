/**
 * Hook de reportes — carga todos los datos desde la API real.
 * Los cálculos viven en el backend (core/reportes.py).
 * Este hook solo gestiona estado de carga y transformación a tipos frontend.
 */

import { useState, useEffect } from 'react'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

// ---- Tipos que reflejan los schemas del backend ---- //

export interface ResumenApi {
  total_ingresos: string
  total_gastos: string
  total_ahorros: string
  saldo_disponible: string
  porcentaje_gastos: string | null
  porcentaje_ahorros: string | null
}

export interface ReporteGastosApi {
  cantidad: number
  total: string
  promedio: string
  mayor_gasto: {
    id: number
    monto: string
    categoria: string
    descripcion: string
    fecha: string
  } | null
}

export interface SubtotalCategoriaApi {
  categoria: string
  cantidad: number
  subtotal: string
  movimientos: { id: number; tipo: string; monto: string; descripcion: string; fecha: string }[]
}

export interface ReporteCategoriasApi {
  total_categorias: number
  categorias: SubtotalCategoriaApi[]
}

// ---- Helpers ---- //

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`)
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { detail?: string }
    throw new Error(body.detail ?? `Error ${res.status}`)
  }
  return res.json() as Promise<T>
}

// ---- Hook ---- //

export function useReportes() {
  const [resumen, setResumen]           = useState<ResumenApi | null>(null)
  const [gastos, setGastos]             = useState<ReporteGastosApi | null>(null)
  const [categorias, setCategorias]     = useState<ReporteCategoriasApi | null>(null)
  const [cargando, setCargando]         = useState(false)
  const [error, setError]               = useState<string | null>(null)

  const cargar = async () => {
    setCargando(true)
    setError(null)
    try {
      const [r, g, c] = await Promise.all([
        fetchJson<ResumenApi>('/reportes/resumen'),
        fetchJson<ReporteGastosApi>('/reportes/gastos'),
        fetchJson<ReporteCategoriasApi>('/reportes/categorias'),
      ])
      setResumen(r)
      setGastos(g)
      setCategorias(c)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar reportes')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => { void cargar() }, [])

  return { resumen, gastos, categorias, cargando, error, recargar: cargar }
}
