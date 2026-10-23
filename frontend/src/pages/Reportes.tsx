/**
 * Página de Reportes — datos reales desde la API.
 *
 * Muestra:
 * - KPIs: tasa de ahorro, % gastos vs ingresos, saldo neto
 * - Distribución de gastos por categoría (pie chart)
 * - Agrupación por categoría con subtotales (tabla)
 * - Reporte de gastos: cantidad, total, promedio, mayor gasto
 */

import { useReportes } from '../hooks/useReportes'
import { Card } from '../components/ui/Card'
import { Spinner } from '../components/ui/Spinner'
import { AlertaError } from '../components/ui/AlertaError'
import { EstadoVacio } from '../components/ui/EstadoVacio'
import { formatearMoneda } from '../utils/formato'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
} from 'recharts'

const COLORES = [
  '#10b981', '#3b82f6', '#f59e0b', '#ef4444',
  '#8b5cf6', '#06b6d4', '#f97316', '#84cc16',
]

function pct(valor: string | null): string {
  if (valor === null) return '—'
  return `${parseFloat(valor).toFixed(1)}%`
}

export function Reportes() {
  const { resumen, gastos, categorias, cargando, error } = useReportes()

  if (cargando) return <Spinner />

  if (error) {
    return (
      <div className="space-y-4">
        <AlertaError mensaje={`No se pudo cargar los reportes: ${error}`} />
        <p className="text-xs text-gray-400 text-center">
          Verifica que el backend esté corriendo en{' '}
          <code className="bg-gray-100 px-1 rounded">http://localhost:8000</code>
        </p>
      </div>
    )
  }

  const sinDatos = !resumen || (
    parseFloat(resumen.total_ingresos) === 0 &&
    parseFloat(resumen.total_gastos)   === 0 &&
    parseFloat(resumen.total_ahorros)  === 0
  )

  if (sinDatos) {
    return (
      <Card className="p-8">
        <EstadoVacio mensaje="Aún no hay movimientos para generar reportes. ¡Registra el primero desde Movimientos!" />
      </Card>
    )
  }

  // Datos para el pie chart: todas las categorías
  const datosPie = (categorias?.categorias ?? []).map(c => ({
    nombre: c.categoria,
    valor: parseFloat(c.subtotal),
  }))

  return (
    <div className="space-y-5">

      {/* KPIs */}
      <section aria-label="Indicadores clave" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 text-center">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
            Tasa de ahorro
          </p>
          <p className="text-3xl font-bold text-emerald-600">
            {pct(resumen?.porcentaje_ahorros ?? null)}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {resumen?.porcentaje_ahorros === null ? 'Sin ingresos registrados' : 'De los ingresos totales'}
          </p>
        </Card>

        <Card className="p-5 text-center">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
            Gasto vs ingreso
          </p>
          <p className="text-3xl font-bold text-red-500">
            {pct(resumen?.porcentaje_gastos ?? null)}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {resumen?.porcentaje_gastos === null ? 'Sin ingresos registrados' : 'Del ingreso total'}
          </p>
        </Card>

        <Card className="p-5 text-center">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
            Saldo neto
          </p>
          <p className="text-3xl font-bold text-gray-800">
            {formatearMoneda(parseFloat(resumen?.saldo_disponible ?? '0'))}
          </p>
          <p className="text-xs text-gray-400 mt-1">Disponible</p>
        </Card>
      </section>

      {/* Reporte de gastos */}
      {gastos && gastos.cantidad > 0 && (
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Reporte de gastos</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-800">{gastos.cantidad}</p>
              <p className="text-xs text-gray-400 mt-1">Total gastos</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-500">
                {formatearMoneda(parseFloat(gastos.total))}
              </p>
              <p className="text-xs text-gray-400 mt-1">Suma total</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-700">
                {formatearMoneda(parseFloat(gastos.promedio))}
              </p>
              <p className="text-xs text-gray-400 mt-1">Promedio</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-500">
                {gastos.mayor_gasto
                  ? formatearMoneda(parseFloat(gastos.mayor_gasto.monto))
                  : '—'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Mayor gasto{gastos.mayor_gasto ? ` (${gastos.mayor_gasto.categoria})` : ''}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Gráfico + Tabla de categorías */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Pie chart */}
        {datosPie.length > 0 && (
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">
              Distribución por categoría
            </h2>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={datosPie}
                  dataKey="valor"
                  nameKey="nombre"
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  label={({ nombre, percent }: { nombre: string; percent: number }) =>
                    `${nombre} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {datosPie.map((_, i) => (
                    <Cell key={i} fill={COLORES[i % COLORES.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [
                    new Intl.NumberFormat('es-CO', {
                      style: 'currency', currency: 'COP', maximumFractionDigits: 0,
                    }).format(value),
                  ]}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Tabla de subtotales por categoría */}
        {categorias && categorias.total_categorias > 0 && (
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">
              Subtotales por categoría
              <span className="ml-2 text-xs font-normal text-gray-400">
                ({categorias.total_categorias} categorías)
              </span>
            </h2>
            <div className="overflow-auto max-h-64">
              <table className="w-full text-sm" aria-label="Subtotales por categoría">
                <thead>
                  <tr className="text-xs text-gray-400 uppercase border-b border-gray-100">
                    <th className="text-left py-2 font-semibold">Categoría</th>
                    <th className="text-center py-2 font-semibold">Movs.</th>
                    <th className="text-right py-2 font-semibold">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {categorias.categorias.map((c, i) => (
                    <tr key={i}>
                      <td className="py-2 text-gray-800 flex items-center gap-2">
                        <span
                          className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: COLORES[i % COLORES.length] }}
                          aria-hidden="true"
                        />
                        {c.categoria}
                      </td>
                      <td className="py-2 text-center text-gray-500">{c.cantidad}</td>
                      <td className="py-2 text-right font-medium text-gray-800">
                        {formatearMoneda(parseFloat(c.subtotal))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {/* Nota sobre gráfico de tendencia */}
      <p className="text-xs text-gray-400 text-center">
        El gráfico de tendencia mensual estará disponible en la Fase 4 (reportes históricos).
      </p>
    </div>
  )
}
