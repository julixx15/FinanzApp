"""
Lógica de negocio pura para movimientos financieros.

Este módulo no importa FastAPI ni SQLAlchemy directamente.
Es completamente testeable sin levantar servidor ni base de datos.
"""

from datetime import date
from decimal import Decimal

from app.db.models import TipoMovimiento
from app.db.repositories.movimiento_repository import MovimientoRepository
from app.schemas.movimiento import MovimientoCreate, MovimientoUpdate, MovimientoResponse


# ------------------------------------------------------------------ #
# Constantes de negocio                                               #
# ------------------------------------------------------------------ #

MONTO_MINIMO = Decimal("0.01")
MONTO_MAXIMO = Decimal("999_999_999.99")


# ------------------------------------------------------------------ #
# Errores de dominio                                                  #
# ------------------------------------------------------------------ #

class MovimientoNoEncontrado(Exception):
    """El movimiento solicitado no existe en la base de datos."""

    def __init__(self, movimiento_id: int) -> None:
        super().__init__(f"No se encontró el movimiento con id={movimiento_id}")
        self.movimiento_id = movimiento_id


class MontoFueraDeRango(Exception):
    """El monto está fuera del rango permitido por las reglas de negocio."""

    def __init__(self, monto: Decimal) -> None:
        super().__init__(
            f"El monto {monto} está fuera del rango permitido "
            f"({MONTO_MINIMO} – {MONTO_MAXIMO})"
        )


# ------------------------------------------------------------------ #
# Servicio                                                            #
# ------------------------------------------------------------------ #

class MovimientoService:
    """
    Orquesta las operaciones de negocio sobre movimientos.

    Recibe un repositorio por inyección de dependencias, lo que permite
    usar un repositorio en memoria en los tests.
    """

    def __init__(self, repo: MovimientoRepository) -> None:
        self._repo = repo

    # ---- Validaciones internas ------------------------------------ #

    def _validar_monto(self, monto: Decimal) -> None:
        """Lanza MontoFueraDeRango si el monto no cumple las reglas de negocio."""
        if monto < MONTO_MINIMO or monto > MONTO_MAXIMO:
            raise MontoFueraDeRango(monto)

    # ---- Operaciones CRUD ---------------------------------------- #

    def crear(self, data: MovimientoCreate) -> MovimientoResponse:
        """
        Valida las reglas de negocio y crea el movimiento.

        La validación de formato ya la hizo Pydantic en el schema;
        aquí se aplican restricciones de dominio adicionales.
        """
        self._validar_monto(data.monto)
        movimiento = self._repo.create(data)
        return MovimientoResponse.model_validate(movimiento)

    def obtener(self, movimiento_id: int) -> MovimientoResponse:
        """Devuelve un movimiento por id. Lanza MovimientoNoEncontrado si no existe."""
        movimiento = self._repo.get_by_id(movimiento_id)
        if movimiento is None:
            raise MovimientoNoEncontrado(movimiento_id)
        return MovimientoResponse.model_validate(movimiento)

    def listar(
        self,
        *,
        tipo: TipoMovimiento | None = None,
        categoria: str | None = None,
        fecha_desde: date | None = None,
        fecha_hasta: date | None = None,
        limit: int = 100,
        offset: int = 0,
    ) -> tuple[list[MovimientoResponse], int]:
        """
        Lista movimientos con filtros opcionales.

        Returns:
            Tupla (lista de movimientos, total sin paginación).
        """
        movimientos = self._repo.get_all(
            tipo=tipo,
            categoria=categoria,
            fecha_desde=fecha_desde,
            fecha_hasta=fecha_hasta,
            limit=limit,
            offset=offset,
        )
        total = self._repo.count(
            tipo=tipo,
            categoria=categoria,
            fecha_desde=fecha_desde,
            fecha_hasta=fecha_hasta,
        )
        return [MovimientoResponse.model_validate(m) for m in movimientos], total

    def actualizar(
        self, movimiento_id: int, data: MovimientoUpdate
    ) -> MovimientoResponse:
        """Actualiza un movimiento. Lanza MovimientoNoEncontrado si no existe."""
        if data.monto is not None:
            self._validar_monto(data.monto)
        movimiento = self._repo.update(movimiento_id, data)
        if movimiento is None:
            raise MovimientoNoEncontrado(movimiento_id)
        return MovimientoResponse.model_validate(movimiento)

    def eliminar(self, movimiento_id: int) -> None:
        """Elimina un movimiento. Lanza MovimientoNoEncontrado si no existe."""
        eliminado = self._repo.delete(movimiento_id)
        if not eliminado:
            raise MovimientoNoEncontrado(movimiento_id)

    # ---- Cálculos financieros ------------------------------------ #

    def calcular_resumen(
        self,
        *,
        fecha_desde: date | None = None,
        fecha_hasta: date | None = None,
    ) -> dict[str, Decimal]:
        """
        Calcula ingresos, gastos, ahorros y saldo disponible.

        saldo_disponible = total_ingresos - total_gastos - total_ahorros

        Returns:
            Dict con claves: total_ingresos, total_gastos, total_ahorros,
            saldo_disponible.
        """
        kwargs: dict = {}
        if fecha_desde:
            kwargs["fecha_desde"] = fecha_desde
        if fecha_hasta:
            kwargs["fecha_hasta"] = fecha_hasta

        total_ingresos = self._repo.suma_por_tipo(TipoMovimiento.ingreso, **kwargs)
        total_gastos = self._repo.suma_por_tipo(TipoMovimiento.gasto, **kwargs)
        total_ahorros = self._repo.suma_por_tipo(TipoMovimiento.ahorro, **kwargs)
        saldo_disponible = total_ingresos - total_gastos - total_ahorros

        return {
            "total_ingresos": total_ingresos,
            "total_gastos": total_gastos,
            "total_ahorros": total_ahorros,
            "saldo_disponible": saldo_disponible,
        }
