from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

TEST_USER = {
    "username": "testuser1",
    "email": "testuser1@example.com",
    "password": "password123",
}


def test_register_success(db_cleanup):
    response = client.post("/register", json=TEST_USER)

    assert response.status_code == 201

    body = response.json()
    assert body["username"] == TEST_USER["username"]
    assert body["email"] == TEST_USER["email"]
    assert "id" in body
    assert "access_token" in body
    assert body["token_type"] == "bearer"


def test_register_duplicate(db_cleanup):
    client.post("/register", json=TEST_USER)
    response = client.post("/register", json=TEST_USER)

    assert response.status_code == 409


def test_login_success(db_cleanup):
    register_response = client.post("/register", json=TEST_USER)
    user_id = register_response.json()["id"]

    response = client.post("/login", json={
        "email": TEST_USER["email"],
        "password": TEST_USER["password"],
    })

    assert response.status_code == 200

    body = response.json()
    assert body["user_id"] == user_id
    assert "access_token" in body
    assert body["token_type"] == "bearer"


def test_login_wrong_password(db_cleanup):
    client.post("/register", json=TEST_USER)

    response = client.post("/login", json={
        "email": TEST_USER["email"],
        "password": "wrongpassword",
    })

    assert response.status_code == 401
