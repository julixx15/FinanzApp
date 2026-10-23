export type TipoMovimiento = 'ingreso' | 'gasto' | 'ahorro'

export interface Movimiento {
  id: number
  tipo: TipoMovimiento
  monto: number
  categoria: string
  descripcion: string
  fecha: string // ISO date string YYYY-MM-DD
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

export type PeriodoFiltro = 'este-mes' | 'mes-anterior' | 'ultimos-3-meses' | 'este-año'
