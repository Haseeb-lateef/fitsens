from datetime import datetime
from pydantic import BaseModel


class BodyweightLogCreate(BaseModel):
    weight_kg: float


class BodyweightLogOut(BaseModel):
    id: int
    weight_kg: float
    logged_at: datetime

    class Config:
        from_attributes = True
