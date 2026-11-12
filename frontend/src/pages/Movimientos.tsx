import { useState } from 'react'
import { useMovimientos } from '../hooks/useMovimientos'
import { eliminarMovimiento } from '../services/movimientosService'
import type { TipoMovimiento } from '../types/domain'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'
import { EstadoVacio } from '../components/ui/EstadoVacio'
import { Spinner } from '../components/ui/Spinner'
import { BannerEstado } from '../components/ui/BannerEstado'
import { formatearMoneda, formatearFecha } from '../utils/formato'
import type { PerfilUsuario } from '../data/usuarios'

type FiltroTipo = TipoMovimiento | 'todos'

interface Props { usuario: PerfilUsuario }

export function Movimientos({ usuario: _usuario }: Props) {
  const { movimientos, categorias, estado, recargar } = useMovimientos()
  const [filtroTipo, setFiltroTipo]           = useState<FiltroTipo>('todos')
  const [filtroCategoria, setFiltroCategoria] = useState('todas')
  const [busqueda, setBusqueda]               = useState('')
  const [eliminando, setEliminando]           = useState<number | null>(null)

  const filtrados = movimientos.filter(m => {
    const ok1 = filtroTipo === 'todos'      || m.tipo === filtroTipo
    const ok2 = filtroCategoria === 'todas' || m.categoria === filtroCategoria
    const ok3 = busqueda === ''             ||
      m.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
      m.categoria.toLowerCase().includes(busqueda.toLowerCase())
    return ok1 && ok2 && ok3
  })

  const handleEliminar = async (id: number) => {
    if (!confirm('¿Eliminar este movimiento?')) return
    setEliminando(id)
    try {
      await eliminarMovimiento(id)
      recargar()
    } catch {
      alert('No se pudo eliminar. Verifica que el backend esté activo.')
    } finally {
      setEliminando(null)
    }
  }

  if (estado === 'cargando') return <Spinner />

  return (
    <div className="space-y-5">
      <BannerEstado estado={estado} onRecargar={recargar} />

      {/* Filtros */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label htmlFor="busqueda" className="sr-only">Buscar</label>
            <input id="busqueda" type="search" placeholder="Buscar por descripción o categoría…"
              value={busqueda} onChange={e => setBusqueda(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-gray-400" />
          </div>
          <div>
            <label htmlFor="filtro-tipo" className="sr-only">Tipo</label>
            <select id="filtro-tipo" value={filtroTipo} onChange={e => setFiltroTipo(e.target.value as FiltroTipo)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
              <option value="todos">Todos los tipos</option>
              <option value="ingreso">Ingresos</option>
              <option value="gasto">Gastos</option>
              <option value="ahorro">Ahorros</option>
            </select>
          </div>
          <div>
            <label htmlFor="filtro-categoria" className="sr-only">Categoría</label>
            <select id="filtro-categoria" value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
              <option value="todas">Todas las categorías</option>
              {categorias.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </Card>

      {/* Tabla */}
      <Card className="overflow-hidden">
        {filtrados.length === 0 ? <EstadoVacio mensaje="No hay movimientos con ese filtro." /> : (
          <>
            <div className="hidden sm:grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wide">
              <span>Tipo</span><span>Descripción</span><span>Fecha</span><span className="text-right">Monto</span><span></span>
            </div>
            <ul className="divide-y divide-gray-50">
              {filtrados.map(mov => (
                <li key={mov.id} className="grid grid-cols-[auto_1fr] sm:grid-cols-[auto_1fr_auto_auto_auto] gap-x-4 gap-y-1 px-5 py-4 items-center">
                  <Badge tipo={mov.tipo} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{mov.descripcion || mov.categoria}</p>
                    <p className="text-xs text-gray-400">{mov.categoria}</p>
                  </div>
                  <span className="hidden sm:block text-sm text-gray-500">{formatearFecha(mov.fecha)}</span>
                  <span className={`text-sm font-semibold text-right ${mov.tipo === 'ingreso' ? 'text-emerald-600' : mov.tipo === 'gasto' ? 'text-red-500' : 'text-blue-600'}`}>
                    {mov.tipo === 'ingreso' ? '+' : '−'}{formatearMoneda(mov.monto)}
                  </span>
                  {estado === 'ok' && (
                    <button
                      onClick={() => handleEliminar(mov.id)}
                      disabled={eliminando === mov.id}
                      className="hidden sm:block text-gray-300 hover:text-red-400 transition-colors disabled:opacity-50 focus:outline-none"
                      aria-label="Eliminar movimiento"
                    >
                      {eliminando === mov.id ? '…' : '×'}
                    </button>
                  )}
                </li>
              ))}
            </ul>
            <div className="px-5 py-3 border-t border-gray-50 text-xs text-gray-400">
              {filtrados.length} movimiento{filtrados.length !== 1 ? 's' : ''}
            </div>
          </>
        )}
      </Card>
    </div>
  )
}
