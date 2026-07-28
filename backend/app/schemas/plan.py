from typing import Literal
from pydantic import BaseModel, Field

DayOfWeek = Literal["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]

TargetSets = Field(None, ge=1, le=20)
TargetReps = Field(None, ge=1, le=100)


class PlannedExerciseCreate(BaseModel):
    exercise_id: int
    display_order: int
    target_sets: int | None = TargetSets
    target_reps: int | None = TargetReps


class PlannedExerciseUpdate(BaseModel):
    exercise_id: int | None = None
    display_order: int | None = None
    target_sets: int | None = TargetSets
    target_reps: int | None = TargetReps


class PlannedExerciseOut(BaseModel):
    id: int
    day_of_week: DayOfWeek
    exercise_id: int
    display_order: int
    target_sets: int | None
    target_reps: int | None

    class Config:
        from_attributes = True
