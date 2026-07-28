from sqlalchemy import  Column, ForeignKey, Integer, String
from app.database import Base

class PlannedExercise(Base):
    __tablename__ = "planned_exercises"

    id = Column(Integer, primary_key=True, nullable=False)
    user_id = Column(Integer,ForeignKey("users.id"),nullable=False)
    day_of_week = Column(String, nullable=False)
    exercise_id = Column(Integer, ForeignKey("exercises.id"), nullable=False)
    display_order = Column(Integer, nullable=False)
    # Targets are per plan entry, not per exercise, so the same exercise can be
    # programmed differently on different days. Nullable for rows created before
    # targets existed; the frontend falls back to a default.
    target_sets = Column(Integer, nullable=True)
    target_reps = Column(Integer, nullable=True)