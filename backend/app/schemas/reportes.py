"""
Schemas Pydantic para los endpoints de reportes.
Reflejan los dataclasses de app/core/reportes.py hacia JSON.
"""

from decimal import Decimal
from pydantic import BaseModel


class ResumenFinancieroResponse(BaseModel):
    total_ingresos: Decimal
    total_gastos: Decimal
    total_ahorros: Decimal
    saldo_disponible: Decimal
    porcentaje_gastos: Decimal | None
    porcentaje_ahorros: Decimal | None


class MovimientoEnReporteResponse(BaseModel):
    """Movimiento simplificado usado dentro de reportes."""
    id: int
    tipo: str
    monto: Decimal
    categoria: str
    descripcion: str
    fecha: str


class MovimientoClasificadoResponse(MovimientoEnReporteResponse):
    nivel: str  # ALTO | MEDIO | BAJO


class ConsultaTipoValorResponse(BaseModel):
    movimientos: list[MovimientoClasificadoResponse]
    cantidad: int
    total: Decimal


class BusquedaCategoriaResponse(BaseModel):
    encontrado: MovimientoEnReporteResponse | None
    revisados: int


class ReporteGastosResponse(BaseModel):
    cantidad: int
    total: Decimal
    promedio: Decimal
    mayor_gasto: MovimientoEnReporteResponse | None


class SubtotalCategoriaResponse(BaseModel):
    categoria: str
    cantidad: int
    subtotal: Decimal
    movimientos: list[MovimientoEnReporteResponse]


class ReporteCategoriasResponse(BaseModel):
    categorias: list[SubtotalCategoriaResponse]
    total_categorias: int
