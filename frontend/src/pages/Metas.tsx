import { METAS_DEMO } from '../data/demo'
import { Card } from '../components/ui/Card'
import { formatearMoneda } from '../utils/formato'
import type { MetaAhorro } from '../types/domain'

function BarraProgreso({ actual, meta, color }: { actual: number; meta: number; color: string }) {
  const pct = Math.min((actual / meta) * 100, 100)
  const completada = pct >= 100
  return (
    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
      <div
        className="h-2.5 rounded-full transition-all duration-700"
        style={{ width: `${pct}%`, backgroundColor: completada ? '#10b981' : color }}
      />
    </div>
  )
}

function TarjetaMeta({ meta }: { meta: MetaAhorro }) {
  const pct = Math.min((meta.actual / meta.meta) * 100, 100)
  const completada = pct >= 100
  const restante = meta.meta - meta.actual
  const hoy = new Date()
  const limite = new Date(meta.fechaLimite)
  const diasRestantes = Math.ceil((limite.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))

  return (
    <Card className="p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{meta.emoji}</span>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">{meta.nombre}</h3>
            <p className="text-xs text-gray-400 mt-0.5">{meta.descripcion}</p>
          </div>
        </div>
        {completada && (
          <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full shrink-0">
            ✓ Completada
          </span>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs text-gray-500">
          <span>{formatearMoneda(meta.actual)} ahorrados</span>
          <span className="font-medium text-gray-700">{pct.toFixed(0)}%</span>
        </div>
        <BarraProgreso actual={meta.actual} meta={meta.meta} color={meta.color} />
        <div className="flex justify-between text-xs">
          <span className="text-gray-400">Meta: {formatearMoneda(meta.meta)}</span>
          {!completada && (
            <span className="text-gray-400">Faltan: {formatearMoneda(restante)}</span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-gray-50">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>Límite: {new Date(meta.fechaLimite).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })}</span>
        </div>
        {!completada && diasRestantes > 0 && (
          <span className={`text-xs font-medium ${diasRestantes < 30 ? 'text-amber-600' : 'text-gray-500'}`}>
            {diasRestantes} días
          </span>
        )}
      </div>
    </Card>
  )
}

export function Metas() {
  const completadas = METAS_DEMO.filter(m => m.actual >= m.meta)
  const enProgreso  = METAS_DEMO.filter(m => m.actual < m.meta)
  const totalMetas  = METAS_DEMO.reduce((s, m) => s + m.meta, 0)
  const totalActual = METAS_DEMO.reduce((s, m) => s + m.actual, 0)

  return (
    <div className="space-y-6">
      {/* Aviso demo */}
      <div className="bg-amber-50 border border-amber-200 text-amber-700 rounded-xl px-4 py-2.5 text-xs font-medium">
        🎯 Datos de demostración — las metas se sincronizarán con el backend en la siguiente fase.
      </div>

      {/* Resumen de metas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 text-center">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Total metas</p>
          <p className="text-3xl font-bold text-gray-800">{METAS_DEMO.length}</p>
          <p className="text-xs text-gray-400 mt-1">{completadas.length} completadas</p>
        </Card>
        <Card className="p-5 text-center">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Progreso global</p>
          <p className="text-3xl font-bold text-emerald-600">
            {((totalActual / totalMetas) * 100).toFixed(0)}%
          </p>
          <p className="text-xs text-gray-400 mt-1">{formatearMoneda(totalActual)} de {formatearMoneda(totalMetas)}</p>
        </Card>
        <Card className="p-5 text-center">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">En progreso</p>
          <p className="text-3xl font-bold text-blue-600">{enProgreso.length}</p>
          <p className="text-xs text-gray-400 mt-1">metas activas</p>
        </Card>
      </div>

      {/* Metas en progreso */}
      {enProgreso.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">En progreso</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4">
            {enProgreso.map(m => <TarjetaMeta key={m.id} meta={m} />)}
          </div>
        </section>
      )}

      {/* Metas completadas */}
      {completadas.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">Completadas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4">
            {completadas.map(m => <TarjetaMeta key={m.id} meta={m} />)}
          </div>
        </section>
      )}
    </div>
  )
}
