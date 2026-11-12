"""
Lógica de negocio financiera pura.
Sin dependencia de FastAPI, SQLAlchemy ni Pydantic.
"""

from collections import defaultdict
from decimal import Decimal

from app.db.models import MovimientoModel
from app.db.repositories.movimientos import monto_decimal
from app.schemas.movimiento import ResumenResponse


def calcular_resumen(movimientos: list[MovimientoModel]) -> ResumenResponse:
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

    return ResumenResponse(
        total_ingresos=total_ingresos,
        total_gastos=total_gastos,
        total_ahorros=total_ahorros,
        saldo_disponible=total_ingresos - total_gastos - total_ahorros,
    )


def categorias_unicas(movimientos: list[MovimientoModel]) -> list[str]:
    return sorted({m.categoria for m in movimientos})


def historial_mensual(movimientos: list[MovimientoModel]) -> list[dict]:
    """
    Agrupa movimientos por año-mes y calcula totales.
    Retorna lista ordenada cronológicamente, lista para los gráficos.
    """
    grupos: dict[str, dict[str, Decimal]] = defaultdict(
        lambda: {"ingresos": Decimal("0"), "gastos": Decimal("0"), "ahorros": Decimal("0")}
    )

    meses_es = ["", "Ene", "Feb", "Mar", "Abr", "May", "Jun",
                "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

    for mov in movimientos:
        clave = f"{mov.fecha.year}-{mov.fecha.month:02d}"
        monto = monto_decimal(mov)
        if mov.tipo == "ingreso":
            grupos[clave]["ingresos"] += monto
        elif mov.tipo == "gasto":
            grupos[clave]["gastos"] += monto
        elif mov.tipo == "ahorro":
            grupos[clave]["ahorros"] += monto

    resultado = []
    for clave in sorted(grupos.keys()):
        mes = int(clave[5:])
        g = grupos[clave]
        resultado.append({
            "periodo": clave,
            "nombre": meses_es[mes],
            "ingresos": float(g["ingresos"]),
            "gastos": float(g["gastos"]),
            "ahorros": float(g["ahorros"]),
            "saldo": float(g["ingresos"] - g["gastos"] - g["ahorros"]),
        })

    return resultado
