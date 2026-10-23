"""
Modelos SQLAlchemy para FinanzApp.

Separados de los schemas Pydantic (app/schemas/) y de la lógica de negocio
(app/core/). Este módulo solo describe la estructura de la base de datos.
"""

import enum
from datetime import date, datetime

from sqlalchemy import Date, DateTime, Enum, Integer, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class TipoMovimiento(str, enum.Enum):
    """Tipos válidos de movimiento financiero."""

    ingreso = "ingreso"
    gasto = "gasto"
    ahorro = "ahorro"


class Movimiento(Base):
    """
    Tabla principal de movimientos financieros.

    - `monto` usa Numeric(14, 2) para evitar errores de punto flotante.
    - `fecha_creacion` se asigna automáticamente por la base de datos.
    - No se almacena información personal ni contraseñas.
    """

    __tablename__ = "movimientos"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    tipo: Mapped[TipoMovimiento] = mapped_column(
        Enum(TipoMovimiento, name="tipo_movimiento"),
        nullable=False,
    )

    # Numeric(14, 2): hasta 14 dígitos totales, 2 decimales. Evita float.
    monto: Mapped[int] = mapped_column(
        Numeric(precision=14, scale=2),
        nullable=False,
    )

    categoria: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    descripcion: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
        default="",
    )

    fecha: Mapped[date] = mapped_column(
        Date,
        nullable=False,
    )

    fecha_creacion: Mapped[datetime] = mapped_column(
        DateTime(timezone=False),
        nullable=False,
        server_default=func.now(),
    )

    def __repr__(self) -> str:
        return (
            f"<Movimiento id={self.id} tipo={self.tipo.value} "
            f"monto={self.monto} fecha={self.fecha}>"
        )
