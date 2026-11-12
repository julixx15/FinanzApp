from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.repositories import metas as repo
from app.schemas.meta import MetaAbonar, MetaCreate, MetaResponse

router = APIRouter(prefix="/metas", tags=["metas"])


def _meta_o_404(meta_id: int, db: Session) -> repo.MetaAhorroModel:
    meta = repo.obtener_por_id(db, meta_id)
    if meta is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail=f"Meta {meta_id} no encontrada")
    return meta


def _a_response(meta: repo.MetaAhorroModel) -> MetaResponse:
    objetivo, actual = repo.meta_a_decimal(meta)
    pct = float((actual / objetivo * 100).quantize(__import__("decimal").Decimal("0.01")))
    return MetaResponse(
        id=meta.id,
        nombre=meta.nombre,
        descripcion=meta.descripcion,
        meta=objetivo,
        actual=actual,
        fecha_limite=meta.fecha_limite,
        emoji=meta.emoji,
        porcentaje=min(pct, 100.0),
        completada=actual >= objetivo,
        creado_en=meta.creado_en,
    )


@router.post("/", response_model=MetaResponse, status_code=status.HTTP_201_CREATED, summary="Crear meta de ahorro")
def crear_meta(datos: MetaCreate, db: Session = Depends(get_db)) -> MetaResponse:
    return _a_response(repo.crear(db, datos))


@router.get("/", response_model=list[MetaResponse], summary="Listar metas de ahorro")
def listar_metas(db: Session = Depends(get_db)) -> list[MetaResponse]:
    return [_a_response(m) for m in repo.listar(db)]


@router.get("/{meta_id}", response_model=MetaResponse, summary="Obtener meta por ID")
def obtener_meta(meta_id: int, db: Session = Depends(get_db)) -> MetaResponse:
    return _a_response(_meta_o_404(meta_id, db))


@router.post("/{meta_id}/abonar", response_model=MetaResponse, summary="Abonar a una meta")
def abonar_meta(meta_id: int, datos: MetaAbonar, db: Session = Depends(get_db)) -> MetaResponse:
    meta = _meta_o_404(meta_id, db)
    return _a_response(repo.abonar(db, meta, datos.monto))


@router.delete("/{meta_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Eliminar meta")
def eliminar_meta(meta_id: int, db: Session = Depends(get_db)) -> None:
    repo.eliminar(db, _meta_o_404(meta_id, db))
