import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { DatoGrafico } from '../../types/domain'
import { formatearMonedaCorta } from '../../utils/formato'
import { Card } from '../ui/Card'

interface GraficoBarrasProps {
  datos: DatoGrafico[]
}

export function GraficoBarras({ datos }: GraficoBarrasProps) {
  return (
    <Card className="p-5">
      <h2 className="text-sm font-semibold text-gray-700 mb-4">
        Evolución mensual
      </h2>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={datos} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="nombre"
            tick={{ fontSize: 12, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatearMonedaCorta}
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
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(value) => <span style={{ fontSize: 12, color: '#6b7280' }}>{value}</span>}
          />
          <Bar dataKey="ingresos" name="Ingresos" fill="#10b981" radius={[4, 4, 0, 0]} />
          <Bar dataKey="gastos"   name="Gastos"   fill="#f87171" radius={[4, 4, 0, 0]} />
          <Bar dataKey="ahorros"  name="Ahorros"  fill="#60a5fa" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}
