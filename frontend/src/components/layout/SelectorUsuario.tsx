import { useState } from 'react'
import { USUARIOS } from '../../data/usuarios'
import type { PerfilUsuario } from '../../data/usuarios'

interface SelectorUsuarioProps {
  usuarioActivo: PerfilUsuario
  onCambiar: (id: string) => void
}

export function SelectorUsuario({ usuarioActivo, onCambiar }: SelectorUsuarioProps) {
  const [abierto, setAbierto] = useState(false)

  return (
    <div className="px-4 py-4 border-t border-gray-100 relative">
      {/* Botón del usuario activo */}
      <button
        onClick={() => setAbierto(a => !a)}
        className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        aria-expanded={abierto}
        aria-label="Cambiar usuario"
      >
        <div className={`w-8 h-8 rounded-full ${usuarioActivo.color} flex items-center justify-center shrink-0`}>
          <span className="text-white font-semibold text-sm">{usuarioActivo.iniciales}</span>
        </div>
        <div className="min-w-0 flex-1 text-left">
          <p className="text-sm font-medium text-gray-800 truncate">
            {usuarioActivo.nombre} {usuarioActivo.apellido}
          </p>
          <p className="text-xs text-gray-400 truncate">{usuarioActivo.programa}</p>
        </div>
        {/* Chevron */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${abierto ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {abierto && (
        <div className="absolute bottom-full left-4 right-4 mb-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-3 pt-3 pb-1">
            Cambiar usuario
          </p>
          {USUARIOS.map(u => {
            const activo = u.id === usuarioActivo.id
            return (
              <button
                key={u.id}
                onClick={() => { onCambiar(u.id); setAbierto(false) }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors
                  ${activo ? 'bg-emerald-50' : 'hover:bg-gray-50'}
                `}
              >
                <div className={`w-8 h-8 rounded-full ${u.color} flex items-center justify-center shrink-0`}>
                  <span className="text-white font-semibold text-xs">{u.iniciales}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-medium truncate ${activo ? 'text-emerald-700' : 'text-gray-800'}`}>
                    {u.nombre} {u.apellido}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{u.programa}</p>
                </div>
                {activo && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
