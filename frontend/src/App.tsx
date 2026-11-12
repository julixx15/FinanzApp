import { useState } from 'react'
import { Sidebar } from './components/layout/Sidebar'
import { Encabezado } from './components/layout/Encabezado'
import { Dashboard } from './pages/Dashboard'
import { Movimientos } from './pages/Movimientos'
import { Reportes } from './pages/Reportes'
import { Metas } from './pages/Metas'
import { NuevoMovimiento } from './pages/NuevoMovimiento'
import { Coach } from './pages/Coach'
import type { PaginaActiva, PeriodoFiltro } from './types/ui'
import { obtenerUsuario } from './data/usuarios'
import './index.css'

function App() {
  const [pagina, setPagina]       = useState<PaginaActiva>('dashboard')
  const [periodo, setPeriodo]     = useState<PeriodoFiltro>('este-mes')
  const [menuAbierto, setMenu]    = useState(false)
  const [usuarioId, setUsuarioId] = useState('julian')

  const usuario = obtenerUsuario(usuarioId)

  const handleCambiarUsuario = (id: string) => {
    setUsuarioId(id)
    setPagina('dashboard') // vuelve al dashboard al cambiar usuario
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        paginaActiva={pagina}
        onNavegar={setPagina}
        abierto={menuAbierto}
        onCerrar={() => setMenu(false)}
        usuarioActivo={usuario}
        onCambiarUsuario={handleCambiarUsuario}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Encabezado
          paginaActiva={pagina}
          periodo={periodo}
          onCambiarPeriodo={setPeriodo}
          onAbrirMenu={() => setMenu(true)}
          usuario={usuario}
        />

        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          {pagina === 'dashboard'   && <Dashboard   usuario={usuario} />}
          {pagina === 'movimientos' && <Movimientos usuario={usuario} />}
          {pagina === 'reportes'    && <Reportes    usuario={usuario} />}
          {pagina === 'metas'       && <Metas       usuario={usuario} />}
          {pagina === 'nuevo'       && <NuevoMovimiento usuario={usuario} />}
          {pagina === 'coach'       && <Coach       usuario={usuario} />}
        </main>
      </div>
    </div>
  )
}

export default App
