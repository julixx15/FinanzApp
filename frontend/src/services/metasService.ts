import { apiFetch } from './api'
import type { MetaAhorro } from '../types/domain'

interface MetaAPI {
  id: number
  nombre: string
  descripcion: string
  meta: string
  actual: string
  fecha_limite: string
  emoji: string
  porcentaje: number
  completada: boolean
  creado_en: string
}

interface MetaCreate {
  nombre: string
  descripcion?: string
  meta: string
  fecha_limite: string
  emoji?: string
}

function apiAMeta(m: MetaAPI): MetaAhorro {
  return {
    id: m.id,
    nombre: m.nombre,
    descripcion: m.descripcion,
    meta: parseFloat(m.meta),
    actual: parseFloat(m.actual),
    fechaLimite: m.fecha_limite,
    color: '#10b981',  // color por defecto; se puede extender
    emoji: m.emoji,
  }
}

export async function listarMetas(): Promise<MetaAhorro[]> {
  const data = await apiFetch<MetaAPI[]>('/metas/')
  return data.map(apiAMeta)
}

export async function crearMeta(datos: MetaCreate): Promise<MetaAhorro> {
  const data = await apiFetch<MetaAPI>('/metas/', {
    method: 'POST',
    body: JSON.stringify(datos),
  })
  return apiAMeta(data)
}

export async function abonarMeta(id: number, monto: string): Promise<MetaAhorro> {
  const data = await apiFetch<MetaAPI>(`/metas/${id}/abonar`, {
    method: 'POST',
    body: JSON.stringify({ monto }),
  })
  return apiAMeta(data)
}

export async function eliminarMeta(id: number): Promise<void> {
  await apiFetch<void>(`/metas/${id}`, { method: 'DELETE' })
}
