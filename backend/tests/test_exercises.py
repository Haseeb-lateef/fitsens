from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_get_exercises_empty(auth_headers):
    response = client.get("/exercises", headers=auth_headers)

    assert response.status_code == 200
    assert response.json() == []


def test_create_exercise(auth_headers):
    response = client.post("/exercises", headers=auth_headers, json={
        "name": "Bench Press",
        "muscle_group": "chest",
    })

    assert response.status_code == 201

    body = response.json()
    assert body["name"] == "Bench Press"
    assert body["muscle_group"] == "chest"
    assert "id" in body
    assert "created_at" in body


def test_create_exercise_duplicate(auth_headers):
    client.post("/exercises", headers=auth_headers, json={"name": "Bench Press"})
    response = client.post("/exercises", headers=auth_headers, json={"name": "Bench Press"})

    assert response.status_code == 409


def test_create_exercise_duplicate_case_insensitive(auth_headers):
    client.post("/exercises", headers=auth_headers, json={"name": "Bench Press"})
    response = client.post("/exercises", headers=auth_headers, json={"name": "bench press"})

    assert response.status_code == 409


def test_get_exercises_after_create(auth_headers):
    client.post("/exercises", headers=auth_headers, json={"name": "Bench Press"})

    response = client.get("/exercises", headers=auth_headers)

    assert response.status_code == 200
    assert len(response.json()) == 1


def test_patch_exercise(auth_headers):
    create_response = client.post("/exercises", headers=auth_headers, json={
        "name": "Bench Press",
        "muscle_group": "chest",
    })
    exercise_id = create_response.json()["id"]

    response = client.patch(f"/exercises/{exercise_id}", headers=auth_headers, json={
        "muscle_group": "upper body",
    })

    assert response.status_code == 200

    body = response.json()
    assert body["name"] == "Bench Press"
    assert body["muscle_group"] == "upper body"


def test_delete_exercise(auth_headers):
    create_response = client.post("/exercises", headers=auth_headers, json={"name": "Bench Press"})
    exercise_id = create_response.json()["id"]

    delete_response = client.delete(f"/exercises/{exercise_id}", headers=auth_headers)
    assert delete_response.status_code == 204

    get_response = client.get("/exercises", headers=auth_headers)
    assert get_response.json() == []


def test_patch_deleted_exercise_404(auth_headers):
    create_response = client.post("/exercises", headers=auth_headers, json={"name": "Bench Press"})
    exercise_id = create_response.json()["id"]

    client.delete(f"/exercises/{exercise_id}", headers=auth_headers)

    response = client.patch(f"/exercises/{exercise_id}", headers=auth_headers, json={"name": "x"})
    assert response.status_code == 404
