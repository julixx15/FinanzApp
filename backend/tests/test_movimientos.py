"""
Pruebas de persistencia, validación y manejo de datos incorrectos
para el recurso Movimiento.
"""

import pytest
from fastapi.testclient import TestClient


# ─── Datos base válidos ────────────────────────────────────────────────────────

MOVIMIENTO_VALIDO = {
    "tipo": "ingreso",
    "monto": "3200000.00",
    "categoria": "Salario",
    "descripcion": "Nómina octubre",
    "fecha": "2026-10-01",
}


# ─── Creación ─────────────────────────────────────────────────────────────────

def test_crear_movimiento_retorna_201(client: TestClient) -> None:
    r = client.post("/movimientos/", json=MOVIMIENTO_VALIDO)
    assert r.status_code == 201
    data = r.json()
    assert data["id"] == 1
    assert data["tipo"] == "ingreso"
    assert float(data["monto"]) == 3200000.00
    assert data["categoria"] == "Salario"
    assert data["descripcion"] == "Nómina octubre"
    assert data["fecha"] == "2026-10-01"
    assert "creado_en" in data


def test_crear_tres_tipos(client: TestClient) -> None:
    for tipo, monto in [("ingreso", "1000.00"), ("gasto", "500.50"), ("ahorro", "200.00")]:
        r = client.post("/movimientos/", json={**MOVIMIENTO_VALIDO, "tipo": tipo, "monto": monto})
        assert r.status_code == 201
        assert r.json()["tipo"] == tipo


# ─── Persistencia ─────────────────────────────────────────────────────────────

def test_movimiento_persiste_tras_creacion(client: TestClient) -> None:
    """Crea un movimiento y lo recupera por ID."""
    creado = client.post("/movimientos/", json=MOVIMIENTO_VALIDO).json()
    r = client.get(f"/movimientos/{creado['id']}")
    assert r.status_code == 200
    assert r.json()["id"] == creado["id"]
    assert r.json()["monto"] == creado["monto"]


def test_listar_devuelve_todos_los_creados(client: TestClient) -> None:
    for i in range(3):
        client.post("/movimientos/", json={**MOVIMIENTO_VALIDO, "descripcion": f"Mov {i}"})
    r = client.get("/movimientos/")
    assert r.status_code == 200
    assert len(r.json()) == 3


# ─── Filtros ──────────────────────────────────────────────────────────────────

def test_filtrar_por_tipo(client: TestClient) -> None:
    client.post("/movimientos/", json={**MOVIMIENTO_VALIDO, "tipo": "ingreso"})
    client.post("/movimientos/", json={**MOVIMIENTO_VALIDO, "tipo": "gasto"})
    client.post("/movimientos/", json={**MOVIMIENTO_VALIDO, "tipo": "ahorro"})

    r = client.get("/movimientos/?tipo=gasto")
    assert r.status_code == 200
    assert all(m["tipo"] == "gasto" for m in r.json())
    assert len(r.json()) == 1


def test_filtrar_por_categoria(client: TestClient) -> None:
    client.post("/movimientos/", json={**MOVIMIENTO_VALIDO, "categoria": "Salario"})
    client.post("/movimientos/", json={**MOVIMIENTO_VALIDO, "categoria": "Freelance"})

    r = client.get("/movimientos/?categoria=Freelance")
    assert r.status_code == 200
    assert len(r.json()) == 1
    assert r.json()[0]["categoria"] == "Freelance"


# ─── Resumen financiero ────────────────────────────────────────────────────────

def test_resumen_calcula_saldo_correctamente(client: TestClient) -> None:
    client.post("/movimientos/", json={**MOVIMIENTO_VALIDO, "tipo": "ingreso", "monto": "1000000.00"})
    client.post("/movimientos/", json={**MOVIMIENTO_VALIDO, "tipo": "gasto",   "monto":  "300000.00"})
    client.post("/movimientos/", json={**MOVIMIENTO_VALIDO, "tipo": "ahorro",  "monto":  "200000.00"})

    r = client.get("/movimientos/resumen")
    assert r.status_code == 200
    data = r.json()
    assert float(data["total_ingresos"])   == 1_000_000.00
    assert float(data["total_gastos"])     ==   300_000.00
    assert float(data["total_ahorros"])    ==   200_000.00
    assert float(data["saldo_disponible"]) ==   500_000.00


def test_resumen_vacio_es_cero(client: TestClient) -> None:
    r = client.get("/movimientos/resumen")
    assert r.status_code == 200
    data = r.json()
    assert float(data["saldo_disponible"]) == 0.0


# ─── Categorías ───────────────────────────────────────────────────────────────

def test_categorias_unicas_ordenadas(client: TestClient) -> None:
    client.post("/movimientos/", json={**MOVIMIENTO_VALIDO, "categoria": "Vivienda"})
    client.post("/movimientos/", json={**MOVIMIENTO_VALIDO, "categoria": "Salario"})
    client.post("/movimientos/", json={**MOVIMIENTO_VALIDO, "categoria": "Salario"})  # duplicado

    r = client.get("/movimientos/categorias")
    assert r.status_code == 200
    cats = r.json()
    assert cats == sorted(set(cats))
    assert len(cats) == 2


# ─── Actualización ────────────────────────────────────────────────────────────

def test_actualizar_monto_parcialmente(client: TestClient) -> None:
    creado = client.post("/movimientos/", json=MOVIMIENTO_VALIDO).json()
    r = client.patch(f"/movimientos/{creado['id']}", json={"monto": "500000.00"})
    assert r.status_code == 200
    assert float(r.json()["monto"]) == 500_000.00
    assert r.json()["tipo"] == "ingreso"  # sin cambios


def test_actualizar_inexistente_retorna_404(client: TestClient) -> None:
    r = client.patch("/movimientos/9999", json={"monto": "100.00"})
    assert r.status_code == 404


# ─── Eliminación ──────────────────────────────────────────────────────────────

def test_eliminar_movimiento(client: TestClient) -> None:
    creado = client.post("/movimientos/", json=MOVIMIENTO_VALIDO).json()
    r = client.delete(f"/movimientos/{creado['id']}")
    assert r.status_code == 204

    r2 = client.get(f"/movimientos/{creado['id']}")
    assert r2.status_code == 404


def test_eliminar_inexistente_retorna_404(client: TestClient) -> None:
    r = client.delete("/movimientos/9999")
    assert r.status_code == 404


# ─── Validaciones — datos inválidos ───────────────────────────────────────────

@pytest.mark.parametrize("monto", ["-100", "0", "-0.01", "0.00"])
def test_monto_negativo_o_cero_retorna_422(client: TestClient, monto: str) -> None:
    r = client.post("/movimientos/", json={**MOVIMIENTO_VALIDO, "monto": monto})
    assert r.status_code == 422


def test_tipo_invalido_retorna_422(client: TestClient) -> None:
    r = client.post("/movimientos/", json={**MOVIMIENTO_VALIDO, "tipo": "deuda"})
    assert r.status_code == 422


def test_categoria_vacia_retorna_422(client: TestClient) -> None:
    r = client.post("/movimientos/", json={**MOVIMIENTO_VALIDO, "categoria": "   "})
    assert r.status_code == 422


def test_campo_obligatorio_faltante_retorna_422(client: TestClient) -> None:
    # Sin tipo
    datos = {k: v for k, v in MOVIMIENTO_VALIDO.items() if k != "tipo"}
    r = client.post("/movimientos/", json=datos)
    assert r.status_code == 422


def test_fecha_invalida_retorna_422(client: TestClient) -> None:
    r = client.post("/movimientos/", json={**MOVIMIENTO_VALIDO, "fecha": "no-es-fecha"})
    assert r.status_code == 422


def test_monto_fuera_de_rango_retorna_422(client: TestClient) -> None:
    r = client.post("/movimientos/", json={**MOVIMIENTO_VALIDO, "monto": "9999999999.99"})
    assert r.status_code == 422


def test_descripcion_muy_larga_retorna_422(client: TestClient) -> None:
    r = client.post("/movimientos/", json={**MOVIMIENTO_VALIDO, "descripcion": "x" * 301})
    assert r.status_code == 422


def test_id_inexistente_retorna_404(client: TestClient) -> None:
    r = client.get("/movimientos/99999")
    assert r.status_code == 404


def test_actualizar_sin_campos_retorna_422(client: TestClient) -> None:
    creado = client.post("/movimientos/", json=MOVIMIENTO_VALIDO).json()
    r = client.patch(f"/movimientos/{creado['id']}", json={})
    assert r.status_code == 422
