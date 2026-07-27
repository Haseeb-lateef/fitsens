from datetime import date, timedelta

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

TEST_FOOD = {
    "name": "Chicken Rice",
    "calories": 650,
    "protein_g": 45,
    "carbs_g": 70,
    "fat_g": 15,
    "meal_type": "lunch",
}


def test_create_food_log(auth_headers):
    response = client.post("/food-log", headers=auth_headers, json=TEST_FOOD)

    assert response.status_code == 201

    body = response.json()
    assert body["name"] == TEST_FOOD["name"]
    assert body["calories"] == TEST_FOOD["calories"]
    assert body["meal_type"] == "lunch"
    assert "id" in body
    assert "logged_at" in body


def test_create_food_log_invalid_meal_type(auth_headers):
    response = client.post("/food-log", headers=auth_headers, json={**TEST_FOOD, "meal_type": "brunch"})

    assert response.status_code == 422


def test_get_food_logs(auth_headers):
    client.post("/food-log", headers=auth_headers, json=TEST_FOOD)

    response = client.get("/food-log", headers=auth_headers)

    assert response.status_code == 200
    assert len(response.json()) == 1


def test_get_food_logs_filter_by_date(auth_headers):
    client.post("/food-log", headers=auth_headers, json=TEST_FOOD)

    today = date.today().isoformat()
    yesterday = (date.today() - timedelta(days=1)).isoformat()

    today_response = client.get(f"/food-log?date={today}", headers=auth_headers)
    assert len(today_response.json()) == 1

    yesterday_response = client.get(f"/food-log?date={yesterday}", headers=auth_headers)
    assert yesterday_response.json() == []


def test_get_food_logs_filter_by_range(auth_headers):
    client.post("/food-log", headers=auth_headers, json=TEST_FOOD)

    response = client.get("/food-log?from=2020-01-01&to=2020-01-02", headers=auth_headers)
    assert response.json() == []


def test_patch_food_log(auth_headers):
    create_response = client.post("/food-log", headers=auth_headers, json=TEST_FOOD)
    food_log_id = create_response.json()["id"]

    response = client.patch(f"/food-log/{food_log_id}", headers=auth_headers, json={"calories": 700})

    assert response.status_code == 200

    body = response.json()
    assert body["calories"] == 700
    assert body["name"] == TEST_FOOD["name"]


def test_delete_food_log(auth_headers):
    create_response = client.post("/food-log", headers=auth_headers, json=TEST_FOOD)
    food_log_id = create_response.json()["id"]

    delete_response = client.delete(f"/food-log/{food_log_id}", headers=auth_headers)
    assert delete_response.status_code == 204

    get_response = client.get("/food-log", headers=auth_headers)
    assert get_response.json() == []
