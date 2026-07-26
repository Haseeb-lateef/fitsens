from datetime import datetime
from pydantic import BaseModel


class ExerciseCreate(BaseModel):
    name: str
    muscle_group: str | None = None


class ExerciseUpdate(BaseModel):
    name: str | None = None
    muscle_group: str | None = None


class ExerciseOut(BaseModel):
    id: int
    name: str
    muscle_group: str | None
    created_at: datetime

    class Config:
        from_attributes = True
