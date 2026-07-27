from datetime import datetime
from pydantic import BaseModel


class WorkoutSetCreate(BaseModel):
    exercise_id: int
    weight_kg: float
    reps: int


class WorkoutSetUpdate(BaseModel):
    weight_kg: float | None = None
    reps: int | None = None


class WorkoutSetOut(BaseModel):
    id: int
    exercise_id: int
    weight_kg: float
    reps: int
    performed_at: datetime

    class Config:
        from_attributes = True
