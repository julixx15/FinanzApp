/**
 * Página Dashboard — datos reales desde la API.
 * El resumen financiero y los movimientos recientes se cargan
 * desde el backend; el gráfico sigue usando datos demo hasta
 * que el endpoint de reportes esté disponible (Fase 4).
 */

import { useDashboard } from '../hooks/useDashboard'
import { TarjetaSaldo } from '../components/dashboard/TarjetaSaldo'
import { GraficoBarras } from '../components/dashboard/GraficoBarras'
import { MovimientosRecientes } from '../components/dashboard/MovimientosRecientes'
import { Spinner } from '../components/ui/Spinner'
import { AlertaError } from '../components/ui/AlertaError'
import { DATOS_GRAFICO_DEMO } from '../data/demo'
import {
  IconoSaldo,
  IconoTendenciaAlza,
  IconoTendenciaBaja,
  IconoAhorro,
} from '../components/ui/Icono'

export function Dashboard() {
  const { movimientos, resumen, cargando, error } = useDashboard()

  if (cargando) return <Spinner />

  if (error) {
    return (
      <div className="space-y-4">
        <AlertaError mensaje={`No se pudo conectar con el backend: ${error}`} />
        <p className="text-xs text-gray-400 text-center">
          Verifica que el servidor esté corriendo en{' '}
          <code className="bg-gray-100 px-1 rounded">http://localhost:8000</code>
        </p>
      </div>
    )
  }

  const r = resumen ?? {
    totalIngresos: 0,
    totalGastos: 0,
    totalAhorros: 0,
    saldoDisponible: 0,
  }

  return (
    <div className="space-y-6">

      {/* Tarjetas de resumen */}
      <section aria-label="Resumen financiero">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <TarjetaSaldo
            titulo="Saldo disponible"
            monto={r.saldoDisponible}
            icono={<IconoSaldo className="w-5 h-5" />}
            color="esmeralda"
            descripcion="Ingresos − gastos − ahorros"
          />
          <TarjetaSaldo
            titulo="Total ingresos"
            monto={r.totalIngresos}
            icono={<IconoTendenciaAlza className="w-5 h-5" />}
            color="gris"
          />
          <TarjetaSaldo
            titulo="Total gastos"
            monto={r.totalGastos}
            icono={<IconoTendenciaBaja className="w-5 h-5" />}
            color="rojo"
          />
          <TarjetaSaldo
            titulo="Total ahorros"
            monto={r.totalAhorros}
            icono={<IconoAhorro className="w-5 h-5" />}
            color="azul"
          />
        </div>
      </section>

      {/* Gráfico + Movimientos recientes */}
      <section aria-label="Gráfico y movimientos recientes">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3">
            {/* Gráfico usa datos demo hasta que exista endpoint de reportes */}
            <GraficoBarras datos={DATOS_GRAFICO_DEMO} />
          </div>
          <div className="lg:col-span-2">
            <MovimientosRecientes movimientos={movimientos} limite={5} />
          </div>
        </div>
      </section>
    </div>
  )
}
