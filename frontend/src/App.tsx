import { useState } from 'react'
import { Sidebar } from './components/layout/Sidebar'
import { Encabezado } from './components/layout/Encabezado'
import { Dashboard } from './pages/Dashboard'
import { Movimientos } from './pages/Movimientos'
import { Reportes } from './pages/Reportes'
import type { PaginaActiva, PeriodoFiltro } from './types/ui'
import './index.css'

function App() {
  const [pagina, setPagina] = useState<PaginaActiva>('dashboard')
  const [periodo, setPeriodo] = useState<PeriodoFiltro>('este-mes')
  const [menuAbierto, setMenuAbierto] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        paginaActiva={pagina}
        onNavegar={setPagina}
        abierto={menuAbierto}
        onCerrar={() => setMenuAbierto(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Encabezado
          paginaActiva={pagina}
          periodo={periodo}
          onCambiarPeriodo={setPeriodo}
          onAbrirMenu={() => setMenuAbierto(true)}
        />

        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          {pagina === 'dashboard'   && <Dashboard />}
          {pagina === 'movimientos' && <Movimientos />}
          {pagina === 'reportes'    && <Reportes />}
        </main>
      </div>
    </div>
  )
}

export default App
