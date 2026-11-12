"""
Repositorio de movimientos.

Responsabilidad única: acceso a datos.
Convierte entre Decimal (dominio) y centavos (base de datos).
No contiene lógica de negocio.
"""

from datetime import date
from decimal import Decimal

from sqlalchemy.orm import Session

from app.db.models import MovimientoModel
from app.schemas.movimiento import MovimientoCreate, MovimientoUpdate

_CENTAVOS = Decimal("100")


def _a_centavos(monto: Decimal) -> int:
    """Convierte pesos Decimal a centavos enteros."""
    return int((monto * _CENTAVOS).to_integral_value())


def _desde_centavos(centavos: int) -> Decimal:
    """Convierte centavos enteros a pesos Decimal."""
    return (Decimal(centavos) / _CENTAVOS).quantize(Decimal("0.01"))


def crear(db: Session, datos: MovimientoCreate) -> MovimientoModel:
    """Persiste un nuevo movimiento y lo retorna con id y creado_en."""
    mov = MovimientoModel(
        tipo=datos.tipo,
        monto_centavos=_a_centavos(datos.monto),
        categoria=datos.categoria,
        descripcion=datos.descripcion,
        fecha=datos.fecha,
    )
    db.add(mov)
    db.commit()
    db.refresh(mov)
    return mov


def obtener_por_id(db: Session, movimiento_id: int) -> MovimientoModel | None:
    return db.get(MovimientoModel, movimiento_id)


def listar(
    db: Session,
    *,
    tipo: str | None = None,
    categoria: str | None = None,
    fecha_desde: date | None = None,
    fecha_hasta: date | None = None,
    limite: int = 100,
    offset: int = 0,
) -> list[MovimientoModel]:
    """Lista movimientos con filtros opcionales."""
    q = db.query(MovimientoModel)
    if tipo:
        q = q.filter(MovimientoModel.tipo == tipo)
    if categoria:
        q = q.filter(MovimientoModel.categoria == categoria)
    if fecha_desde:
        q = q.filter(MovimientoModel.fecha >= fecha_desde)
    if fecha_hasta:
        q = q.filter(MovimientoModel.fecha <= fecha_hasta)
    return q.order_by(MovimientoModel.fecha.desc()).limit(limite).offset(offset).all()


def actualizar(
    db: Session,
    movimiento: MovimientoModel,
    datos: MovimientoUpdate,
) -> MovimientoModel:
    """Actualización parcial de un movimiento."""
    if datos.tipo is not None:
        movimiento.tipo = datos.tipo
    if datos.monto is not None:
        movimiento.monto_centavos = _a_centavos(datos.monto)
    if datos.categoria is not None:
        movimiento.categoria = datos.categoria
    if datos.descripcion is not None:
        movimiento.descripcion = datos.descripcion
    if datos.fecha is not None:
        movimiento.fecha = datos.fecha
    db.commit()
    db.refresh(movimiento)
    return movimiento


def eliminar(db: Session, movimiento: MovimientoModel) -> None:
    """Elimina un movimiento de la base de datos."""
    db.delete(movimiento)
    db.commit()


def monto_decimal(mov: MovimientoModel) -> Decimal:
    """Convierte el monto almacenado en centavos a Decimal."""
    return _desde_centavos(mov.monto_centavos)
