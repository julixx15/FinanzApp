"""
Modelos SQLAlchemy para FinanzApp.

Estrategia monetaria:
- Los montos se almacenan como INTEGER en centavos (x100) para evitar
  errores de punto flotante en cálculos financieros.
- La conversión a/desde Decimal ocurre en los schemas Pydantic.
- Ejemplo: $3.200.000 COP → 320000000 centavos en la base de datos.
"""

from datetime import date, datetime

from sqlalchemy import CheckConstraint, DateTime, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base

TIPOS_VALIDOS = ("ingreso", "gasto", "ahorro")


class MovimientoModel(Base):
    """Representa un movimiento financiero (ingreso, gasto o ahorro)."""

    __tablename__ = "movimientos"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    tipo: Mapped[str] = mapped_column(
        String(10),
        nullable=False,
        comment="Tipo de movimiento: ingreso | gasto | ahorro",
    )

    # Monto en centavos (entero positivo)
    monto_centavos: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        comment="Monto en centavos (entero). Ejemplo: $1.500 → 150000",
    )

    categoria: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        comment="Categoría del movimiento",
    )

    descripcion: Mapped[str] = mapped_column(
        String(300),
        nullable=False,
        default="",
        comment="Descripción opcional del movimiento",
    )

    fecha: Mapped[date] = mapped_column(
        nullable=False,
        comment="Fecha del movimiento (YYYY-MM-DD)",
    )

    creado_en: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        comment="Timestamp de creación (UTC)",
    )

    __table_args__ = (
        CheckConstraint("tipo IN ('ingreso', 'gasto', 'ahorro')", name="ck_tipo_valido"),
        CheckConstraint("monto_centavos > 0", name="ck_monto_positivo"),
        CheckConstraint("length(trim(categoria)) > 0", name="ck_categoria_no_vacia"),
    )

    def __repr__(self) -> str:
        return f"<Movimiento id={self.id} tipo={self.tipo} monto={self.monto_centavos}>"
