import { describe, it, expect, vi, beforeEach } from 'vitest'
import { checkHealth } from './healthService'

describe('checkHealth', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('devuelve los datos de salud cuando el backend responde OK', async () => {
    const mockData = { status: 'ok', version: '0.1.0', database: 'conectada' }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
    } as unknown as Response))

    const result = await checkHealth()
    expect(result).toEqual(mockData)
  })

  it('lanza error cuando el backend responde con error HTTP', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
    } as unknown as Response))

    await expect(checkHealth()).rejects.toThrow('Error al consultar el backend: 503')
  })
})
