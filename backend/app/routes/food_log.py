from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from openai import OpenAIError
from app.deps import get_db, get_current_user
from app.schemas import food_log
from app.models import FoodLog, User
from app.services.ai_parser import parse_food_text

router = APIRouter(tags=["Food Log"], prefix="/food-log")


@router.post("/parse", response_model=food_log.FoodLogParseResponse)
def parse_food_log(parse_data: food_log.FoodLogParseRequest, current_user: User = Depends(get_current_user)):
    try:
        return parse_food_text(parse_data.text)
    except OpenAIError:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="AI parsing service unavailable")


@router.post("", response_model=food_log.FoodLogOut, status_code=status.HTTP_201_CREATED)
def create_food_log(food_data: food_log.FoodLogCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):

    new_food_log = FoodLog(**food_data.model_dump(), user_id=current_user.id)

    db.add(new_food_log)
    db.commit()
    db.refresh(new_food_log)

    return new_food_log


@router.get("", response_model=list[food_log.FoodLogOut])
def get_food_logs(
    date: date | None = None,
    from_date: date | None = Query(None, alias="from"),
    to_date: date | None = Query(None, alias="to"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    query = db.query(FoodLog).filter(FoodLog.user_id == current_user.id)

    if date is not None:
        query = query.filter(func.date(FoodLog.logged_at) == date)

    if from_date is not None:
        query = query.filter(func.date(FoodLog.logged_at) >= from_date)

    if to_date is not None:
        query = query.filter(func.date(FoodLog.logged_at) <= to_date)

    return query.order_by(FoodLog.logged_at).all()


@router.patch("/{food_log_id}", response_model=food_log.FoodLogOut)
def update_food_log(food_log_id: int, food_data: food_log.FoodLogUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):

    existing_food_log = db.query(FoodLog).filter(
        (FoodLog.id == food_log_id) & (FoodLog.user_id == current_user.id)
    ).first()

    if not existing_food_log:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Food log entry not found")

    update_data = food_data.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(existing_food_log, key, value)

    db.commit()
    db.refresh(existing_food_log)

    return existing_food_log


@router.delete("/{food_log_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_food_log(food_log_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):

    existing_food_log = db.query(FoodLog).filter(
        (FoodLog.id == food_log_id) & (FoodLog.user_id == current_user.id)
    ).first()

    if not existing_food_log:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Food log entry not found")

    db.delete(existing_food_log)
    db.commit()
