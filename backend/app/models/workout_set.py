from sqlalchemy import TIMESTAMP, Column, ForeignKey, Integer, Numeric, text

from app.database import Base


class WorkoutSet(Base):
    __tablename__ = "workout_sets"

    id = Column(Integer, primary_key=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    exercise_id = Column(Integer, ForeignKey("exercises.id"), nullable=False)
    weight_kg = Column(Numeric, nullable=False)
    reps = Column(Integer, nullable=False)
    performed_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=text("now()"))
