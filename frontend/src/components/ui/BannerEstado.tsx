import type { EstadoCarga } from '../../hooks/useMovimientos'

interface BannerEstadoProps {
  estado: EstadoCarga
  onRecargar?: () => void
}

export function BannerEstado({ estado, onRecargar }: BannerEstadoProps) {
  if (estado === 'ok') {
    return (
      <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-2.5 text-xs font-medium">
        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
        Conectado al backend — datos en tiempo real
      </div>
    )
  }

  if (estado === 'demo') {
    return (
      <div className="flex items-center justify-between bg-amber-50 border border-amber-200 text-amber-700 rounded-xl px-4 py-2.5 text-xs font-medium">
        <span>📊 Backend no disponible — mostrando datos de demostración</span>
        {onRecargar && (
          <button
            onClick={onRecargar}
            className="ml-3 underline hover:no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded"
          >
            Reintentar
          </button>
        )}
      </div>
    )
  }

  if (estado === 'cargando') {
    return (
      <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 text-gray-500 rounded-xl px-4 py-2.5 text-xs font-medium">
        <span className="w-2 h-2 rounded-full bg-gray-400 inline-block animate-pulse" />
        Conectando con el backend…
      </div>
    )
  }

  return null
}
