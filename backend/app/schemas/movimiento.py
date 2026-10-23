"""
Schemas Pydantic para el recurso Movimiento.

Separación clara de responsabilidades:
- MovimientoCreate  : datos que llegan del cliente (POST)
- MovimientoUpdate  : datos para actualización parcial (PATCH)
- MovimientoResponse: datos que se devuelven al cliente (GET / POST response)

Todos los montos se reciben y devuelven como Decimal para evitar errores
de punto flotante; FastAPI los serializa como strings numéricos en JSON.
"""

from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.db.models import TipoMovimiento


class MovimientoCreate(BaseModel):
    """Schema de entrada para crear un movimiento."""

    tipo: TipoMovimiento = Field(
        ...,
        description="Tipo de movimiento: ingreso, gasto o ahorro",
    )
    monto: Decimal = Field(
        ...,
        gt=Decimal("0"),
        max_digits=14,
        decimal_places=2,
        description="Importe positivo con hasta 2 decimales",
    )
    categoria: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Categoría del movimiento (ej: Salario, Vivienda)",
    )
    descripcion: str = Field(
        default="",
        max_length=500,
        description="Descripción opcional del movimiento",
    )
    fecha: date = Field(
        ...,
        description="Fecha del movimiento en formato YYYY-MM-DD",
    )

    @field_validator("categoria")
    @classmethod
    def categoria_no_vacia(cls, v: str) -> str:
        stripped = v.strip()
        if not stripped:
            raise ValueError("La categoría no puede ser solo espacios en blanco")
        return stripped

    @field_validator("descripcion")
    @classmethod
    def descripcion_sin_espacios_extremos(cls, v: str) -> str:
        return v.strip()


class MovimientoUpdate(BaseModel):
    """Schema de entrada para actualización parcial (todos los campos opcionales)."""

    tipo: TipoMovimiento | None = None
    monto: Decimal | None = Field(
        default=None,
        gt=Decimal("0"),
        max_digits=14,
        decimal_places=2,
    )
    categoria: str | None = Field(default=None, min_length=1, max_length=100)
    descripcion: str | None = Field(default=None, max_length=500)
    fecha: date | None = None

    @field_validator("categoria")
    @classmethod
    def categoria_no_vacia(cls, v: str | None) -> str | None:
        if v is not None:
            stripped = v.strip()
            if not stripped:
                raise ValueError("La categoría no puede ser solo espacios en blanco")
            return stripped
        return v


class MovimientoResponse(BaseModel):
    """Schema de salida: lo que el cliente recibe."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    tipo: TipoMovimiento
    monto: Decimal
    categoria: str
    descripcion: str
    fecha: date
    fecha_creacion: datetime


class MovimientoListResponse(BaseModel):
    """Wrapper de lista con metadatos básicos de paginación."""

    total: int
    movimientos: list[MovimientoResponse]
