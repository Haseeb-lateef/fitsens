from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.deps import get_db, get_current_user, get_owned_exercise_or_404
from app.schemas import exercise, workout_set
from app.models import Exercise, PlannedExercise, WorkoutSet, User

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
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"You already have an exercise called {existing_exercise.name}",
        )

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


@router.get("/{exercise_id}/last-session", response_model=list[workout_set.LastSessionSet])
def get_last_session(exercise_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):

    get_owned_exercise_or_404(exercise_id, db, current_user)

    last_date = db.query(func.max(func.date(WorkoutSet.performed_at))).filter(
        (WorkoutSet.exercise_id == exercise_id) & (WorkoutSet.user_id == current_user.id)
    ).scalar()

    if last_date is None:
        return []

    return db.query(WorkoutSet).filter(
        (WorkoutSet.exercise_id == exercise_id)
        & (WorkoutSet.user_id == current_user.id)
        & (func.date(WorkoutSet.performed_at) == last_date)
    ).order_by(WorkoutSet.performed_at).all()


@router.delete("/{exercise_id}", status_code= status.HTTP_204_NO_CONTENT)
def delete_exercise(exercise_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):

    existing_exercise = db.query(Exercise).filter((Exercise.id == exercise_id)&(Exercise.user_id ==current_user.id)&(Exercise.deleted_at.is_(None))).first()

    if not existing_exercise:
        raise HTTPException(status_code= status.HTTP_404_NOT_FOUND, detail="Exercise not found")

    existing_exercise.deleted_at = datetime.now(timezone.utc)

    # The exercise row is kept so workout_sets history still resolves a name, but
    # planned_exercises is a forward-looking schedule rather than history. Leaving
    # those rows behind pointed the active workout screen at an exercise that
    # /last-session then refused to return, breaking the whole day.
    db.query(PlannedExercise).filter(
        (PlannedExercise.exercise_id == exercise_id)
        & (PlannedExercise.user_id == current_user.id)
    ).delete()

    db.commit()
    db.refresh(existing_exercise)

    