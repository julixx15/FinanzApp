export interface HealthResponse {
  status: string
  version: string
  database: string
}

// ------------------------------------------------------------------ //
// Contratos de la API de Movimientos                                  //
// Reflejan exactamente los schemas Pydantic del backend               //
// ------------------------------------------------------------------ //

export type TipoMovimientoApi = 'ingreso' | 'gasto' | 'ahorro'

/** Payload que se envía al crear un movimiento (POST /movimientos) */
export interface MovimientoCreateRequest {
  tipo: TipoMovimientoApi
  monto: string        // string numérico para preservar precisión Decimal
  categoria: string
  descripcion: string
  fecha: string        // YYYY-MM-DD
}

/** Payload para actualización parcial (PATCH /movimientos/:id) */
export interface MovimientoUpdateRequest {
  tipo?: TipoMovimientoApi
  monto?: string
  categoria?: string
  descripcion?: string
  fecha?: string
}

/** Respuesta individual del backend */
export interface MovimientoApiResponse {
  id: number
  tipo: TipoMovimientoApi
  monto: string        // Decimal serializado como string
  categoria: string
  descripcion: string
  fecha: string
  fecha_creacion: string
}

/** Respuesta del endpoint de lista con paginación */
export interface MovimientoListApiResponse {
  total: number
  movimientos: MovimientoApiResponse[]
}

/** Parámetros de filtro para GET /movimientos */
export interface MovimientosFiltros {
  tipo?: TipoMovimientoApi
  categoria?: string
  fecha_desde?: string
  fecha_hasta?: string
  limit?: number
  offset?: number
}

/** Error estándar devuelto por FastAPI */
export interface ApiError {
  detail: string | { msg: string; loc: string[] }[]
}
