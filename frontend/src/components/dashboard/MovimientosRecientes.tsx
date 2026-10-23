import type { Movimiento } from '../../types/domain'
import { Badge } from '../ui/Badge'
import { Card } from '../ui/Card'
import { EstadoVacio } from '../ui/EstadoVacio'
import { formatearMoneda, formatearFecha } from '../../utils/formato'

interface MovimientosRecientesProps {
  movimientos: Movimiento[]
  limite?: number
}

export function MovimientosRecientes({ movimientos, limite = 5 }: MovimientosRecientesProps) {
  const recientes = movimientos.slice(0, limite)

  return (
    <Card className="p-5">
      <h2 className="text-sm font-semibold text-gray-700 mb-4">
        Movimientos recientes
      </h2>

      {recientes.length === 0 ? (
        <EstadoVacio />
      ) : (
        <ul className="divide-y divide-gray-50">
          {recientes.map(mov => (
            <li key={mov.id} className="flex items-center justify-between py-3 gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="shrink-0">
                  <Badge tipo={mov.tipo} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {mov.descripcion}
                  </p>
                  <p className="text-xs text-gray-400">
                    {mov.categoria} · {formatearFecha(mov.fecha)}
                  </p>
                </div>
              </div>
              <span
                className={`text-sm font-semibold shrink-0 ${
                  mov.tipo === 'ingreso' ? 'text-emerald-600' :
                  mov.tipo === 'gasto'   ? 'text-red-500' :
                  'text-blue-600'
                }`}
              >
                {mov.tipo === 'ingreso' ? '+' : '−'}{formatearMoneda(mov.monto)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
