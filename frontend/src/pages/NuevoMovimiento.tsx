import { useState } from 'react'
import { Card } from '../components/ui/Card'
import { CATEGORIAS_DEMO } from '../data/demo'
import type { TipoMovimiento } from '../types/domain'

type FormState = {
  tipo: TipoMovimiento
  monto: string
  categoria: string
  descripcion: string
  fecha: string
}

const hoy = new Date().toISOString().split('T')[0]

const TIPOS: { valor: TipoMovimiento; etiqueta: string; color: string; bg: string; descripcion: string }[] = [
  { valor: 'ingreso', etiqueta: 'Ingreso',  color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-300 ring-emerald-500', descripcion: 'Salario, freelance, ventas…' },
  { valor: 'gasto',   etiqueta: 'Gasto',    color: 'text-red-600',     bg: 'bg-red-50 border-red-300 ring-red-500',           descripcion: 'Alquiler, comida, servicios…' },
  { valor: 'ahorro',  etiqueta: 'Ahorro',   color: 'text-blue-700',    bg: 'bg-blue-50 border-blue-300 ring-blue-500',        descripcion: 'Fondos, metas, inversiones…' },
]

export function NuevoMovimiento() {
  const [form, setForm] = useState<FormState>({
    tipo: 'ingreso',
    monto: '',
    categoria: '',
    descripcion: '',
    fecha: hoy,
  })
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = (campo: keyof FormState, valor: string) => {
    setForm(f => ({ ...f, [campo]: valor }))
    setError(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.monto || isNaN(Number(form.monto)) || Number(form.monto) <= 0) {
      setError('El monto debe ser un número positivo.')
      return
    }
    if (!form.categoria) {
      setError('Selecciona una categoría.')
      return
    }
    // En el prototipo solo simula el envío
    setEnviado(true)
  }

  const handleNuevo = () => {
    setForm({ tipo: 'ingreso', monto: '', categoria: '', descripcion: '', fecha: hoy })
    setEnviado(false)
    setError(null)
  }

  if (enviado) {
    return (
      <div className="max-w-lg mx-auto space-y-4">
        <Card className="p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">¡Movimiento registrado!</h2>
            <p className="text-gray-500 text-sm mt-1">
              {form.tipo === 'ingreso' ? 'Ingreso' : form.tipo === 'gasto' ? 'Gasto' : 'Ahorro'} de{' '}
              <span className="font-semibold">
                {Number(form.monto).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}
              </span>{' '}
              en <span className="font-semibold">{form.categoria}</span> guardado correctamente.
            </p>
            <p className="text-xs text-amber-600 mt-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              Prototipo — el dato no persiste hasta conectar el backend.
            </p>
          </div>
          <button
            onClick={handleNuevo}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            Registrar otro movimiento
          </button>
        </Card>
      </div>
    )
  }

  const tipoActual = TIPOS.find(t => t.valor === form.tipo)!

  return (
    <div className="max-w-lg mx-auto space-y-5">
      {/* Aviso demo */}
      <div className="bg-amber-50 border border-amber-200 text-amber-700 rounded-xl px-4 py-2.5 text-xs font-medium">
        📝 Prototipo — el formulario valida los datos pero no los envía al backend todavía.
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-5">Nuevo movimiento</h2>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">

          {/* Tipo */}
          <fieldset>
            <legend className="text-sm font-medium text-gray-700 mb-2">Tipo de movimiento</legend>
            <div className="grid grid-cols-3 gap-2">
              {TIPOS.map(t => (
                <button
                  key={t.valor}
                  type="button"
                  onClick={() => set('tipo', t.valor)}
                  className={`
                    flex flex-col items-center gap-1 py-3 px-2 rounded-xl border-2 text-xs font-semibold transition-all
                    focus:outline-none focus-visible:ring-2
                    ${form.tipo === t.valor
                      ? `${t.bg} border-2 ${t.color}`
                      : 'border-gray-200 text-gray-500 hover:border-gray-300 bg-white'}
                  `}
                >
                  <span className={`font-bold text-sm ${form.tipo === t.valor ? t.color : 'text-gray-500'}`}>
                    {t.etiqueta}
                  </span>
                  <span className={`text-center leading-tight hidden sm:block ${form.tipo === t.valor ? t.color : 'text-gray-400'}`}>
                    {t.descripcion}
                  </span>
                </button>
              ))}
            </div>
          </fieldset>

          {/* Monto */}
          <div>
            <label htmlFor="monto" className="block text-sm font-medium text-gray-700 mb-1">
              Monto (COP)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm">$</span>
              <input
                id="monto"
                type="number"
                min="1"
                step="1000"
                placeholder="0"
                value={form.monto}
                onChange={e => set('monto', e.target.value)}
                className="w-full pl-7 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          {/* Categoría */}
          <div>
            <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 mb-1">
              Categoría
            </label>
            <select
              id="categoria"
              value={form.categoria}
              onChange={e => set('categoria', e.target.value)}
              className="w-full py-2.5 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              required
            >
              <option value="">Selecciona una categoría</option>
              {CATEGORIAS_DEMO.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Descripción */}
          <div>
            <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
              Descripción <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <input
              id="descripcion"
              type="text"
              maxLength={300}
              placeholder="Ej: Nómina octubre, Arriendo, Ahorro mensual…"
              value={form.descripcion}
              onChange={e => set('descripcion', e.target.value)}
              className="w-full py-2.5 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Fecha */}
          <div>
            <label htmlFor="fecha" className="block text-sm font-medium text-gray-700 mb-1">
              Fecha
            </label>
            <input
              id="fecha"
              type="date"
              value={form.fecha}
              onChange={e => set('fecha', e.target.value)}
              className="w-full py-2.5 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          {/* Error */}
          {error && (
            <div role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          {/* Botón */}
          <button
            type="submit"
            className={`
              w-full py-3 rounded-xl font-semibold text-white transition-colors text-sm
              ${tipoActual.valor === 'ingreso' ? 'bg-emerald-500 hover:bg-emerald-600' :
                tipoActual.valor === 'gasto'   ? 'bg-red-500 hover:bg-red-600' :
                'bg-blue-500 hover:bg-blue-600'}
            `}
          >
            Registrar {tipoActual.etiqueta.toLowerCase()}
          </button>
        </form>
      </Card>
    </div>
  )
}
