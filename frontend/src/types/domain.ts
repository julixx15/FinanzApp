export type TipoMovimiento = 'ingreso' | 'gasto' | 'ahorro'

export interface Movimiento {
  id: number
  tipo: TipoMovimiento
  monto: number
  categoria: string
  descripcion: string
  fecha: string
}

export interface ResumenFinanciero {
  totalIngresos: number
  totalGastos: number
  totalAhorros: number
  saldoDisponible: number
}

export interface DatoGrafico {
  nombre: string
  ingresos: number
  gastos: number
  ahorros: number
}

export interface MetaAhorro {
  id: number
  nombre: string
  descripcion: string
  meta: number
  actual: number
  fechaLimite: string
  color: string
  emoji: string
}

export type PeriodoFiltro = 'este-mes' | 'mes-anterior' | 'ultimos-3-meses' | 'este-año'
