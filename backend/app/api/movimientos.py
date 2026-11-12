"""
Endpoints del recurso Movimiento.

Solo orquesta: recibe, valida con Pydantic, delega al repositorio/core,
devuelve respuesta. Sin lógica de negocio aquí.
"""

from datetime import date
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.finanzas import calcular_resumen, categorias_unicas
from app.db.database import get_db
from app.db.repositories import movimientos as repo
from app.schemas.movimiento import (
    MovimientoCreate,
    MovimientoResponse,
    MovimientoUpdate,
    ResumenResponse,
)

router = APIRouter(prefix="/movimientos", tags=["movimientos"])


def _movimiento_o_404(movimiento_id: int, db: Session) -> repo.MovimientoModel:
    """Retorna el movimiento o lanza 404."""
    mov = repo.obtener_por_id(db, movimiento_id)
    if mov is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Movimiento {movimiento_id} no encontrado",
        )
    return mov


def _modelo_a_response(mov: repo.MovimientoModel) -> MovimientoResponse:
    """Construye un MovimientoResponse inyectando el monto como Decimal."""
    return MovimientoResponse(
        id=mov.id,
        tipo=mov.tipo,  # type: ignore[arg-type]
        monto=repo.monto_decimal(mov),
        categoria=mov.categoria,
        descripcion=mov.descripcion,
        fecha=mov.fecha,
        creado_en=mov.creado_en,
    )


@router.post(
    "/",
    response_model=MovimientoResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Crear un movimiento",
)
def crear_movimiento(
    datos: MovimientoCreate,
    db: Session = Depends(get_db),
) -> MovimientoResponse:
    mov = repo.crear(db, datos)
    return _modelo_a_response(mov)


@router.get(
    "/",
    response_model=list[MovimientoResponse],
    summary="Listar movimientos con filtros opcionales",
)
def listar_movimientos(
    tipo: str | None = Query(default=None, description="ingreso | gasto | ahorro"),
    categoria: str | None = Query(default=None),
    fecha_desde: date | None = Query(default=None),
    fecha_hasta: date | None = Query(default=None),
    limite: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
) -> list[MovimientoResponse]:
    movs = repo.listar(
        db,
        tipo=tipo,
        categoria=categoria,
        fecha_desde=fecha_desde,
        fecha_hasta=fecha_hasta,
        limite=limite,
        offset=offset,
    )
    return [_modelo_a_response(m) for m in movs]


@router.get(
    "/resumen",
    response_model=ResumenResponse,
    summary="Resumen financiero (saldo, ingresos, gastos, ahorros)",
)
def obtener_resumen(
    fecha_desde: date | None = Query(default=None),
    fecha_hasta: date | None = Query(default=None),
    db: Session = Depends(get_db),
) -> ResumenResponse:
    movs = repo.listar(db, fecha_desde=fecha_desde, fecha_hasta=fecha_hasta, limite=10_000)
    return calcular_resumen(movs)


@router.get(
    "/categorias",
    response_model=list[str],
    summary="Lista de categorías únicas registradas",
)
def obtener_categorias(db: Session = Depends(get_db)) -> list[str]:
    movs = repo.listar(db, limite=10_000)
    return categorias_unicas(movs)


@router.get(
    "/{movimiento_id}",
    response_model=MovimientoResponse,
    summary="Obtener un movimiento por ID",
)
def obtener_movimiento(
    movimiento_id: int,
    db: Session = Depends(get_db),
) -> MovimientoResponse:
    mov = _movimiento_o_404(movimiento_id, db)
    return _modelo_a_response(mov)


@router.patch(
    "/{movimiento_id}",
    response_model=MovimientoResponse,
    summary="Actualizar parcialmente un movimiento",
)
def actualizar_movimiento(
    movimiento_id: int,
    datos: MovimientoUpdate,
    db: Session = Depends(get_db),
) -> MovimientoResponse:
    mov = _movimiento_o_404(movimiento_id, db)
    mov = repo.actualizar(db, mov, datos)
    return _modelo_a_response(mov)


@router.delete(
    "/{movimiento_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar un movimiento",
)
def eliminar_movimiento(
    movimiento_id: int,
    db: Session = Depends(get_db),
) -> None:
    mov = _movimiento_o_404(movimiento_id, db)
    repo.eliminar(db, mov)
