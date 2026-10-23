/**
 * Hook de gestión de movimientos.
 *
 * Centraliza el estado, las operaciones CRUD y los filtros.
 * Los componentes solo consumen este hook — no hacen fetch directamente.
 */

import { useState, useEffect, useCallback } from 'react'
import type { Movimiento } from '../types/domain'
import type { MovimientosFiltros, TipoMovimientoApi } from '../types/api'
import {
  listarMovimientos,
  crearMovimiento,
  eliminarMovimiento,
} from '../services/movimientosService'
import type { MovimientoCreateRequest } from '../types/api'

// ------------------------------------------------------------------ //
// Tipos de estado                                                      //
// ------------------------------------------------------------------ //

export interface FiltrosMovimientos {
  tipo: TipoMovimientoApi | 'todos'
  categoria: string
  busqueda: string
  montoMinimo: string
}

export interface EstadoOperacion {
  cargando: boolean
  error: string | null
  exito: boolean
}

const LIMITE_PAGINA = 20

/** Convierte la respuesta de la API al tipo de dominio frontend */
function apiADominio(m: {
  id: number
  tipo: TipoMovimientoApi
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

export function useMovimientos() {
  // ---- Estado de datos ------------------------------------------- //
  const [movimientos, setMovimientos] = useState<Movimiento[]>([])
  const [total, setTotal]             = useState(0)
  const [pagina, setPagina]           = useState(0)

  // ---- Estado de UI ---------------------------------------------- //
  const [cargando, setCargando]       = useState(false)
  const [error, setError]             = useState<string | null>(null)
  const [operacion, setOperacion]     = useState<EstadoOperacion>({
    cargando: false, error: null, exito: false,
  })

  // ---- Filtros ---------------------------------------------------- //
  const [filtros, setFiltros] = useState<FiltrosMovimientos>({
    tipo: 'todos',
    categoria: '',
    busqueda: '',
    montoMinimo: '',
  })

  // ---- Carga de datos -------------------------------------------- //
  const cargar = useCallback(async (paginaActual = 0, filtrosActuales = filtros) => {
    setCargando(true)
    setError(null)
    try {
      const params: MovimientosFiltros = {
        limit: LIMITE_PAGINA,
        offset: paginaActual * LIMITE_PAGINA,
      }
      if (filtrosActuales.tipo !== 'todos') params.tipo = filtrosActuales.tipo
      if (filtrosActuales.categoria)        params.categoria = filtrosActuales.categoria

      const resultado = await listarMovimientos(params)

      // Filtro de búsqueda y monto mínimo se aplican en cliente
      // porque son filtros de texto libre que no están en la API aún
      let lista = resultado.movimientos.map(apiADominio)

      if (filtrosActuales.busqueda) {
        const q = filtrosActuales.busqueda.toLowerCase()
        lista = lista.filter(
          m =>
            m.descripcion.toLowerCase().includes(q) ||
            m.categoria.toLowerCase().includes(q),
        )
      }
      if (filtrosActuales.montoMinimo) {
        const min = parseFloat(filtrosActuales.montoMinimo)
        if (!isNaN(min)) {
          lista = lista.filter(m => m.monto >= min)
        }
      }

      setMovimientos(lista)
      setTotal(resultado.total)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar movimientos')
    } finally {
      setCargando(false)
    }
  }, [filtros])

  // Recargar cuando cambian filtros o página
  useEffect(() => {
    void cargar(pagina, filtros)
  }, [pagina, filtros, cargar])

  // ---- Operación: crear ------------------------------------------ //
  const crear = useCallback(async (data: MovimientoCreateRequest): Promise<boolean> => {
    setOperacion({ cargando: true, error: null, exito: false })
    try {
      await crearMovimiento(data)
      setOperacion({ cargando: false, error: null, exito: true })
      // Volver a página 0 y recargar para mostrar el nuevo movimiento
      setPagina(0)
      await cargar(0, filtros)
      return true
    } catch (e) {
      setOperacion({
        cargando: false,
        error: e instanceof Error ? e.message : 'Error al crear movimiento',
        exito: false,
      })
      return false
    }
  }, [cargar, filtros])

  // ---- Operación: eliminar --------------------------------------- //
  const eliminar = useCallback(async (id: number): Promise<boolean> => {
    setOperacion({ cargando: true, error: null, exito: false })
    try {
      await eliminarMovimiento(id)
      setOperacion({ cargando: false, error: null, exito: true })
      await cargar(pagina, filtros)
      return true
    } catch (e) {
      setOperacion({
        cargando: false,
        error: e instanceof Error ? e.message : 'Error al eliminar movimiento',
        exito: false,
      })
      return false
    }
  }, [cargar, pagina, filtros])

  // ---- Helpers de paginación ------------------------------------- //
  const totalPaginas = Math.ceil(total / LIMITE_PAGINA)
  const hayPaginaAnterior = pagina > 0
  const hayPaginaSiguiente = pagina < totalPaginas - 1

  const irAPagina = (n: number) => {
    if (n >= 0 && n < totalPaginas) setPagina(n)
  }

  // ---- Actualizar filtros con reset de página -------------------- //
  const actualizarFiltros = (nuevosFiltros: Partial<FiltrosMovimientos>) => {
    setPagina(0)
    setFiltros(prev => ({ ...prev, ...nuevosFiltros }))
  }

  const limpiarOperacion = () => {
    setOperacion({ cargando: false, error: null, exito: false })
  }

  return {
    // Datos
    movimientos,
    total,
    pagina,
    totalPaginas,
    hayPaginaAnterior,
    hayPaginaSiguiente,
    // Estado de carga
    cargando,
    error,
    // Estado de operaciones (crear/eliminar)
    operacion,
    limpiarOperacion,
    // Filtros
    filtros,
    actualizarFiltros,
    // Acciones
    crear,
    eliminar,
    recargar: () => cargar(pagina, filtros),
    irAPagina,
  }
}
