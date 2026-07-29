import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from fastapi.testclient import TestClient

from app.main import app

VALID_PAYLOAD = {
    "location": "thane",
    "carpet_area_sqft": 750,
    "floor_num": 3,
    "bathroom_num": 2,
    "balcony_num": 1,
    "furnishing": "Semi-Furnished",
    "transaction": "Resale",
    "ownership": "Freehold",
    "facing": "East",
}


def test_health():
    with TestClient(app) as client:
        response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_predict_happy_path():
    with TestClient(app) as client:
        response = client.post("/predict", json=VALID_PAYLOAD)
    assert response.status_code == 200
    body = response.json()
    assert "predicted_price" in body
    assert isinstance(body["predicted_price"], float)


def test_predict_invalid_input():
    bad_payload = dict(VALID_PAYLOAD)
    bad_payload["carpet_area_sqft"] = -50  # must be > 0
    with TestClient(app) as client:
        response = client.post("/predict", json=bad_payload)
    assert response.status_code == 422
