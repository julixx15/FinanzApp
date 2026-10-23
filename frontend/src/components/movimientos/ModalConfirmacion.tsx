/**
 * Modal de confirmación para eliminar un movimiento.
 * Accesible: foco atrapado, role="dialog", botones explícitos.
 */

import { useEffect, useRef } from 'react'

interface ModalConfirmacionProps {
  mensaje: string
  onConfirmar: () => void
  onCancelar: () => void
  cargando?: boolean
}

export function ModalConfirmacion({
  mensaje,
  onConfirmar,
  onCancelar,
  cargando = false,
}: ModalConfirmacionProps) {
  const cancelarRef = useRef<HTMLButtonElement>(null)

  // Foco inicial en el botón cancelar (opción segura)
  useEffect(() => {
    cancelarRef.current?.focus()
  }, [])

  // Cerrar con Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancelar()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onCancelar])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-titulo"
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <h2 id="modal-titulo" className="text-base font-semibold text-gray-900 mb-2">
          ¿Eliminar movimiento?
        </h2>
        <p className="text-sm text-gray-600 mb-6">{mensaje}</p>

        <div className="flex gap-3 justify-end">
          <button
            ref={cancelarRef}
            type="button"
            onClick={onCancelar}
            disabled={cargando}
            className="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            disabled={cargando}
            className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-red-500 hover:bg-red-600 disabled:opacity-60 rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          >
            {cargando ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                Eliminando…
              </>
            ) : 'Sí, eliminar'}
          </button>
        </div>
      </div>
    </div>
  )
}
