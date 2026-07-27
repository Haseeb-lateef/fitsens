from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

DAYS_OF_WEEK = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]


def create_test_exercise(auth_headers, name="Squat"):
    response = client.post("/exercises", headers=auth_headers, json={"name": name, "muscle_group": "legs"})
    return response.json()["id"]


def test_get_plan_empty(auth_headers):
    response = client.get("/plan", headers=auth_headers)

    assert response.status_code == 200
    body = response.json()
    assert set(body.keys()) == set(DAYS_OF_WEEK)
    assert all(body[day] == [] for day in DAYS_OF_WEEK)


def test_create_plan_entry(auth_headers):
    exercise_id = create_test_exercise(auth_headers)

    response = client.post("/plan/wednesday", headers=auth_headers, json={
        "exercise_id": exercise_id,
        "display_order": 1,
    })

    assert response.status_code == 201

    body = response.json()
    assert body["day_of_week"] == "wednesday"
    assert body["exercise_id"] == exercise_id
    assert body["display_order"] == 1


def test_create_plan_entry_invalid_day(auth_headers):
    exercise_id = create_test_exercise(auth_headers)

    response = client.post("/plan/notaday", headers=auth_headers, json={
        "exercise_id": exercise_id,
        "display_order": 1,
    })

    assert response.status_code == 422


def test_create_plan_entry_exercise_not_owned(auth_headers):
    response = client.post("/plan/wednesday", headers=auth_headers, json={
        "exercise_id": 999999,
        "display_order": 1,
    })

    assert response.status_code == 404


def test_get_day_plan(auth_headers):
    exercise_id = create_test_exercise(auth_headers)
    client.post("/plan/wednesday", headers=auth_headers, json={"exercise_id": exercise_id, "display_order": 1})

    response = client.get("/plan/wednesday", headers=auth_headers)

    assert response.status_code == 200
    assert len(response.json()) == 1


def test_get_plan_groups_by_day(auth_headers):
    exercise_id = create_test_exercise(auth_headers)
    client.post("/plan/wednesday", headers=auth_headers, json={"exercise_id": exercise_id, "display_order": 1})

    response = client.get("/plan", headers=auth_headers)

    body = response.json()
    assert len(body["wednesday"]) == 1
    assert body["monday"] == []


def test_patch_plan_entry_swap_exercise(auth_headers):
    exercise_id = create_test_exercise(auth_headers, "Squat")
    other_exercise_id = create_test_exercise(auth_headers, "Lunges")

    create_response = client.post("/plan/wednesday", headers=auth_headers, json={
        "exercise_id": exercise_id,
        "display_order": 1,
    })
    entry_id = create_response.json()["id"]

    response = client.patch(f"/plan/{entry_id}", headers=auth_headers, json={
        "exercise_id": other_exercise_id,
    })

    assert response.status_code == 200
    assert response.json()["exercise_id"] == other_exercise_id


def test_patch_plan_entry_reorder(auth_headers):
    exercise_id = create_test_exercise(auth_headers)

    create_response = client.post("/plan/wednesday", headers=auth_headers, json={
        "exercise_id": exercise_id,
        "display_order": 1,
    })
    entry_id = create_response.json()["id"]

    response = client.patch(f"/plan/{entry_id}", headers=auth_headers, json={"display_order": 2})

    assert response.status_code == 200
    assert response.json()["display_order"] == 2


def test_delete_plan_entry(auth_headers):
    exercise_id = create_test_exercise(auth_headers)

    create_response = client.post("/plan/wednesday", headers=auth_headers, json={
        "exercise_id": exercise_id,
        "display_order": 1,
    })
    entry_id = create_response.json()["id"]

    delete_response = client.delete(f"/plan/{entry_id}", headers=auth_headers)
    assert delete_response.status_code == 204

    get_response = client.get("/plan/wednesday", headers=auth_headers)
    assert get_response.json() == []
