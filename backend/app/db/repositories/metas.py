from decimal import Decimal

from sqlalchemy.orm import Session

from app.db.models import MetaAhorroModel
from app.schemas.meta import MetaCreate

_CENTAVOS = Decimal("100")


def _a_centavos(monto: Decimal) -> int:
    return int((monto * _CENTAVOS).to_integral_value())


def _desde_centavos(centavos: int) -> Decimal:
    return (Decimal(centavos) / _CENTAVOS).quantize(Decimal("0.01"))


def crear(db: Session, datos: MetaCreate) -> MetaAhorroModel:
    meta = MetaAhorroModel(
        nombre=datos.nombre,
        descripcion=datos.descripcion,
        meta_centavos=_a_centavos(datos.meta),
        actual_centavos=0,
        fecha_limite=datos.fecha_limite,
        emoji=datos.emoji,
    )
    db.add(meta)
    db.commit()
    db.refresh(meta)
    return meta


def listar(db: Session) -> list[MetaAhorroModel]:
    return db.query(MetaAhorroModel).order_by(MetaAhorroModel.fecha_limite).all()


def obtener_por_id(db: Session, meta_id: int) -> MetaAhorroModel | None:
    return db.get(MetaAhorroModel, meta_id)


def abonar(db: Session, meta: MetaAhorroModel, monto: Decimal) -> MetaAhorroModel:
    meta.actual_centavos += _a_centavos(monto)
    db.commit()
    db.refresh(meta)
    return meta


def eliminar(db: Session, meta: MetaAhorroModel) -> None:
    db.delete(meta)
    db.commit()


def meta_a_decimal(meta: MetaAhorroModel) -> tuple[Decimal, Decimal]:
    """Retorna (meta, actual) como Decimal."""
    return _desde_centavos(meta.meta_centavos), _desde_centavos(meta.actual_centavos)
