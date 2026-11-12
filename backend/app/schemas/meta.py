from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, Field, field_validator

_MONTO_MAX = Decimal("999_999_999.99")


class MetaBase(BaseModel):
    nombre: str = Field(min_length=1, max_length=100)
    descripcion: str = Field(default="", max_length=300)
    meta: Decimal = Field(gt=Decimal("0"), description="Monto objetivo en COP")
    fecha_limite: date
    emoji: str = Field(default="🎯", max_length=10)

    @field_validator("meta")
    @classmethod
    def validar_meta(cls, v: Decimal) -> Decimal:
        if v > _MONTO_MAX:
            raise ValueError(f"El monto no puede superar {_MONTO_MAX:,}")
        return v.quantize(Decimal("0.01"))

    @field_validator("nombre")
    @classmethod
    def validar_nombre(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("El nombre no puede estar vacío")
        return v


class MetaCreate(MetaBase):
    pass


class MetaAbonar(BaseModel):
    """Suma un abono a la meta."""
    monto: Decimal = Field(gt=Decimal("0"), description="Monto a abonar en COP")

    @field_validator("monto")
    @classmethod
    def validar_monto(cls, v: Decimal) -> Decimal:
        return v.quantize(Decimal("0.01"))


class MetaResponse(MetaBase):
    id: int
    actual: Decimal
    porcentaje: float
    completada: bool
    creado_en: datetime

    model_config = {"from_attributes": True}
