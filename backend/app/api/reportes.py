"""
Endpoints de reportes financieros.

Rutas:
  GET /reportes/resumen           — totales, saldo y porcentajes
  GET /reportes/gastos            — cantidad, total, promedio, mayor gasto
  GET /reportes/categorias        — agrupado por categoría con subtotales
  GET /reportes/consulta          — filtrar por tipo y valor mínimo
  GET /reportes/buscar-categoria  — primer movimiento de una categoría
"""

from decimal import Decimal

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core import reportes as core_reportes
from app.core.movimientos import MovimientoService
from app.db.database import get_db
from app.db.models import TipoMovimiento
from app.db.repositories.movimiento_repository import MovimientoRepository
from app.schemas.reportes import (
    BusquedaCategoriaResponse,
    ConsultaTipoValorResponse,
    MovimientoClasificadoResponse,
    MovimientoEnReporteResponse,
    ReporteCategoriasResponse,
    ReporteGastosResponse,
    ResumenFinancieroResponse,
    SubtotalCategoriaResponse,
)

router = APIRouter(prefix="/reportes", tags=["reportes"])


def get_service(db: Session = Depends(get_db)) -> MovimientoService:
    return MovimientoService(MovimientoRepository(db))


def _todos_los_movimientos(service: MovimientoService):
    movimientos, _ = service.listar(limit=10_000)
    return movimientos


def _a_response(m) -> MovimientoEnReporteResponse:
    """Convierte un MovimientoResponse a MovimientoEnReporteResponse."""
    return MovimientoEnReporteResponse(
        id=m.id,
        tipo=m.tipo.value,
        monto=m.monto,
        categoria=m.categoria,
        descripcion=m.descripcion,
        fecha=str(m.fecha),
    )


# ------------------------------------------------------------------ #
# GET /reportes/resumen                                               #
# ------------------------------------------------------------------ #

@router.get("/resumen", response_model=ResumenFinancieroResponse)
def resumen_financiero(
    service: MovimientoService = Depends(get_service),
) -> ResumenFinancieroResponse:
    """Totales, saldo disponible y porcentajes. porcentajes=null si no hay ingresos."""
    r = core_reportes.calcular_resumen(_todos_los_movimientos(service))
    return ResumenFinancieroResponse(
        total_ingresos=r.total_ingresos,
        total_gastos=r.total_gastos,
        total_ahorros=r.total_ahorros,
        saldo_disponible=r.saldo_disponible,
        porcentaje_gastos=r.porcentaje_gastos,
        porcentaje_ahorros=r.porcentaje_ahorros,
    )


# ------------------------------------------------------------------ #
# GET /reportes/gastos                                                #
# ------------------------------------------------------------------ #

@router.get("/gastos", response_model=ReporteGastosResponse)
def reporte_gastos(
    service: MovimientoService = Depends(get_service),
) -> ReporteGastosResponse:
    """Cantidad, total, promedio y mayor gasto. Usa continue para omitir no-gastos."""
    r = core_reportes.reporte_gastos(_todos_los_movimientos(service))
    return ReporteGastosResponse(
        cantidad=r.cantidad,
        total=r.total,
        promedio=r.promedio,
        mayor_gasto=_a_response(r.mayor_gasto) if r.mayor_gasto else None,
    )


# ------------------------------------------------------------------ #
# GET /reportes/categorias                                            #
# ------------------------------------------------------------------ #

@router.get("/categorias", response_model=ReporteCategoriasResponse)
def reporte_categorias(
    service: MovimientoService = Depends(get_service),
) -> ReporteCategoriasResponse:
    """Agrupa movimientos por categoría con subtotales. Usa ciclos anidados."""
    r = core_reportes.agrupar_por_categoria(_todos_los_movimientos(service))
    return ReporteCategoriasResponse(
        total_categorias=r.total_categorias,
        categorias=[
            SubtotalCategoriaResponse(
                categoria=sc.categoria,
                cantidad=sc.cantidad,
                subtotal=sc.subtotal,
                movimientos=[_a_response(m) for m in sc.movimientos],
            )
            for sc in r.categorias
        ],
    )


# ------------------------------------------------------------------ #
# GET /reportes/consulta                                              #
# ------------------------------------------------------------------ #

@router.get("/consulta", response_model=ConsultaTipoValorResponse)
def consultar_por_tipo_y_valor(
    tipo: TipoMovimiento = Query(..., description="Tipo de movimiento"),
    monto_minimo: Decimal = Query(
        default=Decimal("0"),
        ge=Decimal("0"),
        description="Valor mínimo inclusive (0 = todos)",
    ),
    service: MovimientoService = Depends(get_service),
) -> ConsultaTipoValorResponse:
    """Filtra por tipo y valor mínimo. Clasifica cada resultado como ALTO/MEDIO/BAJO."""
    r = core_reportes.consultar_por_tipo_y_valor(
        _todos_los_movimientos(service), tipo, monto_minimo
    )
    return ConsultaTipoValorResponse(
        cantidad=r.cantidad,
        total=r.total,
        movimientos=[
            MovimientoClasificadoResponse(
                id=m.id, tipo=m.tipo, monto=m.monto,
                categoria=m.categoria, descripcion=m.descripcion,
                fecha=m.fecha, nivel=m.nivel,
            )
            for m in r.movimientos
        ],
    )


# ------------------------------------------------------------------ #
# GET /reportes/buscar-categoria                                      #
# ------------------------------------------------------------------ #

@router.get("/buscar-categoria", response_model=BusquedaCategoriaResponse)
def buscar_por_categoria(
    categoria: str = Query(..., min_length=1),
    service: MovimientoService = Depends(get_service),
) -> BusquedaCategoriaResponse:
    """Primer movimiento de la categoría. Usa break para detener la búsqueda."""
    r = core_reportes.buscar_primer_por_categoria(
        _todos_los_movimientos(service), categoria
    )
    return BusquedaCategoriaResponse(
        encontrado=_a_response(r.encontrado) if r.encontrado else None,
        revisados=r.revisados,
    )
