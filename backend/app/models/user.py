from sqlalchemy import TIMESTAMP, Column, Integer, String, text
from app.database import Base


class User(Base):
    __tablename__ = "users"
    id = Column(Integer,primary_key=True,nullable=False)
    username = Column(String, unique=True, nullable=False)
    password_hash= Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    created_at = Column(TIMESTAMP(timezone=True),nullable=False, server_default= text("now()"))

