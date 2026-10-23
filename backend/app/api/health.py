from fastapi import APIRouter
from pydantic import BaseModel
from sqlalchemy import text

from app.db.database import engine

router = APIRouter()


class HealthResponse(BaseModel):
    status: str
    version: str
    database: str


@router.get("/health", response_model=HealthResponse, tags=["salud"])
def health_check() -> HealthResponse:
    """Verifica que el servidor y la base de datos están operativos."""
    db_status = "desconectada"
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        db_status = "conectada"
    except Exception:
        db_status = "error"

    return HealthResponse(
        status="ok",
        version="0.1.0",
        database=db_status,
    )
