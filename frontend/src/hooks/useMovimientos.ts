/**
 * Hook que carga movimientos, resumen, categorías e historial desde la API.
 * Si el backend no está disponible, cae silenciosamente a los datos demo.
 */
import { useEffect, useState, useCallback } from 'react'
import type { Movimiento, ResumenFinanciero, DatoGrafico } from '../types/domain'
import {
  listarMovimientos,
  obtenerResumen,
  obtenerCategorias,
  obtenerHistorialMensual,
} from '../services/movimientosService'
import {
  MOVIMIENTOS_DEMO,
  RESUMEN_DEMO,
  DATOS_GRAFICO_DEMO,
  CATEGORIAS_DEMO,
} from '../data/demo'

export type EstadoCarga = 'cargando' | 'ok' | 'demo' | 'error'

interface UseMovimientosResult {
  movimientos:    Movimiento[]
  resumen:        ResumenFinanciero
  datosGrafico:   DatoGrafico[]
  categorias:     string[]
  estado:         EstadoCarga
  error:          string | null
  recargar:       () => void
  usandoDemo:     boolean
}

export function useMovimientos(): UseMovimientosResult {
  const [movimientos,  setMovimientos]  = useState<Movimiento[]>(MOVIMIENTOS_DEMO)
  const [resumen,      setResumen]      = useState<ResumenFinanciero>(RESUMEN_DEMO)
  const [datosGrafico, setDatosGrafico] = useState<DatoGrafico[]>(DATOS_GRAFICO_DEMO)
  const [categorias,   setCategorias]   = useState<string[]>(CATEGORIAS_DEMO)
  const [estado,       setEstado]       = useState<EstadoCarga>('cargando')
  const [error,        setError]        = useState<string | null>(null)

  const cargar = useCallback(async () => {
    setEstado('cargando')
    setError(null)
    try {
      const [movs, res, cats, hist] = await Promise.all([
        listarMovimientos({ limite: 500 }),
        obtenerResumen(),
        obtenerCategorias(),
        obtenerHistorialMensual(),
      ])
      setMovimientos(movs)
      setResumen(res)
      setCategorias(cats.length > 0 ? cats : CATEGORIAS_DEMO)
      setDatosGrafico(hist.length > 0 ? hist : DATOS_GRAFICO_DEMO)
      setEstado('ok')
    } catch {
      // Backend no disponible — usar datos demo sin romper la UI
      setMovimientos(MOVIMIENTOS_DEMO)
      setResumen(RESUMEN_DEMO)
      setDatosGrafico(DATOS_GRAFICO_DEMO)
      setCategorias(CATEGORIAS_DEMO)
      setEstado('demo')
      setError('Backend no disponible. Mostrando datos de demostración.')
    }
  }, [])

  useEffect(() => { void cargar() }, [cargar])

  return {
    movimientos,
    resumen,
    datosGrafico,
    categorias,
    estado,
    error,
    recargar: cargar,
    usandoDemo: estado === 'demo',
  }
}
