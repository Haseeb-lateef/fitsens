from datetime import datetime
from typing import Literal
from pydantic import BaseModel

MealType = Literal["breakfast", "lunch", "dinner", "snack"]


class FoodLogCreate(BaseModel):
    name: str
    calories: int
    protein_g: float
    carbs_g: float
    fat_g: float
    meal_type: MealType


class FoodLogUpdate(BaseModel):
    name: str | None = None
    calories: int | None = None
    protein_g: float | None = None
    carbs_g: float | None = None
    fat_g: float | None = None
    meal_type: MealType | None = None


class FoodLogParseRequest(BaseModel):
    text: str


class FoodLogParseResponse(BaseModel):
    name: str | None = None
    calories: int | None = None
    protein_g: float | None = None
    carbs_g: float | None = None
    fat_g: float | None = None
    meal_type: MealType | None = None


class FoodLogOut(BaseModel):
    id: int
    name: str
    calories: int
    protein_g: float
    carbs_g: float
    fat_g: float
    meal_type: MealType
    logged_at: datetime

    class Config:
        from_attributes = True
