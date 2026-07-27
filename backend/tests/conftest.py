import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app.models import User, Goal, Exercise, PlannedExercise

client = TestClient(app)

EXERCISE_TEST_USER = {
    "username": "exercisetestuser",
    "email": "exercisetestuser@example.com",
    "password": "password123",
}


@pytest.fixture
def db_cleanup():
    yield
    db = SessionLocal()
    test_user = db.query(User).filter(User.email == "testuser1@example.com").first()
    if test_user:
        db.query(Goal).filter(Goal.user_id == test_user.id).delete()
        db.query(User).filter(User.id == test_user.id).delete()
        db.commit()
    db.close()


@pytest.fixture
def auth_headers():
    response = client.post("/register", json=EXERCISE_TEST_USER)
    token = response.json()["access_token"]

    yield {"Authorization": f"Bearer {token}"}

    db = SessionLocal()
    test_user = db.query(User).filter(User.email == EXERCISE_TEST_USER["email"]).first()
    if test_user:
        db.query(PlannedExercise).filter(PlannedExercise.user_id == test_user.id).delete()
        db.query(Exercise).filter(Exercise.user_id == test_user.id).delete()
        db.query(Goal).filter(Goal.user_id == test_user.id).delete()
        db.query(User).filter(User.id == test_user.id).delete()
        db.commit()
    db.close()
