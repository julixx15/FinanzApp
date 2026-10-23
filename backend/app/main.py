from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.health import router as health_router
from app.api.movimientos import router as movimientos_router

# Las tablas se crean/evolucionan mediante Alembic (ver alembic/).
# NO se llama a Base.metadata.create_all aquí para no recrear el esquema
# en cada reinicio accidental.

app = FastAPI(
    title="FinanzApp API",
    description="API de gestión de finanzas personales",
    version="0.2.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(movimientos_router)


@app.get("/", tags=["raíz"])
def root() -> dict[str, str]:
    return {"mensaje": "FinanzApp API activa. Visita /docs para la documentación."}
