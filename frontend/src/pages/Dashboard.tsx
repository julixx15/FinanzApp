import { MOVIMIENTOS_DEMO, RESUMEN_DEMO, DATOS_GRAFICO_DEMO } from '../data/demo'
import { TarjetaSaldo } from '../components/dashboard/TarjetaSaldo'
import { GraficoBarras } from '../components/dashboard/GraficoBarras'
import { MovimientosRecientes } from '../components/dashboard/MovimientosRecientes'
import {
  IconoSaldo,
  IconoTendenciaAlza,
  IconoTendenciaBaja,
  IconoAhorro,
} from '../components/ui/Icono'

export function Dashboard() {
  const r = RESUMEN_DEMO

  return (
    <div className="space-y-6">
      {/* Aviso datos demo */}
      <div className="bg-amber-50 border border-amber-200 text-amber-700 rounded-xl px-4 py-2.5 text-xs font-medium">
        📊 Mostrando datos de demostración — la conexión con el backend se activará en la siguiente fase.
      </div>

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
            descripcion="Este mes"
          />
          <TarjetaSaldo
            titulo="Total gastos"
            monto={r.totalGastos}
            icono={<IconoTendenciaBaja className="w-5 h-5" />}
            color="rojo"
            descripcion="Este mes"
          />
          <TarjetaSaldo
            titulo="Total ahorros"
            monto={r.totalAhorros}
            icono={<IconoAhorro className="w-5 h-5" />}
            color="azul"
            descripcion="Este mes"
          />
        </div>
      </section>

      {/* Gráfico + Movimientos */}
      <section aria-label="Gráfico y movimientos recientes">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3">
            <GraficoBarras datos={DATOS_GRAFICO_DEMO} />
          </div>
          <div className="lg:col-span-2">
            <MovimientosRecientes movimientos={MOVIMIENTOS_DEMO} limite={5} />
          </div>
        </div>
      </section>
    </div>
  )
}
