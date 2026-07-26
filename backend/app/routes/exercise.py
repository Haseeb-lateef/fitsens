from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.deps import get_db, get_current_user
from app.schemas import exercise
from app.models import Exercise, User

router = APIRouter( tags=["Exercises"], prefix="/exercises")



@router.get("", response_model= list[exercise.ExerciseOut])
def get_exercises(db:Session = Depends(get_db), current_user: User = Depends(get_current_user)):

    exercises = db.query(Exercise).filter((Exercise.user_id == current_user.id) & (Exercise.deleted_at.is_(None))).all()

    return exercises

@router.post("", response_model= exercise.ExerciseOut, status_code= status.HTTP_201_CREATED)
def create_exercise(exercise_data: exercise.ExerciseCreate, db: Session= Depends(get_db), current_user: User = Depends(get_current_user)):

    existing_exercise = db.query(Exercise).filter(
        (Exercise.user_id == current_user.id)
        & (func.lower(Exercise.name) == exercise_data.name.lower())
        & (Exercise.deleted_at.is_(None))
    ).first()

    if existing_exercise:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Exercise already exists")

    new_exercise = Exercise(**exercise_data.model_dump(), user_id= current_user.id)
    
    db.add(new_exercise)
    db.commit()
    db.refresh(new_exercise)

    return new_exercise


@router.patch("/{exercise_id}", response_model= exercise.ExerciseOut)
def update(exercise_data: exercise.ExerciseUpdate,exercise_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):

    existing_exercise = db.query(Exercise).filter((Exercise.id == exercise_id) & (Exercise.user_id == current_user.id) & (Exercise.deleted_at.is_(None))).first()

    if not existing_exercise:
        raise HTTPException(status_code= status.HTTP_404_NOT_FOUND, detail="Exercise not found")

    update_data = exercise_data.model_dump(exclude_unset=True)


    for key,value in update_data.items():
        setattr(existing_exercise,key,value)

    db.commit()
    db.refresh(existing_exercise)

    return existing_exercise


@router.delete("/{exercise_id}", status_code= status.HTTP_204_NO_CONTENT)
def delete_exercise(exercise_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):

    existing_exercise = db.query(Exercise).filter((Exercise.id == exercise_id)&(Exercise.user_id ==current_user.id)&(Exercise.deleted_at.is_(None))).first()

    if not existing_exercise:
        raise HTTPException(status_code= status.HTTP_404_NOT_FOUND, detail="Exercise not found")

    existing_exercise.deleted_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(existing_exercise)

    