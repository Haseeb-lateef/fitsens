from app.database import SessionLocal
from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends, status, HTTPException
from sqlalchemy.orm import Session
from app.auth import jwt
from app.models import User


oauth_scheme = OAuth2PasswordBearer(tokenUrl="login")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()



def get_current_user(token: str = Depends(oauth_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(status_code= status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")

    user_id = jwt.verify_token(token,credentials_exception)

    user = db.query(User).filter(User.id == user_id).first()

    if user is None:
        raise credentials_exception


    return user



