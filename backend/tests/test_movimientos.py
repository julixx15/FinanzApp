"""
Tests de persistencia, validación y manejo de errores para Movimientos.

Cubre:
1. Creación exitosa de los tres tipos de movimiento.
2. Lectura y persistencia tras reinicio simulado (nueva sesión).
3. Listado con filtros.
4. Actualización parcial.
5. Eliminación.
6. Validación: monto negativo, monto cero, campos obligatorios faltantes.
7. Tipos inválidos.
8. Movimiento no encontrado (404).
9. Resumen financiero coherente con los movimientos creados.
"""

import pytest
from decimal import Decimal
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.db.models import Movimiento, TipoMovimiento
from app.db.repositories.movimiento_repository import MovimientoRepository
from app.core.movimientos import MovimientoService, MovimientoNoEncontrado
from app.schemas.movimiento import MovimientoCreate


# ------------------------------------------------------------------ #
# Helpers                                                             #
# ------------------------------------------------------------------ #

def payload_base(**overrides) -> dict:
    """Payload válido por defecto para crear un movimiento."""
    data = {
        "tipo": "ingreso",
        "monto": "150000.00",
        "categoria": "Salario",
        "descripcion": "Pago quincenal",
        "fecha": "2026-10-01",
    }
    data.update(overrides)
    return data


# ------------------------------------------------------------------ #
# 1. Creación exitosa                                                 #
# ------------------------------------------------------------------ #

class TestCreacionMovimiento:
    def test_crear_ingreso(self, client: TestClient) -> None:
        response = client.post("/movimientos", json=payload_base(tipo="ingreso"))
        assert response.status_code == 201
        data = response.json()
        assert data["tipo"] == "ingreso"
        assert Decimal(data["monto"]) == Decimal("150000.00")
        assert data["id"] > 0
        assert "fecha_creacion" in data

    def test_crear_gasto(self, client: TestClient) -> None:
        response = client.post("/movimientos", json=payload_base(tipo="gasto", monto="50000.50"))
        assert response.status_code == 201
        assert response.json()["tipo"] == "gasto"

    def test_crear_ahorro(self, client: TestClient) -> None:
        response = client.post("/movimientos", json=payload_base(tipo="ahorro", monto="200000.00"))
        assert response.status_code == 201
        assert response.json()["tipo"] == "ahorro"

    def test_descripcion_opcional(self, client: TestClient) -> None:
        """Descripción puede estar vacía."""
        response = client.post("/movimientos", json=payload_base(descripcion=""))
        assert response.status_code == 201
        assert response.json()["descripcion"] == ""


# ------------------------------------------------------------------ #
# 2. Persistencia: crear y leer con repositorio directo              #
# ------------------------------------------------------------------ #

class TestPersistencia:
    def test_movimiento_persiste_en_bd(self, db_session: Session) -> None:
        """Crea un movimiento y lo recupera en la misma sesión."""
        repo = MovimientoRepository(db_session)
        data = MovimientoCreate(
            tipo=TipoMovimiento.ingreso,
            monto=Decimal("320000.00"),
            categoria="Freelance",
            descripcion="Proyecto web",
            fecha="2026-10-05",
        )
        creado = repo.create(data)
        assert creado.id is not None

        recuperado = repo.get_by_id(creado.id)
        assert recuperado is not None
        assert recuperado.tipo == TipoMovimiento.ingreso
        assert Decimal(str(recuperado.monto)) == Decimal("320000.00")
        assert recuperado.categoria == "Freelance"
        assert str(recuperado.fecha) == "2026-10-05"

    def test_fecha_creacion_se_asigna_automaticamente(self, db_session: Session) -> None:
        repo = MovimientoRepository(db_session)
        data = MovimientoCreate(
            tipo=TipoMovimiento.gasto,
            monto=Decimal("10000.00"),
            categoria="Transporte",
            descripcion="",
            fecha="2026-10-10",
        )
        creado = repo.create(data)
        assert creado.fecha_creacion is not None

    def test_movimiento_no_existe_devuelve_none(self, db_session: Session) -> None:
        repo = MovimientoRepository(db_session)
        assert repo.get_by_id(99999) is None

    def test_persistencia_simulando_reinicio(self, db_engine) -> None:
        """
        Simula reinicio abriendo dos sesiones distintas sobre el mismo motor.
        Verifica que lo guardado en sesión 1 es visible en sesión 2.
        """
        from sqlalchemy.orm import sessionmaker

        SessionFactory = sessionmaker(bind=db_engine)

        # Sesión 1: crear
        session1 = SessionFactory()
        repo1 = MovimientoRepository(session1)
        data = MovimientoCreate(
            tipo=TipoMovimiento.ahorro,
            monto=Decimal("500000.00"),
            categoria="Fondo emergencia",
            descripcion="Ahorro mensual",
            fecha="2026-10-08",
        )
        creado = repo1.create(data)
        movimiento_id = creado.id
        session1.close()

        # Sesión 2: leer
        session2 = SessionFactory()
        repo2 = MovimientoRepository(session2)
        recuperado = repo2.get_by_id(movimiento_id)
        assert recuperado is not None
        assert recuperado.categoria == "Fondo emergencia"
        session2.close()


# ------------------------------------------------------------------ #
# 3. Listado y filtros                                                #
# ------------------------------------------------------------------ #

class TestListado:
    def _crear_varios(self, client: TestClient) -> None:
        client.post("/movimientos", json=payload_base(tipo="ingreso", monto="100000"))
        client.post("/movimientos", json=payload_base(tipo="gasto", monto="50000", categoria="Vivienda"))
        client.post("/movimientos", json=payload_base(tipo="ahorro", monto="30000", categoria="Vacaciones"))

    def test_listar_todos(self, client: TestClient) -> None:
        self._crear_varios(client)
        response = client.get("/movimientos")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 3
        assert len(data["movimientos"]) == 3

    def test_filtrar_por_tipo(self, client: TestClient) -> None:
        self._crear_varios(client)
        response = client.get("/movimientos?tipo=gasto")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert data["movimientos"][0]["tipo"] == "gasto"

    def test_filtrar_por_categoria(self, client: TestClient) -> None:
        self._crear_varios(client)
        response = client.get("/movimientos?categoria=Vacaciones")
        assert response.status_code == 200
        assert response.json()["total"] == 1

    def test_paginacion(self, client: TestClient) -> None:
        self._crear_varios(client)
        response = client.get("/movimientos?limit=2&offset=0")
        assert response.status_code == 200
        data = response.json()
        assert len(data["movimientos"]) == 2
        assert data["total"] == 3  # total sin paginación


# ------------------------------------------------------------------ #
# 4. Actualización parcial                                            #
# ------------------------------------------------------------------ #

class TestActualizacion:
    def test_actualizar_monto(self, client: TestClient) -> None:
        creado = client.post("/movimientos", json=payload_base()).json()
        response = client.patch(f"/movimientos/{creado['id']}", json={"monto": "999.99"})
        assert response.status_code == 200
        assert Decimal(response.json()["monto"]) == Decimal("999.99")

    def test_actualizar_categoria(self, client: TestClient) -> None:
        creado = client.post("/movimientos", json=payload_base()).json()
        response = client.patch(f"/movimientos/{creado['id']}", json={"categoria": "Freelance"})
        assert response.status_code == 200
        assert response.json()["categoria"] == "Freelance"

    def test_actualizar_no_existente_404(self, client: TestClient) -> None:
        response = client.patch("/movimientos/99999", json={"monto": "100"})
        assert response.status_code == 404


# ------------------------------------------------------------------ #
# 5. Eliminación                                                      #
# ------------------------------------------------------------------ #

class TestEliminacion:
    def test_eliminar_existente(self, client: TestClient) -> None:
        creado = client.post("/movimientos", json=payload_base()).json()
        response = client.delete(f"/movimientos/{creado['id']}")
        assert response.status_code == 204

        # Ya no debe existir
        get_response = client.get(f"/movimientos/{creado['id']}")
        assert get_response.status_code == 404

    def test_eliminar_no_existente_404(self, client: TestClient) -> None:
        response = client.delete("/movimientos/99999")
        assert response.status_code == 404


# ------------------------------------------------------------------ #
# 6. Validación de montos incorrectos                                 #
# ------------------------------------------------------------------ #

class TestValidacionMonto:
    def test_monto_negativo_rechazado(self, client: TestClient) -> None:
        response = client.post("/movimientos", json=payload_base(monto="-100"))
        assert response.status_code == 422

    def test_monto_cero_rechazado(self, client: TestClient) -> None:
        response = client.post("/movimientos", json=payload_base(monto="0"))
        assert response.status_code == 422

    def test_monto_string_no_numerico_rechazado(self, client: TestClient) -> None:
        response = client.post("/movimientos", json=payload_base(monto="abc"))
        assert response.status_code == 422

    def test_monto_muy_grande_rechazado(self, client: TestClient) -> None:
        """Más de 14 dígitos totales debe ser rechazado."""
        response = client.post("/movimientos", json=payload_base(monto="9999999999999.99"))
        assert response.status_code == 422


# ------------------------------------------------------------------ #
# 7. Validación de campos obligatorios                                #
# ------------------------------------------------------------------ #

class TestCamposObligatorios:
    def test_sin_tipo_rechazado(self, client: TestClient) -> None:
        data = payload_base()
        del data["tipo"]
        assert client.post("/movimientos", json=data).status_code == 422

    def test_sin_monto_rechazado(self, client: TestClient) -> None:
        data = payload_base()
        del data["monto"]
        assert client.post("/movimientos", json=data).status_code == 422

    def test_sin_categoria_rechazado(self, client: TestClient) -> None:
        data = payload_base()
        del data["categoria"]
        assert client.post("/movimientos", json=data).status_code == 422

    def test_sin_fecha_rechazado(self, client: TestClient) -> None:
        data = payload_base()
        del data["fecha"]
        assert client.post("/movimientos", json=data).status_code == 422

    def test_categoria_solo_espacios_rechazada(self, client: TestClient) -> None:
        response = client.post("/movimientos", json=payload_base(categoria="   "))
        assert response.status_code == 422

    def test_tipo_invalido_rechazado(self, client: TestClient) -> None:
        response = client.post("/movimientos", json=payload_base(tipo="deuda"))
        assert response.status_code == 422

    def test_fecha_formato_invalido_rechazada(self, client: TestClient) -> None:
        response = client.post("/movimientos", json=payload_base(fecha="01-10-2026"))
        assert response.status_code == 422


# ------------------------------------------------------------------ #
# 8. Lógica de negocio: resumen financiero                           #
# ------------------------------------------------------------------ #

class TestResumenFinanciero:
    def test_resumen_coherente(self, db_session: Session) -> None:
        """
        Crea movimientos con montos conocidos y verifica que el resumen
        coincide con el cálculo manual.
        """
        repo = MovimientoRepository(db_session)
        service = MovimientoService(repo)

        service.crear(MovimientoCreate(
            tipo=TipoMovimiento.ingreso,
            monto=Decimal("3200000.00"),
            categoria="Salario",
            descripcion="",
            fecha="2026-10-01",
        ))
        service.crear(MovimientoCreate(
            tipo=TipoMovimiento.gasto,
            monto=Decimal("850000.00"),
            categoria="Vivienda",
            descripcion="",
            fecha="2026-10-05",
        ))
        service.crear(MovimientoCreate(
            tipo=TipoMovimiento.ahorro,
            monto=Decimal("500000.00"),
            categoria="Fondo emergencia",
            descripcion="",
            fecha="2026-10-08",
        ))

        resumen = service.calcular_resumen()

        assert resumen["total_ingresos"] == Decimal("3200000.00")
        assert resumen["total_gastos"] == Decimal("850000.00")
        assert resumen["total_ahorros"] == Decimal("500000.00")
        assert resumen["saldo_disponible"] == Decimal("1850000.00")

    def test_resumen_sin_movimientos(self, db_session: Session) -> None:
        repo = MovimientoRepository(db_session)
        service = MovimientoService(repo)
        resumen = service.calcular_resumen()
        assert resumen["saldo_disponible"] == Decimal("0")

    def test_error_dominio_movimiento_no_encontrado(self, db_session: Session) -> None:
        repo = MovimientoRepository(db_session)
        service = MovimientoService(repo)
        with pytest.raises(MovimientoNoEncontrado):
            service.obtener(99999)
