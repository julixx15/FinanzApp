"""
Fixtures de prueba — SQLite en memoria con conexión única compartida.

La clave: SQLite :memory: crea una BD diferente por conexión.
Para que las tablas creadas sean visibles en la sesión inyectada,
hay que usar StaticPool y forzar que todas las operaciones usen
la misma conexión en memoria.
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.database import Base, get_db
from app.main import app


@pytest.fixture(scope="function")
def client():
    engine_test = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,  # <— misma conexión para todos los requests
    )
    Base.metadata.create_all(bind=engine_test)

    testing_session = sessionmaker(
        autocommit=False, autoflush=False, bind=engine_test
    )

    def override_get_db():
        db = testing_session()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as c:
        yield c

    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=engine_test)
    engine_test.dispose()
