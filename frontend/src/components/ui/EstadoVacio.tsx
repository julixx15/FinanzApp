interface EstadoVacioProps {
  mensaje?: string
}

export function EstadoVacio({ mensaje = 'No hay movimientos registrados.' }: EstadoVacioProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-3">
      <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-6h6v6m-3-9V3m0 0L9 6m3-3l3 3M3 17h18" />
      </svg>
      <p className="text-sm">{mensaje}</p>
    </div>
  )
}
