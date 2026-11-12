import { useState } from 'react'
import { analizarFinanzas } from '../data/coach'
import type { Consejo } from '../data/coach'
import type { PerfilUsuario } from '../data/usuarios'
import { Card } from '../components/ui/Card'
import { formatearMoneda } from '../utils/formato'

const NIVEL_CFG = {
  critico:     { color: 'text-red-600',     bg: 'bg-red-50',     borde: 'border-red-200',     emoji: '🚨' },
  'en riesgo': { color: 'text-orange-600',  bg: 'bg-orange-50',  borde: 'border-orange-200',  emoji: '⚠️' },
  estable:     { color: 'text-yellow-600',  bg: 'bg-yellow-50',  borde: 'border-yellow-200',  emoji: '📊' },
  saludable:   { color: 'text-emerald-600', bg: 'bg-emerald-50', borde: 'border-emerald-200', emoji: '✅' },
  excelente:   { color: 'text-emerald-700', bg: 'bg-emerald-50', borde: 'border-emerald-200', emoji: '🏆' },
}

const TIPO_CFG = {
  alerta:     { bg: 'bg-red-50',     borde: 'border-red-200',     icono: '🚨', label: 'Alerta',     lc: 'text-red-600'     },
  tip:        { bg: 'bg-blue-50',    borde: 'border-blue-200',    icono: '💡', label: 'Consejo',    lc: 'text-blue-600'    },
  logro:      { bg: 'bg-emerald-50', borde: 'border-emerald-200', icono: '🏅', label: 'Logro',      lc: 'text-emerald-600' },
  prediccion: { bg: 'bg-purple-50',  borde: 'border-purple-200',  icono: '🔮', label: 'Predicción', lc: 'text-purple-600'  },
}

function TarjetaConsejo({ consejo }: { consejo: Consejo }) {
  const [exp, setExp] = useState(false)
  const c = TIPO_CFG[consejo.tipo]
  return (
    <div className={`rounded-xl border p-4 ${c.bg} ${c.borde}`}>
      <div className="flex items-start gap-3">
        <span className="text-xl shrink-0 mt-0.5">{c.icono}</span>
        <div className="flex-1 min-w-0">
          <span className={`text-xs font-semibold uppercase tracking-wide ${c.lc}`}>{c.label}</span>
          <p className="text-sm font-semibold text-gray-800 mt-0.5">{consejo.titulo}</p>
          <p className="text-sm text-gray-600 mt-1">{consejo.mensaje}</p>
          {consejo.accion && (
            <div className="mt-2">
              {!exp
                ? <button onClick={() => setExp(true)} className={`text-xs font-medium ${c.lc} hover:underline`}>Ver qué puedo hacer →</button>
                : <div className="mt-2 p-3 bg-white rounded-lg border border-white/60">
                    <p className="text-xs font-semibold text-gray-700 mb-1">¿Qué puedo hacer?</p>
                    <p className="text-xs text-gray-600">{consejo.accion}</p>
                    <button onClick={() => setExp(false)} className="text-xs text-gray-400 hover:text-gray-600 mt-2">Cerrar</button>
                  </div>
              }
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function PuntajeCircular({ puntaje }: { puntaje: number }) {
  const r = 54, circ = 2 * Math.PI * r
  const color = puntaje >= 80 ? '#10b981' : puntaje >= 60 ? '#3b82f6' : puntaje >= 40 ? '#f59e0b' : '#ef4444'
  return (
    <div className="relative w-32 h-32 mx-auto">
      <svg className="w-32 h-32 -rotate-90" viewBox="0 0 128 128">
        <circle cx="64" cy="64" r={r} fill="none" stroke="#f3f4f6" strokeWidth="10" />
        <circle cx="64" cy="64" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={circ} strokeDashoffset={circ - (puntaje / 100) * circ}
          strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-gray-900">{puntaje}</span>
        <span className="text-xs text-gray-400">/ 100</span>
      </div>
    </div>
  )
}

interface Props { usuario: PerfilUsuario }

export function Coach({ usuario }: Props) {
  const a = analizarFinanzas(usuario.movimientos, usuario.resumen)
  const nivel = NIVEL_CFG[a.nivelFinanciero]

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Cabecera */}
      <Card className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shrink-0">
            <span className="text-2xl">🤖</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Coach Financiero</h2>
            <p className="text-sm text-gray-500 mt-1">
              Analizando las finanzas de <span className="font-semibold text-gray-700">{usuario.nombre} {usuario.apellido}</span> — consejos personalizados, predicciones y guía para ahorrar más.
            </p>
          </div>
        </div>
      </Card>

      {/* Puntaje + predicciones */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="p-6 flex flex-col items-center gap-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Puntaje financiero</p>
          <PuntajeCircular puntaje={a.puntaje} />
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-semibold ${nivel.bg} ${nivel.borde} ${nivel.color}`}>
            <span>{nivel.emoji}</span>
            <span className="capitalize">{a.nivelFinanciero}</span>
          </div>
        </Card>

        <Card className="p-6 space-y-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Predicciones del próximo mes</p>
          {[
            { label: 'Gasto estimado',   val: formatearMoneda(a.prediccionGastoProximoMes), color: 'text-red-500' },
            { label: 'Saldo proyectado', val: formatearMoneda(a.prediccionSaldoProximoMes), color: a.prediccionSaldoProximoMes >= 0 ? 'text-emerald-600' : 'text-red-500' },
            { label: 'Tasa de ahorro',   val: `${a.tasaAhorro.toFixed(1)}%`,                color: 'text-blue-600' },
          ].map(item => (
            <div key={item.label} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
              <span className="text-sm text-gray-600">{item.label}</span>
              <span className={`text-sm font-semibold ${item.color}`}>{item.val}</span>
            </div>
          ))}
          {a.diasHastaCero !== null && (
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600">Días con saldo actual</span>
              <span className={`text-sm font-semibold ${a.diasHastaCero < 20 ? 'text-red-500' : 'text-gray-700'}`}>~{a.diasHastaCero} días</span>
            </div>
          )}
        </Card>
      </div>

      {/* Mayor gasto */}
      <Card className="p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
            <span className="text-lg">📌</span>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Categoría con mayor gasto</p>
            <p className="text-base font-bold text-gray-900">{a.categoriaTopGasto}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-xs text-gray-400">Este mes</p>
            <p className="text-base font-bold text-red-500">{formatearMoneda(a.montoTopGasto)}</p>
          </div>
        </div>
      </Card>

      {/* Consejos */}
      <section>
        <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Consejos para {usuario.nombre} ({a.consejos.length})</h2>
        <div className="space-y-3">{a.consejos.map(c => <TarjetaConsejo key={c.id} consejo={c} />)}</div>
      </section>

      {/* Regla 50/30/20 */}
      <Card className="p-5 bg-gradient-to-br from-emerald-50 to-blue-50 border-emerald-200">
        <h3 className="text-sm font-bold text-gray-800 mb-3">📐 Regla de oro: 50 / 30 / 20</h3>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { pct: '50%', etiqueta: 'Necesidades', color: 'bg-emerald-500', ideal: usuario.resumen.totalIngresos * 0.5 },
            { pct: '30%', etiqueta: 'Deseos',      color: 'bg-blue-500',    ideal: usuario.resumen.totalIngresos * 0.3 },
            { pct: '20%', etiqueta: 'Ahorro',      color: 'bg-purple-500',  ideal: usuario.resumen.totalIngresos * 0.2 },
          ].map(item => (
            <div key={item.pct} className="text-center">
              <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center mx-auto mb-2`}>
                <span className="text-white font-bold text-sm">{item.pct}</span>
              </div>
              <p className="text-xs font-semibold text-gray-700">{item.etiqueta}</p>
              <p className="text-xs text-gray-500 mt-0.5">{formatearMoneda(item.ideal)}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 text-center">
          Basado en los ingresos de {usuario.nombre}: {formatearMoneda(usuario.resumen.totalIngresos)}
        </p>
      </Card>
    </div>
  )
}
