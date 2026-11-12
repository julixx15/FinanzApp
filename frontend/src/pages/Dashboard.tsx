import type { PerfilUsuario } from '../data/usuarios'
import { TarjetaSaldo } from '../components/dashboard/TarjetaSaldo'
import { GraficoBarras } from '../components/dashboard/GraficoBarras'
import { MovimientosRecientes } from '../components/dashboard/MovimientosRecientes'
import { Card } from '../components/ui/Card'
import { formatearMoneda } from '../utils/formato'
import { IconoSaldo, IconoTendenciaAlza, IconoTendenciaBaja, IconoAhorro } from '../components/ui/Icono'

function ResumenMetas({ usuario }: { usuario: PerfilUsuario }) {
  const enProgreso = usuario.metas.filter(m => m.actual < m.meta)
  if (enProgreso.length === 0) return null
  return (
    <Card className="p-5">
      <h2 className="text-sm font-semibold text-gray-700 mb-4">Metas en progreso</h2>
      <ul className="space-y-3">
        {enProgreso.slice(0, 3).map(m => {
          const pct = Math.min((m.actual / m.meta) * 100, 100)
          return (
            <li key={m.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 font-medium text-gray-700">
                  <span>{m.emoji}</span> {m.nombre}
                </span>
                <span className="text-xs text-gray-400">{pct.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div className="h-2 rounded-full" style={{ width: `${pct}%`, backgroundColor: m.color }} />
              </div>
              <p className="text-xs text-gray-400">{formatearMoneda(m.actual)} de {formatearMoneda(m.meta)}</p>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}

function DistribucionGastos({ usuario }: { usuario: PerfilUsuario }) {
  const gastos = usuario.movimientos.filter(m => m.tipo === 'gasto')
  const total = gastos.reduce((s, m) => s + m.monto, 0)
  const porCat: Record<string, number> = {}
  for (const g of gastos) porCat[g.categoria] = (porCat[g.categoria] ?? 0) + g.monto
  const ordenado = Object.entries(porCat).sort((a, b) => b[1] - a[1]).slice(0, 4)
  const colores = ['#ef4444', '#f97316', '#f59e0b', '#8b5cf6']
  return (
    <Card className="p-5">
      <h2 className="text-sm font-semibold text-gray-700 mb-4">Top gastos del mes</h2>
      <ul className="space-y-3">
        {ordenado.map(([cat, monto], i) => (
          <li key={cat} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-700 font-medium">{cat}</span>
              <span className="text-gray-500 text-xs">{formatearMoneda(monto)}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div className="h-1.5 rounded-full" style={{ width: `${(monto / total) * 100}%`, backgroundColor: colores[i] }} />
            </div>
          </li>
        ))}
      </ul>
    </Card>
  )
}

interface Props { usuario: PerfilUsuario }

export function Dashboard({ usuario }: Props) {
  const r = usuario.resumen
  return (
    <div className="space-y-5">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl p-5 text-white">
        <p className="text-emerald-100 text-xs font-medium mb-1">Octubre 2026</p>
        <h2 className="text-2xl font-bold">Hola, {usuario.nombre} 👋</h2>
        <p className="text-emerald-100 text-sm mt-1">
          Tu saldo disponible este mes es{' '}
          <span className="text-white font-bold">{formatearMoneda(r.saldoDisponible)}</span>
        </p>
      </div>

      {/* Tarjetas */}
      <section aria-label="Resumen financiero">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <TarjetaSaldo titulo="Saldo disponible" monto={r.saldoDisponible} icono={<IconoSaldo className="w-5 h-5" />} color="esmeralda" descripcion="Ingresos − gastos − ahorros" />
          <TarjetaSaldo titulo="Total ingresos"   monto={r.totalIngresos}   icono={<IconoTendenciaAlza className="w-5 h-5" />} color="gris"      descripcion="Este mes" />
          <TarjetaSaldo titulo="Total gastos"     monto={r.totalGastos}     icono={<IconoTendenciaBaja className="w-5 h-5" />} color="rojo"      descripcion="Este mes" />
          <TarjetaSaldo titulo="Total ahorros"    monto={r.totalAhorros}    icono={<IconoAhorro className="w-5 h-5" />}        color="azul"      descripcion="Este mes" />
        </div>
      </section>

      {/* Gráfico + Movimientos */}
      <section>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3"><GraficoBarras datos={usuario.datosGrafico} /></div>
          <div className="lg:col-span-2"><MovimientosRecientes movimientos={usuario.movimientos} limite={5} /></div>
        </div>
      </section>

      {/* Metas + distribución */}
      <section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ResumenMetas usuario={usuario} />
          <DistribucionGastos usuario={usuario} />
        </div>
      </section>
    </div>
  )
}
