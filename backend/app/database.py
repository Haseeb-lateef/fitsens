from app.config import settings
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

engine = create_engine(url=settings.database_url)

SessionLocal = sessionmaker(bind=engine)

class Base(DeclarativeBase):
    pass