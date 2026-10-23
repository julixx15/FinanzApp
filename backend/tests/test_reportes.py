"""
Tests del módulo de reportes financieros.

Usa los 6 movimientos de referencia de la Guía N.° 6 para verificar
que los resultados coinciden exactamente con los esperados.

Cubre:
1. Resumen: datos normales, lista vacía, ingresos cero.
2. Consulta por tipo y valor mínimo: filtros, clasificación de nivel.
3. Búsqueda con break: encontrado, no encontrado, revisados.
4. Reporte de gastos con continue: cantidad, total, promedio, mayor.
5. Agrupación por categoría con ciclos anidados: subtotales, repetidos.
6. Casos límite: categorías repetidas, movimientos eliminados.
7. Endpoints HTTP de reportes.
"""

from decimal import Decimal
from datetime import date

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.reportes import (
    calcular_resumen,
    consultar_por_tipo_y_valor,
    buscar_primer_por_categoria,
    reporte_gastos,
    agrupar_por_categoria,
    UMBRAL_ALTO,
    UMBRAL_MEDIO,
)
from app.db.models import TipoMovimiento
from app.db.repositories.movimiento_repository import MovimientoRepository
from app.schemas.movimiento import MovimientoCreate, MovimientoResponse


# ------------------------------------------------------------------ #
# Datos de referencia de la Guía N.° 6                               #
# ------------------------------------------------------------------ #

def movimientos_guia() -> list[MovimientoResponse]:
    """
    Los 6 movimientos exactos de la Guía N.° 6 como objetos de dominio.
    Se construyen directamente sin tocar la base de datos.
    """
    from datetime import datetime
    datos = [
        ("ingreso", "1500000", "Salario",          "Pago mensual de septiembre", "2026-09-01"),
        ("gasto",   "300000",  "Alimentación",      "Mercado semanal",            "2026-09-05"),
        ("ahorro",  "200000",  "Fondo emergencia",  "Depósito mensual al fondo",  "2026-09-05"),
        ("gasto",   "85000",   "Transporte",        "Recarga tarjeta transporte", "2026-09-10"),
        ("gasto",   "120000",  "Servicios",         "Factura de internet",        "2026-09-15"),
        ("gasto",   "45000",   "Alimentación",      "Almuerzos de la semana",     "2026-09-18"),
    ]
    result = []
    for i, (tipo, monto, cat, desc, fecha) in enumerate(datos, start=1):
        result.append(
            MovimientoResponse(
                id=i,
                tipo=TipoMovimiento(tipo),
                monto=Decimal(monto),
                categoria=cat,
                descripcion=desc,
                fecha=date.fromisoformat(fecha),
                fecha_creacion=datetime(2026, 9, 1),
            )
        )
    return result


# ------------------------------------------------------------------ #
# 1. calcular_resumen                                                 #
# ------------------------------------------------------------------ #

class TestCalcularResumen:
    def test_resumen_con_datos_guia(self) -> None:
        """Verifica los valores exactos de la Guía N.° 6 Prueba 7."""
        r = calcular_resumen(movimientos_guia())
        assert r.total_ingresos   == Decimal("1500000")
        assert r.total_gastos     == Decimal("550000")
        assert r.total_ahorros    == Decimal("200000")
        assert r.saldo_disponible == Decimal("750000")

    def test_porcentaje_gastos(self) -> None:
        """550000 / 1500000 * 100 ≈ 36.67% → la guía muestra 36.7%."""
        r = calcular_resumen(movimientos_guia())
        assert r.porcentaje_gastos is not None
        # Aceptamos el valor redondeado
        assert float(r.porcentaje_gastos) == pytest.approx(36.67, abs=0.01)

    def test_porcentaje_ahorros(self) -> None:
        """200000 / 1500000 * 100 ≈ 13.33% → la guía muestra 13.3%."""
        r = calcular_resumen(movimientos_guia())
        assert r.porcentaje_ahorros is not None
        assert float(r.porcentaje_ahorros) == pytest.approx(13.33, abs=0.01)

    def test_lista_vacia_devuelve_ceros(self) -> None:
        """Sin movimientos todo es cero y los porcentajes son None."""
        r = calcular_resumen([])
        assert r.total_ingresos   == Decimal("0")
        assert r.saldo_disponible == Decimal("0")
        assert r.porcentaje_gastos  is None
        assert r.porcentaje_ahorros is None

    def test_sin_ingresos_porcentajes_none(self) -> None:
        """Solo gastos: no hay ingresos → evitar división por cero."""
        from datetime import datetime
        solo_gasto = [MovimientoResponse(
            id=1, tipo=TipoMovimiento.gasto, monto=Decimal("100000"),
            categoria="Test", descripcion="", fecha=date(2026, 10, 1),
            fecha_creacion=datetime(2026, 10, 1),
        )]
        r = calcular_resumen(solo_gasto)
        assert r.porcentaje_gastos  is None
        assert r.porcentaje_ahorros is None
        assert r.saldo_disponible   == Decimal("-100000")

    def test_resumen_tras_eliminar_movimiento(self) -> None:
        """Guía Prueba 7: eliminar mov6 (Alimentación $45.000) → gastos $505.000."""
        sin_mov6 = movimientos_guia()[:5]  # quitamos el último
        r = calcular_resumen(sin_mov6)
        assert r.total_gastos     == Decimal("505000")
        assert r.saldo_disponible == Decimal("795000")


# ------------------------------------------------------------------ #
# 2. consultar_por_tipo_y_valor                                       #
# ------------------------------------------------------------------ #

class TestConsultarPorTipoYValor:
    def test_gastos_con_minimo_100000(self) -> None:
        """
        Guía Prueba 1: tipo=gasto, mínimo=$100.000
        Esperado: Alimentación $300.000 y Servicios $120.000 → total $420.000
        """
        r = consultar_por_tipo_y_valor(
            movimientos_guia(),
            TipoMovimiento.gasto,
            Decimal("100000"),
        )
        assert r.cantidad == 2
        assert r.total    == Decimal("420000")
        categorias = [m.categoria for m in r.movimientos]
        assert "Alimentación" in categorias
        assert "Servicios"    in categorias
        # Transporte ($85.000) y Almuerzos ($45.000) no deben aparecer
        assert "Transporte" not in categorias

    def test_clasificacion_nivel(self) -> None:
        """Alimentación $300.000 → MEDIO; Servicios $120.000 → MEDIO."""
        r = consultar_por_tipo_y_valor(
            movimientos_guia(), TipoMovimiento.gasto, Decimal("100000")
        )
        niveles = {m.categoria: m.nivel for m in r.movimientos}
        assert niveles["Alimentación"] == "MEDIO"
        assert niveles["Servicios"]    == "MEDIO"

    def test_umbral_alto(self) -> None:
        """Importes >= UMBRAL_ALTO deben clasificarse como ALTO."""
        from datetime import datetime
        mov_alto = [MovimientoResponse(
            id=1, tipo=TipoMovimiento.ingreso,
            monto=UMBRAL_ALTO, categoria="Salario", descripcion="",
            fecha=date(2026, 10, 1), fecha_creacion=datetime(2026, 10, 1),
        )]
        r = consultar_por_tipo_y_valor(mov_alto, TipoMovimiento.ingreso, Decimal("0"))
        assert r.movimientos[0].nivel == "ALTO"

    def test_minimo_cero_devuelve_todos_del_tipo(self) -> None:
        """Mínimo 0 con tipo gasto: los 4 gastos de la guía."""
        r = consultar_por_tipo_y_valor(
            movimientos_guia(), TipoMovimiento.gasto, Decimal("0")
        )
        assert r.cantidad == 4

    def test_tipo_sin_resultados(self) -> None:
        """Buscar ahorro con mínimo muy alto: sin resultados."""
        r = consultar_por_tipo_y_valor(
            movimientos_guia(), TipoMovimiento.ahorro, Decimal("9999999")
        )
        assert r.cantidad == 0
        assert r.total    == Decimal("0")

    def test_lista_vacia(self) -> None:
        r = consultar_por_tipo_y_valor([], TipoMovimiento.gasto, Decimal("0"))
        assert r.cantidad == 0


# ------------------------------------------------------------------ #
# 3. buscar_primer_por_categoria (break)                             #
# ------------------------------------------------------------------ #

class TestBuscarPrimerPorCategoria:
    def test_encontrar_transporte(self) -> None:
        """Guía Prueba 3: transporte se encuentra revisando 4 movimientos."""
        r = buscar_primer_por_categoria(movimientos_guia(), "transporte")
        assert r.encontrado is not None
        assert r.encontrado.categoria == "Transporte"
        assert r.revisados == 4  # posición exacta de Transporte en la lista

    def test_busqueda_case_insensitive(self) -> None:
        """La búsqueda no distingue mayúsculas."""
        r = buscar_primer_por_categoria(movimientos_guia(), "SALARIO")
        assert r.encontrado is not None
        assert r.encontrado.tipo == TipoMovimiento.ingreso

    def test_categoria_no_existente_revisa_todos(self) -> None:
        """Guía Prueba 3: Vivienda no existe → revisa los 6 movimientos."""
        r = buscar_primer_por_categoria(movimientos_guia(), "Vivienda")
        assert r.encontrado is None
        assert r.revisados  == 6

    def test_lista_vacia(self) -> None:
        r = buscar_primer_por_categoria([], "Salario")
        assert r.encontrado is None
        assert r.revisados  == 0

    def test_break_detiene_busqueda(self) -> None:
        """Alimentación aparece en posición 2: break debe revisarse solo 2."""
        r = buscar_primer_por_categoria(movimientos_guia(), "Alimentación")
        assert r.revisados == 2  # el break detuvo el ciclo en posición 2


# ------------------------------------------------------------------ #
# 4. reporte_gastos (continue)                                        #
# ------------------------------------------------------------------ #

class TestReporteGastos:
    def test_reporte_con_datos_guia(self) -> None:
        """Guía Prueba 4: 4 gastos, total $550.000, promedio $137.500."""
        r = reporte_gastos(movimientos_guia())
        assert r.cantidad  == 4
        assert r.total     == Decimal("550000")
        assert r.promedio  == Decimal("137500")

    def test_mayor_gasto(self) -> None:
        """Guía Prueba 4: mayor gasto es Alimentación $300.000."""
        r = reporte_gastos(movimientos_guia())
        assert r.mayor_gasto is not None
        assert r.mayor_gasto.monto     == Decimal("300000")
        assert r.mayor_gasto.categoria == "Alimentación"

    def test_ingreso_y_ahorro_ignorados(self) -> None:
        """continue debe ignorar el ingreso $1.500.000 y el ahorro $200.000."""
        r = reporte_gastos(movimientos_guia())
        # Si ingreso/ahorro NO se ignoraran, el total sería mucho mayor
        assert r.total < Decimal("1500000")

    def test_lista_vacia(self) -> None:
        r = reporte_gastos([])
        assert r.cantidad     == 0
        assert r.total        == Decimal("0")
        assert r.promedio     == Decimal("0")
        assert r.mayor_gasto  is None

    def test_sin_gastos(self) -> None:
        """Solo ingresos: continue los salta todos."""
        from datetime import datetime
        solo_ingreso = [MovimientoResponse(
            id=1, tipo=TipoMovimiento.ingreso, monto=Decimal("1000000"),
            categoria="Salario", descripcion="", fecha=date(2026, 10, 1),
            fecha_creacion=datetime(2026, 10, 1),
        )]
        r = reporte_gastos(solo_ingreso)
        assert r.cantidad == 0


# ------------------------------------------------------------------ #
# 5. agrupar_por_categoria (ciclos anidados)                         #
# ------------------------------------------------------------------ #

class TestAgruparPorCategoria:
    def test_categorias_unicas(self) -> None:
        """Guía Prueba 5: 5 categorías distintas."""
        r = agrupar_por_categoria(movimientos_guia())
        assert r.total_categorias == 5

    def test_alimentacion_tiene_dos_movimientos(self) -> None:
        """Guía Prueba 5: Alimentación aparece dos veces ($300.000 + $45.000)."""
        r = agrupar_por_categoria(movimientos_guia())
        alimentacion = next(
            (sc for sc in r.categorias if sc.categoria == "Alimentación"), None
        )
        assert alimentacion is not None
        assert alimentacion.cantidad  == 2
        assert alimentacion.subtotal  == Decimal("345000")

    def test_subtotal_salario(self) -> None:
        salario = next(
            (sc for sc in agrupar_por_categoria(movimientos_guia()).categorias
             if sc.categoria == "Salario"), None
        )
        assert salario is not None
        assert salario.subtotal == Decimal("1500000")

    def test_lista_vacia(self) -> None:
        r = agrupar_por_categoria([])
        assert r.total_categorias == 0
        assert r.categorias       == []

    def test_todas_misma_categoria(self) -> None:
        """Un solo grupo cuando todos los movimientos son de la misma categoría."""
        from datetime import datetime
        movs = [
            MovimientoResponse(
                id=i, tipo=TipoMovimiento.gasto, monto=Decimal("10000"),
                categoria="Test", descripcion="", fecha=date(2026, 10, 1),
                fecha_creacion=datetime(2026, 10, 1),
            )
            for i in range(1, 4)
        ]
        r = agrupar_por_categoria(movs)
        assert r.total_categorias      == 1
        assert r.categorias[0].cantidad == 3
        assert r.categorias[0].subtotal == Decimal("30000")


# ------------------------------------------------------------------ #
# 6. Endpoints HTTP (integración)                                     #
# ------------------------------------------------------------------ #

class TestEndpointsReportes:
    def test_resumen_lista_vacia(self, client: TestClient) -> None:
        resp = client.get("/reportes/resumen")
        assert resp.status_code == 200
        data = resp.json()
        assert data["total_ingresos"]    == "0"
        assert data["porcentaje_gastos"] is None

    def test_resumen_con_datos(self, client: TestClient) -> None:
        client.post("/movimientos", json={
            "tipo": "ingreso", "monto": "1500000.00",
            "categoria": "Salario", "descripcion": "", "fecha": "2026-09-01",
        })
        client.post("/movimientos", json={
            "tipo": "gasto", "monto": "550000.00",
            "categoria": "Gastos", "descripcion": "", "fecha": "2026-09-05",
        })
        resp = client.get("/reportes/resumen")
        assert resp.status_code == 200
        data = resp.json()
        assert Decimal(data["total_ingresos"]) == Decimal("1500000")
        assert Decimal(data["saldo_disponible"]) == Decimal("950000")
        assert data["porcentaje_gastos"] is not None

    def test_reporte_gastos_endpoint(self, client: TestClient) -> None:
        client.post("/movimientos", json={
            "tipo": "gasto", "monto": "300000.00",
            "categoria": "Alimentación", "descripcion": "", "fecha": "2026-09-05",
        })
        resp = client.get("/reportes/gastos")
        assert resp.status_code == 200
        data = resp.json()
        assert data["cantidad"] == 1
        assert Decimal(data["total"]) == Decimal("300000")

    def test_reporte_categorias_endpoint(self, client: TestClient) -> None:
        client.post("/movimientos", json={
            "tipo": "gasto", "monto": "100000.00",
            "categoria": "Vivienda", "descripcion": "", "fecha": "2026-09-01",
        })
        resp = client.get("/reportes/categorias")
        assert resp.status_code == 200
        data = resp.json()
        assert data["total_categorias"] >= 1

    def test_consulta_tipo_valor_endpoint(self, client: TestClient) -> None:
        client.post("/movimientos", json={
            "tipo": "gasto", "monto": "200000.00",
            "categoria": "Servicios", "descripcion": "", "fecha": "2026-09-01",
        })
        resp = client.get("/reportes/consulta?tipo=gasto&monto_minimo=100000")
        assert resp.status_code == 200
        data = resp.json()
        assert data["cantidad"] >= 1

    def test_buscar_categoria_endpoint(self, client: TestClient) -> None:
        client.post("/movimientos", json={
            "tipo": "gasto", "monto": "85000.00",
            "categoria": "Transporte", "descripcion": "Bus", "fecha": "2026-09-10",
        })
        resp = client.get("/reportes/buscar-categoria?categoria=Transporte")
        assert resp.status_code == 200
        data = resp.json()
        assert data["encontrado"] is not None
        assert data["encontrado"]["categoria"] == "Transporte"

    def test_buscar_categoria_no_existente(self, client: TestClient) -> None:
        resp = client.get("/reportes/buscar-categoria?categoria=Inexistente")
        assert resp.status_code == 200
        data = resp.json()
        assert data["encontrado"] is None
