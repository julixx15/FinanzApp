/**
 * Lógica del Coach Financiero — sin dependencias externas.
 * Analiza los movimientos demo y genera consejos personalizados,
 * predicciones y metas sugeridas.
 */
import type { Movimiento, ResumenFinanciero } from '../types/domain'

export interface Consejo {
  id: string
  tipo: 'alerta' | 'tip' | 'logro' | 'prediccion'
  titulo: string
  mensaje: string
  accion?: string
  prioridad: number // 1 = alta, 2 = media, 3 = baja
}

export interface AnalisisCoach {
  consejos: Consejo[]
  tasaAhorro: number
  prediccionGastoProximoMes: number
  prediccionSaldoProximoMes: number
  categoriaTopGasto: string
  montoTopGasto: number
  diasHastaCero: number | null
  puntaje: number // 0-100
  nivelFinanciero: 'critico' | 'en riesgo' | 'estable' | 'saludable' | 'excelente'
}

export function analizarFinanzas(
  movimientos: Movimiento[],
  resumen: ResumenFinanciero,
): AnalisisCoach {
  const tasaAhorro = resumen.totalIngresos > 0
    ? (resumen.totalAhorros / resumen.totalIngresos) * 100
    : 0

  // Categoría con más gastos
  const porCategoria: Record<string, number> = {}
  for (const m of movimientos.filter(m => m.tipo === 'gasto')) {
    porCategoria[m.categoria] = (porCategoria[m.categoria] ?? 0) + m.monto
  }
  const [categoriaTopGasto, montoTopGasto] = Object.entries(porCategoria)
    .sort((a, b) => b[1] - a[1])[0] ?? ['Sin datos', 0]

  // Predicción simple: promedio de los últimos meses × 1.02 (inflación leve)
  const prediccionGasto = Math.round(resumen.totalGastos * 1.02)
  const prediccionSaldo = Math.round(resumen.totalIngresos - prediccionGasto - resumen.totalAhorros)

  // Días hasta que el saldo llegue a cero con gasto diario actual
  const gastoDiario = resumen.totalGastos / 30
  const diasHastaCero = gastoDiario > 0
    ? Math.floor(resumen.saldoDisponible / gastoDiario)
    : null

  // Puntaje financiero
  let puntaje = 50
  if (tasaAhorro >= 20) puntaje += 20
  else if (tasaAhorro >= 10) puntaje += 10
  else if (tasaAhorro < 5) puntaje -= 15

  const ratioGasto = resumen.totalIngresos > 0
    ? resumen.totalGastos / resumen.totalIngresos
    : 1
  if (ratioGasto < 0.5) puntaje += 20
  else if (ratioGasto < 0.7) puntaje += 10
  else if (ratioGasto > 0.9) puntaje -= 20

  if (resumen.saldoDisponible > 0) puntaje += 10
  puntaje = Math.max(0, Math.min(100, puntaje))

  const nivelFinanciero =
    puntaje >= 80 ? 'excelente' :
    puntaje >= 60 ? 'saludable' :
    puntaje >= 40 ? 'estable'   :
    puntaje >= 20 ? 'en riesgo' : 'critico'

  // Generar consejos personalizados
  const consejos: Consejo[] = []

  if (tasaAhorro < 10) {
    consejos.push({
      id: 'ahorro-bajo',
      tipo: 'alerta',
      titulo: 'Tu tasa de ahorro es baja',
      mensaje: `Solo estás ahorrando el ${tasaAhorro.toFixed(1)}% de tus ingresos. Los expertos recomiendan al menos el 20%.`,
      accion: 'Intenta reducir gastos en entretenimiento o comida y destinar esa diferencia al ahorro.',
      prioridad: 1,
    })
  } else if (tasaAhorro >= 20) {
    consejos.push({
      id: 'ahorro-bien',
      tipo: 'logro',
      titulo: '¡Excelente tasa de ahorro!',
      mensaje: `Estás ahorrando el ${tasaAhorro.toFixed(1)}% de tus ingresos. Sigues la regla 50/30/20.`,
      prioridad: 3,
    })
  }

  if (montoTopGasto > resumen.totalIngresos * 0.3) {
    consejos.push({
      id: 'gasto-alto',
      tipo: 'alerta',
      titulo: `Gasto elevado en ${categoriaTopGasto}`,
      mensaje: `Estás gastando el ${((montoTopGasto / resumen.totalIngresos) * 100).toFixed(0)}% de tus ingresos solo en ${categoriaTopGasto}.`,
      accion: `Revisa si puedes reducir el gasto en ${categoriaTopGasto}. Busca alternativas más económicas.`,
      prioridad: 1,
    })
  }

  if (diasHastaCero !== null && diasHastaCero < 20) {
    consejos.push({
      id: 'dias-criticos',
      tipo: 'alerta',
      titulo: 'Saldo en riesgo',
      mensaje: `Con tu ritmo de gasto actual, tu saldo disponible se agotará en aproximadamente ${diasHastaCero} días.`,
      accion: 'Reduce gastos no esenciales esta semana o busca un ingreso extra.',
      prioridad: 1,
    })
  }

  consejos.push({
    id: 'regla-50-30-20',
    tipo: 'tip',
    titulo: 'Regla 50/30/20',
    mensaje: 'Destina el 50% a necesidades, el 30% a deseos y el 20% a ahorro e inversión.',
    accion: `Según tus ingresos de ${new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(resumen.totalIngresos)}, deberías ahorrar al menos ${new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(resumen.totalIngresos * 0.2)} al mes.`,
    prioridad: 2,
  })

  consejos.push({
    id: 'fondo-emergencia',
    tipo: 'tip',
    titulo: 'Fondo de emergencia',
    mensaje: 'Deberías tener entre 3 y 6 meses de gastos guardados como fondo de emergencia.',
    accion: `Tu fondo ideal sería entre ${new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(resumen.totalGastos * 3)} y ${new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(resumen.totalGastos * 6)}.`,
    prioridad: 2,
  })

  if (prediccionSaldo < resumen.saldoDisponible * 0.8) {
    consejos.push({
      id: 'prediccion-baja',
      tipo: 'prediccion',
      titulo: 'Próximo mes podría ser ajustado',
      mensaje: `Basado en tu historial, el próximo mes podrías terminar con aproximadamente ${new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(prediccionSaldo)}.`,
      accion: 'Planifica tus gastos con anticipación para evitar sorpresas.',
      prioridad: 2,
    })
  }

  return {
    consejos: consejos.sort((a, b) => a.prioridad - b.prioridad),
    tasaAhorro,
    prediccionGastoProximoMes: prediccionGasto,
    prediccionSaldoProximoMes: prediccionSaldo,
    categoriaTopGasto,
    montoTopGasto,
    diasHastaCero,
    puntaje,
    nivelFinanciero,
  }
}
