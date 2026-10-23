/**
 * Página de Movimientos — conexión real con la API del backend.
 *
 * Funcionalidades:
 * - Registrar movimientos con formulario validado
 * - Historial paginado (20 por página)
 * - Filtrar por tipo, categoría, búsqueda y monto mínimo
 * - Eliminar con confirmación explícita
 * - Estados de carga, error, éxito y lista vacía
 */

import { useState } from 'react'
import { useMovimientos } from '../hooks/useMovimientos'
import { FormularioMovimiento } from '../components/movimientos/FormularioMovimiento'
import { ModalConfirmacion } from '../components/movimientos/ModalConfirmacion'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'
import { EstadoVacio } from '../components/ui/EstadoVacio'
import { Spinner } from '../components/ui/Spinner'
import { AlertaError } from '../components/ui/AlertaError'
import { formatearMoneda, formatearFecha } from '../utils/formato'

const CATEGORIAS = [
  'Salario', 'Freelance', 'Otros',
  'Vivienda', 'Alimentación', 'Transporte',
  'Servicios', 'Salud', 'Entretenimiento',
  'Fondo emergencia', 'Vacaciones',
]

export function Movimientos() {
  const {
    movimientos, total, pagina, totalPaginas,
    hayPaginaAnterior, hayPaginaSiguiente,
    cargando, error,
    operacion, limpiarOperacion,
    filtros, actualizarFiltros,
    crear, eliminar, irAPagina,
  } = useMovimientos()

  // id del movimiento pendiente de eliminar (null = ninguno)
  const [pendienteEliminar, setPendienteEliminar] = useState<number | null>(null)

  const handleEliminar = async () => {
    if (pendienteEliminar === null) return
    const ok = await eliminar(pendienteEliminar)
    if (ok) setPendienteEliminar(null)
  }

  return (
    <div className="space-y-5">

      {/* Formulario de registro */}
      <FormularioMovimiento
        onCrear={crear}
        cargando={operacion.cargando}
        errorApi={operacion.error}
        exito={operacion.exito}
        onLimpiarEstado={limpiarOperacion}
      />

      {/* Error de carga del listado */}
      {error && <AlertaError mensaje={error} />}

      {/* Filtros */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3 flex-wrap">

          {/* Búsqueda */}
          <div className="flex-1 min-w-40">
            <label htmlFor="busqueda" className="sr-only">Buscar movimiento</label>
            <input
              id="busqueda"
              type="search"
              placeholder="Buscar por descripción o categoría…"
              value={filtros.busqueda}
              onChange={e => actualizarFiltros({ busqueda: e.target.value })}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-gray-400"
            />
          </div>

          {/* Tipo */}
          <div>
            <label htmlFor="filtro-tipo" className="sr-only">Tipo de movimiento</label>
            <select
              id="filtro-tipo"
              value={filtros.tipo}
              onChange={e => actualizarFiltros({ tipo: e.target.value as typeof filtros.tipo })}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="todos">Todos los tipos</option>
              <option value="ingreso">Ingresos</option>
              <option value="gasto">Gastos</option>
              <option value="ahorro">Ahorros</option>
            </select>
          </div>

          {/* Categoría */}
          <div>
            <label htmlFor="filtro-categoria" className="sr-only">Categoría</label>
            <select
              id="filtro-categoria"
              value={filtros.categoria}
              onChange={e => actualizarFiltros({ categoria: e.target.value })}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="">Todas las categorías</option>
              {CATEGORIAS.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Monto mínimo */}
          <div>
            <label htmlFor="filtro-monto" className="sr-only">Monto mínimo</label>
            <input
              id="filtro-monto"
              type="number"
              min="0"
              step="1000"
              placeholder="Monto mínimo"
              value={filtros.montoMinimo}
              onChange={e => actualizarFiltros({ montoMinimo: e.target.value })}
              className="w-36 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-gray-400"
            />
          </div>
        </div>
      </Card>

      {/* Lista */}
      <Card className="overflow-hidden">
        {cargando ? (
          <Spinner />
        ) : movimientos.length === 0 ? (
          <EstadoVacio
            mensaje={
              filtros.busqueda || filtros.tipo !== 'todos' || filtros.categoria || filtros.montoMinimo
                ? 'No hay movimientos con esos filtros.'
                : 'Aún no hay movimientos. ¡Registra el primero!'
            }
          />
        ) : (
          <>
            {/* Cabecera — solo escritorio */}
            <div className="hidden sm:grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wide">
              <span>Tipo</span>
              <span>Descripción</span>
              <span>Fecha</span>
              <span className="text-right">Monto</span>
              <span className="sr-only">Acciones</span>
            </div>

            <ul className="divide-y divide-gray-50" aria-label="Lista de movimientos">
              {movimientos.map(mov => (
                <li
                  key={mov.id}
                  className="grid grid-cols-[auto_1fr_auto] sm:grid-cols-[auto_1fr_auto_auto_auto] gap-x-4 gap-y-1 px-5 py-4 items-center"
                >
                  <Badge tipo={mov.tipo} />

                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {mov.descripcion || <span className="text-gray-400 italic">Sin descripción</span>}
                    </p>
                    <p className="text-xs text-gray-400">{mov.categoria}</p>
                  </div>

                  <span className="hidden sm:block text-sm text-gray-500">
                    {formatearFecha(mov.fecha)}
                  </span>

                  <span
                    className={`text-sm font-semibold text-right ${
                      mov.tipo === 'ingreso' ? 'text-emerald-600' :
                      mov.tipo === 'gasto'   ? 'text-red-500'     :
                      'text-blue-600'
                    }`}
                  >
                    {mov.tipo === 'ingreso' ? '+' : '−'}{formatearMoneda(mov.monto)}
                  </span>

                  {/* Eliminar */}
                  <button
                    type="button"
                    onClick={() => setPendienteEliminar(mov.id)}
                    className="text-gray-300 hover:text-red-500 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 rounded"
                    aria-label={`Eliminar movimiento: ${mov.descripcion || mov.categoria}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>

            {/* Footer: total + paginación */}
            <div className="px-5 py-3 border-t border-gray-50 flex items-center justify-between gap-3 flex-wrap">
              <p className="text-xs text-gray-400">
                {total} movimiento{total !== 1 ? 's' : ''} en total
              </p>

              {totalPaginas > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => irAPagina(pagina - 1)}
                    disabled={!hayPaginaAnterior}
                    className="px-3 py-1 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                    aria-label="Página anterior"
                  >
                    ← Anterior
                  </button>
                  <span className="text-xs text-gray-500">
                    Pág. {pagina + 1} de {totalPaginas}
                  </span>
                  <button
                    type="button"
                    onClick={() => irAPagina(pagina + 1)}
                    disabled={!hayPaginaSiguiente}
                    className="px-3 py-1 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                    aria-label="Página siguiente"
                  >
                    Siguiente →
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </Card>

      {/* Modal de confirmación de eliminación */}
      {pendienteEliminar !== null && (
        <ModalConfirmacion
          mensaje="Esta acción no se puede deshacer. ¿Confirmas que deseas eliminar este movimiento?"
          onConfirmar={() => { void handleEliminar() }}
          onCancelar={() => {
            setPendienteEliminar(null)
            limpiarOperacion()
          }}
          cargando={operacion.cargando}
        />
      )}

      {/* Error de operación (eliminar) cuando no hay modal abierto */}
      {operacion.error && pendienteEliminar === null && (
        <AlertaError mensaje={operacion.error} />
      )}
    </div>
  )
}
