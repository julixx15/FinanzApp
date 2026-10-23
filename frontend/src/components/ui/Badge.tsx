import type { TipoMovimiento } from '../../types/domain'

const estilos: Record<TipoMovimiento, string> = {
  ingreso: 'bg-emerald-100 text-emerald-700',
  gasto:   'bg-red-100 text-red-600',
  ahorro:  'bg-blue-100 text-blue-700',
}

const etiquetas: Record<TipoMovimiento, string> = {
  ingreso: 'Ingreso',
  gasto:   'Gasto',
  ahorro:  'Ahorro',
}

interface BadgeProps {
  tipo: TipoMovimiento
}

export function Badge({ tipo }: BadgeProps) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${estilos[tipo]}`}>
      {etiquetas[tipo]}
    </span>
  )
}
