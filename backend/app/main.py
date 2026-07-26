from fastapi import FastAPI
from app.routes import auth

app = FastAPI(title="fitsens API",version="1.0")


@app.get("/health")
def health_check():
    return {"status":"okay"}


app.include_router(auth.router)