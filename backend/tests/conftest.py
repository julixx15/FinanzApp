"""
Fixtures compartidas para todos los tests de FinanzApp backend.

- Usa SQLite en memoria (:memory:) para aislar cada test.
- Crea las tablas antes del test y las destruye al final.
- Provee cliente HTTP con la sesión de BD inyectada.
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool

from app.db.database import Base, get_db
from app.main import app

# ------------------------------------------------------------------ #
# Motor SQLite en memoria (aislado por test)                          #
# StaticPool garantiza que todas las conexiones del test comparten    #
# la misma instancia en memoria.                                      #
# ------------------------------------------------------------------ #

TEST_DATABASE_URL = "sqlite:///:memory:"


@pytest.fixture()
def db_engine():
    """Crea un motor SQLite en memoria y las tablas para cada test."""
    engine = create_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,  # misma conexión para toda la sesión de test
    )
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)
    engine.dispose()


@pytest.fixture()
def db_session(db_engine) -> Session:
    """Sesión de base de datos ligada al motor de test."""
    TestingSessionLocal = sessionmaker(
        autocommit=False, autoflush=False, bind=db_engine
    )
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture()
def client(db_session: Session) -> TestClient:
    """
    Cliente HTTP con la base de datos de test inyectada.

    Sobreescribe la dependencia get_db de FastAPI para que todos los
    endpoints usen la BD en memoria en lugar de finanzapp.db.
    """

    def override_get_db():
        try:
            yield db_session
        finally:
            pass  # el cierre lo gestiona db_session fixture

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
