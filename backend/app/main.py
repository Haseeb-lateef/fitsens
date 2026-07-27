from fastapi import FastAPI
from app.routes import auth, exercise, plan, workoutset, food_log, bodyweight_log

app = FastAPI(title="fitsens API",version="1.0")


@app.get("/health")
def health_check():
    return {"status":"okay"}


app.include_router(auth.router)
app.include_router(exercise.router)
app.include_router(plan.router)
app.include_router(workoutset.router)
app.include_router(food_log.router)
app.include_router(bodyweight_log.router)