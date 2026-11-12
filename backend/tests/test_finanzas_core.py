"""
Pruebas de la lógica de negocio pura (app/core/finanzas.py).
Sin base de datos real ni servidor HTTP.
"""

from datetime import date
from decimal import Decimal

from app.core.finanzas import calcular_resumen, categorias_unicas
from app.db.models import MovimientoModel
from app.db.repositories.movimientos import _a_centavos


def _mov(tipo: str, monto: str, categoria: str = "Test") -> MovimientoModel:
    """Helper para construir MovimientoModel sin persistir."""
    m = MovimientoModel()
    m.tipo = tipo
    m.monto_centavos = _a_centavos(Decimal(monto))
    m.categoria = categoria
    m.descripcion = ""
    m.fecha = date(2026, 10, 1)
    return m


def test_resumen_con_movimientos_mixtos() -> None:
    movs = [
        _mov("ingreso", "1000000.00"),
        _mov("gasto",    "400000.00"),
        _mov("ahorro",   "100000.00"),
    ]
    r = calcular_resumen(movs)
    assert r.total_ingresos   == Decimal("1000000.00")
    assert r.total_gastos     == Decimal("400000.00")
    assert r.total_ahorros    == Decimal("100000.00")
    assert r.saldo_disponible == Decimal("500000.00")


def test_resumen_lista_vacia() -> None:
    r = calcular_resumen([])
    assert r.saldo_disponible == Decimal("0")
    assert r.total_ingresos   == Decimal("0")


def test_resumen_solo_gastos_saldo_negativo() -> None:
    movs = [_mov("gasto", "500000.00")]
    r = calcular_resumen(movs)
    assert r.saldo_disponible == Decimal("-500000.00")


def test_precision_decimal_sin_error_flotante() -> None:
    """Verifica que la suma de décimos no produce error de punto flotante."""
    movs = [_mov("ingreso", "0.10") for _ in range(3)]
    r = calcular_resumen(movs)
    assert r.total_ingresos == Decimal("0.30")


def test_categorias_unicas_sin_duplicados() -> None:
    movs = [
        _mov("ingreso", "100.00", "Salario"),
        _mov("ingreso", "200.00", "Salario"),
        _mov("gasto",   "50.00",  "Transporte"),
    ]
    cats = categorias_unicas(movs)
    assert cats == ["Salario", "Transporte"]
    assert len(cats) == 2


def test_categorias_ordenadas_alfabeticamente() -> None:
    movs = [
        _mov("gasto",   "10.00", "Vivienda"),
        _mov("ingreso", "10.00", "Alimentación"),
        _mov("ahorro",  "10.00", "Educación"),
    ]
    cats = categorias_unicas(movs)
    assert cats == sorted(cats)
