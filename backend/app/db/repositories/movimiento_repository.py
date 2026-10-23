"""
Repositorio de Movimientos.

Encapsula todo el acceso a la base de datos para el recurso Movimiento.
La lógica de negocio vive en app/core/; las rutas HTTP en app/api/.
"""

from datetime import date
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import Movimiento, TipoMovimiento
from app.schemas.movimiento import MovimientoCreate, MovimientoUpdate


class MovimientoRepository:
    """CRUD de movimientos sobre SQLAlchemy Session."""

    def __init__(self, db: Session) -> None:
        self._db = db

    # ------------------------------------------------------------------ #
    # Lectura                                                              #
    # ------------------------------------------------------------------ #

    def get_by_id(self, movimiento_id: int) -> Movimiento | None:
        """Devuelve un movimiento por id o None si no existe."""
        return self._db.get(Movimiento, movimiento_id)

    def get_all(
        self,
        *,
        tipo: TipoMovimiento | None = None,
        categoria: str | None = None,
        fecha_desde: date | None = None,
        fecha_hasta: date | None = None,
        limit: int = 100,
        offset: int = 0,
    ) -> list[Movimiento]:
        """
        Lista movimientos con filtros opcionales.

        Args:
            tipo: filtra por tipo de movimiento.
            categoria: filtra por categoría exacta (case-insensitive).
            fecha_desde: filtra movimientos a partir de esta fecha (inclusive).
            fecha_hasta: filtra movimientos hasta esta fecha (inclusive).
            limit: máximo de resultados (default 100).
            offset: desplazamiento para paginación.
        """
        stmt = select(Movimiento)

        if tipo is not None:
            stmt = stmt.where(Movimiento.tipo == tipo)
        if categoria is not None:
            stmt = stmt.where(Movimiento.categoria.ilike(categoria))
        if fecha_desde is not None:
            stmt = stmt.where(Movimiento.fecha >= fecha_desde)
        if fecha_hasta is not None:
            stmt = stmt.where(Movimiento.fecha <= fecha_hasta)

        stmt = stmt.order_by(Movimiento.fecha.desc(), Movimiento.id.desc())
        stmt = stmt.limit(limit).offset(offset)

        return list(self._db.scalars(stmt).all())

    def count(
        self,
        *,
        tipo: TipoMovimiento | None = None,
        categoria: str | None = None,
        fecha_desde: date | None = None,
        fecha_hasta: date | None = None,
    ) -> int:
        """Cuenta movimientos con los mismos filtros que get_all."""
        from sqlalchemy import func

        stmt = select(func.count()).select_from(Movimiento)

        if tipo is not None:
            stmt = stmt.where(Movimiento.tipo == tipo)
        if categoria is not None:
            stmt = stmt.where(Movimiento.categoria.ilike(categoria))
        if fecha_desde is not None:
            stmt = stmt.where(Movimiento.fecha >= fecha_desde)
        if fecha_hasta is not None:
            stmt = stmt.where(Movimiento.fecha <= fecha_hasta)

        return self._db.scalar(stmt) or 0

    # ------------------------------------------------------------------ #
    # Escritura                                                            #
    # ------------------------------------------------------------------ #

    def create(self, data: MovimientoCreate) -> Movimiento:
        """Crea y persiste un nuevo movimiento."""
        movimiento = Movimiento(
            tipo=data.tipo,
            monto=data.monto,
            categoria=data.categoria,
            descripcion=data.descripcion,
            fecha=data.fecha,
        )
        self._db.add(movimiento)
        self._db.commit()
        self._db.refresh(movimiento)
        return movimiento

    def update(self, movimiento_id: int, data: MovimientoUpdate) -> Movimiento | None:
        """
        Actualiza parcialmente un movimiento existente.

        Devuelve el movimiento actualizado o None si no existe.
        """
        movimiento = self.get_by_id(movimiento_id)
        if movimiento is None:
            return None

        cambios = data.model_dump(exclude_unset=True)
        for campo, valor in cambios.items():
            setattr(movimiento, campo, valor)

        self._db.commit()
        self._db.refresh(movimiento)
        return movimiento

    def delete(self, movimiento_id: int) -> bool:
        """
        Elimina un movimiento por id.

        Devuelve True si existía y fue eliminado, False si no existía.
        """
        movimiento = self.get_by_id(movimiento_id)
        if movimiento is None:
            return False

        self._db.delete(movimiento)
        self._db.commit()
        return True

    # ------------------------------------------------------------------ #
    # Agregados (usados por core/)                                         #
    # ------------------------------------------------------------------ #

    def suma_por_tipo(
        self,
        tipo: TipoMovimiento,
        *,
        fecha_desde: date | None = None,
        fecha_hasta: date | None = None,
    ) -> Decimal:
        """Suma el monto total de un tipo de movimiento en el rango de fechas."""
        from sqlalchemy import func

        stmt = select(func.coalesce(func.sum(Movimiento.monto), 0)).where(
            Movimiento.tipo == tipo
        )
        if fecha_desde is not None:
            stmt = stmt.where(Movimiento.fecha >= fecha_desde)
        if fecha_hasta is not None:
            stmt = stmt.where(Movimiento.fecha <= fecha_hasta)

        result = self._db.scalar(stmt)
        return Decimal(str(result)) if result is not None else Decimal("0")
