from datetime import datetime
from pydantic import BaseModel


class GoalUpdate(BaseModel):
    daily_calorie_target: int | None = None
    protein_target_g: float | None = None
    goal_weight_kg: float | None = None


class GoalOut(BaseModel):
    daily_calorie_target: int | None
    protein_target_g: float | None
    goal_weight_kg: float | None
    updated_at: datetime

    class Config:
        from_attributes = True
