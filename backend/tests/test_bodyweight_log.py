from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

TEST_ENTRY = {"weight_kg": 78.5}


def test_create_bodyweight_log(auth_headers):
    response = client.post("/bodyweight-log", headers=auth_headers, json=TEST_ENTRY)

    assert response.status_code == 201

    body = response.json()
    assert body["weight_kg"] == TEST_ENTRY["weight_kg"]
    assert "id" in body
    assert "logged_at" in body


def test_get_bodyweight_logs(auth_headers):
    client.post("/bodyweight-log", headers=auth_headers, json=TEST_ENTRY)

    response = client.get("/bodyweight-log", headers=auth_headers)

    assert response.status_code == 200
    assert len(response.json()) == 1


def test_get_bodyweight_logs_filter_by_range(auth_headers):
    client.post("/bodyweight-log", headers=auth_headers, json=TEST_ENTRY)

    response = client.get("/bodyweight-log?from=2020-01-01&to=2020-01-02", headers=auth_headers)
    assert response.json() == []


def test_delete_bodyweight_log(auth_headers):
    create_response = client.post("/bodyweight-log", headers=auth_headers, json=TEST_ENTRY)
    entry_id = create_response.json()["id"]

    delete_response = client.delete(f"/bodyweight-log/{entry_id}", headers=auth_headers)
    assert delete_response.status_code == 204

    get_response = client.get("/bodyweight-log", headers=auth_headers)
    assert get_response.json() == []
