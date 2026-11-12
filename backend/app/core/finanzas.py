"""
Lógica de negocio financiera pura.

Sin dependencia de FastAPI, SQLAlchemy ni Pydantic.
Trabaja exclusivamente con tipos primitivos y Decimal.
Completamente testeable sin levantar servidor.
"""

from decimal import Decimal

from app.db.models import MovimientoModel
from app.db.repositories.movimientos import monto_decimal
from app.schemas.movimiento import ResumenResponse


def calcular_resumen(movimientos: list[MovimientoModel]) -> ResumenResponse:
    """
    Calcula el resumen financiero de una lista de movimientos.

    Usa Decimal para evitar errores de punto flotante en sumas.
    """
    total_ingresos = Decimal("0")
    total_gastos   = Decimal("0")
    total_ahorros  = Decimal("0")

    for mov in movimientos:
        monto = monto_decimal(mov)
        if mov.tipo == "ingreso":
            total_ingresos += monto
        elif mov.tipo == "gasto":
            total_gastos += monto
        elif mov.tipo == "ahorro":
            total_ahorros += monto

    saldo = total_ingresos - total_gastos - total_ahorros

    return ResumenResponse(
        total_ingresos=total_ingresos,
        total_gastos=total_gastos,
        total_ahorros=total_ahorros,
        saldo_disponible=saldo,
    )


def categorias_unicas(movimientos: list[MovimientoModel]) -> list[str]:
    """Retorna las categorías únicas ordenadas alfabéticamente."""
    return sorted({m.categoria for m in movimientos})
