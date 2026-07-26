import pytest
from app.database import SessionLocal
from app.models import User, Goal


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
