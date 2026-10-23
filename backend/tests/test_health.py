from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_returns_ok() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["version"] == "0.1.0"
    assert data["database"] == "conectada"


def test_root_returns_message() -> None:
    response = client.get("/")
    assert response.status_code == 200
    assert "FinanzApp" in response.json()["mensaje"]
