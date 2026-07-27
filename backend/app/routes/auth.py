from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.deps import get_db, get_current_user
from app.schemas import user
from app.models import User, Goal
from app.auth import password, jwt

router = APIRouter(tags=["Authentication"])


@router.post("/login", response_model=user.LoginResponse)
def login(login_info: user.LoginRequest, db: Session = Depends(get_db)):

    db_user = db.query(User).filter(User.email == login_info.email).first()
    credentials_exception = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    if db_user is None:
        raise credentials_exception

    if not password.verify(login_info.password, db_user.password_hash):
        raise credentials_exception

    access_token = jwt.create_token({"user_id": db_user.id})

    return {"access_token": access_token, "token_type": "bearer", "user_id": db_user.id}


@router.post("/register", response_model=user.RegisterResponse, status_code= status.HTTP_201_CREATED)
def register(user_info: user.RegisterData, db: Session = Depends(get_db)):

    existing_user = db.query(User).filter((User.username == user_info.username) | (User.email == user_info.email)).first()

    if existing_user:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="The email or username already exists")

    hashed_password = password.hash_password(user_info.password)

    new_user = User(username=user_info.username, email=user_info.email, password_hash=hashed_password)

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    db.add(Goal(user_id=new_user.id))
    db.commit()

    access_token = jwt.create_token({"user_id": new_user.id})

    return {
        "id": new_user.id,
        "username": new_user.username,
        "email": new_user.email,
        "access_token": access_token,
        "token_type": "bearer",
    }


@router.get("/me", response_model=user.UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
