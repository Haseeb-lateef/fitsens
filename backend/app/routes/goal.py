from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.deps import get_db, get_current_user
from app.schemas import goal
from app.models import Goal, User

router = APIRouter(tags=["Goals"], prefix="/goals")


@router.get("", response_model=goal.GoalOut)
def get_goals(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Goal).filter(Goal.user_id == current_user.id).first()


@router.patch("", response_model=goal.GoalOut)
def update_goals(goal_data: goal.GoalUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    existing_goal = db.query(Goal).filter(Goal.user_id == current_user.id).first()

    if existing_goal is None:
        existing_goal = Goal(user_id=current_user.id)
        db.add(existing_goal)

    update_data = goal_data.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(existing_goal, key, value)

    db.commit()
    db.refresh(existing_goal)

    return existing_goal
