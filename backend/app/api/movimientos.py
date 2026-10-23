"""
Endpoints REST para el recurso Movimiento.

Rutas:
  GET    /movimientos          — lista con filtros y paginación
  POST   /movimientos          — crear movimiento
  GET    /movimientos/{id}     — obtener por id
  PATCH  /movimientos/{id}     — actualizar parcialmente
  DELETE /movimientos/{id}     — eliminar

Este módulo solo orquesta: recibe la request, delega al servicio y
devuelve la respuesta. Sin lógica de negocio aquí.
"""

from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.movimientos import MovimientoNoEncontrado, MovimientoService, MontoFueraDeRango
from app.db.database import get_db
from app.db.models import TipoMovimiento
from app.db.repositories.movimiento_repository import MovimientoRepository
from app.schemas.movimiento import (
    MovimientoCreate,
    MovimientoListResponse,
    MovimientoResponse,
    MovimientoUpdate,
)

router = APIRouter(prefix="/movimientos", tags=["movimientos"])


# ------------------------------------------------------------------ #
# Dependencia: instancia del servicio con repositorio real            #
# ------------------------------------------------------------------ #

def get_service(db: Session = Depends(get_db)) -> MovimientoService:
    return MovimientoService(MovimientoRepository(db))


# ------------------------------------------------------------------ #
# Endpoints                                                           #
# ------------------------------------------------------------------ #

@router.get("", response_model=MovimientoListResponse, summary="Listar movimientos")
def listar_movimientos(
    tipo: TipoMovimiento | None = Query(default=None, description="Filtrar por tipo"),
    categoria: str | None = Query(default=None, description="Filtrar por categoría"),
    fecha_desde: date | None = Query(default=None, description="Fecha inicial YYYY-MM-DD"),
    fecha_hasta: date | None = Query(default=None, description="Fecha final YYYY-MM-DD"),
    limit: int = Query(default=100, ge=1, le=500, description="Máximo de resultados"),
    offset: int = Query(default=0, ge=0, description="Desplazamiento para paginación"),
    service: MovimientoService = Depends(get_service),
) -> MovimientoListResponse:
    """Lista movimientos con filtros opcionales y paginación."""
    movimientos, total = service.listar(
        tipo=tipo,
        categoria=categoria,
        fecha_desde=fecha_desde,
        fecha_hasta=fecha_hasta,
        limit=limit,
        offset=offset,
    )
    return MovimientoListResponse(total=total, movimientos=movimientos)


@router.post(
    "",
    response_model=MovimientoResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Crear movimiento",
)
def crear_movimiento(
    body: MovimientoCreate,
    service: MovimientoService = Depends(get_service),
) -> MovimientoResponse:
    """Crea un nuevo movimiento financiero."""
    try:
        return service.crear(body)
    except MontoFueraDeRango as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc


@router.get("/{movimiento_id}", response_model=MovimientoResponse, summary="Obtener movimiento")
def obtener_movimiento(
    movimiento_id: int,
    service: MovimientoService = Depends(get_service),
) -> MovimientoResponse:
    """Obtiene un movimiento por su id."""
    try:
        return service.obtener(movimiento_id)
    except MovimientoNoEncontrado as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc


@router.patch(
    "/{movimiento_id}",
    response_model=MovimientoResponse,
    summary="Actualizar movimiento",
)
def actualizar_movimiento(
    movimiento_id: int,
    body: MovimientoUpdate,
    service: MovimientoService = Depends(get_service),
) -> MovimientoResponse:
    """Actualiza parcialmente un movimiento existente."""
    try:
        return service.actualizar(movimiento_id, body)
    except MovimientoNoEncontrado as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc
    except MontoFueraDeRango as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc


@router.delete(
    "/{movimiento_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar movimiento",
)
def eliminar_movimiento(
    movimiento_id: int,
    service: MovimientoService = Depends(get_service),
) -> None:
    """Elimina un movimiento por su id."""
    try:
        service.eliminar(movimiento_id)
    except MovimientoNoEncontrado as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc
