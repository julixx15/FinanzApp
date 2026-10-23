import type { PaginaActiva, PeriodoFiltro } from '../../types/ui'
import { IconoMenu } from '../ui/Icono'

const TITULOS: Record<PaginaActiva, string> = {
  dashboard:   'Dashboard',
  movimientos: 'Movimientos',
  reportes:    'Reportes',
}

const PERIODOS: { valor: PeriodoFiltro; etiqueta: string }[] = [
  { valor: 'este-mes',         etiqueta: 'Este mes' },
  { valor: 'mes-anterior',     etiqueta: 'Mes anterior' },
  { valor: 'ultimos-3-meses',  etiqueta: 'Últimos 3 meses' },
  { valor: 'este-año',         etiqueta: 'Este año' },
]

interface EncabezadoProps {
  paginaActiva: PaginaActiva
  periodo: PeriodoFiltro
  onCambiarPeriodo: (p: PeriodoFiltro) => void
  onAbrirMenu: () => void
}

export function Encabezado({ paginaActiva, periodo, onCambiarPeriodo, onAbrirMenu }: EncabezadoProps) {
  return (
    <header className="bg-white border-b border-gray-100 px-4 sm:px-6 py-4 flex items-center gap-4">
      {/* Botón menú móvil */}
      <button
        onClick={onAbrirMenu}
        className="lg:hidden text-gray-500 hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded"
        aria-label="Abrir menú"
      >
        <IconoMenu className="w-6 h-6" />
      </button>

      {/* Título */}
      <h1 className="text-xl font-semibold text-gray-900 flex-1">
        {TITULOS[paginaActiva]}
      </h1>

      {/* Selector de periodo */}
      <div className="flex items-center gap-2">
        <label htmlFor="periodo-select" className="sr-only">
          Periodo
        </label>
        <select
          id="periodo-select"
          value={periodo}
          onChange={e => onCambiarPeriodo(e.target.value as PeriodoFiltro)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          {PERIODOS.map(p => (
            <option key={p.valor} value={p.valor}>{p.etiqueta}</option>
          ))}
        </select>
      </div>
    </header>
  )
}
