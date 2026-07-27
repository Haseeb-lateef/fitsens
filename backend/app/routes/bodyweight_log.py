from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.deps import get_db, get_current_user
from app.schemas import bodyweight_log
from app.models import BodyweightLog, User

router = APIRouter(tags=["Bodyweight Log"], prefix="/bodyweight-log")


@router.post("", response_model=bodyweight_log.BodyweightLogOut, status_code=status.HTTP_201_CREATED)
def create_bodyweight_log(entry: bodyweight_log.BodyweightLogCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_entry = BodyweightLog(**entry.model_dump(), user_id=current_user.id)

    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)

    return new_entry


@router.get("", response_model=list[bodyweight_log.BodyweightLogOut])
def get_bodyweight_logs(
    from_date: date | None = Query(None, alias="from"),
    to_date: date | None = Query(None, alias="to"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(BodyweightLog).filter(BodyweightLog.user_id == current_user.id)

    if from_date is not None:
        query = query.filter(func.date(BodyweightLog.logged_at) >= from_date)

    if to_date is not None:
        query = query.filter(func.date(BodyweightLog.logged_at) <= to_date)

    return query.order_by(BodyweightLog.logged_at).all()


@router.delete("/{bodyweight_log_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_bodyweight_log(bodyweight_log_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    existing_entry = db.query(BodyweightLog).filter(
        (BodyweightLog.id == bodyweight_log_id) & (BodyweightLog.user_id == current_user.id)
    ).first()

    if not existing_entry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bodyweight log entry not found")

    db.delete(existing_entry)
    db.commit()
