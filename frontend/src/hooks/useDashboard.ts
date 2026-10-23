/**
 * Hook para el dashboard: carga movimientos recientes y calcula
 * el resumen financiero directamente desde la API real.
 */

import { useState, useEffect } from 'react'
import type { Movimiento, ResumenFinanciero } from '../types/domain'
import { listarMovimientos } from '../services/movimientosService'

function apiADominio(m: {
  id: number
  tipo: 'ingreso' | 'gasto' | 'ahorro'
  monto: string
  categoria: string
  descripcion: string
  fecha: string
  fecha_creacion: string
}): Movimiento {
  return {
    id: m.id,
    tipo: m.tipo,
    monto: parseFloat(m.monto),
    categoria: m.categoria,
    descripcion: m.descripcion,
    fecha: m.fecha,
  }
}

export function useDashboard() {
  const [movimientos, setMovimientos]   = useState<Movimiento[]>([])
  const [resumen, setResumen]           = useState<ResumenFinanciero | null>(null)
  const [cargando, setCargando]         = useState(false)
  const [error, setError]               = useState<string | null>(null)

  const cargar = async () => {
    setCargando(true)
    setError(null)
    try {
      // Cargamos hasta 100 movimientos para calcular el resumen y mostrar recientes
      const resultado = await listarMovimientos({ limit: 100, offset: 0 })
      const lista = resultado.movimientos.map(apiADominio)
      setMovimientos(lista)

      // Calcular resumen financiero en cliente a partir de todos los movimientos
      const totalIngresos = lista
        .filter(m => m.tipo === 'ingreso')
        .reduce((acc, m) => acc + m.monto, 0)
      const totalGastos = lista
        .filter(m => m.tipo === 'gasto')
        .reduce((acc, m) => acc + m.monto, 0)
      const totalAhorros = lista
        .filter(m => m.tipo === 'ahorro')
        .reduce((acc, m) => acc + m.monto, 0)

      setResumen({
        totalIngresos,
        totalGastos,
        totalAhorros,
        saldoDisponible: totalIngresos - totalGastos - totalAhorros,
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar el dashboard')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    void cargar()
  }, [])

  return { movimientos, resumen, cargando, error, recargar: cargar }
}
