from sqlalchemy import TIMESTAMP, Column, ForeignKey, Integer, Numeric, text

from app.database import Base


class Goal(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    daily_calorie_target = Column(Integer, nullable=True)
    protein_target_g = Column(Numeric, nullable=True)
    goal_weight_kg = Column(Numeric, nullable=True)
    updated_at = Column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=text("now()"),
        onupdate=text("now()"),
    )
