/**
 * Datos de demostración centralizados.
 * Se reemplazarán por llamadas a la API en fases posteriores.
 */
import type { Movimiento, DatoGrafico, ResumenFinanciero } from '../types/domain'

export const MOVIMIENTOS_DEMO: Movimiento[] = [
  { id: 1, tipo: 'ingreso',  monto: 3200000, categoria: 'Salario',      descripcion: 'Nómina octubre',         fecha: '2026-10-01' },
  { id: 2, tipo: 'ingreso',  monto:  450000, categoria: 'Freelance',    descripcion: 'Proyecto diseño web',    fecha: '2026-10-05' },
  { id: 3, tipo: 'gasto',    monto:  850000, categoria: 'Vivienda',      descripcion: 'Arriendo',               fecha: '2026-10-05' },
  { id: 4, tipo: 'gasto',    monto:  210000, categoria: 'Alimentación',  descripcion: 'Mercado semanal',        fecha: '2026-10-07' },
  { id: 5, tipo: 'ahorro',   monto:  500000, categoria: 'Fondo emergencia', descripcion: 'Ahorro mensual',     fecha: '2026-10-08' },
  { id: 6, tipo: 'gasto',    monto:   95000, categoria: 'Transporte',    descripcion: 'Gasolina',               fecha: '2026-10-10' },
  { id: 7, tipo: 'gasto',    monto:   78000, categoria: 'Servicios',     descripcion: 'Internet + telefonía',  fecha: '2026-10-11' },
  { id: 8, tipo: 'ingreso',  monto:  120000, categoria: 'Otros',         descripcion: 'Venta artículos usados', fecha: '2026-10-14' },
  { id: 9, tipo: 'gasto',    monto:  145000, categoria: 'Salud',         descripcion: 'Médico general',         fecha: '2026-10-15' },
  { id: 10, tipo: 'ahorro',  monto:  200000, categoria: 'Vacaciones',    descripcion: 'Meta viaje diciembre',   fecha: '2026-10-18' },
  { id: 11, tipo: 'gasto',   monto:   62000, categoria: 'Entretenimiento', descripcion: 'Cine + restaurante',  fecha: '2026-10-20' },
  { id: 12, tipo: 'gasto',   monto:  185000, categoria: 'Alimentación',  descripcion: 'Domicilios semana',      fecha: '2026-10-22' },
]

export const RESUMEN_DEMO: ResumenFinanciero = {
  totalIngresos:  3770000,
  totalGastos:    1625000,
  totalAhorros:    700000,
  saldoDisponible: 1445000,
}

export const DATOS_GRAFICO_DEMO: DatoGrafico[] = [
  { nombre: 'May', ingresos: 3100000, gastos: 1800000, ahorros: 500000 },
  { nombre: 'Jun', ingresos: 3400000, gastos: 1950000, ahorros: 600000 },
  { nombre: 'Jul', ingresos: 2900000, gastos: 1600000, ahorros: 400000 },
  { nombre: 'Ago', ingresos: 3600000, gastos: 2100000, ahorros: 700000 },
  { nombre: 'Sep', ingresos: 3200000, gastos: 1750000, ahorros: 550000 },
  { nombre: 'Oct', ingresos: 3770000, gastos: 1625000, ahorros: 700000 },
]

export const CATEGORIAS_DEMO: string[] = [
  'Salario', 'Freelance', 'Otros',
  'Vivienda', 'Alimentación', 'Transporte',
  'Servicios', 'Salud', 'Entretenimiento',
  'Fondo emergencia', 'Vacaciones',
]
