from typing import Literal
from pydantic import BaseModel

DayOfWeek = Literal["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]


class PlannedExerciseCreate(BaseModel):
    exercise_id: int
    display_order: int


class PlannedExerciseUpdate(BaseModel):
    exercise_id: int | None = None
    display_order: int | None = None


class PlannedExerciseOut(BaseModel):
    id: int
    day_of_week: DayOfWeek
    exercise_id: int
    display_order: int

    class Config:
        from_attributes = True
