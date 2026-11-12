import type { PaginaActiva } from '../../types/ui'
import {
  IconoDashboard,
  IconoMovimientos,
  IconoReportes,
  IconoCerrar,
  IconoMetas,
  IconoNuevo,
} from '../ui/Icono'

interface NavItem {
  id: PaginaActiva
  etiqueta: string
  Icono: React.ComponentType<{ className?: string }>
  separadorArriba?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard',    etiqueta: 'Dashboard',        Icono: IconoDashboard },
  { id: 'movimientos',  etiqueta: 'Movimientos',      Icono: IconoMovimientos },
  { id: 'metas',        etiqueta: 'Metas de ahorro',  Icono: IconoMetas },
  { id: 'reportes',     etiqueta: 'Reportes',         Icono: IconoReportes },
  { id: 'nuevo',        etiqueta: 'Nuevo movimiento', Icono: IconoNuevo, separadorArriba: true },
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
      {abierto && (
        <div
          className="fixed inset-0 bg-black/30 z-20 lg:hidden"
          onClick={onCerrar}
          aria-hidden="true"
        />
      )}

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
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <div>
              <span className="font-bold text-gray-900 text-base leading-none">FinanzApp</span>
              <p className="text-xs text-gray-400 leading-none mt-0.5">Finanzas personales</p>
            </div>
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
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto" aria-label="Menú">
          {NAV_ITEMS.map(({ id, etiqueta, Icono, separadorArriba }) => {
            const activo = paginaActiva === id
            const esNuevo = id === 'nuevo'
            return (
              <div key={id}>
                {separadorArriba && <div className="my-3 border-t border-gray-100" />}
                <button
                  onClick={() => handleNav(id)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                    transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500
                    ${esNuevo
                      ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                      : activo
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                  `}
                  aria-current={activo ? 'page' : undefined}
                >
                  <Icono className={`w-5 h-5 shrink-0 ${esNuevo ? 'text-white' : activo ? 'text-emerald-600' : 'text-gray-400'}`} />
                  {etiqueta}
                </button>
              </div>
            )
          })}
        </nav>

        {/* Usuario demo */}
        <div className="px-4 py-4 border-t border-gray-100">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
              <span className="text-emerald-700 font-semibold text-sm">J</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">Julian Murcia</p>
              <p className="text-xs text-gray-400 truncate">FESC · 2026</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
