from __future__ import annotations

from fastapi.testclient import TestClient
import time

from app.main import app


client = TestClient(app)


def test_health_check() -> None:
    response = client.get("/api/hello")
    assert response.status_code == 200
    assert response.json()["message"].lower().startswith("hello")


def test_expert_directory_returns_records() -> None:
    response = client.get("/api/experts/all")
    assert response.status_code == 200
    payload = response.json()
    assert isinstance(payload, list)
    assert payload
    assert {"expertId", "userId", "fullName", "primaryExpertise"}.issubset(payload[0].keys())


def test_expert_search_returns_paged_payload() -> None:
    response = client.get("/api/experts/search", params={"page": 1, "pageSize": 2, "availableOnly": True})
    assert response.status_code == 200
    payload = response.json()
    assert {"items", "page", "pageSize", "totalItems", "totalPages"}.issubset(payload.keys())
    assert payload["page"] == 1
    assert payload["pageSize"] == 2
    assert isinstance(payload["items"], list)
    assert payload["items"]


def test_geospatial_search_uses_region_filters() -> None:
    response = client.get(
        "/api/experts/search",
        params={"latitude": 19.0760, "longitude": 72.8777, "radiusKm": 25, "availableOnly": True, "pageSize": 5},
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["items"]


def test_login_returns_token() -> None:
    response = client.post("/api/auth/login", json={"email": "expert001@urbanfix.in", "password": "password"})
    assert response.status_code == 200
    payload = response.json()
    assert {"token", "fullName", "email", "role"}.issubset(payload.keys())


def test_me_returns_expert_profile() -> None:
    login = client.post("/api/auth/login", json={"email": "expert001@urbanfix.in", "password": "password"})
    token = login.json()["token"]

    response = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    payload = response.json()
    assert payload["role"] == "EXPERT"
    assert {"primaryExpertise", "yearsOfExperience", "expertiseAreas", "available", "servesAsResident"}.issubset(payload.keys())


def test_async_matching_job_completes_and_creates_notification() -> None:
    login = client.post("/api/auth/login", json={"email": "kedar@urbanfix.in", "password": "password"})
    token = login.json()["token"]

    submission = client.post(
        "/api/jobs/matching",
        headers={"Authorization": f"Bearer {token}"},
        json={"problemText": "pipe leak in bathroom", "topN": 3, "latitude": 19.0760, "longitude": 72.8777, "radiusKm": 25},
    )
    assert submission.status_code == 200
    job_id = submission.json()["jobId"]

    job_payload = None
    for _ in range(30):
        job_response = client.get(f"/api/jobs/{job_id}", headers={"Authorization": f"Bearer {token}"})
        assert job_response.status_code == 200
        job_payload = job_response.json()
        if job_payload["status"] == "COMPLETED":
            break
        time.sleep(0.1)

    assert job_payload is not None
    assert job_payload["status"] == "COMPLETED"
    assert job_payload["result"]["suggestions"]

    notifications = client.get("/api/notifications", headers={"Authorization": f"Bearer {token}"})
    assert notifications.status_code == 200
    notification_payload = notifications.json()
    assert notification_payload["items"]
    assert notification_payload["items"][0]["title"] == "Matching recommendations ready"


def test_readiness_health_reports_database_and_cache() -> None:
    response = client.get("/api/health/ready")
    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] in {"ready", "degraded"}
    assert "database" in payload and "cache" in payload
    assert payload["database"]["healthy"] is True
