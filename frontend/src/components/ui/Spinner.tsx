export function Spinner() {
  return (
    <div className="flex items-center justify-center py-12" role="status" aria-label="Cargando">
      <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
    </div>
  )
}
