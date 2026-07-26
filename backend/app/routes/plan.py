from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.deps import get_db, get_current_user
from app.schemas import plan
from app.models import PlannedExercise, Exercise, User

router = APIRouter(tags=["Plan"], prefix="/plan")

DAYS_OF_WEEK = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]


def get_owned_exercise_or_404(exercise_id: int, db: Session, current_user: User) -> Exercise:
    exercise = db.query(Exercise).filter(
        (Exercise.id == exercise_id)
        & (Exercise.user_id == current_user.id)
        & (Exercise.deleted_at.is_(None))
    ).first()

    if not exercise:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exercise not found")

    return exercise


@router.get("", response_model=dict[str, list[plan.PlannedExerciseOut]])
def get_plan(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):

    week_plan: dict[str, list[plan.PlannedExerciseOut]] = {day: [] for day in DAYS_OF_WEEK}

    entries = db.query(PlannedExercise).filter(
        PlannedExercise.user_id == current_user.id
    ).order_by(PlannedExercise.day_of_week, PlannedExercise.display_order).all()

    for entry in entries:
        week_plan[entry.day_of_week].append(entry)

    return week_plan


@router.get("/{day_of_week}", response_model=list[plan.PlannedExerciseOut])
def get_day_plan(day_of_week: plan.DayOfWeek, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):

    entries = db.query(PlannedExercise).filter(
        (PlannedExercise.user_id == current_user.id)
        & (PlannedExercise.day_of_week == day_of_week)
    ).order_by(PlannedExercise.display_order).all()

    return entries


@router.post("/{day_of_week}", response_model=plan.PlannedExerciseOut, status_code=status.HTTP_201_CREATED)
def create_plan_entry(day_of_week: plan.DayOfWeek, entry_data: plan.PlannedExerciseCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):

    get_owned_exercise_or_404(entry_data.exercise_id, db, current_user)

    new_entry = PlannedExercise(
        user_id=current_user.id,
        day_of_week=day_of_week,
        exercise_id=entry_data.exercise_id,
        display_order=entry_data.display_order,
    )

    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)

    return new_entry


@router.patch("/{entry_id}", response_model=plan.PlannedExerciseOut)
def update_plan_entry(entry_id: int, entry_data: plan.PlannedExerciseUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):

    existing_entry = db.query(PlannedExercise).filter(
        (PlannedExercise.id == entry_id) & (PlannedExercise.user_id == current_user.id)
    ).first()

    if not existing_entry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan entry not found")

    update_data = entry_data.model_dump(exclude_unset=True)

    if "exercise_id" in update_data:
        get_owned_exercise_or_404(update_data["exercise_id"], db, current_user)

    for key, value in update_data.items():
        setattr(existing_entry, key, value)

    db.commit()
    db.refresh(existing_entry)

    return existing_entry


@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_plan_entry(entry_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):

    existing_entry = db.query(PlannedExercise).filter(
        (PlannedExercise.id == entry_id) & (PlannedExercise.user_id == current_user.id)
    ).first()

    if not existing_entry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan entry not found")

    db.delete(existing_entry)
    db.commit()
