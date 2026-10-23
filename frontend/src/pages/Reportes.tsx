import { MOVIMIENTOS_DEMO, RESUMEN_DEMO, DATOS_GRAFICO_DEMO } from '../data/demo'
import { Card } from '../components/ui/Card'
import { formatearMoneda } from '../utils/formato'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts'

const COLORES_CATEGORIA = [
  '#10b981', '#3b82f6', '#f59e0b', '#ef4444',
  '#8b5cf6', '#06b6d4', '#f97316', '#84cc16',
]

export function Reportes() {
  // Distribución de gastos por categoría
  const gastos = MOVIMIENTOS_DEMO.filter(m => m.tipo === 'gasto')
  const porCategoria: Record<string, number> = {}
  for (const g of gastos) {
    porCategoria[g.categoria] = (porCategoria[g.categoria] ?? 0) + g.monto
  }
  const datosDistribucion = Object.entries(porCategoria).map(([nombre, valor]) => ({
    nombre,
    valor,
  }))

  const r = RESUMEN_DEMO
  const porcentajeAhorro = ((r.totalAhorros / r.totalIngresos) * 100).toFixed(1)

  return (
    <div className="space-y-5">
      {/* Aviso demo */}
      <div className="bg-amber-50 border border-amber-200 text-amber-700 rounded-xl px-4 py-2.5 text-xs font-medium">
        📊 Datos de demostración — reporte del mes actual.
      </div>

      {/* KPIs */}
      <section aria-label="Indicadores clave" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 text-center">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
            Tasa de ahorro
          </p>
          <p className="text-3xl font-bold text-emerald-600">{porcentajeAhorro}%</p>
          <p className="text-xs text-gray-400 mt-1">De los ingresos totales</p>
        </Card>
        <Card className="p-5 text-center">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
            Gasto vs ingreso
          </p>
          <p className="text-3xl font-bold text-red-500">
            {((r.totalGastos / r.totalIngresos) * 100).toFixed(1)}%
          </p>
          <p className="text-xs text-gray-400 mt-1">Del ingreso total</p>
        </Card>
        <Card className="p-5 text-center">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
            Saldo neto
          </p>
          <p className="text-3xl font-bold text-gray-800">
            {formatearMoneda(r.saldoDisponible)}
          </p>
          <p className="text-xs text-gray-400 mt-1">Disponible este mes</p>
        </Card>
      </section>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Línea de tendencia */}
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Tendencia de ingresos y gastos</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={DATOS_GRAFICO_DEMO} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="nombre" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis
                tickFormatter={v => `$${(v / 1_000_000).toFixed(1)}M`}
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                width={52}
              />
              <Tooltip
                formatter={(value: number) => [
                  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value),
                ]}
                contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: 12 }}
              />
              <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ fontSize: 12, color: '#6b7280' }}>{v}</span>} />
              <Line type="monotone" dataKey="ingresos" name="Ingresos" stroke="#10b981" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="gastos"   name="Gastos"   stroke="#f87171" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Torta de gastos por categoría */}
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Distribución de gastos</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={datosDistribucion}
                dataKey="valor"
                nameKey="nombre"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ nombre, percent }) =>
                  `${nombre} ${(percent * 100).toFixed(0)}%`
                }
                labelLine={false}
              >
                {datosDistribucion.map((_, i) => (
                  <Cell key={i} fill={COLORES_CATEGORIA[i % COLORES_CATEGORIA.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [
                  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value),
                ]}
                contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  )
}
