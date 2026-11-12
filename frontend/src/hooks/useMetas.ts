import { useEffect, useState, useCallback } from 'react'
import type { MetaAhorro } from '../types/domain'
import { listarMetas } from '../services/metasService'
import { METAS_DEMO } from '../data/demo'

export function useMetas() {
  const [metas,       setMetas]       = useState<MetaAhorro[]>(METAS_DEMO)
  const [cargando,    setCargando]    = useState(true)
  const [usandoDemo,  setUsandoDemo]  = useState(false)

  const cargar = useCallback(async () => {
    setCargando(true)
    try {
      const data = await listarMetas()
      setMetas(data.length > 0 ? data : METAS_DEMO)
      setUsandoDemo(data.length === 0)
    } catch {
      setMetas(METAS_DEMO)
      setUsandoDemo(true)
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => { void cargar() }, [cargar])

  return { metas, cargando, usandoDemo, recargar: cargar, setMetas }
}
