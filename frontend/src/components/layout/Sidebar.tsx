import type { PaginaActiva } from '../../types/ui'
import {
  IconoDashboard,
  IconoMovimientos,
  IconoReportes,
  IconoCerrar,
} from '../ui/Icono'

interface NavItem {
  id: PaginaActiva
  etiqueta: string
  Icono: React.ComponentType<{ className?: string }>
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard',    etiqueta: 'Dashboard',    Icono: IconoDashboard },
  { id: 'movimientos',  etiqueta: 'Movimientos',  Icono: IconoMovimientos },
  { id: 'reportes',     etiqueta: 'Reportes',     Icono: IconoReportes },
]

interface SidebarProps {
  paginaActiva: PaginaActiva
  onNavegar: (pagina: PaginaActiva) => void
  abierto: boolean
  onCerrar: () => void
}

export function Sidebar({ paginaActiva, onNavegar, abierto, onCerrar }: SidebarProps) {
  const handleNav = (pagina: PaginaActiva) => {
    onNavegar(pagina)
    onCerrar()
  }

  return (
    <>
      {/* Overlay móvil */}
      {abierto && (
        <div
          className="fixed inset-0 bg-black/30 z-20 lg:hidden"
          onClick={onCerrar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-100 z-30
          flex flex-col transition-transform duration-300
          ${abierto ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
        `}
        aria-label="Navegación principal"
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <span className="font-bold text-gray-900 text-lg">FinanzApp</span>
          </div>
          <button
            onClick={onCerrar}
            className="lg:hidden text-gray-400 hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded"
            aria-label="Cerrar menú"
          >
            <IconoCerrar className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Menú">
          {NAV_ITEMS.map(({ id, etiqueta, Icono }) => {
            const activo = paginaActiva === id
            return (
              <button
                key={id}
                onClick={() => handleNav(id)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                  transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500
                  ${activo
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                `}
                aria-current={activo ? 'page' : undefined}
              >
                <Icono className={`w-5 h-5 ${activo ? 'text-emerald-600' : 'text-gray-400'}`} />
                {etiqueta}
              </button>
            )
          })}
        </nav>

        {/* Footer sidebar */}
        <div className="px-6 py-4 border-t border-gray-100">
          <p className="text-xs text-gray-400">Diseño Funcional · Unidad 2</p>
        </div>
      </aside>
    </>
  )
}
