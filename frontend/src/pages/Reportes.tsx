import { useMovimientos } from '../hooks/useMovimientos'
import { BannerEstado } from '../components/ui/BannerEstado'
import { Spinner } from '../components/ui/Spinner'
import { Card } from '../components/ui/Card'
import { formatearMoneda } from '../utils/formato'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts'
import type { PerfilUsuario } from '../data/usuarios'

const COLORES = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#84cc16']

interface Props { usuario: PerfilUsuario }

export function Reportes({ usuario: _usuario }: Props) {
  const { movimientos, resumen, datosGrafico, estado, recargar } = useMovimientos()

  if (estado === 'cargando') return <Spinner />

  const gastos = movimientos.filter(m => m.tipo === 'gasto')
  const porCat: Record<string, number> = {}
  for (const g of gastos) porCat[g.categoria] = (porCat[g.categoria] ?? 0) + g.monto
  const dist = Object.entries(porCat).map(([nombre, valor]) => ({ nombre, valor }))

  const r = resumen
  const pctAhorro = r.totalIngresos > 0 ? ((r.totalAhorros / r.totalIngresos) * 100).toFixed(1) : '0.0'
  const fmt = (v: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v)

  return (
    <div className="space-y-5">
      <BannerEstado estado={estado} onRecargar={recargar} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 text-center">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Tasa de ahorro</p>
          <p className="text-3xl font-bold text-emerald-600">{pctAhorro}%</p>
          <p className="text-xs text-gray-400 mt-1">De los ingresos totales</p>
        </Card>
        <Card className="p-5 text-center">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Gasto vs ingreso</p>
          <p className="text-3xl font-bold text-red-500">
            {r.totalIngresos > 0 ? ((r.totalGastos / r.totalIngresos) * 100).toFixed(1) : '0.0'}%
          </p>
          <p className="text-xs text-gray-400 mt-1">Del ingreso total</p>
        </Card>
        <Card className="p-5 text-center">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Saldo neto</p>
          <p className="text-3xl font-bold text-gray-800">{formatearMoneda(r.saldoDisponible)}</p>
          <p className="text-xs text-gray-400 mt-1">Disponible este mes</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Tendencia de ingresos y gastos</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={datosGrafico} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="nombre" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => `$${(v / 1_000_000).toFixed(1)}M`} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={52} />
              <Tooltip formatter={(v: number) => [fmt(v)]} contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: 12 }} />
              <Legend iconType="circle" iconSize={8} formatter={v => <span style={{ fontSize: 12, color: '#6b7280' }}>{v}</span>} />
              <Line type="monotone" dataKey="ingresos" name="Ingresos" stroke="#10b981" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="gastos"   name="Gastos"   stroke="#f87171" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Distribución de gastos</h2>
          {dist.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-16">Sin gastos registrados</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={dist} dataKey="valor" nameKey="nombre" cx="50%" cy="50%" outerRadius={80}
                  label={({ nombre, percent }) => `${nombre} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {dist.map((_, i) => <Cell key={i} fill={COLORES[i % COLORES.length]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => [fmt(v)]} contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>
    </div>
  )
}
