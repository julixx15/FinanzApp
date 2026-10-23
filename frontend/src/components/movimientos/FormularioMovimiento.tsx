/**
 * Formulario accesible para registrar un movimiento financiero.
 *
 * - Validación en frontend antes de enviar (refleja las mismas
 *   reglas que el backend: monto > 0, campos obligatorios, etc.)
 * - Mensajes de error mostrados junto a cada campo.
 * - Estados de carga, error de API y éxito.
 */

import { useState } from 'react'
import type { TipoMovimientoApi, MovimientoCreateRequest } from '../../types/api'
import { Card } from '../ui/Card'
import { Spinner } from '../ui/Spinner'

const CATEGORIAS_PREDEFINIDAS = [
  'Salario', 'Freelance', 'Otros',
  'Vivienda', 'Alimentación', 'Transporte',
  'Servicios', 'Salud', 'Entretenimiento',
  'Fondo emergencia', 'Vacaciones',
]

interface FormularioMovimientoProps {
  onCrear: (data: MovimientoCreateRequest) => Promise<boolean>
  cargando: boolean
  errorApi: string | null
  exito: boolean
  onLimpiarEstado: () => void
}

interface CamposFormulario {
  tipo: TipoMovimientoApi
  monto: string
  categoria: string
  categoriaPersonalizada: string
  descripcion: string
  fecha: string
}

interface ErroresCampos {
  tipo?: string
  monto?: string
  categoria?: string
  descripcion?: string
  fecha?: string
}

const hoy = () => new Date().toISOString().split('T')[0]

export function FormularioMovimiento({
  onCrear,
  cargando,
  errorApi,
  exito,
  onLimpiarEstado,
}: FormularioMovimientoProps) {
  const [campos, setCampos] = useState<CamposFormulario>({
    tipo: 'ingreso',
    monto: '',
    categoria: CATEGORIAS_PREDEFINIDAS[0],
    categoriaPersonalizada: '',
    descripcion: '',
    fecha: hoy(),
  })
  const [errores, setErrores] = useState<ErroresCampos>({})
  const [abierto, setAbierto] = useState(false)

  const actualizar = (campo: keyof CamposFormulario, valor: string) => {
    setCampos(prev => ({ ...prev, [campo]: valor }))
    setErrores(prev => ({ ...prev, [campo]: undefined }))
    if (exito) onLimpiarEstado()
  }

  // ---- Validación frontend -------------------------------------- //
  const validar = (): boolean => {
    const e: ErroresCampos = {}

    if (!campos.tipo) {
      e.tipo = 'Selecciona un tipo de movimiento.'
    }

    const montoNum = parseFloat(campos.monto)
    if (!campos.monto.trim()) {
      e.monto = 'El monto es obligatorio.'
    } else if (isNaN(montoNum) || montoNum <= 0) {
      e.monto = 'El monto debe ser un número mayor a cero.'
    } else if (montoNum > 999_999_999.99) {
      e.monto = 'El monto supera el máximo permitido.'
    }

    const categoriaFinal =
      campos.categoria === '__personalizada__'
        ? campos.categoriaPersonalizada.trim()
        : campos.categoria

    if (!categoriaFinal) {
      e.categoria = 'La categoría es obligatoria.'
    }

    if (!campos.fecha) {
      e.fecha = 'La fecha es obligatoria.'
    }

    setErrores(e)
    return Object.keys(e).length === 0
  }

  // ---- Envío ---------------------------------------------------- //
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validar()) return

    const categoriaFinal =
      campos.categoria === '__personalizada__'
        ? campos.categoriaPersonalizada.trim()
        : campos.categoria

    // Convertir monto a string con 2 decimales para el backend (Decimal)
    const montoStr = parseFloat(campos.monto).toFixed(2)

    const exito = await onCrear({
      tipo: campos.tipo,
      monto: montoStr,
      categoria: categoriaFinal,
      descripcion: campos.descripcion.trim(),
      fecha: campos.fecha,
    })

    if (exito) {
      // Limpiar formulario tras éxito
      setCampos({
        tipo: 'ingreso',
        monto: '',
        categoria: CATEGORIAS_PREDEFINIDAS[0],
        categoriaPersonalizada: '',
        descripcion: '',
        fecha: hoy(),
      })
      setErrores({})
      setAbierto(false)
    }
  }

  return (
    <div>
      {/* Botón para abrir/cerrar el formulario */}
      <button
        type="button"
        onClick={() => { setAbierto(prev => !prev); onLimpiarEstado() }}
        className="w-full sm:w-auto flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
        aria-expanded={abierto}
      >
        <span className="text-lg leading-none">{abierto ? '−' : '+'}</span>
        Nuevo movimiento
      </button>

      {/* Formulario desplegable */}
      {abierto && (
        <Card className="mt-4 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">
            Registrar movimiento
          </h2>

          {/* Error de API */}
          {errorApi && (
            <div role="alert" className="mb-4 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              <span>⚠️</span>
              <span>{errorApi}</span>
            </div>
          )}

          <form onSubmit={(e) => { void handleSubmit(e) }} noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Tipo */}
              <div>
                <label htmlFor="tipo" className="block text-xs font-medium text-gray-600 mb-1">
                  Tipo <span aria-hidden="true" className="text-red-500">*</span>
                </label>
                <select
                  id="tipo"
                  value={campos.tipo}
                  onChange={e => actualizar('tipo', e.target.value)}
                  className={`w-full text-sm border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errores.tipo ? 'border-red-400' : 'border-gray-200'}`}
                  aria-describedby={errores.tipo ? 'tipo-error' : undefined}
                  aria-invalid={!!errores.tipo}
                >
                  <option value="ingreso">Ingreso</option>
                  <option value="gasto">Gasto</option>
                  <option value="ahorro">Ahorro</option>
                </select>
                {errores.tipo && (
                  <p id="tipo-error" role="alert" className="mt-1 text-xs text-red-600">{errores.tipo}</p>
                )}
              </div>

              {/* Monto */}
              <div>
                <label htmlFor="monto" className="block text-xs font-medium text-gray-600 mb-1">
                  Monto <span aria-hidden="true" className="text-red-500">*</span>
                </label>
                <input
                  id="monto"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  value={campos.monto}
                  onChange={e => actualizar('monto', e.target.value)}
                  className={`w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errores.monto ? 'border-red-400' : 'border-gray-200'}`}
                  aria-describedby={errores.monto ? 'monto-error' : undefined}
                  aria-invalid={!!errores.monto}
                />
                {errores.monto && (
                  <p id="monto-error" role="alert" className="mt-1 text-xs text-red-600">{errores.monto}</p>
                )}
              </div>

              {/* Categoría */}
              <div>
                <label htmlFor="categoria" className="block text-xs font-medium text-gray-600 mb-1">
                  Categoría <span aria-hidden="true" className="text-red-500">*</span>
                </label>
                <select
                  id="categoria"
                  value={campos.categoria}
                  onChange={e => actualizar('categoria', e.target.value)}
                  className={`w-full text-sm border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errores.categoria ? 'border-red-400' : 'border-gray-200'}`}
                  aria-describedby={errores.categoria ? 'categoria-error' : undefined}
                  aria-invalid={!!errores.categoria}
                >
                  {CATEGORIAS_PREDEFINIDAS.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                  <option value="__personalizada__">Otra…</option>
                </select>
                {campos.categoria === '__personalizada__' && (
                  <input
                    type="text"
                    placeholder="Escribe la categoría"
                    value={campos.categoriaPersonalizada}
                    onChange={e => actualizar('categoriaPersonalizada', e.target.value)}
                    className="mt-2 w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    aria-label="Categoría personalizada"
                  />
                )}
                {errores.categoria && (
                  <p id="categoria-error" role="alert" className="mt-1 text-xs text-red-600">{errores.categoria}</p>
                )}
              </div>

              {/* Fecha */}
              <div>
                <label htmlFor="fecha" className="block text-xs font-medium text-gray-600 mb-1">
                  Fecha <span aria-hidden="true" className="text-red-500">*</span>
                </label>
                <input
                  id="fecha"
                  type="date"
                  value={campos.fecha}
                  onChange={e => actualizar('fecha', e.target.value)}
                  className={`w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errores.fecha ? 'border-red-400' : 'border-gray-200'}`}
                  aria-describedby={errores.fecha ? 'fecha-error' : undefined}
                  aria-invalid={!!errores.fecha}
                />
                {errores.fecha && (
                  <p id="fecha-error" role="alert" className="mt-1 text-xs text-red-600">{errores.fecha}</p>
                )}
              </div>

              {/* Descripción — ocupa fila completa */}
              <div className="sm:col-span-2">
                <label htmlFor="descripcion" className="block text-xs font-medium text-gray-600 mb-1">
                  Descripción <span className="text-gray-400 font-normal">(opcional)</span>
                </label>
                <input
                  id="descripcion"
                  type="text"
                  placeholder="Ej: Nómina de octubre"
                  maxLength={500}
                  value={campos.descripcion}
                  onChange={e => actualizar('descripcion', e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Acciones */}
            <div className="flex items-center gap-3 mt-5 pt-4 border-t border-gray-100">
              <button
                type="submit"
                disabled={cargando}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white text-sm font-medium rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
              >
                {cargando ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                    Guardando…
                  </>
                ) : 'Guardar movimiento'}
              </button>
              <button
                type="button"
                onClick={() => { setAbierto(false); onLimpiarEstado() }}
                className="px-4 py-2.5 text-sm text-gray-600 hover:text-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 rounded-xl"
              >
                Cancelar
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* Mensaje de éxito flotante */}
      {exito && !abierto && (
        <div role="status" className="mt-3 flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 text-sm">
          <span>✓</span> Movimiento registrado correctamente.
        </div>
      )}
    </div>
  )
}

// Re-export para no romper importaciones que pudieran existir
export { Spinner }
