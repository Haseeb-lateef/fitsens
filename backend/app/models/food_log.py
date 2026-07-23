from sqlalchemy import TIMESTAMP, Column, ForeignKey, Integer, Numeric, String, text

from app.database import Base


class FoodLog(Base):
    __tablename__ = "food_log"

    id = Column(Integer, primary_key=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    calories = Column(Integer, nullable=False)
    protein_g = Column(Numeric, nullable=False)
    carbs_g = Column(Numeric, nullable=False)
    fat_g = Column(Numeric, nullable=False)
    meal_type = Column(String, nullable=False)
    logged_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=text("now()"))
