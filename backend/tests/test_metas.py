"""
Pruebas del recurso MetaAhorro.
"""

from fastapi.testclient import TestClient

META_VALIDA = {
    "nombre": "Viaje a Bogotá",
    "descripcion": "Vacaciones fin de año",
    "meta": "2000000.00",
    "fecha_limite": "2026-12-20",
    "emoji": "✈️",
}


def test_crear_meta_retorna_201(client: TestClient) -> None:
    r = client.post("/metas/", json=META_VALIDA)
    assert r.status_code == 201
    data = r.json()
    assert data["nombre"] == "Viaje a Bogotá"
    assert float(data["meta"]) == 2_000_000.00
    assert float(data["actual"]) == 0.0
    assert data["porcentaje"] == 0.0
    assert data["completada"] is False


def test_listar_metas(client: TestClient) -> None:
    client.post("/metas/", json=META_VALIDA)
    client.post("/metas/", json={**META_VALIDA, "nombre": "Laptop"})
    r = client.get("/metas/")
    assert r.status_code == 200
    assert len(r.json()) == 2


def test_obtener_meta_por_id(client: TestClient) -> None:
    creada = client.post("/metas/", json=META_VALIDA).json()
    r = client.get(f"/metas/{creada['id']}")
    assert r.status_code == 200
    assert r.json()["id"] == creada["id"]


def test_abonar_a_meta(client: TestClient) -> None:
    creada = client.post("/metas/", json=META_VALIDA).json()
    r = client.post(f"/metas/{creada['id']}/abonar", json={"monto": "500000.00"})
    assert r.status_code == 200
    data = r.json()
    assert float(data["actual"]) == 500_000.00
    assert data["porcentaje"] == 25.0
    assert data["completada"] is False


def test_meta_completada(client: TestClient) -> None:
    creada = client.post("/metas/", json={**META_VALIDA, "meta": "100.00"}).json()
    r = client.post(f"/metas/{creada['id']}/abonar", json={"monto": "100.00"})
    assert r.status_code == 200
    assert r.json()["completada"] is True
    assert r.json()["porcentaje"] == 100.0


def test_eliminar_meta(client: TestClient) -> None:
    creada = client.post("/metas/", json=META_VALIDA).json()
    r = client.delete(f"/metas/{creada['id']}")
    assert r.status_code == 204
    assert client.get(f"/metas/{creada['id']}").status_code == 404


def test_meta_inexistente_retorna_404(client: TestClient) -> None:
    assert client.get("/metas/9999").status_code == 404


def test_nombre_vacio_retorna_422(client: TestClient) -> None:
    r = client.post("/metas/", json={**META_VALIDA, "nombre": "   "})
    assert r.status_code == 422


def test_meta_negativa_retorna_422(client: TestClient) -> None:
    r = client.post("/metas/", json={**META_VALIDA, "meta": "-100"})
    assert r.status_code == 422


def test_historial_mensual_vacio(client: TestClient) -> None:
    r = client.get("/movimientos/historial-mensual")
    assert r.status_code == 200
    assert r.json() == []


def test_historial_mensual_con_datos(client: TestClient) -> None:
    movimiento = {
        "tipo": "ingreso", "monto": "1000000.00",
        "categoria": "Salario", "fecha": "2026-10-01",
    }
    client.post("/movimientos/", json=movimiento)
    client.post("/movimientos/", json={**movimiento, "tipo": "gasto", "monto": "400000.00"})

    r = client.get("/movimientos/historial-mensual")
    assert r.status_code == 200
    datos = r.json()
    assert len(datos) == 1
    assert datos[0]["nombre"] == "Oct"
    assert datos[0]["ingresos"] == 1_000_000.0
    assert datos[0]["gastos"] == 400_000.0
    assert datos[0]["saldo"] == 600_000.0
