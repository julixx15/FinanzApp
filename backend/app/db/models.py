"""
Modelos SQLAlchemy para FinanzApp.

Estrategia monetaria:
- Los montos se almacenan como INTEGER en centavos (x100).
- Conversión a/desde Decimal ocurre en los repositorios.
"""

from datetime import date, datetime

from sqlalchemy import CheckConstraint, DateTime, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class MovimientoModel(Base):
    __tablename__ = "movimientos"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    tipo: Mapped[str] = mapped_column(String(10), nullable=False)
    monto_centavos: Mapped[int] = mapped_column(Integer, nullable=False)
    categoria: Mapped[str] = mapped_column(String(100), nullable=False)
    descripcion: Mapped[str] = mapped_column(String(300), nullable=False, default="")
    fecha: Mapped[date] = mapped_column(nullable=False)
    creado_en: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    __table_args__ = (
        CheckConstraint("tipo IN ('ingreso', 'gasto', 'ahorro')", name="ck_tipo_valido"),
        CheckConstraint("monto_centavos > 0", name="ck_monto_positivo"),
        CheckConstraint("length(trim(categoria)) > 0", name="ck_categoria_no_vacia"),
    )

    def __repr__(self) -> str:
        return f"<Movimiento id={self.id} tipo={self.tipo} monto_centavos={self.monto_centavos}>"


class MetaAhorroModel(Base):
    __tablename__ = "metas_ahorro"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    nombre: Mapped[str] = mapped_column(String(100), nullable=False)
    descripcion: Mapped[str] = mapped_column(String(300), nullable=False, default="")
    # montos en centavos
    meta_centavos: Mapped[int] = mapped_column(Integer, nullable=False)
    actual_centavos: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    fecha_limite: Mapped[date] = mapped_column(nullable=False)
    emoji: Mapped[str] = mapped_column(String(10), nullable=False, default="🎯")
    creado_en: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    __table_args__ = (
        CheckConstraint("meta_centavos > 0", name="ck_meta_positiva"),
        CheckConstraint("actual_centavos >= 0", name="ck_actual_no_negativo"),
        CheckConstraint("length(trim(nombre)) > 0", name="ck_nombre_meta_no_vacio"),
    )

    def __repr__(self) -> str:
        return f"<MetaAhorro id={self.id} nombre={self.nombre}>"
