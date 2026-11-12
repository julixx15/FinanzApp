"""
Schemas Pydantic para el recurso Movimiento.

Convención de montos:
- Entrada y salida usan `monto` como Decimal con 2 decimales (pesos COP).
- Internamente el repositorio convierte a/desde centavos.
- El JSON final envía el monto como número (compatible con frontend TypeScript).
"""

from datetime import date, datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, Field, field_validator, model_validator

TipoMovimiento = Literal["ingreso", "gasto", "ahorro"]

_MONTO_MIN = Decimal("0.01")
_MONTO_MAX = Decimal("999_999_999.99")
_CATEGORIA_MAX = 100
_DESCRIPCION_MAX = 300


class MovimientoBase(BaseModel):
    tipo: TipoMovimiento = Field(description="Tipo de movimiento: ingreso, gasto o ahorro")
    monto: Decimal = Field(
        gt=Decimal("0"),
        description="Monto positivo en pesos COP. Máximo: 999,999,999.99",
    )
    categoria: str = Field(min_length=1, max_length=_CATEGORIA_MAX, description="Categoría del movimiento")
    descripcion: str = Field(default="", max_length=_DESCRIPCION_MAX, description="Descripción opcional")
    fecha: date = Field(description="Fecha del movimiento (YYYY-MM-DD)")

    @field_validator("monto")
    @classmethod
    def validar_monto(cls, v: Decimal) -> Decimal:
        if v > _MONTO_MAX:
            raise ValueError(f"El monto no puede superar {_MONTO_MAX:,}")
        # Redondear a 2 decimales para evitar representaciones extrañas
        return v.quantize(Decimal("0.01"))

    @field_validator("categoria")
    @classmethod
    def validar_categoria(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("La categoría no puede estar vacía")
        return v

    @field_validator("descripcion")
    @classmethod
    def limpiar_descripcion(cls, v: str) -> str:
        return v.strip()

    @field_validator("fecha")
    @classmethod
    def validar_fecha(cls, v: date) -> date:
        from datetime import date as date_type
        min_fecha = date_type(2000, 1, 1)
        max_fecha = date_type(2100, 12, 31)
        if v < min_fecha or v > max_fecha:
            raise ValueError("La fecha debe estar entre 2000-01-01 y 2100-12-31")
        return v


class MovimientoCreate(MovimientoBase):
    """Schema de entrada para crear un movimiento."""
    pass


class MovimientoUpdate(BaseModel):
    """Schema de actualización parcial (todos los campos opcionales)."""
    tipo: TipoMovimiento | None = None
    monto: Decimal | None = Field(default=None, gt=Decimal("0"))
    categoria: str | None = Field(default=None, min_length=1, max_length=_CATEGORIA_MAX)
    descripcion: str | None = Field(default=None, max_length=_DESCRIPCION_MAX)
    fecha: date | None = None

    @model_validator(mode="after")
    def al_menos_un_campo(self) -> "MovimientoUpdate":
        if all(v is None for v in [self.tipo, self.monto, self.categoria, self.descripcion, self.fecha]):
            raise ValueError("Debe proporcionar al menos un campo para actualizar")
        return self

    @field_validator("monto")
    @classmethod
    def validar_monto(cls, v: Decimal | None) -> Decimal | None:
        if v is not None and v > _MONTO_MAX:
            raise ValueError(f"El monto no puede superar {_MONTO_MAX:,}")
        if v is not None:
            return v.quantize(Decimal("0.01"))
        return v


class MovimientoResponse(MovimientoBase):
    """Schema de salida — incluye campos generados por el servidor."""
    id: int
    creado_en: datetime

    model_config = {"from_attributes": True}


class ResumenResponse(BaseModel):
    """Resumen financiero calculado."""
    total_ingresos: Decimal
    total_gastos: Decimal
    total_ahorros: Decimal
    saldo_disponible: Decimal

    model_config = {"from_attributes": True}
