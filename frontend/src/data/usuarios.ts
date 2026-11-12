/**
 * Perfiles de usuario para el prototipo.
 * Cada usuario tiene sus propios movimientos, resumen y metas.
 */
import type { Movimiento, DatoGrafico, ResumenFinanciero, MetaAhorro } from '../types/domain'

export interface PerfilUsuario {
  id: string
  nombre: string
  apellido: string
  iniciales: string
  programa: string
  color: string        // color de avatar
  movimientos: Movimiento[]
  resumen: ResumenFinanciero
  datosGrafico: DatoGrafico[]
  metas: MetaAhorro[]
  categorias: string[]
}

// ─── Julian Camilo Murcia ─────────────────────────────────────────────────────

const movimientosJulian: Movimiento[] = [
  { id: 1,  tipo: 'ingreso', monto: 3200000, categoria: 'Salario',          descripcion: 'Nómina octubre',          fecha: '2026-10-01' },
  { id: 2,  tipo: 'ingreso', monto:  450000, categoria: 'Freelance',        descripcion: 'Proyecto diseño web',     fecha: '2026-10-05' },
  { id: 3,  tipo: 'gasto',   monto:  850000, categoria: 'Vivienda',         descripcion: 'Arriendo',                fecha: '2026-10-05' },
  { id: 4,  tipo: 'gasto',   monto:  210000, categoria: 'Alimentación',     descripcion: 'Mercado semanal',         fecha: '2026-10-07' },
  { id: 5,  tipo: 'ahorro',  monto:  500000, categoria: 'Fondo emergencia', descripcion: 'Ahorro mensual',          fecha: '2026-10-08' },
  { id: 6,  tipo: 'gasto',   monto:   95000, categoria: 'Transporte',       descripcion: 'Gasolina',                fecha: '2026-10-10' },
  { id: 7,  tipo: 'gasto',   monto:   78000, categoria: 'Servicios',        descripcion: 'Internet + telefonía',    fecha: '2026-10-11' },
  { id: 8,  tipo: 'ingreso', monto:  120000, categoria: 'Otros',            descripcion: 'Venta artículos usados',  fecha: '2026-10-14' },
  { id: 9,  tipo: 'gasto',   monto:  145000, categoria: 'Salud',            descripcion: 'Médico general',          fecha: '2026-10-15' },
  { id: 10, tipo: 'ahorro',  monto:  200000, categoria: 'Vacaciones',       descripcion: 'Meta viaje diciembre',    fecha: '2026-10-18' },
  { id: 11, tipo: 'gasto',   monto:   62000, categoria: 'Entretenimiento',  descripcion: 'Cine + restaurante',      fecha: '2026-10-20' },
  { id: 12, tipo: 'gasto',   monto:  185000, categoria: 'Alimentación',     descripcion: 'Domicilios semana',       fecha: '2026-10-22' },
]

const metasJulian: MetaAhorro[] = [
  { id: 1, nombre: 'Viaje a Bogotá',    descripcion: 'Vacaciones fin de año',          meta: 2000000, actual: 700000,  fechaLimite: '2026-12-20', color: '#10b981', emoji: '✈️' },
  { id: 2, nombre: 'Fondo emergencia',  descripcion: '3 meses de gastos cubiertos',    meta: 5000000, actual: 1500000, fechaLimite: '2027-06-01', color: '#3b82f6', emoji: '🛡️' },
  { id: 3, nombre: 'Laptop nueva',      descripcion: 'Para proyectos de software',     meta: 3500000, actual: 3500000, fechaLimite: '2026-10-15', color: '#8b5cf6', emoji: '💻' },
  { id: 4, nombre: 'Curso de inglés',   descripcion: 'Certificación B2',               meta: 1200000, actual: 400000,  fechaLimite: '2027-03-01', color: '#f59e0b', emoji: '📚' },
]

// ─── Jair Fernando Orellano ───────────────────────────────────────────────────

const movimientosJair: Movimiento[] = [
  { id: 1,  tipo: 'ingreso', monto: 2800000, categoria: 'Salario',          descripcion: 'Sueldo octubre',          fecha: '2026-10-01' },
  { id: 2,  tipo: 'ingreso', monto:  350000, categoria: 'Freelance',        descripcion: 'Clases particulares',     fecha: '2026-10-03' },
  { id: 3,  tipo: 'gasto',   monto:  700000, categoria: 'Vivienda',         descripcion: 'Arriendo habitación',     fecha: '2026-10-04' },
  { id: 4,  tipo: 'gasto',   monto:  180000, categoria: 'Alimentación',     descripcion: 'Supermercado',            fecha: '2026-10-06' },
  { id: 5,  tipo: 'ahorro',  monto:  300000, categoria: 'Fondo emergencia', descripcion: 'Reserva mensual',         fecha: '2026-10-07' },
  { id: 6,  tipo: 'gasto',   monto:  120000, categoria: 'Transporte',       descripcion: 'Bus mensual + moto',      fecha: '2026-10-09' },
  { id: 7,  tipo: 'gasto',   monto:   65000, categoria: 'Servicios',        descripcion: 'Plan de datos',           fecha: '2026-10-10' },
  { id: 8,  tipo: 'gasto',   monto:  250000, categoria: 'Educación',        descripcion: 'Semestre FESC',           fecha: '2026-10-12' },
  { id: 9,  tipo: 'ingreso', monto:   80000, categoria: 'Otros',            descripcion: 'Comisión venta',          fecha: '2026-10-13' },
  { id: 10, tipo: 'ahorro',  monto:  150000, categoria: 'Tecnología',       descripcion: 'Tablet para estudiar',    fecha: '2026-10-15' },
  { id: 11, tipo: 'gasto',   monto:   95000, categoria: 'Salud',            descripcion: 'Farmacia',                fecha: '2026-10-17' },
  { id: 12, tipo: 'gasto',   monto:   48000, categoria: 'Entretenimiento',  descripcion: 'Streaming + salida',      fecha: '2026-10-19' },
  { id: 13, tipo: 'gasto',   monto:  130000, categoria: 'Alimentación',     descripcion: 'Restaurante semana',      fecha: '2026-10-21' },
  { id: 14, tipo: 'ingreso', monto:  200000, categoria: 'Freelance',        descripcion: 'Diseño de logo',          fecha: '2026-10-24' },
]

const metasJair: MetaAhorro[] = [
  { id: 1, nombre: 'Tablet para estudiar', descripcion: 'Para el programa de ingeniería', meta: 1800000, actual: 150000,  fechaLimite: '2027-02-01', color: '#10b981', emoji: '📱' },
  { id: 2, nombre: 'Semestre 2027-1',      descripcion: 'Matrícula FESC',                meta: 1500000, actual: 600000,  fechaLimite: '2027-01-15', color: '#3b82f6', emoji: '🎓' },
  { id: 3, nombre: 'Fondo emergencia',     descripcion: '2 meses de gastos',             meta: 3000000, actual: 450000,  fechaLimite: '2027-07-01', color: '#8b5cf6', emoji: '🛡️' },
  { id: 4, nombre: 'Viaje a Cartagena',    descripcion: 'Vacaciones con amigos',         meta: 2500000, actual: 2500000, fechaLimite: '2026-12-01', color: '#f59e0b', emoji: '🏖️' },
]

// ─── Exportaciones ────────────────────────────────────────────────────────────

export const USUARIOS: PerfilUsuario[] = [
  {
    id: 'julian',
    nombre: 'Julian',
    apellido: 'Murcia',
    iniciales: 'JM',
    programa: 'Ingeniería de Software · FESC',
    color: 'bg-emerald-500',
    movimientos: movimientosJulian,
    resumen: {
      totalIngresos:   3770000,
      totalGastos:     1625000,
      totalAhorros:     700000,
      saldoDisponible: 1445000,
    },
    datosGrafico: [
      { nombre: 'May', ingresos: 3100000, gastos: 1800000, ahorros: 500000 },
      { nombre: 'Jun', ingresos: 3400000, gastos: 1950000, ahorros: 600000 },
      { nombre: 'Jul', ingresos: 2900000, gastos: 1600000, ahorros: 400000 },
      { nombre: 'Ago', ingresos: 3600000, gastos: 2100000, ahorros: 700000 },
      { nombre: 'Sep', ingresos: 3200000, gastos: 1750000, ahorros: 550000 },
      { nombre: 'Oct', ingresos: 3770000, gastos: 1625000, ahorros: 700000 },
    ],
    metas: metasJulian,
    categorias: ['Salario', 'Freelance', 'Otros', 'Vivienda', 'Alimentación', 'Transporte', 'Servicios', 'Salud', 'Entretenimiento', 'Fondo emergencia', 'Vacaciones'],
  },
  {
    id: 'jair',
    nombre: 'Jair',
    apellido: 'Orellano',
    iniciales: 'JO',
    programa: 'Ingeniería de Software · FESC',
    color: 'bg-blue-500',
    movimientos: movimientosJair,
    resumen: {
      totalIngresos:   3430000,
      totalGastos:     1588000,
      totalAhorros:     450000,
      saldoDisponible: 1392000,
    },
    datosGrafico: [
      { nombre: 'May', ingresos: 2800000, gastos: 1600000, ahorros: 300000 },
      { nombre: 'Jun', ingresos: 3000000, gastos: 1750000, ahorros: 350000 },
      { nombre: 'Jul', ingresos: 2600000, gastos: 1500000, ahorros: 250000 },
      { nombre: 'Ago', ingresos: 3200000, gastos: 1800000, ahorros: 400000 },
      { nombre: 'Sep', ingresos: 2900000, gastos: 1650000, ahorros: 300000 },
      { nombre: 'Oct', ingresos: 3430000, gastos: 1588000, ahorros: 450000 },
    ],
    metas: metasJair,
    categorias: ['Salario', 'Freelance', 'Otros', 'Vivienda', 'Alimentación', 'Transporte', 'Servicios', 'Salud', 'Entretenimiento', 'Educación', 'Tecnología', 'Fondo emergencia'],
  },
]

export function obtenerUsuario(id: string): PerfilUsuario {
  return USUARIOS.find(u => u.id === id) ?? USUARIOS[0]
}
