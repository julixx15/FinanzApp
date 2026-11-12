import { useState } from 'react'
import { useMetas } from '../hooks/useMetas'
import { abonarMeta, eliminarMeta } from '../services/metasService'
import { Card } from '../components/ui/Card'
import { Spinner } from '../components/ui/Spinner'
import { formatearMoneda } from '../utils/formato'
import type { MetaAhorro } from '../types/domain'
import type { PerfilUsuario } from '../data/usuarios'

function BarraProgreso({ actual, meta, color }: { actual: number; meta: number; color: string }) {
  const pct = Math.min((actual / meta) * 100, 100)
  return (
    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
      <div className="h-2.5 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: pct >= 100 ? '#10b981' : color }} />
    </div>
  )
}

function TarjetaMeta({ meta, onAbonar, onEliminar, usandoDemo }: {
  meta: MetaAhorro
  onAbonar: (id: number, monto: string) => Promise<void>
  onEliminar: (id: number) => Promise<void>
  usandoDemo: boolean
}) {
  const [montoAbono, setMontoAbono] = useState('')
  const [cargando, setCargando]     = useState(false)
  const pct = Math.min((meta.actual / meta.meta) * 100, 100)
  const completada = pct >= 100
  const restante = meta.meta - meta.actual
  const diasRestantes = Math.ceil((new Date(meta.fechaLimite).getTime() - Date.now()) / 86400000)

  const handleAbonar = async () => {
    if (!montoAbono || isNaN(Number(montoAbono)) || Number(montoAbono) <= 0) return
    setCargando(true)
    await onAbonar(meta.id, Number(montoAbono).toFixed(2))
    setMontoAbono('')
    setCargando(false)
  }

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
        {completada && <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full shrink-0">✓ Completada</span>}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs text-gray-500">
          <span>{formatearMoneda(meta.actual)} ahorrados</span>
          <span className="font-medium text-gray-700">{pct.toFixed(0)}%</span>
        </div>
        <BarraProgreso actual={meta.actual} meta={meta.meta} color={meta.color} />
        <div className="flex justify-between text-xs">
          <span className="text-gray-400">Meta: {formatearMoneda(meta.meta)}</span>
          {!completada && <span className="text-gray-400">Faltan: {formatearMoneda(restante)}</span>}
        </div>
      </div>

      {/* Abonar */}
      {!completada && !usandoDemo && (
        <div className="flex gap-2">
          <input type="number" min="1" placeholder="Monto a abonar"
            value={montoAbono} onChange={e => setMontoAbono(e.target.value)}
            className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          <button onClick={handleAbonar} disabled={cargando}
            className="px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-lg disabled:opacity-50 transition-colors">
            {cargando ? '…' : 'Abonar'}
          </button>
        </div>
      )}

      <div className="flex items-center justify-between pt-1 border-t border-gray-50">
        <p className="text-xs text-gray-400">
          Límite: {new Date(meta.fechaLimite).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })}
        </p>
        <div className="flex items-center gap-3">
          {!completada && diasRestantes > 0 && (
            <span className={`text-xs font-medium ${diasRestantes < 30 ? 'text-amber-600' : 'text-gray-500'}`}>
              {diasRestantes} días
            </span>
          )}
          {!usandoDemo && (
            <button onClick={() => onEliminar(meta.id)} className="text-xs text-gray-300 hover:text-red-400 transition-colors">
              Eliminar
            </button>
          )}
        </div>
      </div>
    </Card>
  )
}

interface Props { usuario: PerfilUsuario }

export function Metas({ usuario: _usuario }: Props) {
  const { metas, cargando, usandoDemo, recargar, setMetas } = useMetas()

  const handleAbonar = async (id: number, monto: string) => {
    try {
      const actualizada = await abonarMeta(id, monto)
      setMetas(prev => prev.map(m => m.id === id ? actualizada : m))
    } catch { recargar() }
  }

  const handleEliminar = async (id: number) => {
    if (!confirm('¿Eliminar esta meta?')) return
    try {
      await eliminarMeta(id)
      setMetas(prev => prev.filter(m => m.id !== id))
    } catch { recargar() }
  }

  if (cargando) return <Spinner />

  const completadas = metas.filter(m => m.actual >= m.meta)
  const enProgreso  = metas.filter(m => m.actual < m.meta)
  const totalMeta   = metas.reduce((s, m) => s + m.meta, 0)
  const totalActual = metas.reduce((s, m) => s + m.actual, 0)

  return (
    <div className="space-y-6">
      {usandoDemo && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 rounded-xl px-4 py-2.5 text-xs font-medium">
          🎯 Datos de demostración — inicia el backend para gestionar metas reales.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 text-center">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Total metas</p>
          <p className="text-3xl font-bold text-gray-800">{metas.length}</p>
          <p className="text-xs text-gray-400 mt-1">{completadas.length} completadas</p>
        </Card>
        <Card className="p-5 text-center">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Progreso global</p>
          <p className="text-3xl font-bold text-emerald-600">
            {totalMeta > 0 ? ((totalActual / totalMeta) * 100).toFixed(0) : 0}%
          </p>
          <p className="text-xs text-gray-400 mt-1">{formatearMoneda(totalActual)} de {formatearMoneda(totalMeta)}</p>
        </Card>
        <Card className="p-5 text-center">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">En progreso</p>
          <p className="text-3xl font-bold text-blue-600">{enProgreso.length}</p>
          <p className="text-xs text-gray-400 mt-1">metas activas</p>
        </Card>
      </div>

      {enProgreso.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">En progreso</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {enProgreso.map(m => <TarjetaMeta key={m.id} meta={m} onAbonar={handleAbonar} onEliminar={handleEliminar} usandoDemo={usandoDemo} />)}
          </div>
        </section>
      )}
      {completadas.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">Completadas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {completadas.map(m => <TarjetaMeta key={m.id} meta={m} onAbonar={handleAbonar} onEliminar={handleEliminar} usandoDemo={usandoDemo} />)}
          </div>
        </section>
      )}
    </div>
  )
}
