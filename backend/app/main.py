from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.health import router as health_router
from app.db.database import Base, engine

# Crea las tablas al iniciar (en fases posteriores se usará Alembic)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="FinanzApp API",
    description="API de gestión de finanzas personales",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)


@app.get("/", tags=["raíz"])
def root() -> dict[str, str]:
    return {"mensaje": "FinanzApp API activa. Visita /docs para la documentación."}
