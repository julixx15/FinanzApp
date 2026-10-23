import type { ReactNode } from 'react'
import { Card } from '../ui/Card'
import { formatearMoneda } from '../../utils/formato'

interface TarjetaSaldoProps {
  titulo: string
  monto: number
  icono: ReactNode
  color: 'esmeralda' | 'rojo' | 'azul' | 'gris'
  descripcion?: string
}

const colores = {
  esmeralda: {
    fondo:   'bg-emerald-50',
    texto:   'text-emerald-600',
    monto:   'text-emerald-700',
    iconoBg: 'bg-emerald-100',
  },
  rojo: {
    fondo:   'bg-red-50',
    texto:   'text-red-500',
    monto:   'text-red-700',
    iconoBg: 'bg-red-100',
  },
  azul: {
    fondo:   'bg-blue-50',
    texto:   'text-blue-500',
    monto:   'text-blue-700',
    iconoBg: 'bg-blue-100',
  },
  gris: {
    fondo:   'bg-gray-50',
    texto:   'text-gray-500',
    monto:   'text-gray-800',
    iconoBg: 'bg-gray-100',
  },
}

export function TarjetaSaldo({ titulo, monto, icono, color, descripcion }: TarjetaSaldoProps) {
  const c = colores[color]
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-xs font-semibold uppercase tracking-wide ${c.texto} mb-1`}>
            {titulo}
          </p>
          <p className={`text-2xl font-bold ${c.monto}`}>
            {formatearMoneda(monto)}
          </p>
          {descripcion && (
            <p className="text-xs text-gray-400 mt-1">{descripcion}</p>
          )}
        </div>
        <div className={`w-10 h-10 rounded-xl ${c.iconoBg} ${c.texto} flex items-center justify-center shrink-0`}>
          {icono}
        </div>
      </div>
    </Card>
  )
}
