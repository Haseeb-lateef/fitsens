from sqlalchemy import TIMESTAMP, Column, ForeignKey, Integer, Numeric, text

from app.database import Base


class BodyweightLog(Base):
    __tablename__ = "bodyweight_log"

    id = Column(Integer, primary_key=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    weight_kg = Column(Numeric, nullable=False)
    logged_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=text("now()"))
