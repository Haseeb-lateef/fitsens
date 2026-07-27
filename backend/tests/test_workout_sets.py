from datetime import date, datetime, timedelta, timezone

from fastapi.testclient import TestClient

from app.database import SessionLocal
from app.main import app
from app.models import User, WorkoutSet

client = TestClient(app)


def create_test_exercise(auth_headers, name="Deadlift"):
    response = client.post("/exercises", headers=auth_headers, json={"name": name, "muscle_group": "back"})
    return response.json()["id"]


def test_create_workout_set(auth_headers):
    exercise_id = create_test_exercise(auth_headers)

    response = client.post("/workout-sets", headers=auth_headers, json={
        "exercise_id": exercise_id,
        "weight_kg": 100,
        "reps": 5,
    })

    assert response.status_code == 201

    body = response.json()
    assert body["exercise_id"] == exercise_id
    assert body["weight_kg"] == 100
    assert body["reps"] == 5
    assert "id" in body
    assert "performed_at" in body


def test_create_workout_set_exercise_not_owned(auth_headers):
    response = client.post("/workout-sets", headers=auth_headers, json={
        "exercise_id": 999999,
        "weight_kg": 100,
        "reps": 5,
    })

    assert response.status_code == 404


def test_get_workout_sets(auth_headers):
    exercise_id = create_test_exercise(auth_headers)
    client.post("/workout-sets", headers=auth_headers, json={"exercise_id": exercise_id, "weight_kg": 100, "reps": 5})
    client.post("/workout-sets", headers=auth_headers, json={"exercise_id": exercise_id, "weight_kg": 102.5, "reps": 5})

    response = client.get("/workout-sets", headers=auth_headers)

    assert response.status_code == 200
    assert len(response.json()) == 2


def test_get_workout_sets_filter_by_exercise_id(auth_headers):
    exercise_id = create_test_exercise(auth_headers, "Deadlift")
    other_exercise_id = create_test_exercise(auth_headers, "Squat")
    client.post("/workout-sets", headers=auth_headers, json={"exercise_id": exercise_id, "weight_kg": 100, "reps": 5})
    client.post("/workout-sets", headers=auth_headers, json={"exercise_id": other_exercise_id, "weight_kg": 80, "reps": 5})

    response = client.get(f"/workout-sets?exercise_id={exercise_id}", headers=auth_headers)

    body = response.json()
    assert len(body) == 1
    assert body[0]["exercise_id"] == exercise_id


def test_get_workout_sets_filter_by_date(auth_headers):
    exercise_id = create_test_exercise(auth_headers)
    client.post("/workout-sets", headers=auth_headers, json={"exercise_id": exercise_id, "weight_kg": 100, "reps": 5})

    today = date.today().isoformat()
    yesterday = (date.today() - timedelta(days=1)).isoformat()

    today_response = client.get(f"/workout-sets?date={today}", headers=auth_headers)
    assert len(today_response.json()) == 1

    yesterday_response = client.get(f"/workout-sets?date={yesterday}", headers=auth_headers)
    assert yesterday_response.json() == []


def test_get_workout_sets_filter_by_range(auth_headers):
    exercise_id = create_test_exercise(auth_headers)
    client.post("/workout-sets", headers=auth_headers, json={"exercise_id": exercise_id, "weight_kg": 100, "reps": 5})

    response = client.get("/workout-sets?from=2020-01-01&to=2020-01-02", headers=auth_headers)
    assert response.json() == []


def test_patch_workout_set(auth_headers):
    exercise_id = create_test_exercise(auth_headers)
    create_response = client.post("/workout-sets", headers=auth_headers, json={
        "exercise_id": exercise_id,
        "weight_kg": 100,
        "reps": 5,
    })
    set_id = create_response.json()["id"]

    response = client.patch(f"/workout-sets/{set_id}", headers=auth_headers, json={"reps": 6})

    assert response.status_code == 200

    body = response.json()
    assert body["reps"] == 6
    assert body["weight_kg"] == 100


def test_delete_workout_set(auth_headers):
    exercise_id = create_test_exercise(auth_headers)
    create_response = client.post("/workout-sets", headers=auth_headers, json={
        "exercise_id": exercise_id,
        "weight_kg": 100,
        "reps": 5,
    })
    set_id = create_response.json()["id"]

    delete_response = client.delete(f"/workout-sets/{set_id}", headers=auth_headers)
    assert delete_response.status_code == 204

    get_response = client.get("/workout-sets", headers=auth_headers)
    assert get_response.json() == []


def test_last_session_never_done(auth_headers):
    exercise_id = create_test_exercise(auth_headers)

    response = client.get(f"/exercises/{exercise_id}/last-session", headers=auth_headers)

    assert response.status_code == 200
    assert response.json() == []


def test_last_session_exercise_not_owned(auth_headers):
    response = client.get("/exercises/999999/last-session", headers=auth_headers)

    assert response.status_code == 404


def test_last_session_returns_only_most_recent_date(auth_headers):
    exercise_id = create_test_exercise(auth_headers)

    db = SessionLocal()
    test_user = db.query(User).filter(User.email == "exercisetestuser@example.com").first()

    yesterday = datetime.now(timezone.utc) - timedelta(days=1)
    db.add(WorkoutSet(user_id=test_user.id, exercise_id=exercise_id, weight_kg=90, reps=8, performed_at=yesterday))
    db.add(WorkoutSet(user_id=test_user.id, exercise_id=exercise_id, weight_kg=95, reps=6, performed_at=yesterday))
    db.commit()
    db.close()

    client.post("/workout-sets", headers=auth_headers, json={"exercise_id": exercise_id, "weight_kg": 100, "reps": 5})

    response = client.get(f"/exercises/{exercise_id}/last-session", headers=auth_headers)

    assert response.status_code == 200
    body = response.json()
    assert body == [{"weight_kg": 100, "reps": 5}]
