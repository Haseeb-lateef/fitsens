from fastapi.testclient import TestClient

from app.database import SessionLocal
from app.main import app
from app.models import Goal, User

client = TestClient(app)


def test_get_goals_default(auth_headers):
    response = client.get("/goals", headers=auth_headers)

    assert response.status_code == 200

    body = response.json()
    assert body["daily_calorie_target"] is None
    assert body["protein_target_g"] is None
    assert body["goal_weight_kg"] is None
    assert "updated_at" in body


def test_patch_goals(auth_headers):
    response = client.patch(
        "/goals",
        headers=auth_headers,
        json={"daily_calorie_target": 2200, "protein_target_g": 150},
    )

    assert response.status_code == 200

    body = response.json()
    assert body["daily_calorie_target"] == 2200
    assert body["protein_target_g"] == 150
    assert body["goal_weight_kg"] is None


def test_patch_goals_partial_update_preserves_other_fields(auth_headers):
    client.patch("/goals", headers=auth_headers, json={"daily_calorie_target": 2200})

    response = client.patch("/goals", headers=auth_headers, json={"goal_weight_kg": 80})

    assert response.status_code == 200

    body = response.json()
    assert body["daily_calorie_target"] == 2200
    assert body["goal_weight_kg"] == 80


def test_patch_goals_creates_row_if_missing(auth_headers):
    db = SessionLocal()
    test_user = db.query(User).filter(User.email == "exercisetestuser@example.com").first()
    db.query(Goal).filter(Goal.user_id == test_user.id).delete()
    db.commit()
    db.close()

    response = client.patch("/goals", headers=auth_headers, json={"goal_weight_kg": 75})

    assert response.status_code == 200
    assert response.json()["goal_weight_kg"] == 75
