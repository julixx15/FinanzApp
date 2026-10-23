/**
 * Tests del servicio de movimientos.
 * Cubre: registro correcto, valores inválidos, filtrado,
 * eliminación, errores de API y respuestas inesperadas.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  listarMovimientos,
  crearMovimiento,
  eliminarMovimiento,
  obtenerMovimiento,
} from './movimientosService'

// ------------------------------------------------------------------ //
// Helpers                                                             //
// ------------------------------------------------------------------ //

function mockFetch(ok: boolean, data: unknown, status = ok ? 200 : 400) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok,
      status,
      json: () => Promise.resolve(data),
    } as unknown as Response),
  )
}

const movimientoBase = {
  id: 1,
  tipo: 'ingreso' as const,
  monto: '150000.00',
  categoria: 'Salario',
  descripcion: 'Nómina',
  fecha: '2026-10-01',
  fecha_creacion: '2026-10-01T08:00:00',
}

// ------------------------------------------------------------------ //
// listarMovimientos                                                   //
// ------------------------------------------------------------------ //

describe('listarMovimientos', () => {
  beforeEach(() => vi.resetAllMocks())

  it('devuelve lista y total cuando el backend responde OK', async () => {
    mockFetch(true, { total: 1, movimientos: [movimientoBase] })
    const result = await listarMovimientos()
    expect(result.total).toBe(1)
    expect(result.movimientos[0].monto).toBe('150000.00')
  })

  it('envía parámetros de filtro en la URL', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ total: 0, movimientos: [] }),
    } as unknown as Response)
    vi.stubGlobal('fetch', fetchMock)

    await listarMovimientos({ tipo: 'gasto', limit: 10, offset: 20 })

    const urlLlamada = (fetchMock.mock.calls[0] as [string])[0]
    expect(urlLlamada).toContain('tipo=gasto')
    expect(urlLlamada).toContain('limit=10')
    expect(urlLlamada).toContain('offset=20')
  })

  it('lanza error cuando el backend responde con 500', async () => {
    mockFetch(false, { detail: 'Error interno' }, 500)
    await expect(listarMovimientos()).rejects.toThrow('Error interno')
  })

  it('lanza error genérico cuando la respuesta no es JSON', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
        json: () => Promise.reject(new Error('not json')),
      } as unknown as Response),
    )
    await expect(listarMovimientos()).rejects.toThrow('Error 503')
  })
})

// ------------------------------------------------------------------ //
// crearMovimiento                                                     //
// ------------------------------------------------------------------ //

describe('crearMovimiento', () => {
  beforeEach(() => vi.resetAllMocks())

  it('crea y devuelve el movimiento cuando el backend responde 201', async () => {
    mockFetch(true, movimientoBase, 201)
    const result = await crearMovimiento({
      tipo: 'ingreso',
      monto: '150000.00',
      categoria: 'Salario',
      descripcion: 'Nómina',
      fecha: '2026-10-01',
    })
    expect(result.id).toBe(1)
    expect(result.tipo).toBe('ingreso')
  })

  it('envía el body como JSON con Content-Type correcto', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: () => Promise.resolve(movimientoBase),
    } as unknown as Response)
    vi.stubGlobal('fetch', fetchMock)

    await crearMovimiento({
      tipo: 'gasto',
      monto: '50000.00',
      categoria: 'Vivienda',
      descripcion: '',
      fecha: '2026-10-05',
    })

    const [, opciones] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect((opciones.headers as Record<string, string>)['Content-Type']).toBe('application/json')
    expect(opciones.method).toBe('POST')

    const body = JSON.parse(opciones.body as string) as Record<string, unknown>
    expect(body['tipo']).toBe('gasto')
    expect(body['monto']).toBe('50000.00')
  })

  it('lanza error con el mensaje del backend en validación 422', async () => {
    mockFetch(false, { detail: 'El monto debe ser mayor a cero' }, 422)
    await expect(
      crearMovimiento({
        tipo: 'ingreso',
        monto: '-100.00',
        categoria: 'Salario',
        descripcion: '',
        fecha: '2026-10-01',
      }),
    ).rejects.toThrow('El monto debe ser mayor a cero')
  })

  it('lanza error cuando el campo detail es un array de errores Pydantic', async () => {
    mockFetch(
      false,
      { detail: [{ msg: 'value is not a valid decimal', loc: ['body', 'monto'] }] },
      422,
    )
    await expect(
      crearMovimiento({
        tipo: 'ingreso',
        monto: 'abc',
        categoria: 'Salario',
        descripcion: '',
        fecha: '2026-10-01',
      }),
    ).rejects.toThrow('value is not a valid decimal')
  })
})

// ------------------------------------------------------------------ //
// eliminarMovimiento                                                  //
// ------------------------------------------------------------------ //

describe('eliminarMovimiento', () => {
  beforeEach(() => vi.resetAllMocks())

  it('resuelve sin valor cuando el backend responde 204', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, status: 204 } as Response),
    )
    await expect(eliminarMovimiento(1)).resolves.toBeUndefined()
  })

  it('lanza error cuando el movimiento no existe (404)', async () => {
    mockFetch(false, { detail: 'No se encontró el movimiento con id=99' }, 404)
    await expect(eliminarMovimiento(99)).rejects.toThrow('No se encontró')
  })
})

// ------------------------------------------------------------------ //
// obtenerMovimiento                                                   //
// ------------------------------------------------------------------ //

describe('obtenerMovimiento', () => {
  beforeEach(() => vi.resetAllMocks())

  it('devuelve el movimiento cuando existe', async () => {
    mockFetch(true, movimientoBase)
    const result = await obtenerMovimiento(1)
    expect(result.id).toBe(1)
    expect(result.categoria).toBe('Salario')
  })

  it('lanza error 404 cuando no existe', async () => {
    mockFetch(false, { detail: 'No se encontró el movimiento con id=999' }, 404)
    await expect(obtenerMovimiento(999)).rejects.toThrow('No se encontró')
  })
})
