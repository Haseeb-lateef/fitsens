from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.deps import get_db, get_current_user, get_owned_exercise_or_404
from app.schemas import workout_set
from app.models import WorkoutSet, User

router = APIRouter(tags=["Workout Sets"], prefix="/workout-sets")



@router.post("", response_model= workout_set.WorkoutSetOut, status_code= status.HTTP_201_CREATED)
def create_workout_set(workout_info: workout_set.WorkoutSetCreate, db: Session = Depends(get_db),current_user: User = Depends(get_current_user)):

    get_owned_exercise_or_404(workout_info.exercise_id,db,current_user)

    new_workout_set = WorkoutSet(**workout_info.model_dump(), user_id= current_user.id)

    db.add(new_workout_set)
    db.commit()
    db.refresh(new_workout_set)

    return new_workout_set

@router.get("", response_model= list[workout_set.WorkoutSetOut])
def get_workout_sets(
    exercise_id: int | None = None,
    date: date | None = None,
    from_date: date | None = Query(None, alias="from"),
    to_date: date | None = Query(None, alias="to"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    query = db.query(WorkoutSet).filter(WorkoutSet.user_id == current_user.id)

    if exercise_id is not None:
        query = query.filter(WorkoutSet.exercise_id == exercise_id)

    if date is not None:
        query = query.filter(func.date(WorkoutSet.performed_at) == date)

    if from_date is not None:
        query = query.filter(func.date(WorkoutSet.performed_at) >= from_date)

    if to_date is not None:
        query = query.filter(func.date(WorkoutSet.performed_at) <= to_date)

    return query.order_by(WorkoutSet.performed_at).all()

@router.patch("/{set_id}", response_model= workout_set.WorkoutSetOut)
def update_workout_set(set_id: int,set_info: workout_set.WorkoutSetUpdate,db: Session = Depends(get_db), current_user: User = Depends(get_current_user) ):

    existing_set = db.query(WorkoutSet).filter((WorkoutSet.user_id == current_user.id) & (WorkoutSet.id == set_id)).first()

    if not existing_set:
        raise HTTPException(status_code= status.HTTP_404_NOT_FOUND, detail="Workout set not found")


    updated_set = set_info.model_dump(exclude_unset=True)

    for key, value in updated_set.items():
        setattr(existing_set,key,value)

    db.commit()
    db.refresh(existing_set)

    return existing_set


@router.delete("/{set_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_workout_set(set_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):

    existing_set = db.query(WorkoutSet).filter(
        (WorkoutSet.id == set_id) & (WorkoutSet.user_id == current_user.id)
    ).first()

    if not existing_set:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workout set not found")

    db.delete(existing_set)
    db.commit()
