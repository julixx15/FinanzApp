import { useState } from 'react'
import { MOVIMIENTOS_DEMO, CATEGORIAS_DEMO } from '../data/demo'
import type { TipoMovimiento } from '../types/domain'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'
import { EstadoVacio } from '../components/ui/EstadoVacio'
import { formatearMoneda, formatearFecha } from '../utils/formato'

type FiltroTipo = TipoMovimiento | 'todos'

export function Movimientos() {
  const [filtroTipo, setFiltroTipo] = useState<FiltroTipo>('todos')
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todas')
  const [busqueda, setBusqueda] = useState('')

  const movimientosFiltrados = MOVIMIENTOS_DEMO.filter(m => {
    const coincideTipo      = filtroTipo === 'todos'      || m.tipo === filtroTipo
    const coincideCategoria = filtroCategoria === 'todas' || m.categoria === filtroCategoria
    const coincideBusqueda  = busqueda === ''             ||
      m.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
      m.categoria.toLowerCase().includes(busqueda.toLowerCase())
    return coincideTipo && coincideCategoria && coincideBusqueda
  })

  return (
    <div className="space-y-5">
      {/* Aviso demo */}
      <div className="bg-amber-50 border border-amber-200 text-amber-700 rounded-xl px-4 py-2.5 text-xs font-medium">
        📊 Datos de demostración — los filtros funcionan sobre los datos locales.
      </div>

      {/* Filtros */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Búsqueda */}
          <div className="flex-1">
            <label htmlFor="busqueda" className="sr-only">Buscar movimiento</label>
            <input
              id="busqueda"
              type="search"
              placeholder="Buscar por descripción o categoría…"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-gray-400"
            />
          </div>

          {/* Tipo */}
          <div>
            <label htmlFor="filtro-tipo" className="sr-only">Tipo de movimiento</label>
            <select
              id="filtro-tipo"
              value={filtroTipo}
              onChange={e => setFiltroTipo(e.target.value as FiltroTipo)}
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
              value={filtroCategoria}
              onChange={e => setFiltroCategoria(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="todas">Todas las categorías</option>
              {CATEGORIAS_DEMO.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Tabla / lista */}
      <Card className="overflow-hidden">
        {movimientosFiltrados.length === 0 ? (
          <EstadoVacio mensaje="No hay movimientos con ese filtro." />
        ) : (
          <>
            {/* Cabecera — solo escritorio */}
            <div className="hidden sm:grid grid-cols-[auto_1fr_auto_auto] gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wide">
              <span>Tipo</span>
              <span>Descripción</span>
              <span>Fecha</span>
              <span className="text-right">Monto</span>
            </div>

            <ul className="divide-y divide-gray-50">
              {movimientosFiltrados.map(mov => (
                <li
                  key={mov.id}
                  className="grid grid-cols-[auto_1fr] sm:grid-cols-[auto_1fr_auto_auto] gap-x-4 gap-y-1 px-5 py-4 items-center"
                >
                  <Badge tipo={mov.tipo} />

                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {mov.descripcion}
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
                </li>
              ))}
            </ul>

            <div className="px-5 py-3 border-t border-gray-50 text-xs text-gray-400">
              {movimientosFiltrados.length} movimiento{movimientosFiltrados.length !== 1 ? 's' : ''}
            </div>
          </>
        )}
      </Card>
    </div>
  )
}
